import { describe, it, afterEach } from "vitest";
import { vi } from "vitest";
import {
  createAccount,
  getAccounts,
  deleteAccount,
  patchAccount,
} from "./account.service";
import { expect } from "vitest";
import {
  createAccountInRepository,
  getAccountsFromRepository,
  deleteAccountFromRepository,
  updateAccountInRepository,
} from "./account.repository";
import { HttpBadRequest } from "@httpx/exception";

vi.mock("./account.repository", async (importOriginal) => ({
  ...(await importOriginal()),
  createAccountInRepository: vi.fn((data) => {
    return {
      id: 4,
      userId: data.userId,
      amount: data.amount,
    };
  }),
  updateAccountInRepository: vi.fn((data) => {
    return {
      id: data.id,
      userId: data.userId,
      amount: data.amount,
    };
  }),
  getAccountsFromRepository: vi.fn((userId) => {
    return [
      {
        id: 1,
        userId: userId,
        amount: 100.0,
      },
      {
        id: 2,
        userId: userId,
        amount: 200.0,
      },
    ];
  }),
  deleteAccountFromRepository: vi.fn((accountId, userId) => {
    return {
      id: accountId,
      userId: userId,
    };
  }),
}));

describe("Account Service", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create an account", async () => {
    const account = await createAccount({
      userId: 4,
      amount: 42.42,
    });

    expect(account).toBeDefined();
    expect(account.id).toBeDefined();
    expect(account.id).toBeTypeOf("number");
    expect(account).toHaveProperty("userId", 4);
    expect(account.amount).toBeDefined();
    expect(account.amount).toBe(42.42);

    expect(createAccountInRepository).toBeCalledTimes(1);
    expect(createAccountInRepository).toBeCalledWith({
      userId: 4,
      amount: 42.42,
    });
  });

  it("should trigger a bad request error when account creation", async () => {
    const account = createAccount({
      userId: -4,
      amount: 42.42,
    });

    await expect(account).rejects.toThrowError(
      new HttpBadRequest("Invalid account data")
    );
  });

  it("should get accounts for a user", async () => {
    const accounts = await getAccounts(4);

    expect(accounts).toBeDefined();
    expect(accounts).toBeInstanceOf(Array);
    expect(accounts.length).toBeGreaterThan(0);
    expect(accounts[0]).toHaveProperty("userId", 4);
    expect(accounts[0].amount).toBeDefined();
    expect(accounts[0].amount).toBe(100.0);
    expect(accounts[1]).toHaveProperty("userId", 4);
    expect(accounts[1].amount).toBeDefined();
    expect(accounts[1].amount).toBe(200.0);

    expect(getAccountsFromRepository).toBeCalledTimes(1);
    expect(getAccountsFromRepository).toBeCalledWith(4);
  });

  it("should trigger a bad request error when getting accounts with invalid user ID", async () => {
    await expect(getAccounts(null)).rejects.toThrowError(
      new HttpBadRequest("Invalid user ID")
    );
  });

  it("should delete an account", async () => {
    const account = await deleteAccount(1, 4);

    expect(account).toBeDefined();
    expect(account.id).toBeDefined();
    expect(account.id).toBe(1);
    expect(account.userId).toBe(4);

    expect(deleteAccountFromRepository).toBeCalledTimes(1);
    expect(deleteAccountFromRepository).toBeCalledWith(1, 4);
  });

  it("should trigger a bad request error when deleting an account with invalid account ID", async () => {
    await expect(deleteAccount(null, 4)).rejects.toThrowError(
      new HttpBadRequest("Invalid account ID")
    );
  });

  it("should trigger a bad request error when deleting an account with invalid user ID", async () => {
    await expect(deleteAccount(1, null)).rejects.toThrowError(
      new HttpBadRequest("Invalid user ID")
    );
  });

  it("should return an empty array when user has no accounts", async () => {
    getAccountsFromRepository.mockImplementationOnce(() => []);
    const accounts = await getAccounts(999); // 999 = userId sans comptes

    expect(accounts).toBeDefined();
    expect(accounts).toBeInstanceOf(Array);
    expect(accounts.length).toBe(0);
  });

  it("should patch an account with positive amount", async () => {
    const userId = 4;
    const initialAmount = 100.0;
    const amountToAdd = 50.0;

    const account = await createAccount({
      userId: userId,
      amount: initialAmount,
    });

    updateAccountInRepository.mockImplementationOnce(() => ({
      id: 4,
      userId: userId,
      amount: initialAmount + amountToAdd,
    }));

    const updatedAccount = await patchAccount(account.id, 50.0);

    expect(updatedAccount).toBeDefined();
    expect(updatedAccount.id).toBe(account.id);
    expect(updatedAccount.amount).toBe(150.0);
    expect(updateAccountInRepository).toBeCalledTimes(1);
    expect(updateAccountInRepository).toBeCalledWith(account.id, 50.0);

  });

    it("should patch an account with negative amount", async () => {
    const userId = 4;
    const initialAmount = 100.0;
    const amountToAdd = -50.0;

    const account = await createAccount({
      userId: userId,
      amount: initialAmount,
    });

    updateAccountInRepository.mockImplementationOnce(() => ({
      id: 4,
      userId: userId,
      amount: initialAmount - amountToAdd,
    }));

    const updatedAccount = await patchAccount(account.id, 50.0);

    expect(updatedAccount).toBeDefined();
    expect(updatedAccount.id).toBe(account.id);
    expect(updatedAccount.amount).toBe(150.0);
    expect(updateAccountInRepository).toBeCalledTimes(1);
    expect(updateAccountInRepository).toBeCalledWith(account.id, 50.0);
  });

  it("it should trigger a bad request error when patching an account with invalid account ID", async () => {
    await expect(patchAccount(null, 50.0)).rejects.toThrowError(
      new HttpBadRequest("Invalid account ID")
    );
  });

  it("it should trigger a bad request error when patching an account with invalid amount", async () => {
    await expect(patchAccount(1, "invalid")).rejects.toThrowError(
      new HttpBadRequest("Invalid amount")
    );
  });
});

import { describe, it, afterEach } from "vitest";
import { vi } from "vitest";
import { expect } from "vitest";

import { HttpBadRequest } from "@httpx/exception";
import { createTransfer, getTransfers } from "./transfer.service";
import { createTransfersInRepository } from "./transfer.repository";
import { patchAccount } from "../account/account.service";
import { updateAccountInRepository } from "../account/account.repository";

vi.mock("./transfer.repository", async (importOriginal) => ({
  ...(await importOriginal()),
  createTransfersInRepository: vi.fn((data) => {
    return {
      sourceAccountId: data.sourceAccountId,
      destAccountId: data.destAccountId,
      amount: data.amount,
    };
  }),
  getTransfersFromRepository: vi.fn((userId) => {
    return [
      { sourceAccountId: 1, destAccountId: 2, amount: 50.0 },
      { sourceAccountId: 1, destAccountId: 4, amount: 75.5 },
    ];
  }),
}));

vi.mock("../account/account.repository", async (importOriginal) => ({
  ...(await importOriginal()),
  updateAccountInRepository: vi.fn((data) => {
    return {
      id: data.id,
      userId: data.userId,
      amount: data.amount,
    };
  })
}));

describe("Transfer Service", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create a transfer", async () => {
    const transfer = await createTransfer({
      sourceAccountId: 3,
      destAccountId: 6,
      amount: 25.0,
    });

    expect(transfer).toBeDefined();
    expect(transfer.sourceAccountId).toBe(3);
    expect(transfer.destAccountId).toBe(6);
    expect(transfer.amount).toBe(25.0);
    expect(createTransfersInRepository).toBeCalledTimes(1);
    expect(createTransfersInRepository).toBeCalledWith({
      sourceAccountId: 3,
      destAccountId: 6,
      amount: 25.0,
    });
    expect(updateAccountInRepository).toBeCalledTimes(2);
    expect(updateAccountInRepository).toHaveBeenNthCalledWith(1, 3, -25.0);
    expect(updateAccountInRepository).toHaveBeenNthCalledWith(2, 6, 25.0);
  });

  it("should trigger a bad request error when transfer data is invalid", async () => {
    await expect(
      createTransfer({
        sourceAccountId: 3,
        destAccountId: 3, // Same account
        amount: 25.0,
      })
    ).rejects.toThrowError(
      new HttpBadRequest("Source and destination accounts cannot be the same")
    );
  });

  it("should trigger a bad request error when transfer amount is negative", async () => {
    await expect(
      createTransfer({
        sourceAccountId: 3,
        destAccountId: 6,
        amount: -25.0, 
      })
    ).rejects.toThrowError(new HttpBadRequest("Invalid transfer data"));
  });

  it("should get all transfers for a user", async () => {
    const mockTransfers = [
      { sourceAccountId: 1, destAccountId: 2, amount: 50.0 },
      { sourceAccountId: 1, destAccountId: 4, amount: 75.5 },
    ];
    const transfers = await getTransfers(123); // 123 = userId fictif

    expect(transfers).toBeDefined();
    expect(Array.isArray(transfers)).toBe(true);
    expect(transfers.length).toBe(2);

    transfers.forEach((transfer, idx) => {
      expect(transfer).toMatchObject(mockTransfers[idx]);
    });
  });

  it("should trigger a bad request error when getting transfers with invalid user ID", async () => {
    await expect(getTransfers(null)).rejects.toThrowError(
      new HttpBadRequest("Invalid user ID")
    );
  });

  it("should trigger a bad request error when getting transfers with non-numeric user ID", async () => {
    await expect(getTransfers("invalid")).rejects.toThrowError(
      new HttpBadRequest("Invalid user ID")
    );
  });
});

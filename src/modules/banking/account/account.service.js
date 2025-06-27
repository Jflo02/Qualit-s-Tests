import { HttpBadRequest } from "@httpx/exception";
import { z } from "zod";
import { createAccountInRepository, getAccountsFromRepository, deleteAccountFromRepository, updateAccountInRepository } from "./account.repository";

const AccountSchema = z.object({
  userId: z.number().int().positive(),
  amount: z.number(),
});

export async function createAccount(data) {
  const result = AccountSchema.safeParse(data);
    if (!result.success) {
        throw new HttpBadRequest("Invalid account data");
    }

    return createAccountInRepository(result.data);
  
}

export async function getAccounts(userId) {
  if (!userId || typeof userId !== 'number') {
    throw new HttpBadRequest("Invalid user ID");
  }
  
  return getAccountsFromRepository(userId);
}

export async function deleteAccount(accountId, userId) {
  if (!accountId || typeof accountId !== 'number') {
    throw new HttpBadRequest("Invalid account ID");
  }
  
  if (!userId || typeof userId !== 'number') {
    throw new HttpBadRequest("Invalid user ID");
  }

  return deleteAccountFromRepository(accountId, userId);
}

export async function patchAccount(accountId, amount) {
  if (!accountId || typeof accountId !== 'number') {
    throw new HttpBadRequest("Invalid account ID");
  }
  
  if (typeof amount !== 'number') {
    throw new HttpBadRequest("Invalid amount");
  }

  return updateAccountInRepository(accountId, amount);
}

import { HttpBadRequest } from "@httpx/exception";
import { z } from "zod";
import { patchAccount } from "../account/account.service";
import {
  createTransfersInRepository,
  getTransfersFromRepository,
} from "./transfer.repository";

const TransferSchema = z.object({
  sourceAccountId: z.number().int().positive(),
  destAccountId: z.number().int().positive(),
  amount: z.number().positive(),
});

export async function createTransfer(data) {
  const result = TransferSchema.safeParse(data);
  if (!result.success) {
    throw new HttpBadRequest("Invalid transfer data");
  }
  const { sourceAccountId, destAccountId, amount } = result.data;
  if (sourceAccountId === destAccountId) {
    throw new HttpBadRequest(
      "Source and destination accounts cannot be the same"
    );
  }

  try {
    await createTransfersInRepository(result.data);
    await patchAccount(sourceAccountId, -amount);
    await patchAccount(destAccountId, amount);
  } catch (error) {
    throw new HttpBadRequest("Transfer failed: " + error.message);
  }
  return {
    sourceAccountId,
    destAccountId,
    amount,
  };
}

export async function getTransfers(userId) {
  if (!userId || typeof userId !== "number") {
    throw new HttpBadRequest("Invalid user ID");
  }
  return getTransfersFromRepository(userId);
}

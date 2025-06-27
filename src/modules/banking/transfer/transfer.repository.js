import { sql } from "../../../infrastructure/db";

export async function createTransfersInRepository({
  sourceAccountId,
  destAccountId,
  amount,
}) {
  const transfers = await sql`
    INSERT INTO transfers (sourceAccountId, destAccountId, amount)
    VALUES (${sourceAccountId}, ${destAccountId}, ${amount})
    RETURNING *
    `;

  return transfers[0];
}

export async function getTransfersFromRepository(userId) {
  const transfers = await sql`
    SELECT * FROM transfers WHERE sourceAccountId IN (SELECT id FROM accounts WHERE userId = ${userId})
    OR destAccountId IN (SELECT id FROM accounts WHERE userId = ${userId})
    `;

  return transfers;
}


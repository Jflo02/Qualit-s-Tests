import { sql } from "../../../infrastructure/db";

export async function createAccountInRepository({ userId, amount }) {
  const accounts = await sql`
    INSERT INTO accounts (userId, amount)
    VALUES (${userId}, ${amount})
    RETURNING *
    `;

  return accounts[0];
}

export async function getAccountsFromRepository(userId) {
  const accounts = await sql`
    SELECT * FROM accounts WHERE userId = ${userId}
    `;

  return accounts;
}

export async function deleteAccountFromRepository(accountId, userId) {
  const result = await sql`
    DELETE FROM accounts WHERE id = ${accountId} AND userId = ${userId}
    RETURNING *
    `;

  if (result.length === 0) {
    throw new Error("Account not found or does not belong to the user");
  }

  return result[0];
}

export async function updateAccountInRepository(accountId, amountToAdd) {

    const result = await sql`
    UPDATE accounts
    SET amount = amount + ${amountToAdd}
    WHERE id = ${accountId}
    RETURNING *
    `;
    if (result.length === 0) {
        throw new Error("Account not found");
    }
    return result[0];
}
    
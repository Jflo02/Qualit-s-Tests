import { sql } from "../../../infrastructure/db";

export async function createUserInRepository({ name, birthday }) {
  const users = await sql`
    INSERT INTO users (name, birthday)
    VALUES (${name}, ${birthday})
    RETURNING *
    `;

  return users[0];
}

export async function getUserInRepository(userId) {
  const users = await sql`
    SELECT * FROM users
    WHERE id = ${userId}
  `;

  return users[0];
}

export async function deleteUserInRepository(userId) {
  const users = await sql`
    DELETE FROM users
    WHERE id = ${userId}
    RETURNING *
  `;

  return users[0];
}
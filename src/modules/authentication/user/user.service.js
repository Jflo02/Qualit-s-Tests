import { HttpBadRequest, HttpForbidden } from "@httpx/exception";
import { z } from "zod";
import { createUserInRepository, getUserInRepository, deleteUserInRepository } from "./user.repository";
import { calculateAge } from "../../../shared/utils";

export const MIN_USER_AGE = 18;

const UserSchema = z.object({
  name: z.string().min(2),
  birthday: z.date(),
});

export async function createUser(data) {
  const result = UserSchema.safeParse(data);

  if (result.success) {
    const age = calculateAge(result.data.birthday);

    if (age < MIN_USER_AGE) {
      throw new HttpForbidden("User is too young.");
    }
    return createUserInRepository(result.data);
  } else {
    throw new HttpBadRequest(result.error);
  }
}

export async function getUserById(userId) {
  if (!userId || typeof userId !== 'number') {
    throw new HttpBadRequest("Invalid user ID");
  }

  const user = await getUserInRepository(userId);
  if (!user) {
    throw new HttpBadRequest("User not found");
  }
  
  return user;
}

export async function deleteUserById(userId) {
  if (!userId || typeof userId !== 'number') {
    throw new HttpBadRequest("Invalid user ID");
  }
  
  const user = await deleteUserInRepository(userId);
  console.log("User deleted:", user);
  if (!user) {
    throw new HttpBadRequest("User not found");
  }


  
  return deleteUserById(userId);
}

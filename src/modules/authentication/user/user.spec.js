import { describe, it, expect } from "vitest";
import { createUser, deleteUserById, getUserById } from "./user.service";

describe("Authentification - Intégration", () => {
  it("doit permettre à un utilisateur existant de se connecter avec le bon mot de passe", async () => {
    const name = "jean";
    const birthday = new Date("2000-01-01");

    const result = await createUser({ name, birthday });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("id");
    expect(result.name).toBe(name);

    await getUserById(result.id).then((user) => {
      expect(user).toBeDefined();
      expect(user.id).toBe(result.id);
      expect(user.name).toBe(name);
      deleteUserById(result.id); // Nettoyage après le test
      return user;
    });
  });
});

import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUserByName(name: string) {
    const [result] = await db.select().from(users).where(eq(users.name, name));
    return result;
}

export async function getUserById(user_id:string) {
  const[result] = await db.select().from(users).where(eq(users.id, user_id));
  return result;
}
export async function getUsers() {
  const result = await db.select().from(users);
  return result;
}

export async function deleteAllUsers() {
  await db.delete(users);
}
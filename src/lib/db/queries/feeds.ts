import { eq } from "drizzle-orm";
import { db } from "..";
import { feeds } from "../schema";
import { getUserByName } from "./users";
import { readConfig } from "src/config";

export async function createFeed(name: string, url: string, user_id: string) {
    const [result] = await db.insert(feeds).values({ name: name, url: url, user_id:user_id}).returning();
    return result;
}
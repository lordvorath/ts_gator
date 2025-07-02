import { readConfig } from "src/config";
import { db } from "..";
import { feed_follows, feeds, users } from "../schema";
import { getUserById, getUserByName } from "./users";
import { eq } from "drizzle-orm";

export async function createFeed(name: string, url: string, user_id: string) {
    const [result] = await db.insert(feeds).values({ name: name, url: url, user_id:user_id}).returning();
    return result;
}

export async function getFeedByURL(url:string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}

export async function getFeeds() {
    const result = await db.select().from(feeds);
    return result;
}

export async function createFeedFollow(url:string, user_name: string) {
    try {
        const user = await getUserByName(user_name);
        const feed = await getFeedByURL(url);
        const [result] = await db.insert(feed_follows).values({user_id: user.id, feed_id: feed.id}).returning();
        return {
            id: result.id,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            user_id: result.user_id,
            feed_id: result.feed_id,
            user_name: user.name,
            feed_name: feed.name
        };
    } catch (err) {
        throw err;
    }

}

export async function getFeedFollowsForUser(user_name:string) {
    const user = await getUserByName(user_name);
    const results = await db.select({
        id: feed_follows.id,
        createdAt: feed_follows.createdAt,
        updatedAt: feed_follows.updatedAt,
        user_id: feed_follows.user_id,
        feed_id: feed_follows.feed_id,
        user_name: users.name,
        feed_name: feeds.name
    })
    .from(feed_follows).where(eq(feed_follows.user_id, user.id))
    .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id))
    .innerJoin(users, eq(feed_follows.user_id, users.id));
    return results;
}
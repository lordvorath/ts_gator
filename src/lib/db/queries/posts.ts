import { RSSItem } from "src/rss";
import { db } from "..";
import { Post, posts } from "../schema";
import { desc, eq, sql } from "drizzle-orm";

export async function createPost(post: RSSItem, feed_id: string) {
    let pubdate: Date;
    try {
        pubdate = new Date(post.pubDate);
    } catch (e) {
        throw e;
    }
    try {
        const [result] = await db.insert(posts).values({
            title: post.title,
            url: post.link,
            feed_id: feed_id,
            description: post.description,
            published_at: pubdate
        }).returning();
    } catch (err) {
        console.log(`error while inserting new post. Probably a duplicate...`)
    }
}

export async function getPostsForUser(user_id: string, max: number): Promise<Post[]> {
    const postList = await db.select().from(posts)
        .where(sql`posts.feed_id IN (SELECT ff.feed_id FROM feed_follows AS ff WHERE ff.user_id = ${user_id})`)
        .orderBy(desc(posts.published_at));
    return postList.slice(0, max);
}
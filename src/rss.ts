import { XMLParser } from "fast-xml-parser";
import { Feed, User } from "./lib/db/schema";

type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};

type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

export async function fetchFeedURL(feedURL: string) {
    feedURL = "https://www.wagslane.dev/index.xml";
    const res = await fetch(feedURL, {
        method: "GET",
        headers: {
            "User-Agent": "gator",
        },
    });
    const resText = await res.text();
    const xmlParser = new XMLParser();
    const feed: RSSFeed = xmlParser.parse(resText).rss;
    const channel = feed.channel;
    if (!channel) {
        throw new Error("channel not found in RSSFeed");
    }
    const { title, link, description } = channel;
    if (
        !title || !link || !description ||
        typeof title !== "string" ||
        typeof link !== "string" ||
        typeof description !== "string"
    ) {
        console.log("bad feed");
        console.log(`${typeof title}`);
        console.log(`${typeof link}`);
        console.log(`${typeof description}`);
        throw new Error("Bad feed")
    }
    let items = channel.item;
    if (!Array.isArray(items)) {
        items = [];
    }
    const blah: RSSItem[] = [];
    for (let i of items) {
        const { title, link, description, pubDate } = i;
        blah.push(i)
    }
    const out = {
        title: channel.title,
        link: channel.link,
        description: channel.description,
        items: blah,
    };
}

export function printFeed(feed: Feed, user: User) {
    console.log(`name: ${feed.name}`);
    console.log(`url: ${feed.url}`);
    console.log(`id: ${feed.id}`);
    console.log(`createdAt: ${feed.createdAt}`);
    console.log(`updatedAt: ${feed.updatedAt}`);
    console.log(`user_id: ${feed.user_id}`);
    console.log(`name: ${user.name}`);
}
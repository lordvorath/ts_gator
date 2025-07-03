import { XMLParser } from "fast-xml-parser";
import { Feed, User } from "./lib/db/schema";
import { getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds";

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
        !title || !link || !description
    ) {
        throw new Error("Bad feed")
    }
    let items = channel.item;
    if (!Array.isArray(items)) {
        items = [];
    }
    const blah: RSSItem[] = [];
    for (let i of items) {
        blah.push(i)
    }
    const out = {
        title: channel.title,
        link: channel.link,
        description: channel.description,
        items: blah,
    };
    return out;
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

export async function scrapeFeeds() {
    const nextFeed = await getNextFeedToFetch();
    await markFeedFetched(nextFeed.id);
    console.log(`Fetching feed ${nextFeed.name}`);
    const feed = await fetchFeedURL(nextFeed.url);
    for (let i of feed.items) {
        console.log(`* ${i.title}`);
    }
}


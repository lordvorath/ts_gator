import { url } from "inspector";
import { readConfig, setUser } from "./config.js";
import { createFeed, createFeedFollow, deleteFeedFollow, getFeedFollowsForUser, getFeeds } from "./lib/db/queries/feeds.js";
import { createUser, deleteAllUsers, getUserById, getUserByName, getUsers } from "./lib/db/queries/users.js";
import { printFeed, scrapeFeeds } from "./rss.js";
import { read } from "fs";
import { ConsoleLogWriter } from "drizzle-orm";
import { User } from "./lib/db/schema.js";
import { getPostsForUser } from "./lib/db/queries/posts.js";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;
export type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>;

export function middleWareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async function wrappedHandler(cmdName: string, ...args: string[]) {
        const userName = readConfig().currentUserName;
        const user = await getUserByName(userName);
        if (!user) {
            throw new Error(`User ${userName} not found`);
        }
        await handler(cmdName, user, ...args);
    }
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error(`Unknown command ${cmdName}`);
    }
    try {
        await handler(cmdName, ...args);
    } catch (err) {
        throw err;
    }
}

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error("wrong number of arguments. Usage: login <username>");
    }
    const user = await getUserByName(args[0]);
    if (!user) {
        throw new Error("User doesn't exists");
    }
    setUser(user.name);
    console.log(`User has been set to ${user.name}`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error("wrong number of arguments. Usage: register <username>");
    }
    const oldUser = await getUserByName(args[0]);
    if (oldUser) {
        throw new Error("User already exists");
    }
    const newUser = await createUser(args[0]);
    setUser(newUser.name);
    console.log(`User ${newUser.name} created successfully`);
    console.log(newUser);
}

export async function handlerReset(cmdName: string) {
    await deleteAllUsers();
}

export async function handlerGetUsers(cmdName: string) {
    const users = await getUsers();
    const currentUser = readConfig().currentUserName;
    for (let u of users) {
        console.log(`* ${u.name}${u.name === currentUser ? " (current)" : ""}`);
    }
}

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]) {
    if (args.length !== 2) {
        throw new Error("wrong number of arguments. Usage: addfeed <name> <url>");
    }
    const feed = await createFeed(args[0], args[1], user.id);
    const follow = await createFeedFollow(feed.url, user.name);
    console.log(`User ${user.name} added new feed:\n\t${follow.feed_name}`);
}

export async function handlerFeeds(cmdName: string) {
    const feeds = await getFeeds();
    for (let feed of feeds) {
        const user = await getUserById(feed.user_id);
        console.log(`* ${feed.name}\n\t${feed.url}\n\tAdded by: ${user.name}`);
    }
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error("wrong number of arguments. Usage: follow <url>");
    }
    const feedFollow = await createFeedFollow(args[0], user.name);
    console.log(`User ${user.name} is now following:\n${feedFollow.feed_name}`);
}

export async function handlerGetFeedFollows(cmdName: string, user: User) {
    const follows = await getFeedFollowsForUser(user.name);
    console.log(`User ${user.name} is currently following:`);
    for (let f of follows) {
        console.log(f.feed_name);
    }
}

export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error("wrong number of arguments. Usage: unfollow <url>");
    }
    await deleteFeedFollow(args[0], user.id);
}

function parseDuration(duration: string): number {
    const regex = /^(?<n>\d+)(?<t>ms|s|m|h)$/;
    const match = duration.match(regex);
    if (!match || !match?.groups) {
        throw new Error("bad duration format: <digits><ms|s|m|h>");
    }
    let mult: number;
    switch (match.groups.t) {
        case "ms": mult = 1; break;
        case "s": mult = 1000; break;
        case "m": mult = 1000 * 60; break;
        case "h": mult = 1000 * 60 * 60; break;
        default: throw new Error("unrecognized duration amount");
    }
    const n = parseInt(match.groups.n);
    return n * mult;
}
export async function handlerAggregate(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error("wrong number of arguments. Usage: agg <time_between_reqs>");
    }
    const duration = parseDuration(args[0]);
    console.log(`Collecting feeds every ${args[0]}: ${duration}ms`);
    scrapeFeeds().catch((reason) => {console.log(reason)});
    const intervalRef = setInterval(() => {
        scrapeFeeds().catch((reason) => {console.log(reason)});
    }, duration);
    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(intervalRef);
            resolve();
        });
    });
}

export async function handlerBrwse(cmdName: string, user: User, ...args: string[]) {
    const max = args[0] ? parseInt(args[0]) : 2;
    console.log(`Your latest RSS posts`);
    console.log(`=========================`);
    const result = await getPostsForUser(user.id, max);
    for (let p of result) {
        console.log(`** ${p.title}`);
        console.log(`Link: ${p.url}`);
    }
}
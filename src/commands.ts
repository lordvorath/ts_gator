import { readConfig, setUser } from "./config.js";
import { createUser, deleteAllUsers, getUserByName, getUsers } from "./lib/db/queries/users.js";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;

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

export async function handlerRegister(cmdName:string, ...args: string[]) {
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

export async function handlerReset(cmdName:string) {
    await deleteAllUsers();
}

export async function handlerGetUsers(cmdName:string) {
    const users = await getUsers();
    const currentUser = readConfig().currentUserName;
    for (let u of users) {
        console.log(`* ${u.name}${u.name === currentUser ? " (current)" : ""}`);
    }
}
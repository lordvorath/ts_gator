import { exit } from "process";
import { type CommandsRegistry, handlerAddFeed, handlerFeeds, handlerFollow, handlerGetFeedFollows, handlerGetUsers, handlerLogin, handlerRegister, handlerReset, registerCommand, runCommand } from "./commands.js";
import { fetchFeedURL } from "./rss.js";


async function main() {
  const cmds: CommandsRegistry = {};
  registerCommand(cmds, "login", handlerLogin);
  registerCommand(cmds, "register", handlerRegister);
  registerCommand(cmds, "reset", handlerReset);
  registerCommand(cmds, "users", handlerGetUsers);
  registerCommand(cmds, "agg", fetchFeedURL);
  registerCommand(cmds, "addfeed", handlerAddFeed);
  registerCommand(cmds, "feeds", handlerFeeds)
  registerCommand(cmds, "follow", handlerFollow);
  registerCommand(cmds, "following", handlerGetFeedFollows);
  let args = process.argv.slice(2);
  const cmdName = args[0];
  args = args.slice(1);
  try {
    await runCommand(cmds, cmdName, ...args);
  } catch (e) {
    console.log(e);
    exit(1);
  }
  exit(0);
}

main();
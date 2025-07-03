import { exit } from "process";
import { type CommandsRegistry, handlerAddFeed, handlerAggregate, handlerBrwse, handlerFeeds, handlerFollow, handlerGetFeedFollows, handlerGetUsers, handlerLogin, handlerRegister, handlerReset, handlerUnfollow, middleWareLoggedIn, registerCommand, runCommand } from "./commands.js";
import { fetchFeedURL } from "./rss.js";


async function main() {
  const cmds: CommandsRegistry = {};
  registerCommand(cmds, "login", handlerLogin);
  registerCommand(cmds, "register", handlerRegister);
  registerCommand(cmds, "reset", handlerReset);
  registerCommand(cmds, "users", handlerGetUsers);
  registerCommand(cmds, "agg", handlerAggregate);
  registerCommand(cmds, "addfeed", middleWareLoggedIn(handlerAddFeed));
  registerCommand(cmds, "feeds", handlerFeeds)
  registerCommand(cmds, "follow", middleWareLoggedIn(handlerFollow));
  registerCommand(cmds, "following", middleWareLoggedIn(handlerGetFeedFollows));
  registerCommand(cmds, "unfollow", middleWareLoggedIn(handlerUnfollow));
  registerCommand(cmds, "browse", middleWareLoggedIn(handlerBrwse));
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
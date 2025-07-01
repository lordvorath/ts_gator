import { exit } from "process";
import { type CommandsRegistry, handlerGetUsers, handlerLogin, handlerRegister, handlerReset, registerCommand, runCommand } from "./commands.js";


async function main() {
  const cmds: CommandsRegistry = {};
  registerCommand(cmds, "login", handlerLogin);
  registerCommand(cmds, "register", handlerRegister);
  registerCommand(cmds, "reset", handlerReset);
  registerCommand(cmds, "users", handlerGetUsers);
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
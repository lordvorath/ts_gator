import { exit } from "process";
import { type CommandsRegistry, handlerLogin, registerCommand, runCommand } from "./commands.js";


function main() {
  const cmds: CommandsRegistry = {};
  registerCommand(cmds, "login", handlerLogin);
  let args = process.argv.slice(2);
  const cmdName = args[0];
  args = args.slice(1);
  try {
    runCommand(cmds, cmdName, ...args);
  } catch (e) {
    console.log(e);
    exit(1);
  }
}

main();
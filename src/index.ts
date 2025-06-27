import { readConfig, setUser } from "./config";

function main() {
  console.log("Hello, world!");
  const user = "Stefano";
  setUser(user);
  const cfg = readConfig();
  console.log(cfg);
}

main();
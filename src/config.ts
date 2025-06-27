import fs from "fs";
import os from "os";
import path from "path";


export function setUser(user: string) {
    const cfg = readConfig();
    console.log(`setting user name`);
    console.log(cfg);
    cfg.currentUserName = user;
    console.log(cfg);
    writeConfig(cfg);
}

export function readConfig(): Config {
    const file = getConfigFilePath();
    console.log(`getting config file: ${file}`);
    try {
        const fd = fs.openSync(file, "r");
        const text = fs.readFileSync(fd, 'utf8');
        const data = JSON.parse(text);
        const validated = validateConfig(data);
        return validated;
    } catch (e) {
        throw e;
    }
}

function getConfigFilePath(): string {
    const filepath = path.join(os.homedir(), ".gatorconfig.json")
    return filepath;
}

function writeConfig(cfg: Config): void {
    const file = getConfigFilePath();
    console.log(`writing config file: ${file}`);
    const text = JSON.stringify(cfg);
    try {
        const fd = fs.openSync(file, "w");
        fs.writeFileSync(fd, text, 'utf8');
        return;
    } catch (e) {
        throw e;
    }
}

function validateConfig(rawConfig: any): Config {
    console.log(rawConfig);
    const keys = Object.keys(rawConfig);
    console.log(`keys: ${keys}`)
    let valid = false;
    for (let k of keys) {
        if (k === "dbUrl" || k === "db_url") {
            valid = true;
        }
        if (k === "currentUserName" || k === "current_user_name") {
            valid = true;
        }
    }
    if (!valid) {
        throw new Error("invalid config structure");
    }
    const validatedCOnfig: Config = {
        dbUrl: rawConfig.dbUrl,
        currentUserName: rawConfig.currentUserName
    }
    return validatedCOnfig;
}

export type Config = {
    dbUrl: string;
    currentUserName: string;
}
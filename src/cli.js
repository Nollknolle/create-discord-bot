#!/usr/bin/env node
import inquirer from "inquirer";
import { execSync } from "child_process";
import logSymbols from "log-symbols";
import fs from "fs";

const questions = [
  {
    type: "input",
    name: "repoName",
    message: "What is the name of your project?",
    validate: (input) => {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else
        return "Project name may only include letters, numbers, underscores and hashes.";
    },
  },
  {
    type: "input",
    name: "repoDescription",
    message: "What is the description of your project?",
    default: "A Discord bot made with discord.js",
  },
  {
    type: "input",
    name: "repoAuthor",
    message: "What is the author of your project?",
  },
  {
    type: "input",
    name: "discordToken",
    message:
      "What is your Discord bot token? If you haven't one already press ENTER.",
    default: "NO_TOKEN",
  },
  {
    type: "input",
    name: "clientID",
    message:
      "What is your Discord bot client ID? If you haven't one already press ENTER.",
    default: "NO_CLIENT_ID",
  },
  {
    type: "input",
    name: "devGuildID",
    message:
      "What is your Discord bot development guild ID? If you haven't one already press ENTER.",
    default: "NO_DEV_GUILD_ID",
  },
];

const createProject = async () => {
  let answer = await inquirer.prompt(questions);
  const repoName = answer.repoName;
  const repoAuthor = answer.repoAuthor;
  const repoDescription = answer.repoDescription;
  const discordToken = answer.discordToken;
  const clientID = answer.clientID;
  const devGuildID = answer.devGuildID;

  const gitCloneCommand = `git clone --depth 1 https://github.com/Nollknolle/create-discord-bot-source.git ${repoName}`;
  const installDependenciesCommand = `cd ${repoName} && npm install`;

  console.log(logSymbols.info, "Cloning repository...");
  const isCloned = runCommand(gitCloneCommand);
  if (!isCloned) process.exit(-1);

  console.log(logSymbols.info, "Installing dependencies...");
  const isInstalled = runCommand(installDependenciesCommand);
  if (!isInstalled) process.exit(-1);

  console.log(logSymbols.info, "Changing package.json...");
  const isPackageJsonChanged = changePackageJson(
    repoName,
    repoAuthor,
    repoDescription
  );
  if (!isPackageJsonChanged) process.exit(-1);

  console.log(logSymbols.info, "Creating .env file...");
  const isEnvFileCreated = createEnvFile(
    repoName,
    discordToken,
    clientID,
    devGuildID
  );
  if (!isEnvFileCreated) process.exit(-1);

  console.log(logSymbols.success, "Project created successfully!");
  console.log(
    logSymbols.success,
    "To start your bot, run the following command:"
  );
  console.log(logSymbols.success, `cd ${repoName} && npm start`);
  if (discordToken === "NO_TOKEN")
    console.log(
      logSymbols.warning,
      "You haven't set a Discord bot token. You can do this later in the .env file."
    );
  if (clientID === "NO_CLIENT_ID")
    console.log(
      logSymbols.warning,
      "You haven't set a Discord bot client ID. You can do this later in the .env file."
    );
  if (devGuildID === "NO_DEV_GUILD_ID")
    console.log(
      logSymbols.warning,
      "You haven't set a Discord bot development guild ID. You can do this later in the .env file."
    );
};

createProject();

// Methods
const runCommand = (command) => {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(logSymbols.error, error);
    return false;
  }

  return true;
};

const changePackageJson = (repoName, repoAuthor, repoDescription) => {
  try {
    // Read the old package.json
    const old_pjson = JSON.parse(
      fs.readFileSync(`./${repoName}/package.json`, "utf8")
    );

    // Change the repository name
    old_pjson.name = repoName;

    // Change the author
    old_pjson.author = repoAuthor;

    // Change the description
    old_pjson.description =
      repoDescription +
      " | powered by Nlmyr (https://www.npmjs.com/package/@nlmyr/create-discord-bot)";

    // Write the new package.json
    fs.writeFileSync(
      `./${repoName}/package.json`,
      JSON.stringify(old_pjson, null, 2)
    );
  } catch (error) {
    console.error(logSymbols.error, error);
    return false;
  }

  return true;
};

const createEnvFile = (repoName, discordToken, clientID, devGuildID) => {
  try {
    // Write the .env file
    fs.writeFileSync(
      `./${repoName}/.env`,
      `DISCORD_TOKEN=${discordToken}\nCLIENT_ID=${clientID}\nDEV_GUILD_ID=${devGuildID}`
    );
  } catch (error) {
    console.error(logSymbols.error, error);
    return false;
  }

  return true;
};

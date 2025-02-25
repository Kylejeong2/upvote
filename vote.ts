/**
 * Simple script to run a single vote for Connor Jeong
 */

import { Stagehand } from "@browserbasehq/stagehand";
import StagehandConfig from "./stagehand.config.js";
import chalk from "chalk";
import { main } from "./main.js";

async function runSingleVote() {
  console.log(chalk.blue("Starting single vote for Connor Jeong..."));
  
  try {
    const stagehand = new Stagehand({
      ...StagehandConfig,
    });
    await stagehand.init();
    
    const page = stagehand.page;
    const context = stagehand.context;
    
    await main({
      page,
      context,
      stagehand,
    });
    
    await stagehand.close();
    console.log(chalk.green("Vote completed successfully!"));
  } catch (error) {
    console.error(chalk.red("Error during voting:"), error);
    process.exit(1);
  }
}

// Run the single vote
runSingleVote(); 
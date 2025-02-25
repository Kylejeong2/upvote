/**
 * Parallel voting script that opens multiple browser instances to vote simultaneously
 */

import { Stagehand } from "@browserbasehq/stagehand";
import StagehandConfig from "./stagehand.config.js";
import chalk from "chalk";
import { main } from "./main.js";

// Configuration
const PARALLEL_INSTANCES = 15; // Number of parallel browser instances
const VOTES_PER_INSTANCE = 1; // Number of votes per instance

/**
 * Run a single voting session with a new browser instance
 */
async function runVotingSession(instanceId: number): Promise<boolean> {
  console.log(chalk.blue(`[Instance ${instanceId}] Starting voting session...`));
  
  try {
    // Create a new Stagehand instance
    const stagehand = new Stagehand({
      ...StagehandConfig,
    });
    await stagehand.init();
    
    const page = stagehand.page;
    const context = stagehand.context;
    
    // Run the main voting function
    await main({
      page,
      context,
      stagehand,
    });
    
    // Close the browser
    await stagehand.close();
    console.log(chalk.green(`[Instance ${instanceId}] Voting session completed successfully!`));
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`[Instance ${instanceId}] Error during voting session:`), errorMessage);
    return false;
  }
}

/**
 * Run multiple voting sessions for a single instance
 */
async function runInstanceVotes(instanceId: number): Promise<{ successful: number, failed: number }> {
  let successful = 0;
  let failed = 0;
  
  for (let i = 0; i < VOTES_PER_INSTANCE; i++) {
    const success = await runVotingSession(instanceId);
    if (success) {
      successful++;
    } else {
      failed++;
    }
    
    // Add a small random delay between votes
    if (i < VOTES_PER_INSTANCE - 1) {
      const delay = 1000 + Math.random() * 2000;
      console.log(chalk.yellow(`[Instance ${instanceId}] Waiting ${Math.round(delay/1000)} seconds before next vote...`));
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { successful, failed };
}

/**
 * Main function to run parallel voting
 */
async function runParallelVoting() {
  console.log(chalk.green("=".repeat(50)));
  console.log(chalk.green(`Starting parallel voting with ${PARALLEL_INSTANCES} instances`));
  console.log(chalk.green(`Each instance will cast ${VOTES_PER_INSTANCE} vote(s)`));
  console.log(chalk.green(`Total votes: ${PARALLEL_INSTANCES * VOTES_PER_INSTANCE}`));
  console.log(chalk.green("=".repeat(50)));
  
  const startTime = new Date();
  
  // Create an array of instance IDs
  const instanceIds = Array.from({ length: PARALLEL_INSTANCES }, (_, i) => i + 1);
  
  // Run all instances in parallel
  const results = await Promise.all(
    instanceIds.map(instanceId => runInstanceVotes(instanceId))
  );
  
  // Calculate totals
  const totalSuccessful = results.reduce((sum, result) => sum + result.successful, 0);
  const totalFailed = results.reduce((sum, result) => sum + result.failed, 0);
  
  const endTime = new Date();
  const elapsedSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
  
  console.log(chalk.green("=".repeat(50)));
  console.log(chalk.green(`Parallel voting completed in ${elapsedSeconds.toFixed(2)} seconds`));
  console.log(chalk.green(`Total votes: ${totalSuccessful} successful, ${totalFailed} failed`));
  console.log(chalk.green("=".repeat(50)));
}

// Run the parallel voting
runParallelVoting().catch(error => {
  console.error(chalk.red("Fatal error in parallel voting:"), error);
  process.exit(1);
});
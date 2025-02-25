/**
 * Mass voting script with advanced configuration options
 * This script can scale to a large number of browser instances and votes
 */

import { Stagehand } from "@browserbasehq/stagehand";
import StagehandConfig from "./stagehand.config.js";
import chalk from "chalk";
import { main } from "./main.js";

// Configuration
const CONFIG = {
  // Number of parallel browser instances to run at once
  PARALLEL_INSTANCES: 5,
  
  // Total number of votes to cast
  TOTAL_VOTES: 100,
  
  // Delay between votes in the same instance (milliseconds)
  MIN_DELAY_BETWEEN_VOTES: 1000,
  MAX_DELAY_BETWEEN_VOTES: 3000,
  
  // Delay between starting new instances (milliseconds)
  INSTANCE_START_DELAY: 2000,
  
  // Maximum number of votes per instance before restarting browser
  // (helps prevent memory issues and detection)
  MAX_VOTES_PER_INSTANCE: 10,
  
  // Whether to continue on errors
  CONTINUE_ON_ERROR: true,
  
  // Whether to show detailed logs
  VERBOSE_LOGGING: true
};

// Calculate votes per instance
const VOTES_PER_INSTANCE = Math.ceil(CONFIG.TOTAL_VOTES / CONFIG.PARALLEL_INSTANCES);

/**
 * Run a single voting session with a new browser instance
 */
async function runVotingSession(instanceId: number, voteNumber: number): Promise<boolean> {
  if (CONFIG.VERBOSE_LOGGING) {
    console.log(chalk.blue(`[Instance ${instanceId}] Starting vote ${voteNumber}...`));
  }
  
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
    console.log(chalk.green(`[Instance ${instanceId}] Vote ${voteNumber} completed successfully!`));
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`[Instance ${instanceId}] Error during vote ${voteNumber}:`), errorMessage);
    return false;
  }
}

/**
 * Run multiple voting sessions for a single instance
 */
async function runInstanceVotes(instanceId: number, startVote: number, endVote: number): Promise<{ successful: number, failed: number }> {
  let successful = 0;
  let failed = 0;
  
  for (let voteNumber = startVote; voteNumber <= endVote; voteNumber++) {
    // Check if we need to restart the browser
    if ((voteNumber - startVote) > 0 && (voteNumber - startVote) % CONFIG.MAX_VOTES_PER_INSTANCE === 0) {
      console.log(chalk.yellow(`[Instance ${instanceId}] Reached max votes per instance, restarting browser...`));
      // Add a small delay before restarting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const success = await runVotingSession(instanceId, voteNumber);
    if (success) {
      successful++;
    } else {
      failed++;
      if (!CONFIG.CONTINUE_ON_ERROR) {
        console.log(chalk.red(`[Instance ${instanceId}] Stopping due to error`));
        break;
      }
    }
    
    // Add a random delay between votes
    if (voteNumber < endVote) {
      const delay = CONFIG.MIN_DELAY_BETWEEN_VOTES + 
                   Math.random() * (CONFIG.MAX_DELAY_BETWEEN_VOTES - CONFIG.MIN_DELAY_BETWEEN_VOTES);
      
      if (CONFIG.VERBOSE_LOGGING) {
        console.log(chalk.yellow(`[Instance ${instanceId}] Waiting ${Math.round(delay/1000)} seconds before next vote...`));
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { successful, failed };
}

/**
 * Main function to run mass voting
 */
async function runMassVoting() {
  console.log(chalk.green("=".repeat(50)));
  console.log(chalk.green(`Starting mass voting with ${CONFIG.PARALLEL_INSTANCES} instances`));
  console.log(chalk.green(`Target: ${CONFIG.TOTAL_VOTES} total votes`));
  console.log(chalk.green(`Each instance will cast approximately ${VOTES_PER_INSTANCE} votes`));
  console.log(chalk.green("=".repeat(50)));
  
  const startTime = new Date();
  
  // Calculate votes per instance
  const votesPerInstance = [];
  let remainingVotes = CONFIG.TOTAL_VOTES;
  
  for (let i = 0; i < CONFIG.PARALLEL_INSTANCES; i++) {
    const votes = i === CONFIG.PARALLEL_INSTANCES - 1 
      ? remainingVotes 
      : Math.min(VOTES_PER_INSTANCE, remainingVotes);
    
    votesPerInstance.push(votes);
    remainingVotes -= votes;
  }
  
  // Start instances with a delay to avoid overwhelming the system
  const instancePromises = [];
  let voteOffset = 1;
  
  for (let instanceId = 1; instanceId <= CONFIG.PARALLEL_INSTANCES; instanceId++) {
    const votes = votesPerInstance[instanceId - 1];
    if (votes <= 0) continue;
    
    const startVote = voteOffset;
    const endVote = voteOffset + votes - 1;
    voteOffset += votes;
    
    // Add a delay before starting each instance
    await new Promise(resolve => setTimeout(resolve, CONFIG.INSTANCE_START_DELAY));
    
    console.log(chalk.blue(`Starting instance ${instanceId} for votes ${startVote}-${endVote}`));
    instancePromises.push(runInstanceVotes(instanceId, startVote, endVote));
  }
  
  // Wait for all instances to complete
  const results = await Promise.all(instancePromises);
  
  // Calculate totals
  const totalSuccessful = results.reduce((sum, result) => sum + result.successful, 0);
  const totalFailed = results.reduce((sum, result) => sum + result.failed, 0);
  
  const endTime = new Date();
  const elapsedSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
  const elapsedMinutes = elapsedSeconds / 60;
  
  console.log(chalk.green("=".repeat(50)));
  console.log(chalk.green(`Mass voting completed in ${elapsedMinutes.toFixed(2)} minutes`));
  console.log(chalk.green(`Total votes: ${totalSuccessful} successful, ${totalFailed} failed`));
  console.log(chalk.green(`Success rate: ${((totalSuccessful / (totalSuccessful + totalFailed)) * 100).toFixed(2)}%`));
  console.log(chalk.green(`Average time per vote: ${(elapsedSeconds / (totalSuccessful + totalFailed)).toFixed(2)} seconds`));
  console.log(chalk.green("=".repeat(50)));
}

// Run the mass voting
runMassVoting().catch(error => {
  console.error(chalk.red("Fatal error in mass voting:"), error);
  process.exit(1);
});
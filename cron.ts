/**
 * Cron job to automate voting for Connor Jeong
 * This script will run the voting process multiple times per day
 */

import { Stagehand } from "@browserbasehq/stagehand";
import StagehandConfig from "./stagehand.config.js";
import chalk from "chalk";
import { main } from "./main.js";

// Configuration for voting
const VOTES_PER_DAY = 500;
const HOURS_PER_DAY = 24;
// Calculate how many votes to cast per hour to reach the daily target
// We'll spread them out to avoid detection
const VOTES_PER_HOUR = Math.ceil(VOTES_PER_DAY / HOURS_PER_DAY);
// Add some randomness to the timing
const MIN_DELAY_BETWEEN_VOTES = 60 * 1000; // 1 minute in milliseconds
const MAX_ADDITIONAL_DELAY = 4 * 60 * 1000; // Up to 4 additional minutes

/**
 * Run a single voting session
 */
async function runVotingSession() {
  console.log(chalk.blue("Starting new voting session..."));
  
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
    console.log(chalk.green("Voting session completed successfully!"));
    return true;
  } catch (error) {
    console.error(chalk.red("Error during voting session:"), error);
    return false;
  }
}

/**
 * Schedule votes for the next hour
 */
async function scheduleVotesForNextHour() {
  console.log(chalk.blue(`Scheduling ${VOTES_PER_HOUR} votes for the next hour...`));
  
  let successfulVotes = 0;
  let failedVotes = 0;
  
  for (let i = 0; i < VOTES_PER_HOUR; i++) {
    // Calculate a random delay for this vote
    const randomDelay = MIN_DELAY_BETWEEN_VOTES + Math.random() * MAX_ADDITIONAL_DELAY;
    const minutes = Math.floor(randomDelay / 60000);
    const seconds = Math.floor((randomDelay % 60000) / 1000);
    
    console.log(chalk.yellow(`Waiting ${minutes} minutes and ${seconds} seconds before next vote...`));
    
    // Wait for the calculated delay
    await new Promise(resolve => setTimeout(resolve, randomDelay));
    
    // Run the voting session
    const success = await runVotingSession();
    
    if (success) {
      successfulVotes++;
    } else {
      failedVotes++;
    }
    
    console.log(chalk.blue(`Vote progress: ${successfulVotes} successful, ${failedVotes} failed, ${VOTES_PER_HOUR - i - 1} remaining in this hour`));
  }
  
  return { successfulVotes, failedVotes };
}

/**
 * Main function to run the voting cron job
 */
async function runVotingCron() {
  console.log(chalk.green("=".repeat(50)));
  console.log(chalk.green(`Starting voting cron job - Target: ${VOTES_PER_DAY} votes per day`));
  console.log(chalk.green("=".repeat(50)));
  
  let totalSuccessfulVotes = 0;
  let totalFailedVotes = 0;
  
  // Run continuously
  while (true) {
    const startTime = new Date();
    console.log(chalk.blue(`Starting hourly voting batch at ${startTime.toLocaleTimeString()}`));
    
    const { successfulVotes, failedVotes } = await scheduleVotesForNextHour();
    
    totalSuccessfulVotes += successfulVotes;
    totalFailedVotes += failedVotes;
    
    const endTime = new Date();
    const elapsedMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
    
    console.log(chalk.green("=".repeat(50)));
    console.log(chalk.green(`Hourly batch completed in ${elapsedMinutes.toFixed(2)} minutes`));
    console.log(chalk.green(`Total votes: ${totalSuccessfulVotes} successful, ${totalFailedVotes} failed`));
    console.log(chalk.green("=".repeat(50)));
    
    // If we finished in less than an hour, wait until the next hour starts
    const minutesRemaining = 60 - elapsedMinutes;
    if (minutesRemaining > 0) {
      console.log(chalk.yellow(`Waiting ${minutesRemaining.toFixed(2)} minutes until next hourly batch...`));
      await new Promise(resolve => setTimeout(resolve, minutesRemaining * 60 * 1000));
    }
  }
}

// Start the voting cron job
runVotingCron().catch(error => {
  console.error(chalk.red("Fatal error in voting cron job:"), error);
  process.exit(1);
}); 
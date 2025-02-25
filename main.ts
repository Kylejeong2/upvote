/**
 * 🤘 Welcome to Stagehand!
 *
 * TO RUN THIS PROJECT:
 * ```
 * npm install
 * npm run start
 * ```
 *
 * To edit config, see `stagehand.config.ts`
 *
 */
import { Page, BrowserContext, Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import chalk from "chalk";
import dotenv from "dotenv";
import { actWithCache, drawObserveOverlay, clearOverlays } from "./utils.js";

dotenv.config();

export async function main({
  page,
  context,
  stagehand,
}: {
  page: Page; // Playwright Page with act, extract, and observe methods
  context: BrowserContext; // Playwright BrowserContext
  stagehand: Stagehand; // Stagehand instance
}) {
  console.log(chalk.blue("Starting vote automation for Connor Jeong..."));
  
  try {
    // Navigate to the voting page with a modified timeout and wait until domcontentloaded
    await page.goto("https://www.mercurynews.com/2025/02/24/vote-now-bay-area-news-group-boys-athlete-of-the-week-144/", {
      timeout: 60000, // Increase timeout to 60 seconds
      waitUntil: 'domcontentloaded' // Only wait until DOM is loaded, not all resources
    });
    console.log(chalk.green("✓ Navigated to Mercury News voting page"));
    
    // Wait a moment for any scripts to initialize
    await page.waitForTimeout(5000);
    
    // Find and click the checkbox for Connor Jeong directly
    const selectCheckboxResults = await page.observe("Click the checkbox next to Connor Jeong, Castro Valley wrestling");
    await drawObserveOverlay(page, selectCheckboxResults);
    await page.waitForTimeout(1000);
    await clearOverlays(page);
    await page.act(selectCheckboxResults[0]);
    console.log(chalk.green("✓ Selected Connor Jeong's checkbox"));
    
    // Wait a moment before clicking vote
    await page.waitForTimeout(1000);
    
    // Click the vote button
    const voteButtonResults = await page.observe({
      instruction: "Click the Vote button",
      returnAction: true,
    });
    await drawObserveOverlay(page, voteButtonResults);
    await page.waitForTimeout(1000);
    await clearOverlays(page);
    await page.act(voteButtonResults[0]);
    console.log(chalk.green("✓ Clicked the Vote button"));
    
    // Wait to see confirmation
    await page.waitForTimeout(3000);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(chalk.red("Error during automation:"), errorMessage);
  }
  
  console.log(chalk.blue("Vote automation completed!"));
}

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
// import { z } from "zod";
import chalk from "chalk";
import dotenv from "dotenv";
// import { actWithCache, drawObserveOverlay, clearOverlays } from "./utils.js";

dotenv.config();

// export async function main({
//   page,
//   context,
//   stagehand,
// }: {
//   page: Page; // Playwright Page with act, extract, and observe methods
//   context: BrowserContext; // Playwright BrowserContext
//   stagehand: Stagehand; // Stagehand instance
// }) {
//   console.log(chalk.blue("Starting vote automation for Connor Jeong..."));
  
//   try {
//     // Navigate to the voting page with a modified timeout and wait until domcontentloaded
//     await page.goto("https://www.mercurynews.com/2025/02/24/vote-now-bay-area-news-group-boys-athlete-of-the-week-144/", {
//       timeout: 60000, // Increase timeout to 60 seconds
//       waitUntil: 'domcontentloaded' // Only wait until DOM is loaded, not all resources
//     });
//     console.log(chalk.green("✓ Navigated to Mercury News voting page"));
    
//     // Wait a moment for any scripts to initialize
//     await page.waitForTimeout(5000);
    
//     // Find and click the checkbox for Connor Jeong directly
//     const selectCheckboxResults = await page.observe("Click the checkbox next to Connor Jeong, Castro Valley wrestling");
//     await drawObserveOverlay(page, selectCheckboxResults);
//     await page.waitForTimeout(1000);
//     await clearOverlays(page);
//     await page.act(selectCheckboxResults[0]);
//     console.log(chalk.green("✓ Selected Connor Jeong's checkbox"));
    
//     // Wait a moment before clicking vote
//     await page.waitForTimeout(1000);
    
//     // Click the vote button
//     const voteButtonResults = await page.observe({
//       instruction: "Click the Vote button",
//       returnAction: true,
//     });
//     await drawObserveOverlay(page, voteButtonResults);
//     await page.waitForTimeout(1000);
//     await clearOverlays(page);
//     await page.act(voteButtonResults[0]);
//     console.log(chalk.green("✓ Clicked the Vote button"));
    
//     // Wait to see confirmation
//     await page.waitForTimeout(3000);
    
//     // Check if vote was successful
//     try {
//       const { confirmation } = await page.extract({
//         instruction: "Extract any confirmation message that appears after voting",
//         schema: z.object({
//           confirmation: z.string(),
//         }),
//         useTextExtract: true,
//       });
//       console.log(chalk.green("Vote confirmation:"), confirmation);
//     } catch (error) {
//       console.log(chalk.yellow("Could not extract confirmation message, but vote may still have been successful"));
//     }
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     console.log(chalk.red("Error during automation:"), errorMessage);
//   }
  
//   console.log(chalk.blue("Vote automation completed!"));
// }

// New implementation using direct Playwright selectors for speed
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
      timeout: 120000, // Increase timeout to 120 seconds
      waitUntil: 'domcontentloaded' // Only wait until DOM is loaded, not all resources
    });
    console.log(chalk.green("✓ Navigated to Mercury News voting page"));
    
    // Wait longer for any scripts to initialize
    await page.waitForTimeout(5000);
    
    // Try to find the iframe if it exists (polls are often in iframes)
    try {
      const frameElement = await page.$('iframe[id*="poll"]');
      if (frameElement) {
        const frameSrc = await frameElement.getAttribute('src');
        console.log(chalk.blue(`Found poll iframe with src: ${frameSrc}`));
        
        // Switch to the iframe
        const pollFrame = page.frame({ url: frameSrc || '' });
        if (pollFrame) {
          console.log(chalk.green("✓ Switched to poll iframe"));
          
          // Directly click the checkbox for Connor Jeong using the provided selector in the iframe
          const checkboxSelector = 'input#PDI_answer66898754';
          await pollFrame.waitForSelector(checkboxSelector, { timeout: 30000 });
          await pollFrame.click(checkboxSelector);
          console.log(chalk.green("✓ Selected Connor Jeong's checkbox in iframe"));
          
          // Wait a moment before clicking vote
          await page.waitForTimeout(1000);
          
          // Click the vote button using the provided selector
          const voteButtonSelector = 'button#pd-vote-button15105118';
          await pollFrame.waitForSelector(voteButtonSelector, { timeout: 30000 });
          await pollFrame.click(voteButtonSelector);
          console.log(chalk.green("✓ Clicked the Vote button in iframe"));
          
          // Wait to see confirmation
          await page.waitForTimeout(3000);
          
          // Check if vote was successful by looking for the exact thank you message
          try {
            const thankYouSelector = 'div.pds-question-top';
            const thankYouElement = await pollFrame.waitForSelector(thankYouSelector, { timeout: 10000 });
            const confirmationText = await thankYouElement.textContent();
            
            if (confirmationText && confirmationText.includes("Thank you for voting!")) {
              console.log(chalk.green("Vote confirmation:"), "Thank you for voting!");
            } else {
              console.log(chalk.yellow("Vote may have been successful, but confirmation message was different:"), 
                confirmationText?.trim() || "No confirmation text found");
            }
          } catch (error) {
            console.log(chalk.yellow("Could not extract confirmation message from iframe, but vote may still have been successful"));
          }
          
          return; // Exit the function since we've handled the iframe case
        }
      }
    } catch (frameError) {
      console.log(chalk.yellow("No iframe found or error accessing iframe, trying direct page access"));
    }
    
    // If we get here, we're working with the main page (no iframe or iframe handling failed)
    
    // Directly click the checkbox for Connor Jeong using the provided selector
    const checkboxSelector = 'input#PDI_answer66898754';
    await page.waitForSelector(checkboxSelector, { timeout: 30000 });
    await page.click(checkboxSelector);
    console.log(chalk.green("✓ Selected Connor Jeong's checkbox"));
    
    // Wait a moment before clicking vote
    await page.waitForTimeout(1000);
    
    // Click the vote button using the provided selector
    const voteButtonSelector = 'button#pd-vote-button15105118';
    await page.waitForSelector(voteButtonSelector, { timeout: 30000 });
    await page.click(voteButtonSelector);
    console.log(chalk.green("✓ Clicked the Vote button"));
    
    // Wait to see confirmation
    await page.waitForTimeout(3000);
    
    // Check if vote was successful by looking for the exact thank you message
    try {
      // Using the exact selector for the thank you message
      const thankYouSelector = 'div.pds-question-top';
      const thankYouElement = await page.waitForSelector(thankYouSelector, { timeout: 10000 });
      const confirmationText = await thankYouElement.textContent();
      
      if (confirmationText && confirmationText.includes("Thank you for voting!")) {
        console.log(chalk.green("Vote confirmation:"), "Thank you for voting!");
      } else {
        console.log(chalk.yellow("Vote may have been successful, but confirmation message was different:"), 
          confirmationText?.trim() || "No confirmation text found");
      }
    } catch (error) {
      console.log(chalk.yellow("Could not extract confirmation message, but vote may still have been successful"));
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(chalk.red("Error during automation:"), errorMessage);
  }
  
  console.log(chalk.blue("Vote automation completed!"));
}
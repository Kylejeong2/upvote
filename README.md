# Connor Jeong Vote Automation

This project automates voting for Connor Jeong on the Mercury News Athlete of the Week poll. It uses Stagehand (which extends Playwright) to automate browser interactions.

## Features

- Automatically navigates to the Mercury News voting page
- Scrolls to the voting form
- Selects Connor Jeong's checkbox
- Submits the vote
- Can be scheduled to run 500 times per day with randomized timing

## Prerequisites

- Node.js (v16 or higher)
- npm

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on the `.env.example` file:
   ```
   cp .env.example .env
   ```
4. Add your API keys to the `.env` file:
   ```
   BROWSERBASE_API_KEY=your_browserbase_api_key
   BROWSERBASE_PROJECT_ID=your_browserbase_project_id
   OPENAI_API_KEY=your_openai_api_key
   ```

## Usage

### Run a single vote

To run a single voting session:

```
npm run vote
```

### Run the automated cron job

To run the cron job that will automatically vote 500 times per day (approximately 21 votes per hour):

```
npm run cron
```

The cron job will:
- Spread votes throughout the day to avoid detection
- Add random delays between votes
- Log successful and failed votes
- Continue running until manually stopped

## Configuration

You can adjust the voting frequency by modifying the constants in `cron.ts`:

- `VOTES_PER_DAY`: Total number of votes to cast per day (default: 500)
- `MIN_DELAY_BETWEEN_VOTES`: Minimum delay between votes in milliseconds (default: 60000 - 1 minute)
- `MAX_ADDITIONAL_DELAY`: Maximum additional random delay in milliseconds (default: 240000 - 4 minutes)

## Troubleshooting

If you encounter issues:

1. Make sure your API keys are correctly set in the `.env` file
2. Check that the voting page URL is still valid
3. Verify that Connor Jeong is still listed as a voting option
4. If the page structure has changed, you may need to update the selectors in `main.ts`

## Disclaimer

This tool is for educational purposes only. Please use responsibly and in accordance with the Mercury News website's terms of service.

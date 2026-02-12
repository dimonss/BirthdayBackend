import TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import { BOT_TOKEN, PAGES_DIR } from './config.js';
import { registerCommands } from './bot/commands.js';
import { registerMessageHandlers } from './bot/messages.js';
import { registerCallbackHandlers } from './bot/callbacks.js';
import { startApiServer } from './api.js';

// Create pages directory if it doesn't exist
if (!fs.existsSync(PAGES_DIR!)) {
    fs.mkdirSync(PAGES_DIR!);
}

// Initialize bot with your token
const bot = new TelegramBot(BOT_TOKEN!, { polling: true });

// Register all handlers
registerCommands(bot);
registerMessageHandlers(bot);
registerCallbackHandlers(bot);

// Start HTTP API server
startApiServer();

console.log('Bot is running...');

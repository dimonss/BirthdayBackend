import TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as path from 'path';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get bot token from environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not defined in environment variables');
}
console.log('BOT_TOKEN');
console.log(BOT_TOKEN);
// Initialize bot with your token
const bot = new TelegramBot(BOT_TOKEN, {polling: true});

// Create pages directory if it doesn't exist
const pagesDir = path.join(__dirname, 'pages');
if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir);
}

// Handle incoming messages
bot.on('message', async (msg: any) => {
    const chatId = msg.chat.id;
    const username = msg.from?.username || 'unknown_user';
    const userDir = path.join(pagesDir, username);

    // Create user directory if it doesn't exist
    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir);
    }

    // Handle photo messages
    if (msg.photo) {
        try {
            // Get the largest photo
            const photo = msg.photo[msg.photo.length - 1];
            const fileId = photo.file_id;

            // Get file path from Telegram
            const file = await bot.getFile(fileId);
            const filePath = file.file_path;

            // Download the file
            const photoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
            const response = await fetch(photoUrl);
            const buffer = await response.arrayBuffer();

            // Save the file
            const photoPath = path.join(userDir, 'photo.jpg');
            fs.writeFileSync(photoPath, Buffer.from(buffer));

            await bot.sendMessage(chatId, 'Photo saved successfully!');
        } catch (error) {
            console.error('Error saving photo:', error);
            await bot.sendMessage(chatId, 'Error saving photo. Please try again.');
        }
    }

    // Handle audio messages
    if (msg.audio) {
        try {
            const fileId = msg.audio.file_id;

            // Get file path from Telegram
            const file = await bot.getFile(fileId);
            const filePath = file.file_path;

            // Download the file
            const audioUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
            const response = await fetch(audioUrl);
            const buffer = await response.arrayBuffer();

            // Save the file
            const audioPath = path.join(userDir, 'audio.mp3');
            fs.writeFileSync(audioPath, Buffer.from(buffer));

            await bot.sendMessage(chatId, 'Audio saved successfully!');
        } catch (error) {
            console.error('Error saving audio:', error);
            await bot.sendMessage(chatId, 'Error saving audio. Please try again.');
        }
    }
});

console.log('Bot is running...');

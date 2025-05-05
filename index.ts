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
    const username = msg.from?.username;

    // Check if user has a username
    if (!username) {
        await bot.sendMessage(
            chatId,
            'Для использования бота необходимо установить username в настройках Telegram.\n\n' +
            'Как установить username:\n' +
            '1. Откройте настройки Telegram\n' +
            '2. Перейдите в раздел "Изменить профиль"\n' +
            '3. Нажмите на поле "Имя пользователя"\n' +
            '4. Введите желаемый username\n' +
            '5. Нажмите "Сохранить"\n\n' +
            'После установки username, вы сможете отправлять фото и аудио сообщения.'
        );
        return;
    }

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

            await bot.sendMessage(chatId, 'Фото успешно сохранено!');
        } catch (error) {
            console.error('Error saving photo:', error);
            await bot.sendMessage(chatId, 'Ошибка при сохранении фото. Пожалуйста, попробуйте еще раз.');
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

            await bot.sendMessage(chatId, 'Аудио успешно сохранено!');
        } catch (error) {
            console.error('Error saving audio:', error);
            await bot.sendMessage(chatId, 'Ошибка при сохранении аудио. Пожалуйста, попробуйте еще раз.');
        }
    }
});

console.log('Bot is running...');

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

// File size limits in bytes
const PHOTO_SIZE_LIMIT = 500 * 1024; // 500KB
const AUDIO_SIZE_LIMIT = 1024 * 1024; // 1MB

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

// Function to check if user has both photo and audio
const checkUserFiles = (userDir: string): boolean => {
    const photoPath = path.join(userDir, 'photo.jpg');
    const audioPath = path.join(userDir, 'audio.mp3');
    return fs.existsSync(photoPath) && fs.existsSync(audioPath);
};

// Function to send user's page link
const sendUserPageLink = async (chatId: number, username: string) => {
    const userPageUrl = `https://chalysh.tech/birthday/pages/${username}`;
    await bot.sendMessage(
        chatId,
        `Ваша страница с поздравлением готова!\n\n` +
        `Вы можете посмотреть её по ссылке:\n${userPageUrl}\n\n` +
        `Вы можете обновить своё поздравление, отправив новое фото или аудио.`
    );
};

// Function to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Handle /start command
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from?.username;

    if (!username) {
        await bot.sendMessage(
            chatId,
            'Добро пожаловать! 👋\n\n' +
            'Для использования бота необходимо установить username в настройках Telegram.\n\n' +
            'Как установить username:\n' +
            '1. Откройте настройки Telegram\n' +
            '2. Перейдите в раздел "Изменить профиль"\n' +
            '3. Нажмите на поле "Имя пользователя"\n' +
            '4. Введите желаемый username\n' +
            '5. Нажмите "Сохранить"\n\n' +
            'После установки username, напишите /start снова.'
        );
        return;
    }

    const userDir = path.join(pagesDir, username);
    const hasFiles = fs.existsSync(userDir) && checkUserFiles(userDir);

    await bot.sendMessage(
        chatId,
        'Добро пожаловать! 👋\n\n' +
        'Этот бот поможет вам создать персональное поздравление с днем рождения!\n\n' +
        'Как это работает:\n' +
        '1. Отправьте фото для вашего поздравления\n' +
        '2. Отправьте аудио сообщение с вашими пожеланиями\n' +
        '3. Получите ссылку на вашу персональную страницу с поздравлением\n\n' +
        (hasFiles 
            ? 'У вас уже есть готовое поздравление! Вы можете:\n' +
              '• Посмотреть его по ссылке: https://chalysh.tech/birthday/pages/' + username + '\n' +
              '• Обновить его, отправив новое фото или аудио'
            : 'Начните с отправки фото или аудио сообщения!')
    );
});

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
            
            // Check file size
            if (photo.file_size > PHOTO_SIZE_LIMIT) {
                await bot.sendMessage(
                    chatId,
                    `Размер фото превышает допустимый лимит (${formatFileSize(PHOTO_SIZE_LIMIT)}). ` +
                    `Пожалуйста, отправьте фото меньшего размера.`
                );
                return;
            }

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
            
            // Check if user has both files and send link if they do
            if (checkUserFiles(userDir)) {
                await sendUserPageLink(chatId, username);
            } else {
                await bot.sendMessage(
                    chatId,
                    'Теперь отправьте аудио сообщение, чтобы завершить ваше поздравление!'
                );
            }
        } catch (error) {
            console.error('Error saving photo:', error);
            await bot.sendMessage(chatId, 'Ошибка при сохранении фото. Пожалуйста, попробуйте еще раз.');
        }
    }

    // Handle audio messages
    if (msg.audio) {
        try {
            // Check file size
            if (msg.audio.file_size > AUDIO_SIZE_LIMIT) {
                await bot.sendMessage(
                    chatId,
                    `Размер аудио файла превышает допустимый лимит (${formatFileSize(AUDIO_SIZE_LIMIT)}). ` +
                    `Пожалуйста, отправьте аудио меньшего размера.`
                );
                return;
            }

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
            
            // Check if user has both files and send link if they do
            if (checkUserFiles(userDir)) {
                await sendUserPageLink(chatId, username);
            } else {
                await bot.sendMessage(
                    chatId,
                    'Теперь отправьте фото, чтобы завершить ваше поздравление!'
                );
            }
        } catch (error) {
            console.error('Error saving audio:', error);
            await bot.sendMessage(chatId, 'Ошибка при сохранении аудио. Пожалуйста, попробуйте еще раз.');
        }
    }
});

console.log('Bot is running...');

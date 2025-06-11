import TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// File size limits in bytes
const PHOTO_SIZE_LIMIT = 500 * 1024; // 500KB
const AUDIO_SIZE_LIMIT = 1024 * 1024; // 1MB

// Get environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const USER_PAGE_URL = process.env.USER_PAGE_URL;
const PAGES_DIR = process.env.PAGES_DIR;

if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not defined in environment variables');
}

if (!USER_PAGE_URL) {
    throw new Error('USER_PAGE_URL is not defined in environment variables');
}

if (!PAGES_DIR) {
    throw new Error('PAGES_DIR is not defined in environment variables');
}

// Telegram API URL
const TELEGRAM_API_URL = `https://api.telegram.org/file/bot${BOT_TOKEN}`;

// Initialize bot with your token
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Set bot commands
bot.setMyCommands([
    { command: '/start', description: 'Начать работу с ботом' },
    { command: '/help', description: 'Показать справку' },
    { command: '/status', description: 'Проверить статус вашего поздравления' },
    { command: '/delete', description: 'Удалить ваше поздравление' }
]);

// Create pages directory if it doesn't exist
if (!fs.existsSync(PAGES_DIR)) {
    fs.mkdirSync(PAGES_DIR);
}

// Function to copy HTML template
const copyHtmlTemplate = (userDir: string) => {
    const templatePath = path.join(__dirname, '..', 'htmlTemplates', 'indexFirst.html');
    const targetPath = path.join(userDir, 'indexFirst.html');
    
    // Check if indexFirst.html already exists
    if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(templatePath, targetPath);
    }
};

// Function to check if user has both photo and audio
const checkUserFiles = (userDir: string): boolean => {
    const photoPath = path.join(userDir, 'img.jpg');
    const audioPath = path.join(userDir, 'audio.mp3');
    return fs.existsSync(photoPath) && fs.existsSync(audioPath);
};

// Function to send user's page link
const sendUserPageLink = async (chatId: number, username: string) => {
    const userPageUrl = `${USER_PAGE_URL}/${username}`;
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

    const userDir = path.join(PAGES_DIR, username);
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
              '• Посмотреть его по ссылке: ' + `${USER_PAGE_URL}/${username}\n` +
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

    const userDir = path.join(PAGES_DIR, username);

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
            const photoUrl = `${TELEGRAM_API_URL}/${filePath}`;
            const response = await fetch(photoUrl);
            const buffer = await response.arrayBuffer();
            
            // Save the file
            const photoPath = path.join(userDir, 'img.jpg');
            fs.writeFileSync(photoPath, Buffer.from(buffer));
            
            await bot.sendMessage(chatId, 'Фото успешно сохранено!');
            
            // Check if user has both files and send link if they do
            if (checkUserFiles(userDir)) {
                copyHtmlTemplate(userDir);
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
    if (msg.audio || msg.voice) {
        try {
            const audioData = msg.audio || msg.voice;
            
            // Check file size
            if (audioData.file_size > AUDIO_SIZE_LIMIT) {
                await bot.sendMessage(
                    chatId,
                    `Размер аудио файла превышает допустимый лимит (${formatFileSize(AUDIO_SIZE_LIMIT)}). ` +
                    `Пожалуйста, отправьте аудио меньшего размера.`
                );
                return;
            }

            const fileId = audioData.file_id;
            
            // Get file path from Telegram
            const file = await bot.getFile(fileId);
            const filePath = file.file_path;
            
            // Download the file
            const audioUrl = `${TELEGRAM_API_URL}/${filePath}`;
            const response = await fetch(audioUrl);
            const buffer = await response.arrayBuffer();
            
            // Save the file
            const audioPath = path.join(userDir, 'audio.mp3');
            fs.writeFileSync(audioPath, Buffer.from(buffer));
            
            await bot.sendMessage(chatId, 'Аудио успешно сохранено!');
            
            // Check if user has both files and send link if they do
            if (checkUserFiles(userDir)) {
                copyHtmlTemplate(userDir);
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

// Handle /help command
bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(
        chatId,
        '📚 Справка по использованию бота:\n\n' +
        '1. /start - Начать работу с ботом\n' +
        '2. /help - Показать эту справку\n' +
        '3. /status - Проверить статус вашего поздравления\n' +
        '4. /delete - Удалить ваше поздравление\n\n' +
        'Как создать поздравление:\n' +
        '1. Отправьте фото (до 500KB)\n' +
        '2. Отправьте аудио сообщение (до 1MB)\n' +
        '3. Получите ссылку на вашу страницу\n\n' +
        'Вы можете обновить своё поздравление в любой момент, отправив новое фото или аудио.'
    );
});

// Handle /status command
bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from?.username;

    if (!username) {
        await bot.sendMessage(
            chatId,
            'Для проверки статуса необходимо установить username в настройках Telegram.'
        );
        return;
    }

    const userDir = path.join(PAGES_DIR, username);
    const hasPhoto = fs.existsSync(path.join(userDir, 'img.jpg'));
    const hasAudio = fs.existsSync(path.join(userDir, 'audio.mp3'));

    let statusMessage = '📊 Статус вашего поздравления:\n\n';
    statusMessage += `Фото: ${hasPhoto ? '✅ Загружено' : '❌ Отсутствует'}\n`;
    statusMessage += `Аудио: ${hasAudio ? '✅ Загружено' : '❌ Отсутствует'}\n\n`;

    if (hasPhoto && hasAudio) {
        statusMessage += `Ваше поздравление готово!\nПосмотреть его можно здесь:\n${USER_PAGE_URL}/${username}`;
    } else {
        statusMessage += 'Для завершения поздравления необходимо загрузить оба файла.';
    }

    await bot.sendMessage(chatId, statusMessage);
});

// Handle /delete command
bot.onText(/\/delete/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from?.username;

    if (!username) {
        await bot.sendMessage(
            chatId,
            'Для удаления поздравления необходимо установить username в настройках Telegram.'
        );
        return;
    }

    const userDir = path.join(PAGES_DIR, username);
    
    if (!fs.existsSync(userDir)) {
        await bot.sendMessage(chatId, 'У вас пока нет загруженных файлов.');
        return;
    }

    try {
        fs.rmSync(userDir, { recursive: true, force: true });
        await bot.sendMessage(
            chatId,
            '✅ Ваше поздравление успешно удалено.\nВы можете создать новое, отправив фото и аудио.'
        );
    } catch (error) {
        console.error('Error deleting user directory:', error);
        await bot.sendMessage(chatId, '❌ Произошла ошибка при удалении файлов. Пожалуйста, попробуйте позже.');
    }
});

console.log('Bot is running...');

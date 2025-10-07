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
    { command: '/template', description: 'Выбрать шаблон для поздравления' },
    { command: '/status', description: 'Проверить статус вашего поздравления' },
    { command: '/delete', description: 'Удалить ваше поздравление' }
]);

// Create pages directory if it doesn't exist
if (!fs.existsSync(PAGES_DIR)) {
    fs.mkdirSync(PAGES_DIR);
}

// Available templates
const AVAILABLE_TEMPLATES = [
    { id: 'indexFirst', name: '🎨 Яркий и веселый', description: 'Цветной шаблон с конфетти и анимациями' },
    { id: 'indexTwo', name: '🌙 Современный темный', description: 'Стильный темный шаблон с эффектами стекла' },
    { id: 'indexThree', name: '✨ Элегантный золотой', description: 'Изысканный шаблон в золотых тонах' }
];

// User template preferences storage
const userTemplates = new Map<string, string>();

// Function to copy HTML template
const copyHtmlTemplate = (userDir: string, templateId: string = 'indexFirst') => {
    const templatePath = path.join(__dirname, 'htmlTemplates', `${templateId}.html`);
    const targetPath = path.join(userDir, 'index.html');
    
    // Check if template exists
    if (!fs.existsSync(templatePath)) {
        console.error(`Template ${templateId} not found, using default`);
        const defaultTemplatePath = path.join(__dirname, 'htmlTemplates', 'indexFirst.html');
        fs.copyFileSync(defaultTemplatePath, targetPath);
        return;
    }
    
    fs.copyFileSync(templatePath, targetPath);
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

    const selectedTemplate = userTemplates.get(username);
    const templateInfo = selectedTemplate 
        ? AVAILABLE_TEMPLATES.find(t => t.id === selectedTemplate)
        : null;

    await bot.sendMessage(
        chatId,
        'Добро пожаловать! 👋\n\n' +
        'Этот бот поможет вам создать персональное поздравление с днем рождения!\n\n' +
        'Как это работает:\n' +
        '1. Выберите шаблон командой /template\n' +
        '2. Отправьте фото для вашего поздравления\n' +
        '3. Отправьте аудио сообщение с вашими пожеланиями\n' +
        '4. Получите ссылку на вашу персональную страницу с поздравлением\n\n' +
        (templateInfo 
            ? `Выбранный шаблон: ${templateInfo.name}\n\n`
            : '') +
        (hasFiles 
            ? 'У вас уже есть готовое поздравление! Вы можете:\n' +
              '• Посмотреть его по ссылке: ' + `${USER_PAGE_URL}/${username}\n` +
              '• Изменить шаблон командой /template\n' +
              '• Обновить его, отправив новое фото или аудио'
            : 'Начните с выбора шаблона командой /template!')
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
                const selectedTemplate = userTemplates.get(username) || 'indexFirst';
                copyHtmlTemplate(userDir, selectedTemplate);
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
                const selectedTemplate = userTemplates.get(username) || 'indexFirst';
                copyHtmlTemplate(userDir, selectedTemplate);
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

// Handle /template command
bot.onText(/\/template/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from?.username;

    if (!username) {
        await bot.sendMessage(
            chatId,
            'Для выбора шаблона необходимо установить username в настройках Telegram.'
        );
        return;
    }

    const keyboard = {
        inline_keyboard: AVAILABLE_TEMPLATES.map(template => [
            {
                text: template.name,
                callback_data: `template_${template.id}`
            }
        ])
    };

    let message = '🎨 Выберите шаблон для вашего поздравления:\n\n';
    AVAILABLE_TEMPLATES.forEach(template => {
        message += `${template.name}\n${template.description}\n\n`;
    });

    await bot.sendMessage(chatId, message, { reply_markup: keyboard });
});

// Handle template selection callback
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message?.chat.id;
    const username = callbackQuery.from?.username;
    const data = callbackQuery.data;

    if (!chatId || !username || !data?.startsWith('template_')) {
        return;
    }

    const templateId = data.replace('template_', '');
    const selectedTemplate = AVAILABLE_TEMPLATES.find(t => t.id === templateId);

    if (!selectedTemplate) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Шаблон не найден' });
        return;
    }

    // Save user's template preference
    userTemplates.set(username, templateId);

    // Update existing page if user has both files
    const userDir = path.join(PAGES_DIR, username);
    if (checkUserFiles(userDir)) {
        copyHtmlTemplate(userDir, templateId);
    }

    await bot.answerCallbackQuery(callbackQuery.id, { 
        text: `Выбран шаблон: ${selectedTemplate.name}` 
    });

    await bot.editMessageText(
        `✅ Шаблон "${selectedTemplate.name}" выбран!\n\n` +
        `Описание: ${selectedTemplate.description}\n\n` +
        (checkUserFiles(userDir) 
            ? 'Ваша страница обновлена с новым шаблоном!'
            : 'Когда вы загрузите фото и аудио, будет использован выбранный шаблон.'),
        {
            chat_id: chatId,
            message_id: callbackQuery.message?.message_id
        }
    );
});

// Handle /help command
bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(
        chatId,
        '📚 Справка по использованию бота:\n\n' +
        '1. /start - Начать работу с ботом\n' +
        '2. /help - Показать эту справку\n' +
        '3. /template - Выбрать шаблон для поздравления\n' +
        '4. /status - Проверить статус вашего поздравления\n' +
        '5. /delete - Удалить ваше поздравление\n\n' +
        'Как создать поздравление:\n' +
        '1. Выберите шаблон командой /template\n' +
        '2. Отправьте фото (до 500KB)\n' +
        '3. Отправьте аудио сообщение (до 1MB)\n' +
        '4. Получите ссылку на вашу страницу\n\n' +
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

    const selectedTemplate = userTemplates.get(username);
    const templateInfo = selectedTemplate 
        ? AVAILABLE_TEMPLATES.find(t => t.id === selectedTemplate)
        : null;

    let statusMessage = '📊 Статус вашего поздравления:\n\n';
    statusMessage += `Фото: ${hasPhoto ? '✅ Загружено' : '❌ Отсутствует'}\n`;
    statusMessage += `Аудио: ${hasAudio ? '✅ Загружено' : '❌ Отсутствует'}\n`;
    statusMessage += `Шаблон: ${templateInfo ? `✅ ${templateInfo.name}` : '❌ Не выбран'}\n\n`;

    if (hasPhoto && hasAudio) {
        statusMessage += `Ваше поздравление готово!\nПосмотреть его можно здесь:\n${USER_PAGE_URL}/${username}`;
        if (templateInfo) {
            statusMessage += `\n\nИспользуется шаблон: ${templateInfo.name}`;
        }
    } else {
        statusMessage += 'Для завершения поздравления необходимо:\n';
        if (!templateInfo) statusMessage += '• Выбрать шаблон командой /template\n';
        if (!hasPhoto) statusMessage += '• Загрузить фото\n';
        if (!hasAudio) statusMessage += '• Загрузить аудио';
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
        // Clear template preference
        userTemplates.delete(username);
        await bot.sendMessage(
            chatId,
            '✅ Ваше поздравление успешно удалено.\nВы можете создать новое, выбрав шаблон командой /template.'
        );
    } catch (error) {
        console.error('Error deleting user directory:', error);
        await bot.sendMessage(chatId, '❌ Произошла ошибка при удалении файлов. Пожалуйста, попробуйте позже.');
    }
});

console.log('Bot is running...');

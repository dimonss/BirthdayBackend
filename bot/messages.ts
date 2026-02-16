import TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as path from 'path';
import {
    PAGES_DIR, TELEGRAM_API_URL,
    PHOTO_SIZE_LIMIT, AUDIO_SIZE_LIMIT,
    userTemplates, userEvents
} from '../config.js';
import {
    checkUserFiles, copyHtmlTemplate,
    sendUserPageLink, formatFileSize,
    writeClientConfig
} from '../helpers.js';

// Send visibility consent prompt
async function sendVisibilityPrompt(bot: TelegramBot, chatId: number) {
    const keyboard = {
        inline_keyboard: [
            [
                { text: '✅ Да, показывать', callback_data: 'visibility_yes' },
                { text: '❌ Нет', callback_data: 'visibility_no' }
            ]
        ]
    };

    await bot.sendMessage(
        chatId,
        '🌐 Хотите, чтобы ваше поздравление отображалось в общем списке на главной странице?\n\n' +
        'Вы сможете изменить это позже командой /visibility.',
        { reply_markup: keyboard }
    );
}

export function registerMessageHandlers(bot: TelegramBot) {
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

        const userDir = path.join(PAGES_DIR!, username);

        // Create user directory if it doesn't exist
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir);
            writeClientConfig(userDir, { showOnMainPage: false });
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
                    const selectedEvent = userEvents.get(username) || 'birthday';
                    copyHtmlTemplate(userDir, selectedTemplate, selectedEvent, username);
                    await sendUserPageLink(bot, chatId, username);
                    await sendVisibilityPrompt(bot, chatId);
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
                    const selectedEvent = userEvents.get(username) || 'birthday';
                    copyHtmlTemplate(userDir, selectedTemplate, selectedEvent, username);
                    await sendUserPageLink(bot, chatId, username);
                    await sendVisibilityPrompt(bot, chatId);
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
}

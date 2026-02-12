import * as fs from 'fs';
import * as path from 'path';
import { ROOT_DIR, USER_PAGE_URL, EVENT_TEXTS } from './config.js';
import { replaceMetadataMarkers } from './metadata-config.js';

// Function to copy HTML template with dynamic text replacement
export const copyHtmlTemplate = (userDir: string, templateId: string = 'indexFirst', eventId: string = 'birthday', username?: string) => {
    // Go up one level from dist directory to find htmlTemplates
    const templatePath = path.join(ROOT_DIR, '..', 'htmlTemplates', `${templateId}.html`);
    const targetPath = path.join(userDir, 'index.html');

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
        console.error(`Template ${templateId} not found, using default`);
        const defaultTemplatePath = path.join(ROOT_DIR, '..', 'htmlTemplates', 'indexFirst.html');
        fs.copyFileSync(defaultTemplatePath, targetPath);
        return;
    }

    // Read template content
    let templateContent = fs.readFileSync(templatePath, 'utf8');

    // Get the new event text
    const eventText = EVENT_TEXTS[eventId] || EVENT_TEXTS.birthday;

    // Replace metadata markers
    const pageUrl = username ? `${USER_PAGE_URL}/${username}` : '';
    const currentDate = new Date().toISOString();

    templateContent = replaceMetadataMarkers(
        templateContent,
        eventId,
        templateId,
        pageUrl,
        currentDate,
        currentDate
    );

    // Replace the content inside the element with class "message"
    templateContent = templateContent.replace(
        /<div class="message">.*?<\/div>/g,
        `<div class="message">${eventText}</div>`
    );

    // Write the modified content to target file
    fs.writeFileSync(targetPath, templateContent);
};

// Function to copy default HTML template (for deleted pages)
export const copyDefaultTemplate = (userDir: string, username?: string) => {
    const templatePath = path.join(ROOT_DIR, '..', 'htmlTemplates', 'default.html');
    const targetPath = path.join(userDir, 'index.html');

    // Ensure directory exists
    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
    }

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
        console.error('Default template not found');
        return;
    }

    // Read template content
    let templateContent = fs.readFileSync(templatePath, 'utf8');

    // Replace only PAGE_URL marker
    const pageUrl = username ? `${USER_PAGE_URL}/${username}` : '';
    templateContent = templateContent.replace(/{{PAGE_URL}}/g, pageUrl);

    // Write the modified content to target file
    fs.writeFileSync(targetPath, templateContent);
};

// Function to check if user has both photo and audio
export const checkUserFiles = (userDir: string): boolean => {
    const photoPath = path.join(userDir, 'img.jpg');
    const audioPath = path.join(userDir, 'audio.mp3');
    return fs.existsSync(photoPath) && fs.existsSync(audioPath);
};

// Function to send user's page link
export const sendUserPageLink = async (bot: any, chatId: number, username: string) => {
    const userPageUrl = `${USER_PAGE_URL}/${username}`;
    await bot.sendMessage(
        chatId,
        `Ваша страница с поздравлением готова!\n\n` +
        `Вы можете посмотреть её по ссылке:\n${userPageUrl}\n\n` +
        `Вы можете обновить своё поздравление, отправив новое фото или аудио.\n\n` +
        `Если превью ссылки в Telegram не обновилось, отправьте URL боту @WebpageBot — он обновит предпросмотр.`
    );
};

// Function to format file size
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

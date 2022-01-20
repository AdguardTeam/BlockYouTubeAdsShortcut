import fs from 'fs/promises';
import path from 'path';

import {
    BASE_LOCALE,
    LOCALES_DIR,
    USERSCRIPT_META_TEMPLATE_PATH,
    VERSION,
} from './constants.js';

/**
 * Replaces placeholders in the string with data
 * @param str
 * @param key
 * @param data
 * @returns {string}
 */
const appendData = (str, key, data) => str.replace(`[${key}]`, data);

/**
 * Retrieves messages from the locales
 * @returns {Promise<{messages: any, locale: string}[]>}
 */
const getMessages = async () => {
    const locales = await fs.readdir(LOCALES_DIR);
    return Promise.all(locales.map(async (locale) => {
        const localeFilePath = path.join(LOCALES_DIR, locale, 'messages.json');
        const localeString = await fs.readFile(localeFilePath, 'utf-8');
        const localeMessages = JSON.parse(localeString);
        return {
            locale,
            messages: localeMessages,
        };
    }));
};

/**
 * Generates localized meta by key based on the messages
 * @param messages - localized messages
 * @param key - message key
 * @returns {Promise<string>}
 */
const generateLocalizedMetaByKey = async (messages, key) => {
    const localeKeyPairs = messages.map((message) => ({
        locale: message.locale,
        [key]: message.messages[key].message,
    }));

    let result = [];
    for (const pair of localeKeyPairs) {
        const { locale } = pair;
        const value = pair[key];

        if (locale === BASE_LOCALE) {
            // e.g.: "@name Blocks YouTube ads"
            result = [`@${key} ${value}`, ...result];
        } else {
            // e.g.: "// @name:ru Блокирует рекламу на YouTube"
            result.push(`// @${key}:${locale} ${value}`);
        }
    }

    return result.join('\n');
};

/**
 * Generates banner with metadata
 * @returns {Promise<string>}
 */
export const generateBanner = async () => {
    let metaTemplate = await fs.readFile(USERSCRIPT_META_TEMPLATE_PATH, 'utf-8');

    metaTemplate = appendData(metaTemplate, 'USERSCRIPT_VERSION', VERSION);

    const messages = await getMessages();

    const names = await generateLocalizedMetaByKey(messages, 'name');
    metaTemplate = appendData(metaTemplate, 'USERSCRIPT_NAME', names);

    const descriptions = await generateLocalizedMetaByKey(messages, 'description');
    metaTemplate = appendData(metaTemplate, 'USERSCRIPT_DESCRIPTION', descriptions);

    return metaTemplate;
};

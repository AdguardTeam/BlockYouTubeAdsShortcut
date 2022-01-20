import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

export const __dirname = dirname(fileURLToPath(import.meta.url));

export const VERSION = process.env.npm_package_version;

export const DIST_DIR = path.resolve(__dirname, '../../dist');

export const LOCALES_DIR = path.resolve(__dirname, '../../src/locales');

export const BANNER = `/**
* This file is part of AdGuard's Block YouTube Ads (https://github.com/AdguardTeam/BlockYouTubeAdsShortcut).
*
* AdGuard's Block YouTube Ads is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* AdGuard's Block YouTube Ads is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with AdGuard's Block YouTube Ads.  If not, see <http://www.gnu.org/licenses/>.
*/

// AdGuard BlockYouTubeAdsShortcut v${VERSION}
`;

export const USERSCRIPT_META_TEMPLATE_PATH = path.resolve(__dirname, './meta.template.js');

export const BASE_LOCALE = 'en';

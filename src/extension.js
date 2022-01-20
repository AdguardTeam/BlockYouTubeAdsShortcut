/**
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

import { runBlockYoutube } from './run-block-youtube';

const ExtensionJavaScriptClass = function ExtensionJavaScriptClass() { };

ExtensionJavaScriptClass.prototype = {
    run: (options) => {
        try {
            const result = runBlockYoutube();
            options.completionFunction(result);
        } catch (ex) {
            options.completionFunction({
                success: false,
                status: 'error',
                message: ex.toString(),
            });
        }
    },
    finalize: () => {
        // Do nothing
        console.log('finalize called');
    },
};

// The JavaScript file must contain a global object named "ExtensionPreprocessingJS".
// eslint-disable-next-line no-unused-vars,no-var,vars-on-top
var ExtensionPreprocessingJS = new ExtensionJavaScriptClass();

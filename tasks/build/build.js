import esbuild from 'esbuild';
import fs from 'fs/promises';

import { BANNER, DIST_DIR } from './constants.js';
import { generateBanner } from './generate-banner.js';

/**
 * Config for remote and shortcut extension
 */
const config = {
    entryPoints: {
        index: 'src/index.js',
        extension: 'src/extension.js',
        remote: 'src/remote.js',
    },
    banner: {
        js: BANNER,
    },
    charset: 'utf8',
    bundle: true,
    outdir: DIST_DIR,
};

/**
 * Config for userscript
 */
const userscriptConfig = {
    entryPoints: {
        'block-youtube-ads.user': 'src/userscript.js',
    },
    charset: 'utf8',
    bundle: true,
    outdir: DIST_DIR,
};

/**
 * Generates banner, adds it to config and bundles userscript
 */
const buildUserscript = async (config) => {
    config.banner = { js: await generateBanner() };

    return esbuild.build(config);
};

/**
 * Removes dist directory
 * @return {Promise<void>}
 */
const cleanDist = async () => {
    await fs.rm(DIST_DIR, { recursive: true, force: true });
};

export const build = async () => {
    console.log('Start building');

    try {
        await cleanDist();
        await esbuild.build(config);
        await buildUserscript(userscriptConfig);
    } catch (e) {
        console.log(`An error occurred during build: ${e}`);
        process.exit(1);
    }

    console.log(`Success! Builds can be found in the "${DIST_DIR}" directory`);
};

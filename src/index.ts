import 'dotenv/config';
// @ts-ignore
import { addonBuilder, serveHTTP, StreamRequest } from 'stremio-addon-sdk';
import { manifest } from './manifest';
import { fetchMetaFromCinemeta } from './services/cinemeta';
import { getStreamsFromRezka } from './services/rezka';
import { parseStremioId } from './utils';
import logger from './utils/logger';

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async (args: StreamRequest) => {
    const parsed = parseStremioId(args.id);

    try {
        // Get title by IMDb ID
        const meta = await fetchMetaFromCinemeta(parsed.imdbId, args.type);
        // Find video url in rezka by title
        const streams = await getStreamsFromRezka({
            title: meta.title,
            targetYear: meta.targetYear,
            type: args.type,
            season: parsed.season,
            episode: parsed.episode
        });

        return { streams };
    } catch (error: any) {
        logger.error(`[Index] Error for ID ${args.id}: ${error.message}`, {stack: error.stack});
        return { streams: [] };
    }
});

serveHTTP(builder.getInterface(), { port: Number(process.env.PORT) || 7860 });

// @ts-ignore
import { addonBuilder, serveHTTP, StreamRequest } from 'stremio-addon-sdk';
import { manifest } from './manifest';
import { fetchMetaFromCinemeta } from './services/cinemeta';
import { getStreamsFromRezka } from './services/rezka';
import { parseStremioId } from './utils';

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
    } catch (err) {
        console.error(`Error for ID ${args.id}:`, err);
        return { streams: [] };
    }
});

serveHTTP(builder.getInterface(), { port: Number(process.env.PORT) || 7000 });

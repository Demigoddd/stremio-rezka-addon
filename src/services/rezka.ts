import { ContentType, Stream } from 'stremio-addon-sdk';
import { login } from 'rezka.ts';
import logger from '../utils/logger';

interface RezkaServiceArgs {
    title: string;
    targetYear: number;
    type: ContentType;
    season?: number;
    episode?: number;
}

export const getStreamsFromRezka = async ({
    title,
    targetYear,
    type,
    season,
    episode
}: RezkaServiceArgs): Promise<Stream[]> => {
    try {
        if (!process.env.REZKA_LOGIN || !process.env.REZKA_PASSWORD) return [];

        let rawStreams: Record<string, string> = {};
        const targetBaseUrl = 'https://rezka.ag';
        const client = await login(
            process.env.REZKA_LOGIN,
            process.env.REZKA_PASSWORD,
            {
                baseUrl: targetBaseUrl,
                timeout: 30_000,
            }
        );

        const searchResults = await client.search(title);
        if (!searchResults || searchResults.length === 0) {
            logger.notice(`[Rezka Service] No results found for: "${title}"`);
            return [];
        }

        const target = searchResults.find(item => parseInt(item.year) === targetYear) || searchResults[0];
        const media = await client.load(target.url);
        if (!media) {
            logger.notice(`[Rezka Service] Failed to load media page for URL: ${target.url}`);
            return [];
        }

        if (type === 'movie') {
            rawStreams = await media.streams();
        } else if (type === 'series' && season && episode) {
            if (!media.seasons || media.seasons.length === 0) {
                logger.notice(`[Rezka Service] No seasons found for this series: ${media.title}`);
                return [];
            }

            const targetSeason = media.seasons.find(s => s.id === season) || media.seasons[season - 1];
            if (!targetSeason) return [];

            const episodes = media.episodes(targetSeason.id);
            if (!episodes || episodes.length === 0) return [];

            const targetEpisode = episodes.find(e => e.episodeId === episode) || episodes[episode - 1];
            if (!targetEpisode) return [];

            rawStreams = await media.episode(targetSeason.id, targetEpisode.episodeId).streams();
        }

        if (!rawStreams || Object.keys(rawStreams).length === 0) {
            logger.notice(`[Rezka Service] Video streams are empty for URL: ${target.url}`);
            return [];
        }

        return Object.entries(rawStreams).map(([quality, url]) => ({
            name: `HDRezka - ${quality}`,
            title: `${media.title}`,
            url: url
        }));
    } catch (error: any) {
        logger.error(`[Rezka Service] Error inside service: ${error.message}`, {stack: error.stack});
        // Return an empty array to prevent crashing the entire addon server
        return [];
    }
}

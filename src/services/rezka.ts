import { ContentType, Stream } from 'stremio-addon-sdk';
import { search, load } from 'rezka.ts';
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
        // Perform a text search on the website
        const searchResults = await search(title);
        if (!searchResults || searchResults.length === 0) {
            logger.notice(`[Rezka Service] No results found for: "${title}"`);
            return [];
        }

        // Filter results by year (fallback to the first result if no exact match)
        const target = searchResults.find(item => parseInt(item.year) === targetYear) || searchResults[0];

        const media = await load(target.url);
        if (!media) {
            logger.notice(`[Rezka Service] Failed to load media page for URL: ${target.url}`);
            return [];
        }

        // Initialize the correct class and fetch direct video streams
        let rawStreams: Record<string, string> = {};

        // Extract stream URLs based on media type
        if (type === 'movie') {
            // For movies, fetch streams directly from the media root object
            rawStreams = await media.streams();
        } else if (type === 'series' && season && episode) {
            if (!media.seasons || media.seasons.length === 0) {
                logger.notice(`[Rezka Service] No seasons found for this series: ${media.title}`);
                return [];
            }

            // Find the correct season by ID or fallback to index matching
            const targetSeason = media.seasons.find(s => s.id === season) || media.seasons[season - 1];
            if (!targetSeason) return [];

            // Fetch episodes for the detected season
            const episodes = media.episodes(targetSeason.id);
            if (!episodes || episodes.length === 0) return [];

            // Find the correct episode by episodeId or fallback to index matching
            const targetEpisode = episodes.find(e => e.episodeId === episode) || episodes[episode - 1];
            if (!targetEpisode) return [];

            // Get streams for the specific episode (uses first available translation by default)
            rawStreams = await media.episode(targetSeason.id, targetEpisode.episodeId).streams();
        }

        if (!rawStreams || Object.keys(rawStreams).length === 0) {
            logger.notice(`[Rezka Service] Video streams are empty for URL: ${target.url}`);
            return [];
        }

        // Step 5: Map raw Rezka stream data to the Stremio standard format
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

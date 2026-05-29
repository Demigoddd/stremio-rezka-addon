import { ContentType } from 'stremio-addon-sdk';
import axios from 'axios';
import { MetaInfo } from '../types';
import { SimpleCache } from '../utils/cache';

const metaCache = new SimpleCache<MetaInfo>();

export async function fetchMetaFromCinemeta(imdbId: string, type: ContentType): Promise<MetaInfo> {
    const cacheKey = `${type}:${imdbId}`;
    const cached = metaCache.get(cacheKey);

    if (cached) return cached;

    const { data } = await axios.get(`https://v3-cinemeta.strem.io/meta/${type}/${imdbId}.json`);

    if (!data?.meta) throw new Error(`Cinemeta couldn't find metadata for ${imdbId}`);

    const metaInfo: MetaInfo = {
        title: data.meta.name,
        targetYear: parseInt(data.meta.year || data.meta.released?.split('-')[0] || '0'),
        type
    };

    metaCache.set(cacheKey, metaInfo);
    return metaInfo;
}

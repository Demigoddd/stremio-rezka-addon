import { ContentType } from 'stremio-addon-sdk';

export interface MetaInfo {
    title: string;
    targetYear: number;
    type: ContentType;
}

export interface ParsedId {
    imdbId: string;
    season?: number;
    episode?: number;
}

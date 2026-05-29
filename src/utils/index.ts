import { ParsedId } from "../types";

export const parseStremioId = (id: string): ParsedId => {
    const parts = id.split(':');

    return {
        imdbId: parts[0],
        season: parts[1] ? parseInt(parts[1]) : undefined,
        episode: parts[2] ? parseInt(parts[2]) : undefined
    };
}

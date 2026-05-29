import { Manifest } from 'stremio-addon-sdk';
import { version } from '../package.json';

export const manifest: Manifest = {
    id: 'community.rezka.stremio',
    version,
    name: 'Rezka',
    description: 'Streams from rezka',
    resources: ['stream'],
    types: ['movie', 'series'],
    idPrefixes: ['tt'],
    catalogs: []
};

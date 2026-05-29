import 'stremio-addon-sdk';

declare module 'stremio-addon-sdk' {
  export interface StreamRequest {
    type: ContentType;
    id: string;
  }
}

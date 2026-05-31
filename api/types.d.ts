declare module "pdf-parse" {
  interface PDFParseOptions {
    data: Buffer | Uint8Array;
  }
  class TextResult {
    pages: { num: number; text: string }[];
    text: string;
    total: number;
  }
  export class PDFParse {
    constructor(options: PDFParseOptions);
    getText(params?: Record<string, unknown>): Promise<TextResult>;
    destroy(): void;
  }
}

declare module "epub" {
  interface ManifestItem {
    id: string;
    href: string;
    "media-type": string;
  }
  interface SpineItem {
    id: string;
    href: string;
    linear: string;
  }
  interface EPubMetadata {
    title: string;
    creator: string;
    language: string;
  }
  export default class EPub {
    constructor(buffer: Buffer);
    metadata: EPubMetadata;
    manifest: Record<string, ManifestItem>;
    spine: { toc: false | ManifestItem; contents: SpineItem[] };
    parse(): Promise<void>;
    getChapter(id: string): Promise<string>;
    getChapterRaw(id: string): Promise<string>;
    hasDRM(): boolean;
  }
}

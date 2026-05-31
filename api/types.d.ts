declare module "pdf-parse" {
  interface PDFParseOptions {
    data: Buffer | Uint8Array;
  }
  export class PDFParse {
    constructor(options: PDFParseOptions);
    load(): Promise<void>;
    getText(): Promise<string>;
    getPageText(pageNum: number): Promise<string>;
    destroy(): void;
  }
}

declare module "epub" {
  interface EPubChapter {
    id: string;
    href: string;
    index: number;
  }
  interface EPubMetadata {
    title: string;
    creator: string;
    language: string;
  }
  export default class EPub {
    constructor(buffer: Buffer);
    metadata: EPubMetadata;
    spine: EPubChapter[];
    parse(): Promise<void>;
    getChapter(index: number): Promise<string>;
    getChapterRaw(index: number): Promise<string>;
    hasDRM(): boolean;
  }
}

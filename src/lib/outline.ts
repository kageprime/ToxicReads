export interface OutlineEntry {
  title: string;
  index: number;
}

export function parseOutline(content: string): OutlineEntry[] {
  const blocks = content.split("\n\n");
  const outline: OutlineEntry[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const text = blocks[i].trim();
    if (!text) continue;

    const firstLine = text.split("\n")[0].trim();

    // Chapter / Part / Section / Act / Scene numbered
    if (/^(Chapter|Part|Section|Act|Scene)\s+\d+/i.test(firstLine)) {
      outline.push({ title: firstLine, index: i });
      continue;
    }

    // Roman numeral chapters
    if (/^(Chapter|Part|Section)\s+(I|V|X|L|C|D|M)+[\.\s]/i.test(firstLine)) {
      outline.push({ title: firstLine, index: i });
      continue;
    }

    // Markdown headings
    if (/^#{1,3}\s/.test(firstLine)) {
      outline.push({ title: firstLine.replace(/^#+\s*/, ""), index: i });
      continue;
    }

    // Short all-caps line (likely a heading)
    if (
      firstLine === firstLine.toUpperCase() &&
      firstLine.length > 2 &&
      firstLine.length < 70 &&
      !firstLine.endsWith(".") &&
      !firstLine.endsWith("?") &&
      !firstLine.endsWith("!")
    ) {
      outline.push({ title: firstLine, index: i });
      continue;
    }

    // Short line followed by a blank line (detect headings)
    if (
      firstLine.length < 60 &&
      text === firstLine &&
      (i === 0 || blocks[i - 1].trim() === "")
    ) {
      outline.push({ title: firstLine, index: i });
    }
  }

  return outline;
}

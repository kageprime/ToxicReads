// Shared slug utilities — single source of truth for book + author slugs.
// Rules (SEO best practice): lowercase, hyphens, NFKD-transliterated ASCII,
// no leading/trailing/double hyphens, capped length, stable after publish.

const MAX_SLUG_LENGTH = 80;

export function slugify(input: string, maxLength = MAX_SLUG_LENGTH): string {
  const slug = (input ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
  return slug || "book";
}

export function isNumericId(value: string | undefined | null): boolean {
  return !!value && /^\d+$/.test(value);
}

// Backend book rows -> shapes the Bookly template components expect.
import {assetUrl} from './config';

export const mapBook = b => ({
  id: b.id,
  slug: b.slug ?? null,
  title: b.title ?? '',
  author: b.author ?? '',
  authorSlug: b.authorSlug ?? null,
  description: b.description ?? '',
  price: b.price ?? '0',
  priceLabel: `₦${b.price ?? '0'}`,
  image: b.coverImage ? {uri: assetUrl(b.coverImage)} : null,
  category: b.category ?? '',
  status: b.status ?? 'approved',
  views: b.views ?? 0,
  createdAt: b.createdAt ?? null,
  rating: null,
  ratingsCount: 0,
});

// Merge book.ratings batch results into mapped books.
export const withRatings = (books, ratings = []) => {
  const byId = new Map((ratings ?? []).map(r => [r.bookId, r]));
  return (books ?? []).map(b => {
    const r = byId.get(b.id);
    return r
      ? {...b, rating: r.avg ?? 0, ratingsCount: r.count ?? 0}
      : b;
  });
};

// Backend book -> legacy card-component item shape.
export const toCardItem = b => ({
  ...b,
  msg: b.author,
  originalPrice: b.priceLabel,
  withoutDiscountPrice: null,
  ratingStar: null,
  rating: b.rating ? Number(b.rating).toFixed(1) : 'New',
});

export const mapAuthor = a =>
  a
    ? {
        id: a.id,
        name: a.name ?? '',
        slug: a.slug ?? '',
        bio: a.bio ?? '',
        dedication: a.dedication ?? '',
        location: a.location ?? '',
        website: a.website ?? '',
        twitter: a.twitter ?? '',
        instagram: a.instagram ?? '',
        avatar: a.avatar ? {uri: assetUrl(a.avatar)} : null,
      }
    : null;

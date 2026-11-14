import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/how-to-play'],
      disallow: ['/admin', '/api/'],
    },
    sitemap: 'https://footble.vercel.app/sitemap.xml',
  };
}

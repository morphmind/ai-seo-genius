import { XMLParser } from 'fast-xml-parser';

export interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export const extractUrlsFromSitemap = async (sitemapUrl: string): Promise<string[]> => {
  try {
    const response = await fetch(sitemapUrl, {
      headers: {
        'User-Agent': 'PostmanRuntime/7.32.3',
      },
      mode: 'no-cors', // Add no-cors mode
      // @ts-ignore
      rejectUnauthorized: false
    });
    
    if (!response.ok && response.type !== 'opaque') {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: ''
    });
    
    const parsed = parser.parse(xmlText);
    
    // Handle both urlset (standard sitemap) and sitemapindex (sitemap index)
    if (parsed.urlset?.url) {
      const urls = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
      return urls.map((url: SitemapURL) => url.loc);
    } else if (parsed.sitemapindex?.sitemap) {
      const sitemaps = Array.isArray(parsed.sitemapindex.sitemap) 
        ? parsed.sitemapindex.sitemap 
        : [parsed.sitemapindex.sitemap];
      
      // Recursively fetch URLs from all sitemaps
      const nestedUrls = await Promise.all(
        sitemaps.map((sitemap: { loc: string }) => extractUrlsFromSitemap(sitemap.loc))
      );
      
      return nestedUrls.flat();
    }
    
    return [];
  } catch (error) {
    console.error('Sitemap parsing error:', error);
    throw new Error('Sitemap ayrıştırma hatası');
  }
};
import { XMLParser } from 'fast-xml-parser';

export interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export const extractUrlsFromSitemap = async (sitemapUrl: string): Promise<string[]> => {
  try {
    console.log('Fetching sitemap:', sitemapUrl);
    
    // Use proxy to avoid CORS issues
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(sitemapUrl)}`;
    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'PostmanRuntime/7.32.3'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlText = await response.text();
    
    if (!xmlText || xmlText.trim() === '') {
      throw new Error('Empty response received');
    }
    
    console.log('Successfully fetched XML content');
    
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
    
    throw new Error('No valid sitemap format found in the response');
  } catch (error) {
    console.error('Sitemap parsing error:', error);
    throw new Error(`Sitemap ayrıştırma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
  }
};

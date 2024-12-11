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
    
    const response = await fetch(sitemapUrl, {
      headers: {
        'User-Agent': 'PostmanRuntime/7.32.3',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      },
      mode: 'no-cors',
      // @ts-ignore
      rejectUnauthorized: false
    });
    
    console.log('Response type:', response.type);
    console.log('Response status:', response.status);
    
    // For opaque responses (no-cors mode), we need to handle them differently
    if (response.type === 'opaque') {
      // Try alternative fetch with proxy or different settings
      const proxyResponse = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(sitemapUrl)}`, {
        headers: {
          'User-Agent': 'PostmanRuntime/7.32.3'
        }
      });
      
      if (!proxyResponse.ok) {
        throw new Error(`Proxy fetch failed with status: ${proxyResponse.status}`);
      }
      
      const xmlText = await proxyResponse.text();
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
    }
    
    return [];
  } catch (error) {
    console.error('Sitemap parsing error:', error);
    throw new Error(`Sitemap ayrıştırma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
  }
};
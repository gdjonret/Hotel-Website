/**
 * Sitemap Generator for Hotel Le Process
 * Generates XML sitemap for search engines
 */

function generateSitemap() {
  const baseUrl = 'https://hotelleprocess.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Define all pages with their priority and change frequency
  const pages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/BookNow', changefreq: 'daily', priority: '0.9' },
    { url: '/discover-chad', changefreq: 'weekly', priority: '0.8' },
    { url: '/about-us', changefreq: 'monthly', priority: '0.7' },
    { url: '/contact', changefreq: 'monthly', priority: '0.7' },
    { url: '/rooms', changefreq: 'weekly', priority: '0.8' },
  ];

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  sitemap += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  pages.forEach(page => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${page.priority}</priority>\n`;
    
    // Add alternate language versions (French)
    sitemap += `    <xhtml:link rel="alternate" hreflang="fr" href="${baseUrl}${page.url}?lang=fr"/>\n`;
    sitemap += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${page.url}?lang=en"/>\n`;
    sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${page.url}"/>\n`;
    
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>';
  
  return sitemap;
}

module.exports = { generateSitemap };

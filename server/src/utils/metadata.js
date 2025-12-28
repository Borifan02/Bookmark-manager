const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

async function fetchMetadata(targetUrl) {
  try {
    const res = await axios.get(targetUrl, {
      timeout: 7000,
      headers: { 'User-Agent': 'BookmarkManager/1.0 (+https://example.com)' }
    });
    const html = res.data;
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content') || $('title').text() || '';

    let favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || $('link[rel="apple-touch-icon"]').attr('href') || '';
    if (favicon) {
      try {
        const u = new URL(favicon, targetUrl);
        // Rewrite gstatic faviconV2 proxies (t2/t3.gstatic.com) to the more reliable s2 endpoint
        if (u.hostname && u.hostname.endsWith('gstatic.com') && u.pathname && u.pathname.includes('faviconV2')) {
          const targetHost = new URL(targetUrl).hostname
          favicon = `https://www.google.com/s2/favicons?domain=${targetHost}`
        } else {
          favicon = u.toString();
        }
      } catch (e) {}
    } else {
      const u = new URL(targetUrl);
      favicon = `https://www.google.com/s2/favicons?domain=${u.hostname}`;
    }

    return { title: title.trim(), favicon };
  } catch (err) {
    try {
      const u = new URL(targetUrl);
      return { title: '', favicon: `https://www.google.com/s2/favicons?domain=${u.hostname}` };
    } catch (e) {
      return { title: '', favicon: '' };
    }
  }
}

module.exports = { fetchMetadata };

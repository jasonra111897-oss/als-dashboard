const DEPED_NEWS_FEED_URL = "https://www.deped.gov.ph/category/news/feed/";
const DEPED_SITE_FEED_URL = "https://www.deped.gov.ph/feed/";
const CACHE_TTL_MS = 15 * 60 * 1000;
const DEFAULT_LIMIT = 6;

let cachedFeed = {
  expiresAt: 0,
  items: [],
};

const decodeXmlEntities = (value = "") =>
  String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const stripHtml = (value = "") =>
  decodeXmlEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractTagContent = (block, tagName) => {
  const match = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? match[1].trim() : "";
};

const extractImageFromHtml = (value = "") => {
  const match = String(value).match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1].trim() : "";
};

const fetchFeedXml = async (url, controller) => {
  const response = await fetch(url, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      "User-Agent": "ALS NCR Dashboard News Client",
    },
    signal: controller.signal,
  });

  if (!response.ok) {
    throw new Error(`DepEd feed request failed with status ${response.status}.`);
  }

  return response.text();
};

const parseRssItems = (xml = "") => {
  const matches = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  return matches.map((itemBlock) => {
    const title = stripHtml(extractTagContent(itemBlock, "title"));
    const link = decodeXmlEntities(extractTagContent(itemBlock, "link"));
    const pubDateRaw = stripHtml(extractTagContent(itemBlock, "pubDate"));
    const descriptionHtml = extractTagContent(itemBlock, "description");
    const contentHtml =
      extractTagContent(itemBlock, "content:encoded") ||
      extractTagContent(itemBlock, "encoded");
    const summary = stripHtml(contentHtml || descriptionHtml);
    const image = extractImageFromHtml(contentHtml || descriptionHtml);

    return {
      source: "Department of Education",
      type: "DepEd Official News",
      title,
      link,
      publishedAt: pubDateRaw,
      summary,
      image: image || "/DEPED LOGOS.png",
    };
  });
};

const normalizeItems = (items, limit) =>
  items
    .filter((item) => item.title && item.link)
    .slice(0, limit)
    .map((item) => ({
      ...item,
      summary:
        item.summary ||
        "Open the official DepEd news story to read the full education update and related announcement.",
    }));

const fetchDepedNewsFeed = async (limit = DEFAULT_LIMIT) => {
  const now = Date.now();

  if (cachedFeed.expiresAt > now && cachedFeed.items.length) {
    return cachedFeed.items.slice(0, limit);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const preferredXml = await fetchFeedXml(DEPED_NEWS_FEED_URL, controller);
    let parsedItems = normalizeItems(parseRssItems(preferredXml), Math.max(limit, DEFAULT_LIMIT));

    if (!parsedItems.length) {
      const siteXml = await fetchFeedXml(DEPED_SITE_FEED_URL, controller);
      parsedItems = normalizeItems(parseRssItems(siteXml), Math.max(limit, DEFAULT_LIMIT));
    }

    if (!parsedItems.length) {
      throw new Error("DepEd official feeds did not return any readable news items.");
    }

    cachedFeed = {
      expiresAt: now + CACHE_TTL_MS,
      items: parsedItems,
    };

    return parsedItems.slice(0, limit);
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = {
  fetchDepedNewsFeed,
};

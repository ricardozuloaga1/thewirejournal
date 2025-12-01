/**
 * Image Extraction Module
 * 
 * Extracts OG (Open Graph) images from news source URLs.
 * This provides real, professional news photos without API costs.
 */

export interface ExtractedImage {
  id: string;
  url: string;
  sourceUrl: string;
  sourceDomain: string;
}

/**
 * Extract OG image from a single URL
 */
async function extractOGImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
        'Accept': 'text/html',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Try og:image first (most common)
    let match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (match?.[1]) return match[1];

    // Try content before property (some sites do it this way)
    match = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (match?.[1]) return match[1];

    // Try twitter:image
    match = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (match?.[1]) return match[1];

    // Try twitter:image:src
    match = html.match(/<meta[^>]+name=["']twitter:image:src["'][^>]+content=["']([^"']+)["']/i);
    if (match?.[1]) return match[1];

    return null;
  } catch (error) {
    // Timeout or network error - silently fail
    console.log(`Failed to extract image from ${url}:`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Validate that an image URL is accessible and returns an image
 */
async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return false;

    const contentType = response.headers.get('content-type');
    return contentType?.startsWith('image/') ?? false;
  } catch {
    return false;
  }
}

/**
 * Get domain from URL for attribution
 */
function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

/**
 * Extract images from multiple source URLs
 * Returns up to `maxImages` unique, validated images
 */
export async function extractImagesFromSources(
  sources: { url: string }[],
  maxImages: number = 3
): Promise<ExtractedImage[]> {
  const images: ExtractedImage[] = [];
  const seenUrls = new Set<string>();

  console.log(`Extracting images from ${sources.length} sources...`);

  // Process sources in parallel with concurrency limit
  const results = await Promise.allSettled(
    sources.slice(0, 10).map(async (source) => { // Limit to first 10 sources
      const imageUrl = await extractOGImage(source.url);
      if (imageUrl && !seenUrls.has(imageUrl)) {
        const isValid = await validateImageUrl(imageUrl);
        if (isValid) {
          return {
            imageUrl,
            sourceUrl: source.url,
          };
        }
      }
      return null;
    })
  );

  // Collect successful extractions
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      const { imageUrl, sourceUrl } = result.value;
      
      if (!seenUrls.has(imageUrl) && images.length < maxImages) {
        seenUrls.add(imageUrl);
        images.push({
          id: `extracted-${Date.now()}-${images.length}`,
          url: imageUrl,
          sourceUrl,
          sourceDomain: getDomain(sourceUrl),
        });
      }
    }
  }

  console.log(`Extracted ${images.length} valid images from sources`);
  return images;
}

/**
 * Quick extraction for a single URL (useful for testing)
 */
export async function extractSingleImage(url: string): Promise<ExtractedImage | null> {
  const imageUrl = await extractOGImage(url);
  if (!imageUrl) return null;

  const isValid = await validateImageUrl(imageUrl);
  if (!isValid) return null;

  return {
    id: `extracted-${Date.now()}`,
    url: imageUrl,
    sourceUrl: url,
    sourceDomain: getDomain(url),
  };
}



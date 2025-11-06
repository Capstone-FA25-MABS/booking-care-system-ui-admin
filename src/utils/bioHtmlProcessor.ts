/**
 * Utility to process and sanitize bio HTML content
 * Automatically adds CSS classes to images and videos
 */

/**
 * Strip HTML tags from text safely to prevent ReDoS attacks
 * @param html - The HTML string to strip tags from
 * @param maxLength - Maximum length of input to process (default: 1MB)
 * @returns Text content without HTML tags
 */
export const stripHtmlTags = (html: string, maxLength: number = 1024 * 1024): string => {
    // Limit input length to prevent ReDoS attacks
    if (html.length > maxLength) {
        html = html.substring(0, maxLength);
    }

    // Use a more efficient regex that avoids excessive backtracking
    // Using + instead of * ensures at least one character, reducing backtracking
    return html.replace(/<[^>]+>/g, '').trim();
};

/**
 * Normalize font sizes to 15px for all text elements
 * @param doc - DOM Document
 */
const normalizeFontSize = (doc: Document): void => {
    const allElements = doc.querySelectorAll('*');
    allElements.forEach((element) => {
        const htmlElement = element as HTMLElement;

        // Remove font-size from style attribute
        if (htmlElement.style.fontSize) {
            htmlElement.style.fontSize = '';
        }

        // Remove inline font-size from style string
        const style = htmlElement.getAttribute('style');
        if (style) {
            const cleanedStyle = style
                .split(';')
                .filter((s) => !s.trim().toLowerCase().startsWith('font-size'))
                .join(';');

            if (cleanedStyle.trim()) {
                htmlElement.setAttribute('style', cleanedStyle);
            } else {
                htmlElement.removeAttribute('style');
            }
        }
    });

    // Remove font size spans
    const spans = doc.querySelectorAll('span[style*="font-size"]');
    spans.forEach((span) => {
        const htmlSpan = span as HTMLElement;
        htmlSpan.style.fontSize = '';
        if (!htmlSpan.getAttribute('style')?.trim()) {
            htmlSpan.removeAttribute('style');
        }
    });
};

/**
 * Convert video URL to embed URL
 * @param url - Original video URL
 * @returns Embed URL or original URL if not supported
 */
const convertToEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    }
    if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    }
    if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        if (videoId) {
            return `https://player.vimeo.com/video/${videoId}`;
        }
    }
    return url;
};

/**
 * Process all images in the document
 * @param doc - DOM Document
 */
const processImages = (doc: Document): void => {
    const images = doc.querySelectorAll('img');
    images.forEach((img) => {
        if (!img.className) {
            img.className = 'img-responsive';
        }
        if (!img.alt) {
            img.alt = 'Doctor bio image';
        }
        img.setAttribute('width', '200');
        img.setAttribute('height', '150');
        img.style.width = '200px';
        img.style.height = '150px';
        img.style.objectFit = 'cover';
    });
};

/**
 * Process media embeds (oembed elements) and convert to iframes
 * @param doc - DOM Document
 */
const processMediaEmbeds = (doc: Document): void => {
    const mediaFigures = doc.querySelectorAll('figure.media');
    mediaFigures.forEach((figure) => {
        const oembed = figure.querySelector('oembed');
        if (!oembed) return;

        const url = oembed.getAttribute('url');
        if (!url) return;

        const embedUrl = convertToEmbedUrl(url);
        const iframe = doc.createElement('iframe');
        iframe.setAttribute('src', embedUrl);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('class', 'video-embed');
        figure.replaceWith(iframe);
    });
};

/**
 * Process all iframes in the document
 * @param doc - DOM Document
 */
const processIframes = (doc: Document): void => {
    const iframes = doc.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
        if (!iframe.getAttribute('class')?.includes('video-embed')) {
            iframe.setAttribute('class', 'video-embed');
        }
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
    });
};

/**
 * Process all video elements in the document
 * @param doc - DOM Document
 */
const processVideos = (doc: Document): void => {
    const videos = doc.querySelectorAll('video');
    videos.forEach((video) => {
        if (!video.getAttribute('class')?.includes('video-embed')) {
            video.setAttribute('class', 'video-embed');
        }
        video.style.objectFit = 'cover';
        if (!video.hasAttribute('controls')) {
            video.setAttribute('controls', 'true');
        }
    });
};

/**
 * Remove background color from code blocks
 * @param doc - DOM Document
 */
const processCodeBlocks = (doc: Document): void => {
    const codeBlocks = doc.querySelectorAll('code, pre');
    codeBlocks.forEach((block) => {
        const htmlBlock = block as HTMLElement;
        htmlBlock.style.backgroundColor = '';
        htmlBlock.style.background = '';
        if (!htmlBlock.getAttribute('style')?.trim()) {
            htmlBlock.removeAttribute('style');
        }
    });
};

/**
 * Process HTML content to add responsive classes to images and videos
 * @param html - Raw HTML from CKEditor
 * @returns Processed HTML with CSS classes
 */
export const processBioHtml = (html: string): string => {
    if (!html) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    normalizeFontSize(doc);
    processImages(doc);
    processMediaEmbeds(doc);
    processIframes(doc);
    processVideos(doc);
    processCodeBlocks(doc);

    return doc.body.innerHTML;
};

/**
 * Sanitize HTML to remove potentially dangerous content
 * @param html - Raw HTML
 * @returns Sanitized HTML
 */
export const sanitizeBioHtml = (html: string): string => {
    if (!html) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove script tags
    const scripts = doc.querySelectorAll('script');
    scripts.forEach((script) => script.remove());

    // Remove event handlers
    const allElements = doc.querySelectorAll('*');
    allElements.forEach((element) => {
        // Remove on* attributes (onclick, onload, etc.)
        Array.from(element.attributes).forEach((attr) => {
            if (attr.name.startsWith('on')) {
                element.removeAttribute(attr.name);
            }
        });
    });

    return doc.body.innerHTML;
};

/**
 * Complete processing pipeline: sanitize + add classes
 * @param html - Raw HTML from CKEditor
 * @returns Fully processed and safe HTML
 */
export const prepareBioForSave = (html: string): string => {
    // First sanitize
    let processed = sanitizeBioHtml(html);

    // Then add responsive classes and convert oembed to iframe
    processed = processBioHtml(processed);

    return processed;
};

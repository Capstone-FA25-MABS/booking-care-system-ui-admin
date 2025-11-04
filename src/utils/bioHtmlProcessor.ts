/**
 * Utility to process and sanitize bio HTML content
 * Automatically adds CSS classes to images and videos
 */

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
 * Process HTML content to add responsive classes to images and videos
 * @param html - Raw HTML from CKEditor
 * @returns Processed HTML with CSS classes
 */
export const processBioHtml = (html: string): string => {
    if (!html) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Normalize font sizes to 15px
    normalizeFontSize(doc);

    // Process all images
    const images = doc.querySelectorAll('img');
    images.forEach((img) => {
        // Add responsive class if not exists
        if (!img.className) {
            img.className = 'img-responsive';
        }

        // Ensure images have alt text for accessibility
        if (!img.alt) {
            img.alt = 'Doctor bio image';
        }

        // Set fixed dimensions: 200x150px
        img.setAttribute('width', '200');
        img.setAttribute('height', '150');
        img.style.width = '200px';
        img.style.height = '150px';
        img.style.objectFit = 'cover'; // Maintain aspect ratio
    });

    // Process media embeds (CKEditor creates <figure class="media"><oembed url="..."></oembed></figure>)
    const mediaFigures = doc.querySelectorAll('figure.media');

    mediaFigures.forEach((figure) => {
        // CKEditor uses <oembed> tag with url attribute (not <ooxml> with text content)
        const oembed = figure.querySelector('oembed');

        if (oembed) {
            // Get URL from "url" attribute
            const url = oembed.getAttribute('url');

            if (url) {
                // Convert YouTube watch URL to embed URL
                let embedUrl = url;
                if (url.includes('youtube.com/watch')) {
                    const videoId = new URL(url).searchParams.get('v');
                    if (videoId) {
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    }
                } else if (url.includes('youtu.be/')) {
                    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                    if (videoId) {
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    }
                } else if (url.includes('vimeo.com/')) {
                    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
                    if (videoId) {
                        embedUrl = `https://player.vimeo.com/video/${videoId}`;
                    }
                }

                // Create iframe with responsive sizing
                const iframe = doc.createElement('iframe');
                iframe.setAttribute('src', embedUrl);
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allowfullscreen', 'true');
                iframe.setAttribute('class', 'video-embed');

                // Replace figure with iframe
                figure.replaceWith(iframe);
            }
        }
    });

    // Process all iframes (videos) - add responsive class
    const iframes = doc.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
        // Add class for responsive styling (80% width, centered)
        if (!iframe.getAttribute('class')?.includes('video-embed')) {
            iframe.setAttribute('class', 'video-embed');
        }
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
    });

    // Process all videos
    const videos = doc.querySelectorAll('video');
    videos.forEach((video) => {
        // Add responsive class for styling (80% width, centered)
        if (!video.getAttribute('class')?.includes('video-embed')) {
            video.setAttribute('class', 'video-embed');
        }
        video.style.objectFit = 'cover';

        // Add controls if not exists
        if (!video.hasAttribute('controls')) {
            video.setAttribute('controls', 'true');
        }
    });

    // Remove background color from code blocks
    const codeBlocks = doc.querySelectorAll('code, pre');
    codeBlocks.forEach((block) => {
        const htmlBlock = block as HTMLElement;
        htmlBlock.style.backgroundColor = '';
        htmlBlock.style.background = '';

        // Clean up style attribute if empty
        if (!htmlBlock.getAttribute('style')?.trim()) {
            htmlBlock.removeAttribute('style');
        }
    });

    // Return processed HTML
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

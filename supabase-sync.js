import { supabase } from './supabase-client.js';

// The fallback image links are in window.imageLinks from image-links.js
async function syncContent() {
    try {
        // Find current language. Let's assume 'en' unless html lang contains 'zh'
        const currentLang = document.documentElement.lang.includes('zh') ? 'zh' : 'en';

        // 1. Fetch images (mostly lang independent) and text (lang dependent)
        const { data, error } = await supabase
            .from('site_content')
            .select('*')
            .in('lang', [currentLang, 'all']);

        if (error) {
            console.error('Error fetching site content from Supabase:', error);
            // We can still rely on image-links.js fallback
            if (typeof window.applyImageLinks === 'function') {
                window.applyImageLinks();
            }
            return;
        }

        const contentMap = {};
        data.forEach(item => {
            contentMap[item.key] = item.value;
        });

        // 2. Override window.imageLinks with values from DB where applicable
        if (window.imageLinks) {
            Object.keys(window.imageLinks).forEach(key => {
                if (contentMap[key]) {
                    window.imageLinks[key] = contentMap[key];
                }
            });
        }

        // Apply Image Links
        if (typeof window.applyImageLinks === 'function') {
            window.applyImageLinks();
        }

        // 3. Apply Text Content
        const textElements = document.querySelectorAll('[data-content]');
        textElements.forEach(el => {
            const key = el.getAttribute('data-content');
            if (contentMap[key]) {
                // Determine whether to use innerText or innerHTML
                // If the key implies HTML (e.g., contains <br>, we might need innerHTML)
                // For safety, innerHTML is used but we should trust our own DB.
                el.innerHTML = contentMap[key];
            }
        });

        // 4. Update Document Title if there is a 'site_title'
        if (contentMap['site_title']) {
            document.title = contentMap['site_title'];
        }

    } catch (err) {
        console.error('Unexpected error in syncContent:', err);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncContent);
} else {
    syncContent();
}

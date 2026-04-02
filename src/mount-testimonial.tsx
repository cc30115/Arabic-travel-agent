import React from 'react';
import { createRoot } from 'react-dom/client';
import { DemoOne } from './components/demo-testimonial';
import './index.css';

document.addEventListener('DOMContentLoaded', () => {
    // Find all potential mounting points
    const containers = document.querySelectorAll('.react-testimonial-mount');
    
    containers.forEach(container => {
        const lang = container.getAttribute('data-lang') === 'zh' ? 'zh' : 'en';
        const root = createRoot(container);
        root.render(
            <React.StrictMode>
                <DemoOne lang={lang} />
            </React.StrictMode>
        );
    });
});

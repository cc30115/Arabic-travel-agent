import { supabase } from './supabase-client.js';

// ─── DOM References ─────────────────────────────────────────────────────────
const authView          = document.getElementById('auth-view');
const dashboardView     = document.getElementById('dashboard-view');
const loginForm         = document.getElementById('login-form');
const loginError        = document.getElementById('login-error');
const logoutBtn         = document.getElementById('logout-btn');

const loadingState      = document.getElementById('loading-state');
const mainContent       = document.getElementById('main-content');
const refreshBtn        = document.getElementById('refresh-btn');
const addNewBtn         = document.getElementById('add-new-btn');
const sectionTitle      = document.getElementById('section-title');
const sectionDesc       = document.getElementById('section-desc');

const editModal         = document.getElementById('edit-modal');
const editModalContent  = document.getElementById('edit-modal-content');
const closeModalBtn     = document.getElementById('close-modal-btn');
const cancelModalBtn    = document.getElementById('cancel-modal-btn');
const editForm          = document.getElementById('edit-form');
const editTypeSelect    = document.getElementById('edit-type');
const imagePreviewWrap  = document.getElementById('image-preview-wrap');
const imagePreview      = document.getElementById('image-preview');
const editValue         = document.getElementById('edit-value');
const saveIcon          = document.getElementById('save-icon');

// ─── State ───────────────────────────────────────────────────────────────────
let currentData   = [];
let activeSection = 'all';

// ─── Section Definitions ─────────────────────────────────────────────────────
const SECTIONS = {
    all: {
        label: 'All Content',
        desc:  'All editable content across the website',
        filter: () => true
    },
    hero: {
        label: 'Hero Section',
        desc:  'The full-screen opening hero on the home page',
        filter: item => item.key.startsWith('hero_')
    },
    journeys: {
        label: 'Journeys',
        desc:  'The three curated journey packages (durations, titles, descriptions)',
        filter: item => item.key.startsWith('journey') && !['dubai','liwa','empty_quarter','bedouin','abu_dhabi','louvre','mosque','departure','musandam','nizwa','wahiba','riyadh','alula','oman_mt','salalah'].some(p => item.key.startsWith(p))
    },
    journey_detail: {
        label: 'Journey Day Images',
        desc:  'Day-by-day itinerary photos shown in the lightbox on each journey page',
        filter: item => ['dubai','liwa','empty_quarter','bedouin','abu_dhabi','louvre','mosque','departure','musandam','nizwa','wahiba','riyadh','alula','oman_mt','salalah'].some(p => item.key.startsWith(p))
    },
    values: {
        label: 'Core Values',
        desc:  'The "Rooted in tradition" section and its three value cards',
        filter: item => item.key.startsWith('value')
    },
    concierge: {
        label: 'Concierge CTA',
        desc:  'The "Craft Your Bespoke Journey" call-to-action section',
        filter: item => item.key.startsWith('concierge')
    },
    footer: {
        label: 'Footer',
        desc:  'Footer tagline, email address, and bottom-of-page text',
        filter: item => item.key.startsWith('footer')
    },
    images: {
        label: 'Image Assets',
        desc:  'All images used across the website — click any card to change its URL',
        filter: item => item.type === 'image'
    }
};

// Order for "All Content" grouped view
const GROUP_ORDER = ['hero', 'journeys', 'journey_detail', 'values', 'concierge', 'footer', 'images'];

const GROUP_ICONS = {
    hero:           '🌟',
    journeys:       '🗺',
    journey_detail: '📸',
    values:         '✨',
    concierge:      '📞',
    footer:         '📄',
    images:         '🖼'
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    handleSession(session);
    supabase.auth.onAuthStateChange((_event, session) => handleSession(session));
}

function handleSession(session) {
    if (session) {
        authView.classList.add('hidden');
        dashboardView.classList.replace('hidden', 'flex');
        fetchContent();
    } else {
        authView.classList.remove('hidden');
        dashboardView.classList.replace('flex', 'hidden');
    }
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');
    const { error } = await supabase.auth.signInWithPassword({
        email:    document.getElementById('email').value,
        password: document.getElementById('password').value
    });
    if (error) {
        loginError.textContent = error.message;
        loginError.classList.remove('hidden');
    }
});

logoutBtn.addEventListener('click', () => supabase.auth.signOut());

// ─── Data Fetch ───────────────────────────────────────────────────────────────
async function fetchContent() {
    loadingState.classList.remove('hidden');
    mainContent.classList.add('hidden');

    const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('type', { ascending: true })
        .order('key',  { ascending: true });

    if (error) {
        loadingState.innerHTML = `
            <div class="flex flex-col items-center gap-3">
                <iconify-icon icon="lucide:alert-circle" class="text-3xl text-red-400"></iconify-icon>
                <p class="text-red-400 text-sm">Failed to load: ${error.message}</p>
            </div>`;
        return;
    }

    currentData = data;
    renderSection();
}

refreshBtn.addEventListener('click', fetchContent);

// ─── Sidebar Navigation ───────────────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeSection = btn.dataset.section;
        const sec = SECTIONS[activeSection];
        sectionTitle.textContent = sec.label;
        sectionDesc.textContent  = sec.desc;
        if (currentData.length > 0) renderSection();
    });
});

// ─── Render Router ────────────────────────────────────────────────────────────
function renderSection() {
    loadingState.classList.add('hidden');
    mainContent.classList.remove('hidden');

    if (activeSection === 'all') {
        renderAllGrouped();
    } else if (activeSection === 'images') {
        renderImageGrid(currentData.filter(SECTIONS.images.filter));
    } else {
        renderFilteredList(currentData.filter(SECTIONS[activeSection].filter));
    }
}

// ─── All Content (Grouped) ────────────────────────────────────────────────────
function renderAllGrouped() {
    const categorised = new Set();
    let html = '';

    GROUP_ORDER.forEach(sectionId => {
        const sec   = SECTIONS[sectionId];
        const items = currentData.filter(sec.filter);
        items.forEach(i => categorised.add(i.id));
        if (!items.length) return;

        const icon  = GROUP_ICONS[sectionId] || '📦';
        const label = sec.label;

        if (sectionId === 'images') {
            html += `
                <div class="mb-8">
                    ${sectionHeader(icon, label, items.length)}
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        ${items.map(imageCardHTML).join('')}
                    </div>
                </div>`;
        } else {
            html += `
                <div class="mb-8">
                    ${sectionHeader(icon, label, items.length)}
                    <div class="bg-black border border-white/8 rounded-xl overflow-hidden" style="border-color:rgba(255,255,255,0.07)">
                        ${items.map(textRowHTML).join('')}
                    </div>
                </div>`;
        }
    });

    // Uncategorised items
    const other = currentData.filter(i => !categorised.has(i.id));
    if (other.length) {
        html += `
            <div class="mb-8">
                ${sectionHeader('📦', 'Other', other.length)}
                <div class="bg-black border border-white/8 rounded-xl overflow-hidden" style="border-color:rgba(255,255,255,0.07)">
                    ${other.map(textRowHTML).join('')}
                </div>
            </div>`;
    }

    mainContent.innerHTML = html || emptyState('No content yet. Click "Add Key" to start.');
    bindButtons();
}

// ─── Filtered List ────────────────────────────────────────────────────────────
function renderFilteredList(items) {
    if (!items.length) {
        mainContent.innerHTML = emptyState(`No content in this section yet. Click "Add Key" to create an entry.`);
        return;
    }
    mainContent.innerHTML = `
        <div class="bg-black border border-white/8 rounded-xl overflow-hidden" style="border-color:rgba(255,255,255,0.07)">
            ${items.map(textRowHTML).join('')}
        </div>`;
    bindButtons();
}

// ─── Image Grid ───────────────────────────────────────────────────────────────
function renderImageGrid(items) {
    if (!items.length) {
        mainContent.innerHTML = emptyState('No image assets yet. Click "Add Key" and choose type "Image URL".');
        return;
    }
    mainContent.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            ${items.map(imageCardHTML).join('')}
        </div>`;
    bindButtons();
}

// ─── Templates ────────────────────────────────────────────────────────────────

// Fix relative asset paths (e.g. "asset/foo.jpg" → "/asset/foo.jpg")
// so they work both locally and on Vercel at any URL depth.
function resolveImageSrc(src) {
    if (!src) return '';
    if (src.startsWith('http') || src.startsWith('//') || src.startsWith('data:') || src.startsWith('blob:')) {
        return src;
    }
    return '/' + src.replace(/^\//, '');
}

function sectionHeader(icon, label, count) {
    return `
        <div class="flex items-center gap-2 mb-3">
            <span class="text-sm">${icon}</span>
            <span class="text-[10px] tracking-[0.12em] uppercase text-white/35">${label}</span>
            <div class="flex-1 h-px bg-white/5"></div>
            <span class="text-[10px] text-white/20">${count} item${count !== 1 ? 's' : ''}</span>
        </div>`;
}

function textRowHTML(item) {
    const langClass = item.lang === 'all' ? 'lang-all' : `lang-${item.lang}`;
    const langLabel = item.lang === 'all' ? 'Global' : item.lang.toUpperCase();
    const typeClass = item.type === 'image' ? 'type-image' : 'type-text';

    // Image rows get a clickable thumbnail instead of raw URL text
    if (item.type === 'image') {
        return `
        <div class="content-card flex items-center gap-4 px-5 py-3 border-b border-white/4 last:border-0" style="border-color:rgba(255,255,255,0.04)">
            <!-- Clickable thumbnail -->
            <div class="relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border border-white/10 cursor-pointer group edit-btn" data-id="${item.id}" title="Click to change image">
                <img src="${resolveImageSrc(item.value)}" alt="${escapeHTML(item.description || item.key)}"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.2);font-size:10px;text-align:center;padding:4px\\'>No image</div>'">
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <iconify-icon icon="lucide:pencil" width="16" style="color:white"></iconify-icon>
                </div>
            </div>
            <!-- Info -->
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <span class="font-mono text-xs text-[#C5A059]">${item.key}</span>
                    <span class="badge ${langClass}">${langLabel}</span>
                    <span class="badge ${typeClass}">image</span>
                </div>
                <p class="text-[10px] text-white/25 uppercase tracking-widest mb-1">${item.description || 'No description'}</p>
                <p class="text-[11px] text-white/30 truncate max-w-sm">${escapeHTML(item.value)}</p>
            </div>
            <!-- Actions -->
            <div class="flex items-center gap-0.5 flex-shrink-0">
                <button class="edit-btn text-white/25 hover:text-[#C5A059] transition-colors p-2 rounded-lg hover:bg-white/5"
                    data-id="${item.id}" title="Edit">
                    <iconify-icon icon="lucide:edit-3" width="14"></iconify-icon>
                </button>
                <button class="delete-btn text-white/25 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/8"
                    data-id="${item.id}" title="Delete">
                    <iconify-icon icon="lucide:trash-2" width="14"></iconify-icon>
                </button>
            </div>
        </div>`;
    }

    // Text rows
    const preview = item.value.length > 110
        ? item.value.substring(0, 110) + '…'
        : item.value;

    return `
        <div class="content-card flex items-start gap-4 px-5 py-4 border-b border-white/4 last:border-0" style="border-color:rgba(255,255,255,0.04)">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <span class="font-mono text-xs text-[#C5A059]">${item.key}</span>
                    <span class="badge ${langClass}">${langLabel}</span>
                    <span class="badge ${typeClass}">text</span>
                </div>
                <p class="text-[10px] text-white/25 uppercase tracking-widest mb-1.5">${item.description || 'No description'}</p>
                <p class="text-sm text-white/55 leading-relaxed line-clamp-2">${escapeHTML(preview)}</p>
            </div>
            <div class="flex items-center gap-0.5 flex-shrink-0 pt-0.5">
                <button class="edit-btn text-white/25 hover:text-[#C5A059] transition-colors p-2 rounded-lg hover:bg-white/5"
                    data-id="${item.id}" title="Edit">
                    <iconify-icon icon="lucide:edit-3" width="14"></iconify-icon>
                </button>
                <button class="delete-btn text-white/25 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/8"
                    data-id="${item.id}" title="Delete">
                    <iconify-icon icon="lucide:trash-2" width="14"></iconify-icon>
                </button>
            </div>
        </div>`;
}

function imageCardHTML(item) {
    const label = item.description || item.key;
    return `
        <div class="image-card bg-black border border-white/8 rounded-xl overflow-hidden cursor-pointer group" style="border-color:rgba(255,255,255,0.07)" data-id="${item.id}">
            <div class="relative h-36 bg-white/4 overflow-hidden">
                <img src="${resolveImageSrc(item.value)}" alt="${escapeHTML(label)}"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onerror="this.parentElement.innerHTML='<div class=\\'flex items-center justify-center h-full\\' style=\\'color:rgba(255,255,255,0.2); font-size:11px;\\'>No image found</div>'">
                <div class="absolute inset-0 bg-transparent group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span class="text-white text-[10px] uppercase tracking-widest bg-black/70 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <iconify-icon icon="lucide:edit-3" width="11"></iconify-icon> Edit
                    </span>
                </div>
            </div>
            <div class="px-3 pt-2.5 pb-1">
                <p class="font-mono text-[11px] text-[#C5A059] truncate">${item.key}</p>
                <p class="text-[10px] text-white/25 mt-0.5 truncate">${escapeHTML(label)}</p>
            </div>
            <div class="flex border-t border-white/5 mt-1">
                <button class="edit-btn flex-1 py-2 text-[10px] text-white/30 hover:text-[#C5A059] transition-colors flex items-center justify-center gap-1" data-id="${item.id}">
                    <iconify-icon icon="lucide:edit-3" width="11"></iconify-icon> Edit
                </button>
                <div class="w-px bg-white/5"></div>
                <button class="delete-btn flex-1 py-2 text-[10px] text-white/30 hover:text-red-400 transition-colors flex items-center justify-center gap-1" data-id="${item.id}">
                    <iconify-icon icon="lucide:trash-2" width="11"></iconify-icon> Delete
                </button>
            </div>
        </div>`;
}

function emptyState(msg) {
    return `
        <div class="py-24 text-center text-white/25 flex flex-col items-center gap-4">
            <iconify-icon icon="lucide:inbox" class="text-4xl"></iconify-icon>
            <p class="text-sm max-w-xs">${msg}</p>
        </div>`;
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ─── Button Bindings ──────────────────────────────────────────────────────────
function bindButtons() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = currentData.find(d => d.id === e.currentTarget.dataset.id);
            if (item) openModal(item);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const item = currentData.find(d => d.id === e.currentTarget.dataset.id);
            if (confirm(`Delete "${item?.key}"?\n\nThis cannot be undone.`)) {
                const { error } = await supabase.from('site_content').delete().eq('id', item.id);
                if (!error) fetchContent();
                else alert('Delete failed: ' + error.message);
            }
        });
    });

    // Image cards — whole card is clickable
    document.querySelectorAll('.image-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) return;
            const item = currentData.find(d => d.id === card.dataset.id);
            if (item) openModal(item);
        });
    });
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function openModal(item = null) {
    const idEl    = document.getElementById('edit-id');
    const keyEl   = document.getElementById('edit-key');
    const descEl  = document.getElementById('edit-desc');
    const langEl  = document.getElementById('edit-lang');
    const typeEl  = document.getElementById('edit-type');
    const valEl   = document.getElementById('edit-value');
    const titleEl = document.getElementById('modal-title');

    if (item) {
        idEl.value            = item.id;
        keyEl.value           = item.key;
        keyEl.readOnly        = true;
        keyEl.style.opacity   = '0.5';
        keyEl.style.cursor    = 'not-allowed';
        descEl.value          = item.description || '';
        langEl.value          = item.lang;
        typeEl.value          = item.type;
        valEl.value           = item.value;
        titleEl.textContent   = `Edit: ${item.description || item.key}`;
        updateImagePreview(item.type, item.value);
    } else {
        editForm.reset();
        idEl.value          = '';
        keyEl.readOnly      = false;
        keyEl.style.opacity = '1';
        keyEl.style.cursor  = 'text';
        langEl.value        = 'en';
        typeEl.value        = 'text';
        titleEl.textContent = 'Add New Content Key';
        imagePreviewWrap.classList.add('hidden');
    }

    editModal.classList.replace('hidden', 'flex');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            editModalContent.classList.remove('scale-95', 'opacity-0');
        });
    });
}

function closeModal() {
    editModalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => editModal.classList.replace('flex', 'hidden'), 200);
}

function updateImagePreview(type, url) {
    const uploadWrap = document.getElementById('upload-wrap');
    if (type === 'image') {
        uploadWrap && uploadWrap.classList.remove('hidden');
        if (url && url.trim()) {
            imagePreviewWrap.classList.remove('hidden');
            imagePreview.src = resolveImageSrc(url.trim());
        } else {
            imagePreviewWrap.classList.add('hidden');
        }
    } else {
        uploadWrap && uploadWrap.classList.add('hidden');
        imagePreviewWrap.classList.add('hidden');
    }
}

// Live preview updates
editTypeSelect.addEventListener('change', () => updateImagePreview(editTypeSelect.value, editValue.value));
editValue.addEventListener('input',       () => updateImagePreview(editTypeSelect.value, editValue.value));

// ─── File Upload ──────────────────────────────────────────────────────────────
const imageFileInput  = document.getElementById('image-file-input');
const uploadFileBtn   = document.getElementById('upload-file-btn');
const uploadBtnLabel  = document.getElementById('upload-btn-label');

// Clicking the upload button or the preview triggers the file picker
uploadFileBtn && uploadFileBtn.addEventListener('click', () => imageFileInput && imageFileInput.click());
imagePreviewWrap && imagePreviewWrap.addEventListener('click', () => imageFileInput && imageFileInput.click());

imageFileInput && imageFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant local preview while uploading
    const blobUrl = URL.createObjectURL(file);
    imagePreviewWrap.classList.remove('hidden');
    imagePreview.src = blobUrl;

    // Update button label to show progress
    uploadBtnLabel.textContent = 'Uploading…';
    uploadFileBtn.disabled = true;

    try {
        const publicUrl = await uploadImageFile(file);
        editValue.value = publicUrl;
        imagePreview.src = publicUrl;
        URL.revokeObjectURL(blobUrl);
        uploadBtnLabel.textContent = '✓ Uploaded Successfully';
        setTimeout(() => { uploadBtnLabel.textContent = 'Upload from Computer'; }, 2500);
    } catch (err) {
        uploadBtnLabel.textContent = 'Upload Failed — Check Supabase Storage';
        console.error('Upload error:', err);
        // Keep the blob preview and leave the textarea empty so user can paste URL manually
        setTimeout(() => { uploadBtnLabel.textContent = 'Upload from Computer'; }, 3000);
    }

    uploadFileBtn.disabled = false;
    imageFileInput.value = '';
});

async function uploadImageFile(file) {
    const ext      = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false, contentType: file.type });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
    return data.publicUrl;
}

addNewBtn.addEventListener('click',      () => openModal());
closeModalBtn.addEventListener('click',  closeModal);
cancelModalBtn.addEventListener('click', closeModal);
editModal.addEventListener('click', (e) => { if (e.target === editModal) closeModal(); });

// ─── Save ─────────────────────────────────────────────────────────────────────
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveIcon.setAttribute('icon', 'lucide:loader-2');
    saveIcon.classList.add('animate-spin');

    const id      = document.getElementById('edit-id').value;
    const payload = {
        key:         document.getElementById('edit-key').value.trim(),
        description: document.getElementById('edit-desc').value.trim(),
        lang:        document.getElementById('edit-lang').value,
        type:        document.getElementById('edit-type').value,
        value:       document.getElementById('edit-value').value.trim()
    };

    const { error } = id
        ? await supabase.from('site_content').update(payload).eq('id', id)
        : await supabase.from('site_content').insert([payload]);

    saveIcon.setAttribute('icon', 'lucide:save');
    saveIcon.classList.remove('animate-spin');

    if (error) {
        alert('Error saving: ' + error.message);
    } else {
        closeModal();
        fetchContent();
    }
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
init();

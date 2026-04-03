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
        const isSpecial = ['inquiries','availability'].includes(activeSection);
        if (isSpecial || currentData.length > 0) renderSection();
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
    } else if (activeSection === 'inquiries') {
        renderInquiries();
    } else if (activeSection === 'availability') {
        renderAvailability();
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

// ─── Inquiries ────────────────────────────────────────────────────────────────
async function renderInquiries() {
    mainContent.classList.remove('hidden');
    loadingState.classList.add('hidden');
    mainContent.innerHTML = `<div class="py-16 text-center flex flex-col items-center gap-3 text-white/30">
        <iconify-icon icon="lucide:loader-2" class="animate-spin text-3xl text-[#C5A059]"></iconify-icon>
        <p class="text-[10px] tracking-widest uppercase">Loading Inquiries...</p></div>`;

    const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    if (error) { mainContent.innerHTML = `<p class="text-red-400 text-sm p-6">Error: ${error.message}</p>`; return; }
    if (!data.length) { mainContent.innerHTML = emptyState('No inquiries yet — submitted forms will appear here.'); return; }

    mainContent.innerHTML = `<div class="space-y-3">${data.map(inqCardHTML).join('')}</div>`;

    document.querySelectorAll('.inq-review-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            await supabase.from('inquiries').update({ status: 'reviewed' }).eq('id', btn.dataset.id);
            renderInquiries();
        });
    });
    document.querySelectorAll('.inq-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Delete this inquiry permanently?')) {
                await supabase.from('inquiries').delete().eq('id', btn.dataset.id);
                renderInquiries();
            }
        });
    });
}

function inqCardHTML(inq) {
    const submitted = new Date(inq.created_at).toLocaleDateString('en', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    const travelDate = inq.travel_date ? new Date(inq.travel_date + 'T00:00:00').toLocaleDateString('en', { month:'long', day:'numeric', year:'numeric' }) : '—';
    const isNew = !inq.status || inq.status === 'new';
    return `
    <div class="bg-black border rounded-xl overflow-hidden" style="border-color:${isNew ? 'rgba(197,160,89,0.2)' : 'rgba(255,255,255,0.06)'}">
        <div class="px-5 py-4 flex items-start gap-4">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span class="font-medium text-white text-sm">${escapeHTML(inq.name || '—')}</span>
                    <span class="badge ${isNew ? 'bg-[#C5A059]/15 text-[#C5A059]' : 'bg-white/5 text-white/30'}">${isNew ? 'New' : 'Reviewed'}</span>
                    ${inq.journey ? `<span class="badge lang-all">${escapeHTML(inq.journey)}</span>` : ''}
                </div>
                <div class="flex flex-wrap gap-4 text-[10px] text-white/35 uppercase tracking-widest mb-2">
                    <span><iconify-icon icon="lucide:mail" width="10"></iconify-icon> ${escapeHTML(inq.email || '')}</span>
                    ${inq.phone ? `<span><iconify-icon icon="lucide:phone" width="10"></iconify-icon> ${escapeHTML(inq.phone)}</span>` : ''}
                    <span><iconify-icon icon="lucide:calendar" width="10"></iconify-icon> ${escapeHTML(travelDate)}</span>
                    ${inq.guests ? `<span><iconify-icon icon="lucide:users" width="10"></iconify-icon> ${inq.guests} guest${inq.guests > 1 ? 's' : ''}</span>` : ''}
                </div>
                ${inq.message ? `<p class="text-white/50 text-sm leading-relaxed line-clamp-2">${escapeHTML(inq.message)}</p>` : ''}
                <p class="text-white/20 text-[10px] mt-2">${submitted}</p>
            </div>
            <div class="flex items-center gap-0.5 flex-shrink-0 pt-1">
                ${isNew ? `<button class="inq-review-btn text-white/25 hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-green-500/8" data-id="${inq.id}" title="Mark reviewed">
                    <iconify-icon icon="lucide:check" width="14"></iconify-icon></button>` : ''}
                <button class="inq-delete-btn text-white/25 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/8" data-id="${inq.id}" title="Delete">
                    <iconify-icon icon="lucide:trash-2" width="14"></iconify-icon></button>
            </div>
        </div>
    </div>`;
}

// ─── Availability Calendar ────────────────────────────────────────────────────
let availYear  = new Date().getFullYear();
let availMonth = new Date().getMonth();
let availDates = {}; // { 'YYYY-MM-DD': { id, status } }

async function renderAvailability() {
    mainContent.classList.remove('hidden');
    loadingState.classList.add('hidden');
    mainContent.innerHTML = `<div class="py-16 text-center flex flex-col items-center gap-3 text-white/30">
        <iconify-icon icon="lucide:loader-2" class="animate-spin text-3xl text-[#C5A059]"></iconify-icon>
        <p class="text-[10px] tracking-widest uppercase">Loading Calendar...</p></div>`;

    const { data, error } = await supabase.from('booking_dates').select('*');
    if (error) { mainContent.innerHTML = `<p class="text-red-400 text-sm p-6">Error: ${error.message}</p>`; return; }
    availDates = {};
    (data || []).forEach(d => availDates[d.date] = { id: d.id, status: d.status });
    drawAvailCalendar();
}

function drawAvailCalendar() {
    const MONTHS_A = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const firstDay = new Date(availYear, availMonth, 1).getDay();
    const days = new Date(availYear, availMonth + 1, 0).getDate();
    const today = new Date(); today.setHours(0,0,0,0);

    let cells = '';
    for (let i = 0; i < firstDay; i++) cells += '<div></div>';
    for (let d = 1; d <= days; d++) {
        const ds = `${availYear}-${String(availMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const isPast = new Date(availYear, availMonth, d) < today;
        const isToday = new Date(availYear, availMonth, d).toDateString() === today.toDateString();
        const entry = availDates[ds];
        let bg = 'bg-white/5 hover:bg-white/10 text-white/60 cursor-pointer';
        let sub = '';
        if (isPast) { bg = 'text-white/10 cursor-default'; }
        else if (entry?.status === 'blocked') { bg = 'bg-red-500/15 hover:bg-red-500/25 text-red-300 cursor-pointer'; sub = '<div class="text-[7px] leading-none mt-0.5 text-red-400/60">blocked</div>'; }
        else if (entry?.status === 'open')    { bg = 'bg-[#C5A059]/15 hover:bg-[#C5A059]/25 text-[#C5A059] cursor-pointer'; sub = '<div class="text-[7px] leading-none mt-0.5 text-[#C5A059]/60">open</div>'; }
        const ring = isToday ? 'ring-1 ring-[#C5A059]/40' : '';
        cells += `<div class="avail-cell flex flex-col items-center justify-center rounded-xl text-xs ${bg} ${ring} transition-colors aspect-square select-none"
            ${isPast ? '' : `data-d="${ds}"`}>${d}${sub}</div>`;
    }

    const managed = Object.entries(availDates)
        .filter(([d]) => d >= today.toISOString().split('T')[0])
        .sort(([a],[b]) => a.localeCompare(b));

    const managedHTML = managed.length
        ? managed.map(([d, e]) => `
        <div class="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
            <div class="flex items-center gap-2.5">
                <span class="badge ${e.status === 'blocked' ? 'bg-red-500/15 text-red-400' : 'bg-[#C5A059]/15 text-[#C5A059]'}">${e.status}</span>
                <span class="text-sm text-white/65">${new Date(d + 'T00:00:00').toLocaleDateString('en', { weekday:'short', month:'short', day:'numeric', year:'numeric' })}</span>
            </div>
            <button class="rm-avail text-white/20 hover:text-red-400 p-1 transition-colors" data-id="${e.id}" data-date="${d}">
                <iconify-icon icon="lucide:x" width="12"></iconify-icon></button>
        </div>`).join('')
        : '<p class="text-white/25 text-xs py-4 text-center">No dates managed yet.</p>';

    mainContent.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div class="lg:col-span-2 bg-black border border-white/7 rounded-2xl p-6" style="border-color:rgba(255,255,255,0.07)">
            <div class="flex items-center justify-between mb-5">
                <button id="ap" class="text-white/30 hover:text-[#C5A059] p-2 rounded-lg hover:bg-white/5 transition-colors"><iconify-icon icon="lucide:chevron-left" width="18"></iconify-icon></button>
                <span class="text-sm tracking-[0.15em] uppercase text-white">${MONTHS_A[availMonth]} ${availYear}</span>
                <button id="an" class="text-white/30 hover:text-[#C5A059] p-2 rounded-lg hover:bg-white/5 transition-colors"><iconify-icon icon="lucide:chevron-right" width="18"></iconify-icon></button>
            </div>
            <div class="grid grid-cols-7 mb-2">
                ${['Su','Mo','Tu','We','Th','Fr','Sa'].map(h=>`<div class="text-center text-[9px] tracking-widest uppercase text-white/20 pb-2">${h}</div>`).join('')}
            </div>
            <div class="grid grid-cols-7 gap-1.5">${cells}</div>
            <div class="flex flex-wrap gap-4 mt-5 pt-4 border-t border-white/5 text-[9px] tracking-widest uppercase text-white/25">
                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-white/20"></span> Click to Block</span>
                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-red-500/40"></span> Blocked → Promote</span>
                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-[#C5A059]/40"></span> Promoted → Remove</span>
            </div>
        </div>
        <div class="bg-black border border-white/7 rounded-2xl p-5" style="border-color:rgba(255,255,255,0.07)">
            <p class="text-[10px] uppercase tracking-widest text-white/30 mb-4">Managed Dates</p>
            ${managedHTML}
        </div>
    </div>`;

    document.getElementById('ap').addEventListener('click', () => { availMonth--; if (availMonth<0){availMonth=11;availYear--;} drawAvailCalendar(); });
    document.getElementById('an').addEventListener('click', () => { availMonth++; if (availMonth>11){availMonth=0;availYear++;} drawAvailCalendar(); });

    document.querySelectorAll('.avail-cell[data-d]').forEach(cell => {
        cell.addEventListener('click', () => toggleAvailDate(cell.dataset.d));
    });
    document.querySelectorAll('.rm-avail').forEach(btn => {
        btn.addEventListener('click', async () => {
            await supabase.from('booking_dates').delete().eq('id', btn.dataset.id);
            delete availDates[btn.dataset.date];
            drawAvailCalendar();
        });
    });
}

async function toggleAvailDate(ds) {
    const entry = availDates[ds];
    if (!entry) {
        const { data, error } = await supabase.from('booking_dates').insert([{ date: ds, status: 'blocked' }]).select().single();
        if (!error && data) availDates[ds] = { id: data.id, status: 'blocked' };
    } else if (entry.status === 'blocked') {
        await supabase.from('booking_dates').update({ status: 'open' }).eq('id', entry.id);
        availDates[ds].status = 'open';
    } else {
        await supabase.from('booking_dates').delete().eq('id', entry.id);
        delete availDates[ds];
    }
    drawAvailCalendar();
}

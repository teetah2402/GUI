//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/views/WorkflowLibrary.vue
//#######################################################################

<template>
  <div class="library-wrapper" :data-theme="uiStore.currentTheme" @scroll="handleScroll">
    <div class="library-container">
      <header class="library-header">
        <div class="header-content">
            <div>
                <h1>📚 Workflow Library</h1>
                <p>A collection of ready-to-use workflows from the community.</p>
            </div>
            <button @click="openSubmitModal" class="btn-submit">➕ Submit Workflow</button>
        </div>

        <div class="search-container">
            <input
                type="text"
                v-model="searchQuery"
                placeholder="Search workflows by title or description..."
                class="search-input"
            />
        </div>
      </header>

      <div v-if="isLoading && displayedTemplates.length === 0" class="loading-state">
        ⏳ Loading library from server...
      </div>

      <div v-else class="workflow-list">

        <div v-if="displayedTemplates.length === 0 && !searchQuery" class="empty-state">
            No workflows in the library yet. Be the first to submit!
        </div>
        <div v-if="displayedTemplates.length === 0 && searchQuery" class="empty-state">
            No workflows found matching "{{ searchQuery }}".
        </div>

        <div v-for="item in displayedTemplates" :key="item.id" class="workflow-card">
          <div class="workflow-info">
            <h2 class="workflow-title">{{ item.title }}</h2>
            <p class="workflow-desc">{{ item.desc }}</p>
            <span class="workflow-meta">ID: {{ item.shortId }}</span>
          </div>
          <div class="workflow-action">
            <a :href="`/flow-designer?id=${item.shortId}`" target="_blank" class="btn-open-link">
              Open in Editor ↗
            </a>
          </div>
        </div>

        <div v-if="isLazyLoading" class="lazy-loading-indicator">
            ⏳ Loading more workflows...
        </div>
        <div v-if="!hasMoreData && displayedTemplates.length > 0" class="end-of-list">
            ✅ All workflows loaded.
        </div>
      </div>
    </div>

    <div v-if="isSubmitModalOpen" class="modal-overlay">
        <div class="modal-box">
            <div class="modal-header">
                <h3>Submit to Library</h3>
                <button @click="closeSubmitModal" class="btn-close">✕</button>
            </div>
            <div class="modal-body">
                <p class="modal-hint">Make sure you have created a workflow in Flow Designer, then click "Share" to get the Short ID.</p>

                <div class="form-group">
                    <label>Workflow Title <span class="req">*</span></label>
                    <input type="text" v-model="submitForm.title" class="form-control" placeholder="e.g. WhatsApp Auto Reply Bot" />
                </div>

                <div class="form-group">
                    <label>Short ID <span class="req">*</span></label>
                    <input type="text" v-model="submitForm.shortId" class="form-control" placeholder="e.g. k8Zp9X" />
                </div>

                <div class="form-group">
                    <label>Short Description <span class="req">*</span></label>
                    <textarea v-model="submitForm.desc" class="form-control" rows="3" placeholder="Briefly explain what this workflow does..."></textarea>
                </div>

                <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>
            </div>
            <div class="modal-footer">
                <button @click="closeSubmitModal" class="btn-cancel">Cancel</button>
                <button @click="submitToLibrary" class="btn-confirm" :disabled="isSubmitting">
                    {{ isSubmitting ? '⏳ Verifying & Submitting...' : '🚀 Submit Now' }}
                </button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useUiStore } from '@/store/ui';

const uiStore = useUiStore();
const templates = ref([]);
const displayedTemplates = ref([]);
const isLoading = ref(true);

const isSubmitModalOpen = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');
const submitForm = ref({ title: '', desc: '', shortId: '' });

// Konfigurasi Lazy Loading & Caching 24 Jam
const CACHE_KEY = 'flow_library_cache_v1';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 Jam dalam milidetik
const itemsPerPage = 10;
let currentIndex = 0;
const isLazyLoading = ref(false);
const hasMoreData = ref(true);

// [NEW] State untuk Fitur Search
const searchQuery = ref('');

// [NEW] Computed Property untuk memfilter template berdasarkan Judul atau Deskripsi
const filteredTemplates = computed(() => {
    if (!searchQuery.value.trim()) return templates.value;

    const query = searchQuery.value.toLowerCase();
    return templates.value.filter(tpl =>
        (tpl.title && tpl.title.toLowerCase().includes(query)) ||
        (tpl.desc && tpl.desc.toLowerCase().includes(query))
    );
});

// [NEW] Watcher: Jika user mengetik pencarian, reset daftar yang tampil dan muat ulang dari atas
watch(searchQuery, () => {
    displayedTemplates.value = [];
    currentIndex = 0;
    hasMoreData.value = true;
    loadMore();
});

onMounted(async () => {
    await fetchLibrary();
});

async function fetchLibrary() {
    isLoading.value = true;
    try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
            const parsed = JSON.parse(cachedData);
            if (Date.now() - parsed.timestamp < CACHE_TTL) {
                templates.value = parsed.data;
                loadMore();
                isLoading.value = false;
                console.log("Loaded library from 24h Cache!");
                return;
            }
        }

        const res = await fetch('/api/v1/flow/library');
        if (res.ok) {
            const data = await res.json();
            templates.value = data;

            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));

            loadMore();
        } else {
            console.error("Failed to load library data");
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        isLoading.value = false;
    }
}

// [UPDATE] Logika Chunking (Lazy Load) sekarang menggunakan 'filteredTemplates' bukan 'templates' murni
function loadMore() {
    if (currentIndex >= filteredTemplates.value.length) {
        hasMoreData.value = false;
        return;
    }

    isLazyLoading.value = true;

    setTimeout(() => {
        const nextItems = filteredTemplates.value.slice(currentIndex, currentIndex + itemsPerPage);
        if (nextItems.length > 0) {
            displayedTemplates.value.push(...nextItems);
            currentIndex += itemsPerPage;
        }

        if (currentIndex >= filteredTemplates.value.length) {
            hasMoreData.value = false;
        }
        isLazyLoading.value = false;
    }, 400);
}

function handleScroll(e) {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 50 && !isLazyLoading.value && hasMoreData.value) {
        loadMore();
    }
}

function openSubmitModal() {
    submitForm.value = { title: '', desc: '', shortId: '' };
    errorMessage.value = '';
    isSubmitModalOpen.value = true;
}

function closeSubmitModal() {
    isSubmitModalOpen.value = false;
}

async function submitToLibrary() {
    if (!submitForm.value.title || !submitForm.value.shortId || !submitForm.value.desc) {
        errorMessage.value = "All fields are required!";
        return;
    }

    try {
        isSubmitting.value = true;
        errorMessage.value = '';

        const res = await fetch('/api/v1/flow/library', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submitForm.value)
        });

        const result = await res.json();

        if (res.ok) {
            templates.value.push(result.template);

            // Perbarui cache
            const currentCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
            if (currentCache.data) {
                currentCache.data.push(result.template);
                localStorage.setItem(CACHE_KEY, JSON.stringify(currentCache));
            }

            // [UPDATE] Reset View agar data yang baru ditambahkan masuk ke alur lazy loading
            displayedTemplates.value = [];
            currentIndex = 0;
            hasMoreData.value = true;
            loadMore();

            closeSubmitModal();
            alert("Success! Your workflow has been added to the Library.");
        } else {
            errorMessage.value = result.error || "Failed to submit workflow.";
        }
    } catch (e) {
        errorMessage.value = "System Error: " + e.message;
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<style scoped>
/* CSS VARIABLES ENGINE UNTUK MENDUKUNG DARK MODE & LIGHT MODE */
.library-wrapper {
    /* DEFAULT: DARK MODE */
    --lib-bg: #121212;
    --lib-card: #1e1e1e;
    --lib-header: #1a1a1a;
    --lib-border: #333333;
    --lib-text-main: #e0e0e0;
    --lib-text-title: #ffffff;
    --lib-text-muted: #aaaaaa;
    --lib-accent: #00ffcc;
    --lib-accent-bg: rgba(0, 255, 204, 0.1);
    --lib-primary: #aa88ff;
    --lib-primary-hover: #9966ff;
    --lib-primary-shadow: rgba(170, 136, 255, 0.4);
    --lib-input-bg: #111111;
    --lib-error: #ff4444;
    --lib-meta-bg: #000000;

    background-color: var(--lib-bg);
    color: var(--lib-text-main);

    height: 100vh;
    overflow-y: auto;
    padding: 40px 20px;
    font-family: sans-serif;
    box-sizing: border-box;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.library-wrapper[data-theme="light"] {
    /* OVERRIDE: LIGHT MODE */
    --lib-bg: #f8fafc;
    --lib-card: #ffffff;
    --lib-header: #f1f5f9;
    --lib-border: #cbd5e1;
    --lib-text-main: #334155;
    --lib-text-title: #0f172a;
    --lib-text-muted: #64748b;
    --lib-accent: #059669;
    --lib-accent-bg: rgba(5, 150, 105, 0.1);
    --lib-primary: #6366f1;
    --lib-primary-hover: #4f46e5;
    --lib-primary-shadow: rgba(99, 102, 241, 0.4);
    --lib-input-bg: #ffffff;
    --lib-error: #ef4444;
    --lib-meta-bg: #e2e8f0;
}

.library-container {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.library-header {
  margin-bottom: 30px;
  border-bottom: 1px solid var(--lib-border);
  padding-bottom: 20px;
  transition: border-color 0.3s ease;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 600px) {
    .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
}

.library-header h1 {
  color: var(--lib-accent);
  margin: 0 0 10px 0;
  transition: color 0.3s ease;
}

.library-header p {
  color: var(--lib-text-muted);
  margin: 0;
  font-size: 14px;
}

/* [NEW] STYLE UNTUK SEARCH BAR */
.search-container {
    margin-top: 25px;
}
.search-input {
    width: 100%;
    padding: 14px 18px;
    background: var(--lib-input-bg);
    border: 1px solid var(--lib-border);
    color: var(--lib-text-main);
    border-radius: 8px;
    outline: none;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
}
.search-input:focus {
    border-color: var(--lib-accent);
    box-shadow: 0 0 8px var(--lib-accent-bg);
}
.search-input::placeholder {
    color: var(--lib-text-muted);
    font-style: italic;
}

.btn-submit {
    background-color: var(--lib-primary);
    color: #ffffff;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
}
.btn-submit:hover {
    background-color: var(--lib-primary-hover);
    box-shadow: 0 0 15px var(--lib-primary-shadow);
}

.loading-state, .empty-state, .lazy-loading-indicator, .end-of-list {
    text-align: center;
    padding: 30px;
    color: var(--lib-text-muted);
    font-style: italic;
    background: var(--lib-header);
    border-radius: 8px;
    border: 1px dashed var(--lib-border);
    margin-top: 15px;
    transition: background 0.3s, border-color 0.3s;
}
.loading-state, .lazy-loading-indicator { color: var(--lib-accent); animation: pulse 1.5s infinite; }
.end-of-list { color: var(--lib-text-muted); border: none; background: transparent;}

.workflow-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.workflow-card {
  background-color: var(--lib-card);
  border: 1px solid var(--lib-border);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: border-color 0.2s, background-color 0.3s;
}

.workflow-card:hover {
  border-color: var(--lib-accent);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.workflow-info {
  flex: 1;
  padding-right: 20px;
}

.workflow-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--lib-text-title);
  transition: color 0.3s;
}

.workflow-desc {
  margin: 0 0 10px 0;
  color: var(--lib-text-muted);
  font-size: 14px;
  line-height: 1.4;
}

.workflow-meta {
    font-size: 11px;
    background: var(--lib-meta-bg);
    color: var(--lib-accent);
    padding: 3px 8px;
    border-radius: 4px;
    font-family: monospace;
    font-weight: 600;
}

.workflow-action {
  flex-shrink: 0;
}

.btn-open-link {
  display: inline-block;
  background-color: var(--lib-accent-bg);
  color: var(--lib-accent);
  border: 1px solid var(--lib-accent);
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-open-link:hover {
  background-color: var(--lib-accent);
  color: #ffffff;
}

.modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999; backdrop-filter: blur(4px);
}
.modal-box {
    background: var(--lib-card); border: 1px solid var(--lib-border);
    border-radius: 8px; width: 450px; max-width: 90%;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; flex-direction: column;
}
.modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 15px 20px; border-bottom: 1px solid var(--lib-border);
    background: var(--lib-header); border-radius: 8px 8px 0 0;
}
.modal-header h3 { margin: 0; font-size: 16px; color: var(--lib-text-title); }
.btn-close { background: none; border: none; color: var(--lib-text-muted); cursor: pointer; font-size: 16px; transition: 0.2s;}
.btn-close:hover { color: var(--lib-error); }
.modal-body { padding: 20px; }
.modal-hint { font-size: 12px; color: var(--lib-text-muted); margin-top: 0; margin-bottom: 20px; line-height: 1.4; background: var(--lib-header); padding: 10px; border-left: 3px solid var(--lib-accent);}
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 13px; color: var(--lib-text-main); font-weight: bold; }
.req { color: var(--lib-error); }
.form-control { width: 100%; padding: 10px; background: var(--lib-input-bg); border: 1px solid var(--lib-border); color: var(--lib-accent); border-radius: 4px; outline: none; font-size: 14px; font-family: monospace; box-sizing: border-box;}
.form-control:focus { border-color: var(--lib-accent); }
textarea.form-control { resize: vertical; font-family: sans-serif; color: var(--lib-text-main); }
.error-msg { color: var(--lib-error); font-size: 13px; font-weight: bold; margin-top: 10px; }
.modal-footer {
    display: flex; justify-content: flex-end; gap: 10px;
    padding: 15px 20px; border-top: 1px solid var(--lib-border);
    background: var(--lib-header); border-radius: 0 0 8px 8px;
}
.btn-cancel { background: transparent; color: var(--lib-text-main); border: 1px solid var(--lib-border); padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: bold; transition: 0.2s; }
.btn-cancel:hover { background: var(--lib-border); }
.btn-confirm { background: var(--lib-accent); color: #fff; border: none; padding: 8px 15px; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-confirm:hover:not(:disabled) { filter: brightness(1.1); box-shadow: 0 0 10px var(--lib-accent-bg); }
.btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
</style>
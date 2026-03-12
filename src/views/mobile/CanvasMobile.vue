//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/views/mobile/CanvasMobile.vue
// STYLE     : Mobile Canvas with Touch Pan, Auto-Center, and Launchpad
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="os-root-m" :data-theme="uiStore.currentTheme">

    <GuestLeftSidebarMobile
        :is-open="isSidebarOpen"
        @close="isSidebarOpen = false"
    />

    <div class="os-bg-m">
        <div v-if="uiStore.currentTheme !== 'light'" class="cyberpunk-scene-m">
            <div class="cyber-grid-floor-m"></div>
            <div class="cyber-horizon-glow-m"></div>
        </div>
        <div v-else class="light-scene-m">
            <div class="paint-blobs-m">
                <div class="blob-m blue-paint-m"></div>
                <div class="blob-m gold-paint-m"></div>
            </div>
        </div>
    </div>

    <div class="os-main-m">
      <div class="os-viewport-m"
            ref="viewportRef"
            @touchstart="handleGlobalTouchStart"
            @touchmove="handleGlobalTouchMove"
            @touchend="handleGlobalTouchEnd">

        <transition name="fade">
            <div v-if="windows.length === 0" class="empty-canvas-instruction-m">
                <div class="instruction-box-m">
                    <i class="mdi mdi-gesture-swipe-horizontal instruction-icon-m"></i>
                    <h2 class="instruction-title-m">Workspace Ready</h2>
                    <p class="instruction-text-m">Tap the Launchpad button below to add tools to your infinite canvas.</p>
                    <button @click="isSidebarOpen = true" class="instruction-btn-m">🚀 Open Launchpad</button>
                </div>
            </div>
        </transition>

        <div class="os-world-m" :style="worldStyle">
            <div class="windows-layer-m">
                <SandboxedAppMobile
                    v-for="win in windows"
                    :key="win.instanceId"
                    class="gpu-optimized-m"
                    :unique-id="win.instanceId"
                    :url="win.url"
                    :app-data="win"
                    :is-fav="isFavorite(win)"
                    :current-theme="uiStore.currentTheme"
                    :global-scale="globalTransform.scale"
                    :initial-x="win.x"
                    :initial-y="win.y"
                    :initial-scale="win.scale"
                    :z-index="win.zIndex"
                    :is-sidebar-open="isSidebarOpen"
                    @mousedown="focusWindow(win.instanceId)"
                    @close="closeWindow(win.instanceId)"
                    @update-metrics="updateWindowMetrics(win.instanceId, $event)"
                    @toggle-favorite="toggleFavorite(win)"
                    @edit-app="editCustomApp"
                />
            </div>
        </div>

        </div>

      </div>

    <Transition name="sys-pop">
      <div v-if="builderModal.active" class="sys-modal-backdrop-m builder-backdrop" @click.self="builderModal.active = false">
        <div class="sys-modal-card-m builder-card-m">
          <div class="sys-modal-header-m">
             <span v-if="builderModal.mode === 'ai'">✨ AI App Builder</span>
             <span v-else>🛠 Build Virtual App</span>
          </div>

          <div class="sys-modal-body-m custom-scroll" style="flex: 1; overflow-y: auto; text-align: left; padding-bottom: 20px;">

            <div v-if="builderModal.mode === 'ai'" class="ai-box-m">
                <h4 class="ai-title-m">✨ AI App Builder (God Mode)</h4>
                <div class="input-group-m">
                    <label>Gemini API Key</label>
                    <input type="password" v-model="geminiApiKey" class="sys-input-m" placeholder="AIzaSy..." />
                </div>
                <div class="input-group-m">
                    <label>Prompt / Request</label>
                    <textarea v-model="aiPrompt" class="sys-input-m area-m" rows="5" placeholder="e.g. Build an SEO checker tool with modern UI..."></textarea>
                </div>
                <button @click="generateAppWithAI" class="sys-btn-m ai-gen-btn-m" :disabled="isGeneratingAI">
                    {{ isGeneratingAI ? '⏳ Generating Code...' : '🤖 Generate App' }}
                </button>
            </div>

            <template v-if="builderModal.mode === 'manual'">
                <div class="input-group-m">
                  <label>App Name</label>
                  <input type="text" v-model="builderModal.name" class="sys-input-m" placeholder="e.g. Tool Name">
                </div>
                <div class="input-group-m">
                  <label>HTML Template</label>
                  <textarea v-model="builderModal.templateHtml" class="sys-input-m area-m" rows="6"></textarea>
                </div>
                <div class="input-group-m">
                  <label>Logic JS (mount function)</label>
                  <textarea v-model="builderModal.logicJs" class="sys-input-m area-m" rows="6"></textarea>
                </div>
            </template>

          </div>

          <div class="sys-modal-footer-m" style="display: flex; flex-wrap: wrap; flex-shrink: 0; gap: 5px;">
            <button @click="builderModal.active = false" class="sys-btn-m secondary-m" style="flex: 1;">Cancel</button>
            <button v-if="builderModal.mode === 'manual'" @click="downloadCurrentBuilderApp" class="sys-btn-m" style="flex: 1; background: rgba(0, 187, 249, 0.2); color: #00BBF9; border: 1px solid #00BBF9; border-radius: 8px;">📥 Unduh</button>
            <button v-if="builderModal.mode === 'manual'" @click="saveAndLaunchCustomApp" class="sys-btn-m primary-m" style="flex: 1;">Save & Run</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="sys-pop">
      <div v-if="sysModal.active" class="sys-modal-backdrop-m" @click.self="shakeModal">
        <div class="sys-modal-card-m" :class="{ 'shake': sysModal.shaking }">
          <div class="sys-modal-header-m"><span>{{ sysModal.title }}</span></div>
          <div class="sys-modal-body-m"><p>{{ sysModal.message }}</p></div>
          <div class="sys-modal-footer-m">
            <button v-if="sysModal.type === 'confirm'" @click="resolveModal(false)" class="sys-btn-m secondary-m">Cancel</button>
            <button @click="resolveModal(true)" class="sys-btn-m primary-m">OK</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, provide, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '@/store/ui';
import { useAppStore } from '@/store/apps';
import { useSocketStore } from '@/store/socket';
import SandboxedAppMobile from '@/components/os/mobile/SandboxedAppMobile.vue';
import GuestLeftSidebarMobile from '@/components/layout/mobile/GuestLeftSidebarMobile.vue';

const router = useRouter();
const uiStore = useUiStore();
const appStore = useAppStore();
const socketStore = useSocketStore();

const windows = ref([]);
const activeWindowId = ref(null);
const zIndexCounter = ref(100);

const isSidebarOpen = ref(false);
// USER RULE #1: Comment out unused variables
// const timeString = ref('00:00');
const windowWidth = ref(window.innerWidth);

const geminiApiKey = ref(localStorage.getItem('gemini_api_key') || '');
const aiPrompt = ref(localStorage.getItem('flowork_ai_prompt') || '');
const isGeneratingAI = ref(false);

const savedDraft = JSON.parse(localStorage.getItem('flowork_builder_draft') || '{}');
const builderModal = reactive({
    active: false,
    mode: 'manual',
    id: savedDraft.id || '',
    name: savedDraft.name || '',
    templateHtml: savedDraft.templateHtml || '',
    logicJs: savedDraft.logicJs || ''
});

watch(aiPrompt, (val) => {
    localStorage.setItem('flowork_ai_prompt', val);
});

watch(builderModal, (val) => {
    if (val.active) {
        localStorage.setItem('flowork_builder_draft', JSON.stringify({
            id: val.id,
            name: val.name,
            templateHtml: val.templateHtml,
            logicJs: val.logicJs
        }));
    }
}, { deep: true });

const globalTransform = reactive({ x: 0, y: 0, scale: 1.0 });
const currentPage = ref(0);
const PAGE_WIDTH_OFFSET = 1500;

let isGlobalDragging = false;
let startPos = { x: 0, y: 0 };
let lastPinchDist = 0;
let saveTimeout = null;

const worldStyle = computed(() => {
    const originX = (currentPage.value * PAGE_WIDTH_OFFSET) + (windowWidth.value / 2);
    return {
        transform: `translate(${globalTransform.x}px, ${globalTransform.y}px) scale(${globalTransform.scale})`,
        transformOrigin: `${originX}px center`,
        transition: isGlobalDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        willChange: 'transform'
    };
});

const handleGlobalTouchStart = (e) => {
    const isApp = e.target.closest('.app-content-wrapper-m') || e.target.closest('.mobile-pill-dock');
    if (isApp) return;
    if (windows.value.length === 0) return;

    if (e.touches.length === 1) {
        isGlobalDragging = true;
        startPos = { x: e.touches[0].clientX - globalTransform.x, y: e.touches[0].clientY - globalTransform.y };
    } else if (e.touches.length === 2) {
        lastPinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }
};

const handleGlobalTouchMove = (e) => {
    if (windows.value.length === 0) return;

    if (e.touches.length === 1 && isGlobalDragging) {
        e.preventDefault();
        globalTransform.x = e.touches[0].clientX - startPos.x;
        globalTransform.y = e.touches[0].clientY - startPos.y;
    } else if (e.touches.length === 2 && lastPinchDist > 0) {
        e.preventDefault();
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const delta = dist / lastPinchDist;
        globalTransform.scale = Math.min(Math.max(globalTransform.scale * delta, 0.5), 3.0);
        lastPinchDist = dist;
    }
};

const handleGlobalTouchEnd = () => {
    isGlobalDragging = false;
    lastPinchDist = 0;
    saveCanvasState();
};

const isFavorite = (app) => appStore.favoriteIds.includes(app.id || app.slug);
const toggleFavorite = (app) => appStore.toggleFavorite(app.id || app.slug);

const getSmartCoordinates = (index = 0, targetPage = currentPage.value) => {
    const currentScreenOffsetX = (targetPage * PAGE_WIDTH_OFFSET);
    return { x: currentScreenOffsetX, y: 0 };
};

const launchApp = async (app, overrideX = null, overrideY = null, overrideScale = null) => {
    // [MODIFIED] Mencegah aplikasi khusus Desktop untuk dijalankan di Canvas Mobile
    if (app.android === 'no') {
        if (typeof triggerModal === 'function') triggerModal(`Aplikasi ini tidak dirancang untuk perangkat Mobile.`, `Device Mismatch`);
        return;
    }

    if (appStore.addToRecent) appStore.addToRecent(app.slug || app.id);
    await nextTick();

    const appId = app.slug || app.id;
    let finalUrl;

    if (appId && appId.startsWith('custom_')) {
        finalUrl = `virtual://${appId}`;
    } else if (app.is_local) {
        // [MODIFIED] Deteksi cerdas Dynamic Entry Point khusus Mobile, fallback ke mobile.html
        let localEntry = app.entry_point_mobile || (app.action && app.action.default_popup) || 'mobile.html';
        finalUrl = `http://127.0.0.1:5000/local-apps/${appId}/${localEntry}`;
    } else {
        let basePath = `/store/${appId}`;
        finalUrl = `${basePath}/mobile.html`.replace(/([^:]\/)\/+/g, "$1");
    }

    const instanceId = Date.now() + Math.random();
    let finalX, finalY;

    if (overrideX !== null && overrideY !== null) {
        finalX = overrideX; finalY = overrideY;
    } else {
        const coords = getSmartCoordinates(windows.value.length, currentPage.value);
        finalX = coords.x; finalY = coords.y;
    }

    const newWindow = { ...app, instanceId, url: finalUrl, x: finalX, y: finalY, scale: overrideScale !== null ? overrideScale : 1.0, zIndex: ++zIndexCounter.value };
    windows.value.push(newWindow);
    focusWindow(instanceId);
    saveCanvasState();
};

const closeWindow = (id) => {
    const idx = windows.value.findIndex(w => w.instanceId === id);
    if (idx !== -1) {
        windows.value.splice(idx, 1);
        if (windows.value.length === 0) {
            globalTransform.scale = 1.0; globalTransform.y = 0; globalTransform.x = 0; currentPage.value = 0;
            const url = new URL(window.location); url.search = ''; window.history.replaceState({}, '', url);
        }
        saveCanvasState();
    }
};

const focusWindow = (id) => {
    activeWindowId.value = id;
    const win = windows.value.find(w => w.instanceId === id);
    if (win) { win.zIndex = ++zIndexCounter.value; saveCanvasState(); }
};

const updateWindowMetrics = (id, metrics) => {
    const win = windows.value.find(w => w.instanceId === id);
    if (win) { win.x = metrics.x; win.y = metrics.y; win.scale = metrics.scale; saveCanvasState(); }
};

const changePage = (dir) => {
    const newPage = currentPage.value + dir;
    if (newPage < 0) return;
    currentPage.value = newPage;
    globalTransform.x = -(newPage * PAGE_WIDTH_OFFSET);
    globalTransform.y = 0;
    saveCanvasState();
};

const saveCanvasState = () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        const state = {
            transform: { ...globalTransform },
            page: currentPage.value,
            // [MODIFIED] Menyertakan action dan entry_point_mobile untuk auto-restore
            windows: windows.value.map(w => ({ id: w.id, slug: w.slug, name: w.name, icon: w.icon, type: w.type, path: w.path, entry: w.entry, instanceId: w.instanceId, url: w.url, x: w.x, y: w.y, scale: w.scale, zIndex: w.zIndex, is_local: w.is_local, entry_point_mobile: w.entry_point_mobile, action: w.action, browser_action: w.browser_action, side_panel: w.side_panel }))
        };
        localStorage.setItem('flowork_canvas_state', JSON.stringify(state));
    }, 500);
};

const loadCanvasState = () => {
    const saved = localStorage.getItem('flowork_canvas_state');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.transform) { globalTransform.x = parsed.transform.x || 0; globalTransform.y = parsed.transform.y || 0; globalTransform.scale = parsed.transform.scale || 1.0; }
            if (typeof parsed.page === 'number') currentPage.value = parsed.page;
            if (parsed.windows && Array.isArray(parsed.windows)) { windows.value = parsed.windows; zIndexCounter.value = Math.max(...parsed.windows.map(w => w.zIndex || 0), 100); }
        } catch (e) {}
    }
};

const sysModal = reactive({ active: false, shaking: false, title: '', message: '', type: 'alert', resolve: null });
provide('sys-dialog', { alert: (msg, title) => triggerModal(msg, title, 'alert'), confirm: (msg, title) => triggerModal(msg, title, 'confirm') });
const triggerModal = (message, title='System', type='alert') => new Promise(resolve => { sysModal.active = true; sysModal.title = title; sysModal.message = message; sysModal.type = type; sysModal.resolve = resolve; });
const resolveModal = (res) => { sysModal.active = false; if(sysModal.resolve) sysModal.resolve(res); };
const shakeModal = () => { sysModal.shaking = true; setTimeout(() => sysModal.shaking = false, 300); };

// USER RULE #1: Comment out unused clock logic
// const updateTime = () => { const d = new Date(); timeString.value = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
// let clockInterval = setInterval(updateTime, 1000);

const handleExternalLaunch = (e) => {
    const app = e.detail;
    launchApp(app);
};

const openBuilderManual = () => {
    builderModal.mode = 'manual';
    const draft = JSON.parse(localStorage.getItem('flowork_builder_draft') || '{}');
    if (draft.templateHtml) {
        builderModal.id = draft.id || `custom_${Date.now()}`;
        builderModal.name = draft.name || 'New App';
        builderModal.templateHtml = draft.templateHtml;
        builderModal.logicJs = draft.logicJs || '';
    } else {
        builderModal.id = `custom_${Date.now()}`;
        builderModal.name = 'New App';
        builderModal.templateHtml = `<div style="padding:15px; text-align:center;">\n  <h3 style="color:#00ffcc;">Virtual App</h3>\n  <button id="btn-test" style="padding:10px; background:#00ffcc; border-radius:8px;">Run App</button>\n</div>`;
        builderModal.logicJs = `return {\n  mount(sys) {\n    sys.root.querySelector("#btn-test").onclick = () => {\n      sys.toast("Hello from Custom App!");\n    };\n  }\n}`;
    }
    builderModal.active = true;
};

const openBuilderAI = () => {
    builderModal.mode = 'ai';
    const draft = JSON.parse(localStorage.getItem('flowork_builder_draft') || '{}');
    builderModal.id = draft.id || `custom_${Date.now()}`;
    builderModal.name = draft.name || '';
    builderModal.templateHtml = draft.templateHtml || '';
    builderModal.logicJs = draft.logicJs || '';
    builderModal.active = true;
};

const editCustomApp = (appData) => {
    if (!appData) return;
    const targetId = appData.id || appData.slug;
    const customApp = appStore.customCanvasApps.find(a => a.id === targetId);

    if (customApp) {
        builderModal.mode = 'manual';
        builderModal.id = customApp.id;
        builderModal.name = customApp.name;
        builderModal.templateHtml = customApp.templateHtml;
        builderModal.logicJs = customApp.logicJs;
        builderModal.active = true;
    } else {
        triggerModal("App source not found in memory.", "Edit Failed");
    }
};

const downloadCurrentBuilderApp = () => {
    if (!builderModal.name.trim()) {
        triggerModal("Harap isi nama aplikasi sebelum mengunduh.", "Error");
        return;
    }
    const appToExport = {
        id: builderModal.id,
        slug: builderModal.id,
        name: builderModal.name,
        icon: 'mdi-code-braces',
        templateHtml: builderModal.templateHtml,
        logicJs: builderModal.logicJs,
        category: 'Custom App'
    };

    const dataStr = JSON.stringify([appToExport], null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app_custom_${builderModal.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerModal("Kode aplikasi berhasil diunduh!", "Success");
};

const saveAndLaunchCustomApp = () => {
    if (!builderModal.name.trim()) {
        triggerModal("App name cannot be empty.", "Error");
        return;
    }
    const newApp = {
        id: builderModal.id,
        slug: builderModal.id,
        name: builderModal.name,
        icon: 'mdi-code-braces',
        templateHtml: builderModal.templateHtml,
        logicJs: builderModal.logicJs,
        category: 'Custom App'
    };

    appStore.saveCustomApp(newApp);
    builderModal.active = false;

    const existingWin = windows.value.find(w => w.id === newApp.id || w.slug === newApp.id);
    if (existingWin) {
        const tempX = existingWin.x; const tempY = existingWin.y; const tempS = existingWin.scale;
        closeWindow(existingWin.instanceId);
        setTimeout(() => { launchApp(newApp, tempX, tempY, tempS); }, 50);
    } else {
        launchApp(newApp);
    }
};

async function generateAppWithAI() {
    if (!geminiApiKey.value || !aiPrompt.value) {
        triggerModal("API Key and Prompt are required.", "AI Validation");
        return;
    }
    localStorage.setItem('gemini_api_key', geminiApiKey.value);
    isGeneratingAI.value = true;

    try {
        const promptSystem = `
        You are an expert Frontend Developer building a Virtual App for a web-based OS.
        Based on this request: "${aiPrompt.value}"

        Generate a valid JSON object containing exactly these fields:
        {
            "name": "Short, clear app name (string)",
            "templateHtml": "String containing the HTML UI. Use inline styles.",
            "logicJs": "String containing a Javascript object that MUST have a 'mount(sys)' function. You can access DOM elements via 'sys.root.querySelector'. You can show alerts using 'sys.toast(msg)'. Example: 'return { mount(sys) { const btn = sys.root.querySelector(\\"#myBtn\\"); btn.onclick = () => sys.toast(\\"Clicked!\\"); } }'"
        }
        DO NOT wrap the response in markdown code blocks (\`\`\`json). RETURN PURE RAW JSON ONLY.
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${geminiApiKey.value}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptSystem }] }] })
        });

        if (!response.ok) throw new Error("Failed to connect to AI server.");

        const data = await response.json();
        let resultText = data.candidates[0].content.parts[0].text;
        resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

        const generatedApp = JSON.parse(resultText);
        builderModal.name = generatedApp.name || 'AI Generated App';
        builderModal.templateHtml = generatedApp.templateHtml || '';
        builderModal.logicJs = generatedApp.logicJs || '';

        builderModal.mode = 'manual';

        triggerModal("App generated successfully! Review the code and click Save & Run.", "Success");
    } catch (error) {
        triggerModal("AI Generation failed: " + error.message, "Error");
    } finally {
        isGeneratingAI.value = false;
    }
}

const handleExternalAppUpload = (e) => {
    const parsedData = e.detail;
    if (Array.isArray(parsedData)) {
        appStore.importCustomApps(parsedData);
        triggerModal(`Successfully imported ${parsedData.length} apps.`, "Import Success");
    } else {
        triggerModal("Invalid format. Expected an array of apps.", "Error");
    }
};

const exportCustomApps = () => {
    const data = appStore.customCanvasApps;
    if (!data || data.length === 0) {
        triggerModal("No custom apps available to export.", "Download Failed");
        return;
    }
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowork_custom_apps_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

const toggleSidebarGlobal = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};

onMounted(async () => {
    // USER RULE #1: Comment out unused clock logic
    // updateTime();
    loadCanvasState();

    appStore.setDeviceType('mobile');

    window.addEventListener('flowork-launch-app', handleExternalLaunch);
    window.addEventListener('flowork-open-builder', openBuilderManual);
    window.addEventListener('flowork-open-ai-builder', openBuilderAI);
    window.addEventListener('flowork-app-upload', handleExternalAppUpload);
    window.addEventListener('flowork-app-download', exportCustomApps);
    window.addEventListener('flowork-toggle-sidebar', toggleSidebarGlobal);

    socketStore.connect();
    uiStore.initTheme();
    if (appStore.installedApps.length === 0) await appStore.fetchInstalledApps();
});

onUnmounted(() => {
    // USER RULE #1: Comment out unused clock logic
    // clearInterval(clockInterval);
    window.removeEventListener('flowork-launch-app', handleExternalLaunch);
    window.removeEventListener('flowork-open-builder', openBuilderManual);
    window.removeEventListener('flowork-open-ai-builder', openBuilderAI);
    window.removeEventListener('flowork-app-upload', handleExternalAppUpload);
    window.removeEventListener('flowork-app-download', exportCustomApps);
    window.removeEventListener('flowork-toggle-sidebar', toggleSidebarGlobal);
});
</script>

<style scoped>
/* [FIXED] Z-Index diatur super tinggi agar modal apapun (Builder / Sys Alert) langsung menimpa Launchpad */
.sys-modal-backdrop-m { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 9999999 !important; display: flex; align-items: center; justify-content: center; padding: 20px; }

.os-root-m {
    --bg-page: #020205; --header-bg: rgba(10, 10, 15, 0.8);
    --text-main: #ffffff; --text-muted: rgba(255, 255, 255, 0.6); --border: rgba(255, 255, 255, 0.1);
    position: fixed; inset: 0; z-index: 9999; display: flex; flex-direction: column;
    background-color: var(--bg-page); color: var(--text-main); font-family: 'Space Grotesk', sans-serif;
    overflow: hidden; touch-action: none; overscroll-behavior: none; -webkit-user-select: none; user-select: none;
}
.os-root-m[data-theme="light"] {
    --bg-page: #f8fafc; --header-bg: rgba(255, 255, 255, 0.8);
    --text-main: #0f172a; --text-muted: rgba(0, 0, 0, 0.6); --border: rgba(0, 0, 0, 0.1);
}

.os-bg-m { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
.cyberpunk-scene-m { position: absolute; inset: 0; background: #020205; perspective: 800px; }
.cyber-grid-floor-m { position: absolute; width: 200%; height: 200%; top: -50%; left: -50%; background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 40px 40px; transform: rotateX(60deg); animation: grid-move-m 15s linear infinite; filter: drop-shadow(0 0 2px #00ffcc); }
.cyber-horizon-glow-m { position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, #00ffcc 0%, transparent 70%); opacity: 0.1; mix-blend-mode: screen; }

.os-main-m { flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden; height: 100%; }

/* USER RULE #1: Comment out unused styles */
/*
.os-header-m { height: 50px; background: var(--header-bg); border-bottom: 1px solid var(--border); backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: space-between; padding: 0 15px; z-index: 10000; position: relative; }
.header-section-m { display: flex; align-items: center; gap: 8px; }
.font-tech-m { font-weight: 800; font-size: 1rem; letter-spacing: 1px; }
.p2p-status-m { display: flex; align-items: center; gap: 6px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 10px; }
.status-dot-m { width: 6px; height: 6px; border-radius: 50%; }
.clock-display-m { font-family: monospace; font-size: 0.9rem; font-weight: bold; opacity: 0.8; }
*/

/* USER RULE #1: Comment out restricted height, set to 100vh to fill bottom space */
/* .os-viewport-m { position: absolute; top: 0; left: 0; width: 100%; height: calc(100vh - 120px); will-change: transform; } */
.os-viewport-m { position: absolute; top: 0; left: 0; width: 100%; height: 100vh; will-change: transform; }

.os-world-m { width: 100%; height: 100%; position: absolute; top:0; left: 0; will-change: transform; }
.windows-layer-m { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }

/* USER RULE #1: Comment out dock styles since dock is removed */
/*
.mobile-pill-dock {
    position: absolute; bottom: 70px; left: 50%; transform: translateX(-50%); z-index: 10000;
    display: flex; align-items: center; gap: 10px; background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 8px 12px; border-radius: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    pointer-events: auto;
}
.pill-btn { background: transparent; border: none; color: #fff; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 5px 10px; transition: 0.2s; }
.pill-btn:active { transform: scale(0.9); color: #00ffcc; }
.main-launch-btn { font-size: 0.9rem; font-weight: 700; gap: 8px; color: #00ffcc; text-transform: uppercase; letter-spacing: 0.5px; }
.pill-sep { width: 1px; height: 20px; background: rgba(255,255,255,0.2); }
*/

.empty-canvas-instruction-m { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 5; pointer-events: none; padding: 20px; }
.instruction-box-m { text-align: center; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(20px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); padding: 30px 20px; pointer-events: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.5); width: 100%; max-width: 320px; }
.instruction-icon-m { font-size: 50px; color: #00ffcc; margin-bottom: 15px; display: block; opacity: 0.8; }
.instruction-title-m { font-size: 1.3rem; font-weight: 800; margin-bottom: 10px; }
.instruction-text-m { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 20px; }
.instruction-btn-m { background: #00ffcc; color: #000; border: none; padding: 14px 20px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; width: 100%; box-shadow: 0 5px 15px rgba(0,255,204,0.3); cursor: pointer; }
.instruction-btn-m:active { transform: scale(0.95); }

.sys-modal-card-m { width: 100%; max-width: 320px; background: #1e293b; border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; color: #fff; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); display: flex; flex-direction: column; }
.sys-modal-header-m { padding: 15px; text-align: center; font-weight: bold; background: rgba(255,255,255,0.05); font-size: 1.1rem; color: #00ffcc; }
.sys-modal-body-m { padding: 20px; text-align: center; line-height: 1.5; font-size: 0.9rem; }
.sys-modal-footer-m { display: flex; border-top: 1px solid rgba(255,255,255,0.1); }
.sys-btn-m { flex: 1; padding: 15px; border: none; background: transparent; color: #fff; font-weight: bold; cursor: pointer; }
.sys-btn-m.primary-m { color: #00ffcc; background: rgba(0,255,204,0.05); }
.sys-btn-m:active { background: rgba(255,255,255,0.1); }
.shake { animation: shakeM 0.3s; }
@keyframes shakeM { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
@keyframes grid-move-m { 0% { background-position: 0 0; } 100% { background-position: 0 40px; } }

.builder-backdrop { align-items: flex-end; padding: 0; }
.builder-card-m { max-width: 100%; height: 85vh; border-bottom-left-radius: 0; border-bottom-right-radius: 0; padding-bottom: 85px; display: flex; flex-direction: column; }

.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
.ai-box-m { background: rgba(0,255,204,0.05); padding: 15px; border-radius: 12px; border: 1px solid rgba(0,255,204,0.2); margin-bottom: 15px; }
.ai-title-m { font-size: 1.1rem; margin-bottom: 15px; }
.input-group-m { display: flex; flex-direction: column; gap: 6px; margin-bottom: 15px; }
.input-group-m label { font-size: 0.8rem; color: #94a3b8; font-weight: bold; text-transform: uppercase; }
.sys-input-m { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; color: #fff; font-family: inherit; width: 100%; box-sizing: border-box; }
.sys-input-m:focus { border-color: #00ffcc; outline: none; }
.area-m { font-family: monospace; resize: vertical; }
.ai-gen-btn-m { background: #00ffcc; color: #000; padding: 12px; border-radius: 8px; width: 100%; margin-top: 5px; }
.divider-m { height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0; }
</style>
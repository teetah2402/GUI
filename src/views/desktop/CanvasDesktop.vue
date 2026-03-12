//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/views/desktop/CanvasDesktop.vue
//#######################################################################

<template>
  <div class="os-root" :data-theme="uiStore.currentTheme">

    <GuestLeftSidebar
        :is-open="isSidebarOpen"
        @close="isSidebarOpen = false"
    />

    <div class="os-bg">
        <div v-if="uiStore.currentTheme !== 'light'" class="cyberpunk-scene">
            <div class="cyber-grid-floor"></div>
            <div class="cyber-horizon-glow"></div>
            <div class="cyber-vignette"></div>
        </div>
        <div v-else class="light-scene">
            <div class="canvas-texture"></div>
            <div class="paint-blobs">
                <div class="blob blue-paint"></div>
                <div class="blob gold-paint"></div>
                <div class="blob white-wash"></div>
            </div>
        </div>
    </div>

    <div class="os-main">
      <transition name="fade-down">
        <div class="os-header">
           <div class="header-section left">
            <button @click="toggleSidebar" class="icon-btn mr-2" title="Toggle Sidebar">
               <i class="mdi" :class="isSidebarOpen ? 'mdi-backburger' : 'mdi-menu'"></i>
            </button>
            <span class="font-bold text-sm tracking-wider font-tech header-text">FLOWORK OS</span>

            <div class="p2p-status" style="display: flex; align-items: center; gap: 6px; margin-left: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;" :style="{ color: socketStore.isConnected ? '#3DDC84' : '#FF006E' }">
                <span style="width: 8px; height: 8px; border-radius: 50%;" :style="{ background: socketStore.isConnected ? '#3DDC84' : '#FF006E', boxShadow: socketStore.isConnected ? '0 0 10px #3DDC84' : 'none' }"></span>
                {{ socketStore.isConnected ? 'Engine Online' : 'Engine Offline' }}
            </div>
          </div>
          <div class="header-section center">
              <div class="clock-display">{{ timeString }}</div>
          </div>
          <div class="header-section right">
              <div class="auth-group">
                  <button @click="openBuilderModal" class="auth-text-btn" style="color: var(--brand); border: 1px solid var(--brand); font-weight: 800; background: rgba(6, 182, 212, 0.1);">🛠 BUILD APP</button>
                  <button @click="router.push('/store')" class="auth-text-btn">App Store</button>
                  <button @click="router.push('/')" class="auth-text-btn">Exit</button>
              </div>

              <button @click="closeAllApps" class="icon-btn close-all-btn" title="Close All Apps">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
          </div>
        </div>
      </transition>

      <div class="os-viewport"
            ref="viewportRef"
            @mousedown="handleGlobalMouseDown"
            @wheel.passive="handleGlobalWheel"
            @touchstart="handleGlobalTouchStart"
            @touchmove="handleGlobalTouchMove"
            @touchend="handleGlobalTouchEnd">

        <transition name="fade">
            <div v-if="windows.length === 0" class="empty-canvas-instruction">
                <div class="instruction-box">
                    <i class="mdi mdi-plus-box-multiple-outline instruction-icon"></i>
                    <h2 class="instruction-title">Canvas is Ready</h2>
                    <p class="instruction-text">To start working, please <b>open the sidebar</b> and add your favorite tools to this workspace.</p>

                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button @click="toggleSidebar" class="instruction-btn">Add Apps Now</button>
                        <button @click="openBuilderModal" class="instruction-btn" style="background: transparent; color: var(--brand); border: 2px solid var(--brand);">🛠 Build App</button>
                    </div>

                    <div style="margin-top: 15px; display: flex; justify-content: center;">
                        <a href="https://floworkos.com/blog/ultimate-guide-to-virtual-app" target="_blank" class="instruction-btn" style="display: inline-block; background: rgba(170, 136, 255, 0.1); color: #aa88ff; border: 1px dashed #aa88ff; text-decoration: none; font-size: 13px; padding: 8px 16px;">
                            📖 Read Tutorial
                        </a>
                    </div>

                </div>
            </div>
        </transition>

        <div class="os-world" :style="worldStyle">
            <div class="windows-layer">
                <SandboxedApp
                    v-for="win in windows"
                    :key="win.instanceId"
                    class="gpu-optimized"
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

        <transition name="fade-up">
            <div class="bottom-center-dock" v-if="windows.length > 0">
                <div class="dock-glass">
                    <button @click.stop="changePage(-1)" class="dock-btn" title="Previous Workspace">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <div class="v-sep"></div>
                    <button @click.stop="resetGlobalView" class="dock-btn main-action" title="Reset View">
                          <span class="page-num">{{ currentPage + 1 }}</span>
                          <span class="page-label">PAGE</span>
                    </button>
                    <div class="v-sep"></div>
                    <button @click.stop="changePage(1)" class="dock-btn" title="Next Workspace">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            </div>
        </transition>

        <transition name="fade-right">
            <div class="right-floating-dock">
                <div class="vertical-glass">
                    <button @click.stop="openBuilderModal" class="dock-btn" title="Build Virtual App" style="color: var(--brand);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                    </button>
                    <div class="h-sep"></div>

                    <button @click.stop="exportWorkspaceTemplate" class="dock-btn" title="Export Alur Kerja (Layout Workspace)" style="color: #FEE440;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                    <button @click.stop="triggerWorkspaceImport" class="dock-btn" title="Import Alur Kerja (Layout Workspace)" style="color: #3DDC84;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </button>
                    <div class="h-sep"></div>

                    <button @click.stop="openShareModal" class="dock-btn" title="Share Workspace Link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    </button>
                    <div class="h-sep"></div>
                    <button @click.stop="zoomCanvas(0.1)" class="dock-btn" title="Zoom In">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    </button>
                    <div class="h-sep"></div>
                    <button @click.stop="zoomCanvas(-0.1)" class="dock-btn" title="Zoom Out">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    </button>
                </div>
            </div>
        </transition>

        </div>

      </div>

    <Transition name="sys-pop">
      <div v-if="sysModal.active" class="sys-modal-backdrop" @mousedown.self="shakeModal">
        <div class="sys-modal-card" :class="{ 'shake': sysModal.shaking }">
          <div class="sys-modal-header"><span>{{ sysModal.title }}</span></div>
          <div class="sys-modal-body"><p>{{ sysModal.message }}</p></div>
          <div class="sys-modal-footer">
            <button v-if="sysModal.type === 'confirm'" @click="resolveModal(false)" class="sys-btn secondary">Cancel</button>
            <button @click="resolveModal(true)" class="sys-btn primary">OK</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="sys-pop">
      <div v-if="shareModal.active" class="sys-modal-backdrop" @mousedown.self="shareModal.active = false">
        <div class="sys-modal-card share-card">
          <div class="sys-modal-header"><span>Share Workspace</span></div>
          <div class="sys-modal-body">
             <div class="input-group">
                <label>Title</label>
                <input type="text" v-model="shareModal.title" class="sys-input" placeholder="e.g. Pro SEO Setup" ref="shareInputRef">
             </div>

             <div class="input-group">
                <label>Description (SEO)</label>
                <textarea v-model="shareModal.desc" class="sys-input area" rows="2" placeholder="Describe your workspace setup..." maxlength="150"></textarea>
                <div class="char-count">{{ shareModal.desc.length }}/150</div>
             </div>

             <div class="input-group">
                <label>Keywords (SEO)</label>
                <input type="text" v-model="shareModal.keywords" class="sys-input" placeholder="e.g. tools, generator, automation">
             </div>
          </div>
          <div class="sys-modal-footer">
            <button @click="shareModal.active = false" class="sys-btn secondary">Cancel</button>
            <button @click="generateAndCopyLink" class="sys-btn primary">Copy Link</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="sys-pop">
      <div v-if="builderModal.active" class="sys-modal-backdrop" @mousedown.self="builderModal.active = false">
        <div class="sys-modal-card share-card" style="width: 900px !important; max-width: 95vw;">
          <div class="sys-modal-header"><span>🛠 Build Virtual App</span></div>
          <div class="sys-modal-body custom-scroll" style="max-height: 70vh; overflow-y: auto; display: flex; gap: 20px; text-align: left;">

            <div style="flex: 1; display: flex; flex-direction: column;">
                <div class="input-group">
                  <label>App Name</label>
                  <input type="text" v-model="builderModal.name" class="sys-input" placeholder="e.g. My Custom Tool">
                </div>
                <div class="input-group">
                  <label>HTML Template</label>
                  <textarea v-model="builderModal.templateHtml" class="sys-input area" rows="7" placeholder="<div>Hello World</div>" style="font-family: monospace;"></textarea>
                </div>
                <div class="input-group">
                  <label>JavaScript Logic (mount function)</label>
                  <textarea v-model="builderModal.logicJs" class="sys-input area" rows="10" placeholder="return { mount(sys) { sys.toast('Ready!'); } }" style="font-family: monospace;"></textarea>
                </div>
            </div>

            <div style="width: 300px; background: rgba(6, 182, 212, 0.05); padding: 15px; border-radius: 8px; border: 1px solid rgba(6, 182, 212, 0.2); display: flex; flex-direction: column;">
                <h4 style="margin-top: 0; color: var(--brand); font-size: 13px; margin-bottom: 10px; display: flex; align-items: center; gap: 5px;">
                    <span>✨</span> AI App Builder
                </h4>
                <p style="font-size: 10px; color: rgba(255,255,255,0.6); line-height: 1.4; margin-bottom: 15px;">
                    Describe what you want the app to do. <b>Gemini 3.1 Pro Preview</b> will instantly write the HTML UI and Javascript logic for you.
                </p>

                <div class="input-group">
                    <label>Gemini API Key</label>
                    <input type="password" v-model="geminiApiKey" class="sys-input" placeholder="AIzaSy..." />
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" style="font-size: 9px; color: var(--brand); text-decoration: none; display: block; margin-top: 5px;">Get Free Key</a>
                </div>

                <div class="input-group" style="flex: 1; display: flex; flex-direction: column;">
                    <label>Prompt</label>
                    <textarea v-model="aiPrompt" class="sys-input area" style="flex: 1; min-height: 120px;" placeholder="e.g. Build a simple Markdown note taking app with a dark theme and auto-save using sys.variables..."></textarea>
                </div>

                <button @click="generateAppWithAI" class="sys-btn primary" style="width: 100%; background: var(--brand); color: #000; border-radius: 6px; font-size: 12px; margin-top: 10px;" :disabled="isGeneratingAI">
                    {{ isGeneratingAI ? '⏳ Generating App...' : '🤖 Generate App' }}
                </button>
            </div>

          </div>
          <div class="sys-modal-footer" style="flex-wrap: wrap; gap: 4px; padding: 10px;">
            <button @click="exportCustomApps" class="sys-btn secondary" style="flex: unset; font-size: 11px; padding: 8px 12px; background: rgba(255,255,255,0.1); border-radius: 6px;">📥 Export App</button>
            <button @click="triggerAppImport" class="sys-btn secondary" style="flex: unset; font-size: 11px; padding: 8px 12px; background: rgba(255,255,255,0.1); border-radius: 6px;">📤 Import App</button>

            <div style="flex: 1;"></div>
            <button @click="builderModal.active = false" class="sys-btn secondary" style="flex: unset; padding: 8px 12px;">Cancel</button>
            <button @click="saveAndLaunchCustomApp" class="sys-btn primary" style="flex: unset; padding: 8px 12px;">Save & Launch</button>
          </div>
        </div>
      </div>
    </Transition>

    <input type="file" ref="appImportRef" @change="handleAppImport" accept=".json" style="display: none;" />
    <input type="file" ref="workspaceImportRef" @change="handleWorkspaceImport" accept=".json" style="display: none;" />

  </div>
</template>

<script setup>
import { ref, reactive, provide, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '@/store/ui';
import { useAppStore } from '@/store/apps';
import { useSocketStore } from '@/store/socket';
import SandboxedApp from '@/components/os/desktop/SandboxedAppDesktop.vue';
import GuestLeftSidebar from '@/components/layout/desktop/GuestLeftSidebarDesktop.vue';

const router = useRouter();
const uiStore = useUiStore();
const appStore = useAppStore();
const socketStore = useSocketStore();

const windows = ref([]);
const recentApps = computed(() => appStore.recentApps.map(id => appStore.getAppById(id)).filter(Boolean));
const activeWindowId = ref(null);
const zIndexCounter = ref(100);

const isSidebarOpen = ref(false);
const timeString = ref('00:00');

const windowWidth = ref(window.innerWidth);

const geminiApiKey = ref(localStorage.getItem('gemini_api_key') || '');
const aiPrompt = ref('');
const isGeneratingAI = ref(false);

const handleGlobalTouchStart = (e) => {
    const isApp = e.target.closest('.app-content-wrapper');
    if (isApp) return;
    if (windows.value.length === 0) return;
    if (e.touches.length === 1) {
        isGlobalDragging = true;
        startPos = { x: e.touches[0].clientX - globalTransform.x, y: e.touches[0].clientY - globalTransform.y };
    } else if (e.touches.length === 2) {
        lastPinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }
};

const favoriteIds = computed(() => appStore.favoriteIds);

const globalTransform = reactive({ x: 0, y: 0, scale: 1.0 });
const currentPage = ref(0);
const PAGE_WIDTH_OFFSET = 3000;

let isGlobalDragging = false;
let startPos = { x: 0, y: 0 };
let lastPinchDist = 0;
let saveTimeout = null;

const worldStyle = computed(() => {
    const originX = (currentPage.value * PAGE_WIDTH_OFFSET) + (windowWidth.value / 2);
    return {
        transform: `translate(${globalTransform.x}px, ${globalTransform.y}px) scale(${globalTransform.scale})`,
        transformOrigin: `${originX}px center`,
        transition: isGlobalDragging ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        willChange: 'transform'
    };
});

const isFavorite = (app) => appStore.favoriteIds.includes(app.id || app.slug);
const toggleFavorite = (app) => appStore.toggleFavorite(app.id || app.slug);

const getSmartCoordinates = (index = 0, targetPage = currentPage.value) => {
    const currentScreenOffsetX = (targetPage * PAGE_WIDTH_OFFSET);
    let finalX = currentScreenOffsetX + (window.innerWidth * 0.30);
    let startY = window.innerHeight * 0.05;
    const offsetStep = 30;
    const safeCount = index % 10;
    finalX += (safeCount * offsetStep);
    let finalY = startY + (safeCount * offsetStep);
    return { x: finalX, y: finalY };
};

const addToHistory = (app) => {
    if (appStore.addToRecent) appStore.addToRecent(app.id || app.slug);
};

const launchApp = async (app, overrideX = null, overrideY = null, overrideScale = null) => {
    // [MODIFIED] Mencegah aplikasi HP untuk dijalankan di Canvas Desktop agar tidak rusak layoutnya
    if (app.desktop === 'no') {
        if(typeof triggerModal === 'function') triggerModal(`Aplikasi ini tidak dirancang untuk perangkat Desktop.`, `Device Mismatch`);
        return;
    }

    addToHistory(app);
    document.activeElement?.blur();
    await nextTick();

    const appId = app.slug || app.id;

    let finalUrl;
    if (appId && appId.startsWith('custom_')) {
        finalUrl = `virtual://${appId}`;
    } else if (app.is_local) {
        /* [ZOMBIE CODE]
        finalUrl = `http://127.0.0.1:5000/local-apps/${appId}/index.html`; // <-- Hardcode penyebab 404 pada app bersubfolder
        */

        // [MODIFIED] Deteksi cerdas Dynamic Entry Point mengikuti standar AppDirectViewDesktop
        let localEntry = 'index.html';
        if (app.action && app.action.default_popup) {
            localEntry = app.action.default_popup;
        } else if (app.browser_action && app.browser_action.default_popup) {
            localEntry = app.browser_action.default_popup;
        } else if (app.side_panel && app.side_panel.default_path) {
            localEntry = app.side_panel.default_path;
        }

        finalUrl = `http://127.0.0.1:5000/local-apps/${appId}/${localEntry}`;
    } else {
        let basePath = `/store/${appId}`;
        finalUrl = `${basePath}/index.html`.replace(/([^:]\/)\/+/g, "$1");
    }

    const instanceId = Date.now() + Math.random();
    let finalX, finalY;

    if (overrideX !== null && overrideY !== null) {
        finalX = overrideX; finalY = overrideY;
    } else {
        const targetPage = currentPage.value;
        const coords = getSmartCoordinates(windows.value.length, targetPage);
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
            globalTransform.scale = 1.0;
            globalTransform.y = 0;
            globalTransform.x = 0;
            currentPage.value = 0;
            const url = new URL(window.location);
            url.search = '';
            window.history.replaceState({}, '', url);
        }
        saveCanvasState();
    }
};

const closeAllApps = () => {
    windows.value = [];
    globalTransform.scale = 1.0;
    globalTransform.y = 0;
    globalTransform.x = 0;
    currentPage.value = 0;
    const url = new URL(window.location);
    url.search = '';
    window.history.replaceState({}, '', url);
    saveCanvasState();
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

const isAppRunning = (app) => windows.value.some(w => (w.slug && w.slug === app.slug) || (w.id && w.id === app.id));

const smartLaunch = (app) => {
    const runningInstance = windows.value.find(w => (w.slug && w.slug === app.slug) || (w.id && w.id === app.id));
    if (runningInstance) focusWindow(runningInstance.instanceId);
    else launchApp(app);
};

const minimizeAll = () => { resetGlobalView(); };

const shareModal = reactive({ active: false, title: '', desc: '', keywords: '' });
const shareInputRef = ref(null);

const openShareModal = () => {
    if (windows.value.length === 0) {
        triggerModal('Open some apps first to share your workspace.', 'Canvas Empty');
        return;
    }
    shareModal.title = '';
    shareModal.desc = '';
    shareModal.keywords = '';
    shareModal.active = true;
    nextTick(() => { if(shareInputRef.value) shareInputRef.value.focus(); });
};

const generateAndCopyLink = () => {
    let title = shareModal.title.trim() || "Untitled Workspace";
    let description = shareModal.desc.trim();
    let keywords = shareModal.keywords.trim();

    const slug = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    const baseUrl = `${window.location.origin}/share/${slug}`;
    const params = new URLSearchParams();

    if (windows.value.length > 0) {
        const stateData = {
            t: uiStore.currentTheme,
            d: description,
            k: keywords,
            w: windows.value.map(w => ({
                id: w.id || w.slug,
                name: w.name,
                x: Math.round(w.x),
                y: Math.round(w.y),
                s: parseFloat(w.scale.toFixed(2))
            }))
        };
        params.set('state', btoa(JSON.stringify(stateData)));
    }

    const finalLink = `${baseUrl}?${params.toString()}`;
    navigator.clipboard.writeText(finalLink).then(() => {
        shareModal.active = false;
        triggerModal('Link copied to clipboard!', 'Workspace Shared');
    });
};

const isActiveFav = computed(() => {
    if (!activeWindowId.value) return false;
    const win = windows.value.find(w => w.instanceId === activeWindowId.value);
    return win ? isFavorite(win) : false;
});

const toggleActiveFav = () => {
    if (!activeWindowId.value) return;
    const win = windows.value.find(w => w.instanceId === activeWindowId.value);
    if(win) toggleFavorite(win);
};

const processUrlCommands = async () => {
    const params = new URLSearchParams(window.location.search);
    const appSlug = params.get('app');

    if (appSlug) {
        const existingInstance = windows.value.find(w => w.slug === appSlug || w.id === appSlug);
        if (existingInstance) { focusWindow(existingInstance.instanceId); }
        else {
            const app = appStore.getAppBySlug(appSlug);
            if (app) await launchApp(app);
        }
    }

    const stateParam = params.get('state') || params.get('layout');
    if (stateParam) {
        try {
            const decoded = JSON.parse(atob(stateParam));
            const windowsData = Array.isArray(decoded) ? decoded : decoded.w;
            const themeData = decoded.t;

            if (themeData) {
                uiStore.currentTheme = themeData;
                document.documentElement.setAttribute('data-theme', themeData);
                localStorage.setItem('flowork_os_theme', themeData);
            }

            if (Array.isArray(windowsData)) {
                for (const item of windowsData) {
                    const app = appStore.getAppBySlug(item.id);
                    const isOpen = windows.value.some(w => (w.id === item.id || w.slug === item.id));
                    if (app && !isOpen) launchApp(app, item.x, item.y, item.s);
                }
            }
        } catch (e) { console.warn('Invalid Share State', e); }
    }

    if (appSlug || stateParam) {
        const url = new URL(window.location);
        url.search = '';
        window.history.replaceState({}, '', url);
    }
};

const zoomCanvas = (delta) => {
    if (windows.value.length === 0) return;
    globalTransform.scale = Math.min(Math.max(globalTransform.scale + delta, 0.2), 5.0);
    saveCanvasState();
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
            // [MODIFIED] Menyertakan action untuk auto-restore entry point
            windows: windows.value.map(w => ({ id: w.id, slug: w.slug, name: w.name, icon: w.icon, type: w.type, path: w.path, entry: w.entry, instanceId: w.instanceId, url: w.url, x: w.x, y: w.y, scale: w.scale, zIndex: w.zIndex, is_local: w.is_local, action: w.action, browser_action: w.browser_action, side_panel: w.side_panel }))
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

const resetGlobalView = () => {
    const pagesMap = new Map();
    const visualSort = [...windows.value].sort((a, b) => a.x - b.x);
    visualSort.forEach(win => {
        let pageIdx = Math.round(win.x / PAGE_WIDTH_OFFSET);
        if (pageIdx < 0) pageIdx = 0;
        if (!pagesMap.has(pageIdx)) { pagesMap.set(pageIdx, []); }
        pagesMap.get(pageIdx).push(win);
    });
    const sortedKeys = Array.from(pagesMap.keys()).sort((a, b) => a - b);
    let newPageIndex = 0;
    sortedKeys.forEach((oldKey) => {
        const pageWindows = pagesMap.get(oldKey);
        pageWindows.forEach((win, index) => {
            const coords = getSmartCoordinates(index, newPageIndex);
            win.x = coords.x; win.y = coords.y; win.scale = 1.0;
        });
        newPageIndex++;
    });
    currentPage.value = 0; globalTransform.x = 0;
    globalTransform.scale = 1.0; globalTransform.y = 0;
    saveCanvasState();
};

const handleGlobalWheel = (e) => {
    if (windows.value.length === 0) return;
    const isApp = e.target.closest('.app-content-wrapper');
    if (!isApp) {
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        globalTransform.scale = Math.min(Math.max(globalTransform.scale * delta, 0.2), 5.0);
        saveCanvasState();
    }
};

const handleGlobalMouseDown = (e) => {
    const isInteractive = e.target.closest('.app-content-wrapper') || e.target.closest('.mobile-dock-container') || e.target.closest('.os-header') || e.target.closest('.bottom-center-dock') || e.target.closest('.right-floating-dock');
    if (isInteractive) return;
    if ((e.button === 0 || e.button === 1)) {
        if (windows.value.length === 0) return;
        e.preventDefault();
        isGlobalDragging = true;
        startPos = { x: e.clientX - globalTransform.x, y: e.clientY - globalTransform.y };
        window.addEventListener('mousemove', onGlobalMouseMove);
        window.addEventListener('mouseup', onGlobalMouseUp);
    }
};

const onGlobalMouseMove = (e) => {
    if (!isGlobalDragging) return;
    e.preventDefault();
    globalTransform.x = e.clientX - startPos.x;
    globalTransform.y = e.clientY - startPos.y;
};

const onGlobalMouseUp = () => {
    isGlobalDragging = false;
    window.removeEventListener('mousemove', onGlobalMouseMove);
    window.removeEventListener('mouseup', onGlobalMouseUp);
    saveCanvasState();
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
        globalTransform.scale = Math.min(Math.max(globalTransform.scale * delta, 0.2), 5.0);
        lastPinchDist = dist;
    }
};

const handleGlobalTouchEnd = () => {
    isGlobalDragging = false; lastPinchDist = 0; saveCanvasState();
};

const sysModal = reactive({ active: false, shaking: false, title: '', message: '', type: 'alert', resolve: null });
provide('sys-dialog', { alert: (msg, title) => triggerModal(msg, title, 'alert'), confirm: (msg, title) => triggerModal(msg, title, 'confirm') });
const triggerModal = (message, title='System', type='alert') => new Promise(resolve => { sysModal.active = true; sysModal.title = title; sysModal.message = message; sysModal.type = type; sysModal.resolve = resolve; });
const resolveModal = (res) => { sysModal.active = false; if(sysModal.resolve) sysModal.resolve(res); };
const shakeModal = () => { sysModal.shaking = true; setTimeout(() => sysModal.shaking = false, 300); };

const updateTime = () => { const d = new Date(); timeString.value = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
let clockInterval = setInterval(updateTime, 1000);

const loadRegistry = async () => {
    try {
        appStore.setDeviceType('desktop');
        await appStore.fetchInstalledApps();
        await processUrlCommands();
    } catch(e){}
};

const handleResize = () => {
    windowWidth.value = window.innerWidth;
};

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};

watch(isSidebarOpen, (val) => {
    if (window.innerWidth >= 768) {
        localStorage.setItem('flowork_sidebar_state', JSON.stringify(val));
    }
});

const handleExternalLaunch = (e) => {
    const app = e.detail;
    launchApp(app);
};

const builderModal = reactive({ active: false, id: '', name: '', templateHtml: '', logicJs: '' });

const openBuilderModal = () => {
    builderModal.id = `custom_${Date.now()}`;
    builderModal.name = 'My First Tool';
    builderModal.templateHtml = `<div style="padding:20px; text-align:center;">\n  <h2 style="color:var(--brand);">🚀 Canvas Virtual App</h2>\n  <p>Aplikasi ini jalan murni dari RAM dan disuntik God Mode!</p>\n  <button id="btn-test" style="padding:10px 15px; background:var(--brand); border:none; border-radius:8px; color:#1E1B4B; font-weight:bold; cursor:pointer; margin-top:20px; transition:0.2s;">Run God Mode</button>\n</div>`;
    builderModal.logicJs = `return {\n  mount(sys) {\n    sys.root.querySelector("#btn-test").onclick = () => {\n      sys.toast("Hello dari Custom RAM App!");\n    };\n  }\n}`;
    builderModal.active = true;
};

const editCustomApp = (appData) => {
    if (!appData) return;
    const targetId = appData.id || appData.slug;
    const customApp = appStore.customCanvasApps.find(a => a.id === targetId);

    if (customApp) {
        builderModal.id = customApp.id;
        builderModal.name = customApp.name;
        builderModal.templateHtml = customApp.templateHtml;
        builderModal.logicJs = customApp.logicJs;
        builderModal.active = true;
    } else {
        triggerModal("Data mentah aplikasi ini tidak ditemukan di Memory.", "Edit Gagal");
    }
};

const saveAndLaunchCustomApp = () => {
    if (!builderModal.name.trim()) {
        triggerModal("Nama aplikasi tidak boleh kosong.", "Error");
        return;
    }
    const newApp = {
        id: builderModal.id,
        slug: builderModal.id,
        name: builderModal.name,
        icon: 'mdi-code-braces',
        templateHtml: builderModal.templateHtml,
        logicJs: builderModal.logicJs,
        category: 'Custom Virtual App'
    };

    appStore.saveCustomApp(newApp);
    builderModal.active = false;

    const existingWin = windows.value.find(w => w.id === newApp.id || w.slug === newApp.id);

    if (existingWin) {
        const tempX = existingWin.x;
        const tempY = existingWin.y;
        const tempS = existingWin.scale;

        closeWindow(existingWin.instanceId);

        setTimeout(() => {
            launchApp(newApp, tempX, tempY, tempS);
        }, 50);
    } else {
        launchApp(newApp);
    }
};

async function generateAppWithAI() {
    if (!geminiApiKey.value || !aiPrompt.value) {
        triggerModal("API Key dan Prompt harus diisi sebelum generate AI.", "Validasi AI");
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
            "templateHtml": "String containing the HTML UI. Use inline styles or standard HTML elements. Do not include <html> or <body> tags, just the inner container.",
            "logicJs": "String containing a Javascript object that MUST have a 'mount(sys)' function. You can access DOM elements via 'sys.root.querySelector'. You can show alerts using 'sys.toast(msg)'. You can use 'sys.variables.get(name)' to get variables. Example: 'return { mount(sys) { const btn = sys.root.querySelector(\\"#myBtn\\"); btn.onclick = () => sys.toast(\\"Clicked!\\"); } }'"
        }

        DO NOT wrap the response in markdown code blocks (\`\`\`json). RETURN PURE RAW JSON ONLY.
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${geminiApiKey.value}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptSystem }] }]
            })
        });

        if (!response.ok) throw new Error("Gagal menghubungi server AI. Pastikan API Key valid.");

        const data = await response.json();
        let resultText = data.candidates[0].content.parts[0].text;

        resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

        const generatedApp = JSON.parse(resultText);

        builderModal.name = generatedApp.name || 'AI Generated App';
        builderModal.templateHtml = generatedApp.templateHtml || '';
        builderModal.logicJs = generatedApp.logicJs || '';

        triggerModal("Virtual App berhasil digenerate oleh AI! Silakan review dan klik Save & Launch.", "AI Berhasil");

    } catch (error) {
        console.error(error);
        triggerModal("Gagal generate AI: " + error.message, "Error AI");
    } finally {
        isGeneratingAI.value = false;
    }
}


const appImportRef = ref(null);

const exportCustomApps = () => {
    const data = appStore.customCanvasApps;
    if (!data || data.length === 0) {
        triggerModal("Belum ada aplikasi kustom yang dibuat untuk di-export.", "Export Gagal");
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

const triggerAppImport = () => {
    if(appImportRef.value) appImportRef.value.click();
};

const handleAppImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const parsed = JSON.parse(ev.target.result);
            if (Array.isArray(parsed)) {
                appStore.importCustomApps(parsed);
                triggerModal(`Berhasil import ${parsed.length} aplikasi kustom. Buka sidebar untuk meluncurkannya.`, "Import Berhasil");
                builderModal.active = false;
            } else {
                triggerModal("Format file JSON tidak valid. Harus berupa Array.", "Import Gagal");
            }
        } catch (err) {
            triggerModal("Gagal membaca atau memparsing file JSON.", "Error");
        }
        e.target.value = '';
    };
    reader.readAsText(file);
};


const workspaceImportRef = ref(null);

const exportWorkspaceTemplate = () => {
    if (windows.value.length === 0 && appStore.customCanvasApps.length === 0) {
        triggerModal('Tidak ada aplikasi yang terbuka atau custom app untuk di-export.', 'Canvas Kosong');
        return;
    }

    const layout = windows.value.map(w => ({
        id: w.id || w.slug,
        x: Math.round(w.x),
        y: Math.round(w.y),
        scale: parseFloat(w.scale.toFixed(2))
    }));

    const customAppsToExport = appStore.customCanvasApps || [];

    const exportData = {
        version: "1.0",
        type: "flowork_workspace",
        theme: uiStore.currentTheme,
        layout: layout,
        customAppsData: customAppsToExport
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowork_workspace_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

const triggerWorkspaceImport = () => {
    if(workspaceImportRef.value) workspaceImportRef.value.click();
};

const handleWorkspaceImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
        try {
            const parsed = JSON.parse(ev.target.result);
            if (parsed.type === 'flowork_workspace') {

                if (parsed.customAppsData && Array.isArray(parsed.customAppsData)) {
                    appStore.importCustomApps(parsed.customAppsData);
                }

                if (parsed.theme) {
                    uiStore.currentTheme = parsed.theme;
                    document.documentElement.setAttribute('data-theme', parsed.theme);
                    localStorage.setItem('flowork_os_theme', parsed.theme);
                }

                closeAllApps();
                await nextTick();

                if (parsed.layout && Array.isArray(parsed.layout)) {
                    for (const item of parsed.layout) {
                        const app = appStore.getAppBySlug(item.id);
                        if (app) {
                            await launchApp(app, item.x, item.y, item.scale);
                        } else {
                            console.warn(`App [${item.id}] tidak ditemukan di sistem.`);
                        }
                    }
                }

                triggerModal("Template Alur Kerja (Workspace) berhasil direstore dengan aman!", "Import Berhasil");
            } else {
                triggerModal("Format file salah. Gunakan file JSON dari menu Export Workspace.", "Import Gagal");
            }
        } catch (err) {
            triggerModal("Gagal membaca file JSON.", "Error Sistem");
        }
        e.target.value = '';
    };
    reader.readAsText(file);
};

onMounted(() => {
    updateTime();
    loadCanvasState();
    loadRegistry();
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('flowork-launch-app', handleExternalLaunch);

    socketStore.connect();

    uiStore.initTheme();
    if (window.innerWidth >= 768) {
        const savedSidebar = localStorage.getItem('flowork_sidebar_state');
        isSidebarOpen.value = savedSidebar !== null ? JSON.parse(savedSidebar) : true;
    } else {
        isSidebarOpen.value = false;
    }
});
onUnmounted(() => {
    clearInterval(clockInterval);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('flowork-launch-app', handleExternalLaunch);
});
</script>

<style scoped>
/* COPIED STYLES ... */
.os-viewport {
    will-change: scroll-position;
    position: absolute;
    top: 56px; left: 0; width: 100%; height: calc(100vh - 56px);
}
.gpu-optimized { backface-visibility: hidden; transform: translateZ(0); contain: paint; }
.os-root {
    --bg-page: #050505; --header-bg: rgba(18, 18, 18, 0.7); --sidebar-bg: rgba(10, 10, 10, 0.8);
    --text-main: #ffffff; --text-muted: rgba(255, 255, 255, 0.6); --border: rgba(255, 255, 255, 0.1);
    --brand: #06b6d4; --card-bg: rgba(30, 30, 35, 0.6); --card-hover-bg: rgba(40, 40, 45, 0.8); --card-border: rgba(255, 255, 255, 0.1);
    position: fixed; inset: 0; z-index: 9999; display: flex;
    background-color: var(--bg-page); color: var(--text-main); font-family: 'Inter', sans-serif; overflow: hidden;
    transition: background-color 0.5s ease, color 0.5s ease;
    touch-action: none; overscroll-behavior: none; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent;
}
.os-root[data-theme="light"] {
    --bg-page: #ffffff; --header-bg: rgba(255, 255, 255, 0.65); --sidebar-bg: rgba(255, 255, 255, 0.7);
    --text-main: #1e293b; --text-muted: rgba(0, 0, 0, 0.6); --border: rgba(0, 0, 0, 0.08);
    --brand: #3b82f6; --card-bg: rgba(255, 255, 255, 0.6); --card-hover-bg: rgba(255, 255, 255, 0.9); --card-border: rgba(0, 0, 0, 0.05);
}
.os-root[data-theme="hacker"] {
    --bg-page: #000000; --header-bg: rgba(0, 20, 0, 0.9); --sidebar-bg: rgba(0, 10, 0, 0.95);
    --text-main: #00ff00; --text-muted: rgba(0, 255, 0, 0.6); --border: rgba(0, 255, 0, 0.3);
    --brand: #00ff00; --card-bg: rgba(0, 20, 0, 0.8); --card-hover-bg: rgba(0, 40, 0, 0.9); --card-border: rgba(0, 255, 0, 0.3); font-family: 'Courier New', monospace;
}
.os-bg { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; background-color: var(--bg-page); contain: strict; }
.cyberpunk-scene { position: absolute; inset: 0; background: #020205; perspective: 1000px; }
.cyber-grid-floor { position: absolute; width: 200%; height: 200%; top: -50%; left: -50%; background-image: linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px); background-size: 60px 60px; transform: rotateX(60deg); animation: grid-move 20s linear infinite; filter: drop-shadow(0 0 2px var(--brand)); }
.cyber-horizon-glow { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 50% 0%, var(--brand) 0%, transparent 60%); opacity: 0.15; mix-blend-mode: screen; }
.cyber-vignette { position: absolute; inset: 0; background: radial-gradient(circle, transparent 40%, #000 100%); opacity: 0.8; }
.light-scene { position: absolute; inset: 0; background: #f8fafc; overflow: hidden; }
.canvas-texture { position: absolute; inset: 0; opacity: 0.4; background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2394a3b8' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
.paint-blobs { position: absolute; inset: 0; filter: blur(80px); }
.blob { position: absolute; border-radius: 50%; opacity: 0.6; will-change: transform; }
.blue-paint { width: 90vw; height: 90vw; background: linear-gradient(135deg, #a5f3fc 0%, #38bdf8 100%); top: -20%; left: -20%; animation: paintFlow 25s ease-in-out infinite alternate; }
.gold-paint { width: 80vw; height: 80vw; background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%); bottom: -20%; right: -20%; animation: paintFlow 30s ease-in-out infinite alternate-reverse; }
.white-wash { width: 100vw; height: 100vw; background: rgba(255,255,255,0.5); top: 50%; left: 50%; transform: translate(-50%, -50%); mix-blend-mode: overlay; }
@keyframes paintFlow { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(100px, 50px) scale(1.1); } }
@keyframes grid-move { 0% { background-position: 0 0; } 100% { background-position: 0 60px; } }
.os-header { height: 56px; background: var(--header-bg); border-bottom: 1px solid var(--border); backdrop-filter: blur(30px); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; z-index: 10000; position: relative; }
.os-main { flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden; height: 100%; }
.header-section { display: flex; align-items: center; gap: 10px; }
.icon-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: transparent; border: 1px solid transparent; color: var(--text-main); border-radius: 50%; cursor: pointer; transition: 0.2s; }
.icon-btn:hover { background: var(--card-hover-bg); transform: scale(1.1); border-color: var(--border); }
.os-viewport:active { cursor: grabbing; }
.os-world { width: 100%; height: 100%; position: absolute; top:0; left: 0; will-change: transform; }
.clock-display { font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 1px; color: var(--text-main); opacity: 0.8; }
.auth-group { display: flex; gap: 4px; margin-right: 8px; }
.auth-text-btn { background: transparent; color: var(--text-muted); border: 1px solid transparent; font-size: 12px; padding: 4px 8px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-weight: 600; }
.auth-text-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.05); }
.close-all-btn:hover { color: #ff5f56; border-color: rgba(255, 95, 86, 0.3); background: rgba(255, 95, 86, 0.1); }
@media (max-width: 768px) { .os-header { padding: 0 10px; gap: 8px; } .header-section.center { flex: 0 0 auto; } .header-section.right { flex: 1; justify-content: flex-end; gap: 4px; display: flex; align-items: center; min-width: 80px; flex-shrink: 0; } }
.windows-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; display: block; }
.bottom-center-dock { position: absolute; bottom: 130px; left: 50%; transform: translateX(-50%); z-index: 10000; display: flex; justify-content: center; pointer-events: auto; }
.dock-glass { display: flex; align-items: center; gap: 12px; background: rgba(15, 15, 20, 0.75); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.15); padding: 8px 16px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.4); transition: 0.3s; }
.dock-btn { background: transparent; border: none; color: rgba(255, 255, 255, 0.8); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
.dock-btn.main-action { flex-direction: column; width: 50px; height: 50px; border-radius: 16px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.05); margin: 0 8px; }
.page-num { font-size: 16px; font-weight: bold; color: #fff; line-height: 1; }
.page-label { font-size: 8px; color: rgba(255,255,255,0.6); letter-spacing: 1px; margin-top: 2px; }
.v-sep { width: 1px; height: 24px; background: rgba(255,255,255,0.1); }
.right-floating-dock { position: absolute; bottom: 130px; right: 20px; z-index: 10000; display: flex; pointer-events: auto; }
.vertical-glass { display: flex; flex-direction: column; align-items: center; gap: 8px; background: rgba(15, 15, 20, 0.75); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.15); padding: 10px 6px; border-radius: 99px; box-shadow: 0 10px 40px rgba(0,0,0,0.4); }
.dock-btn:hover { background: rgba(255, 255, 255, 0.15); color: #fff; transform: scale(1.1); }
.h-sep { height: 1px; width: 24px; background: rgba(255,255,255,0.1); }
.empty-canvas-instruction { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 5; pointer-events: none; }
.instruction-box { text-align: center; max-width: 450px; padding: 40px; background: rgba(15, 15, 20, 0.6); backdrop-filter: blur(20px); border-radius: 32px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.5); pointer-events: auto; }
.instruction-icon { font-size: 64px; color: var(--brand); opacity: 0.6; margin-bottom: 20px; display: block; }
.instruction-title { font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 12px; }
.instruction-text { font-size: 0.95rem; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 24px; }
.instruction-btn { background: var(--brand); color: #000; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.instruction-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
.sys-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); z-index: 99999; display: flex; align-items: center; justify-content: center; }
.sys-modal-card { width: 300px; background: rgba(30,30,35,0.95); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; color: #fff; overflow: hidden; }
.sys-modal-header { padding: 15px; text-align: center; font-weight: bold; background: rgba(255,255,255,0.05); }
.sys-modal-body { padding: 20px; text-align: center; line-height: 1.5; color: rgba(255,255,255,0.9); }
.sys-modal-footer { display: flex; border-top: 1px solid rgba(255,255,255,0.1); }
.sys-btn { flex: 1; padding: 12px; border: none; cursor: pointer; background: transparent; color: #fff; }
.sys-btn.primary { color: var(--brand); font-weight: bold; }
.history-icon-wrapper { flex: 0 0 44px; height: 44px; margin: 0 4px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: 0.2s; cursor: pointer; border: 1px solid transparent; position: relative; }
.history-img { width: 28px; height: 28px; object-fit: contain; }
.running-dot { position: absolute; bottom: 2px; width: 4px; height: 4px; background: var(--brand); border-radius: 50%; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-down-enter-active { transition: all 0.3s; }
.fade-down-enter-from { transform: translateY(-20px); opacity: 0; }

.input-group { text-align: left; margin-bottom: 12px; }
.input-group label { display: block; font-size: 11px; margin-bottom: 6px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
.sys-input { width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 13px; font-family: inherit; transition: 0.2s; }
.sys-input:focus { outline: none; border-color: var(--brand); background: rgba(0,0,0,0.5); }
.sys-input::placeholder { color: rgba(255,255,255,0.3); }
.char-count { text-align: right; font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 4px; }
</style>
//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/components/os/desktop/SandboxedAppDesktop.vue
//#######################################################################

<template>
  <Teleport to="body" :disabled="!isMaximized">
      <div class="app-content-wrapper"
            :class="{
                'immersive-mode': isDirectView || isMaximized,
                'is-dragging': isDragging,
                'is-resizing': isResizing
            }"
            :data-theme="currentTheme"
            :style="computedStyle"
            @mousedown="handleMouseDown">

        <div class="app-screen">
            <div class="app-layer">

                <div v-if="appType === 'native' && appMenus" class="triad-app-container">

                    <header class="triad-top-bar">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <h1 class="font-display text-xl font-black italic" style="margin:0;">
                                {{ appDict.appName }}<span class="text-brand">{{ appDict.appNameHl }}</span>
                            </h1>
                        </div>
                        <div class="flex-actions">
                            <button @click="reloadApp" class="btn-icon bouncy-fx" style="width:35px; height:35px; font-size:12px;" title="Reload State">🔄</button>
                        </div>
                    </header>

                    <div class="triad-layout-body">
                        <aside v-if="appMenus?.sidebar?.length" class="triad-sidebar custom-scrollbar">
                            <button v-for="btn in appMenus.sidebar" :key="btn.id"
                                    class="side-btn" :class="{ active: activeSide === btn.id }"
                                    @click="handleMenuClick(btn.id)"
                                    :title="appDict[btn.labelKey]">
                                <div class="side-icon">{{ btn.icon }}</div>
                                <span>{{ appDict[btn.labelKey] }}</span>
                            </button>
                        </aside>

                        <div class="triad-workspace">
                            <div id="app-native-root" ref="nativeRoot" class="native-app-host custom-scroll triad-scroll"></div>

                            <div v-if="appMenus" class="triad-dock-wrapper">
                                <div v-if="appMenus?.actionDock?.length" class="action-dock-outer bouncy-up">
                                    <button class="btn-icon bouncy-fx" style="background: var(--bg-panel); color: var(--text-main); width:35px; min-width:35px; font-size:12px;" @click="scrollDock(-100)">❮</button>

                                    <div class="action-dock-inner custom-scrollbar" ref="actionDockRef">
                                        <button v-for="btn in appMenus.actionDock" :key="btn.id"
                                                @click="handleMenuClick(btn.id)"
                                                class="btn-icon bouncy-fx" :class="btn.color ? 'btn-' + btn.color : ''"
                                                :title="appDict[btn.labelKey]">
                                            {{ btn.icon }}
                                        </button>
                                    </div>

                                    <button class="btn-icon bouncy-fx" style="background: var(--bg-panel); color: var(--text-main); width:35px; min-width:35px; font-size:12px;" @click="scrollDock(100)">❯</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else-if="appType === 'native' && !appMenus" ref="nativeRoot" class="native-app-host custom-scroll"></div>

                <iframe v-else-if="appType === 'iframe'" ref="iframeRef" @load="injectChromePolyfill" :src="activeUrl" class="iframe-app-host" frameborder="0"></iframe>

                <EngineRenderer v-else-if="appType === 'logic'" :schema="uiSchema" :initial-state="savedInternalState" @state-change="handleInternalStateSave" @action="handleAppAction" />
            </div>

            <Transition name="sys-pop">
                <div v-if="customPopup.active" class="triad-popup-overlay">
                    <div class="triad-popup-card universal-green-pop" :style="{ width: customPopup.width }">
                        <div class="triad-popup-header">
                            <span>{{ customPopup.title }}</span>
                            <button @click="closeCustomPopup" class="btn-pop-close">✖</button>
                        </div>
                        <div :id="'triad-popup-body-' + uniqueId" class="triad-popup-content custom-scroll"></div>
                    </div>
                </div>
            </Transition>

            <div v-if="loading" class="state-overlay">
                <div class="gummy-loader"></div>
                <span class="font-display tracking-[0.3em] uppercase">Booting Engine...</span>
            </div>

            <div v-if="error" class="state-overlay error">
                <div class="error-card gummy-board">
                    <div class="error-title font-display">SYSTEM CRASH 💀</div>
                    <textarea class="error-msg input-carved" readonly>{{ error }}</textarea>
                    <div class="error-actions">
                        <button @click="reloadApp" class="btn-game !bg-[var(--yellow-cyber)] text-xs">RELOAD</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="frame-controls" v-if="!isDirectView">
             <div class="gesture-zone top" @dblclick="toggleMaximize" @mousedown.stop="startDrag" @wheel.stop.prevent="handleZoomWheel">
                <div class="win-controls-group">
                    <button class="win-control-btn close" @click.stop="requestClose" title="Close">
                        <v-icon icon="mdi-close" size="14"></v-icon>
                    </button>
                    <button class="win-control-btn max" @click.stop="toggleMaximize" title="Maximize">
                        <v-icon :icon="isMaximized ? 'mdi-window-restore' : 'mdi-window-maximize'" size="14"></v-icon>
                    </button>

                    <button v-if="url && url.startsWith('virtual://')" class="win-control-btn edit-app" @click.stop="$emit('edit-app', appData)" title="Edit Logic & UI">
                        <v-icon icon="mdi-pencil" size="14"></v-icon>
                    </button>

                    <div class="win-sep"></div>
                    <button class="win-control-btn reload-desk" @click.stop="reloadApp">
                        <v-icon icon="mdi-refresh" size="14"></v-icon>
                    </button>
                    <button class="win-control-btn fav" :class="{ 'active': isFav }" @click.stop="$emit('toggle-favorite')">
                        <v-icon :icon="isFav ? 'mdi-star' : 'mdi-star-outline'" size="14"></v-icon>
                    </button>
                </div>
                <div class="app-drag-title font-display">{{ appData?.name || 'Gummy App' }}</div>
             </div>

             <template v-if="!isMaximized">
                <div class="gesture-zone left" @mousedown.stop="startResize($event, 'left')"></div>
                <div class="gesture-zone right" @mousedown.stop="startResize($event, 'right')"></div>
                <div class="gesture-zone bottom" @mousedown.stop="startResize($event, 'bottom')">
                    <div class="home-indicator"></div>
                </div>
                <div class="resize-corner bottom-right" @mousedown.stop="startResize($event, 'both')"></div>
             </template>
        </div>

      </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, defineAsyncComponent, shallowRef, nextTick, inject, reactive } from 'vue';
import { useAppStore } from '@/store/apps';
import { initChromePolyfill } from '@/utils/chromePolyfill';
import { executeEngineTask } from '@/utils/systemBridge';

const EngineRenderer = defineAsyncComponent(() => import('@/components/engine/EngineRenderer.vue'));

const props = defineProps(['url', 'globalScale', 'initialX', 'initialY', 'initialScale', 'uniqueId', 'zIndex', 'isFav', 'isDirectView', 'appData', 'isSidebarOpen']);
const emit = defineEmits(['close', 'action', 'mousedown', 'update-metrics', 'toggle-favorite', 'edit-app']);

const sysDialog = inject('sys-dialog');
const appStore = useAppStore();

const appMenus = ref(null);
const appDict = ref({});
const activeNav = ref('');
const activeSide = ref('');
const actionDockRef = ref(null);

const loading = ref(true);
const error = ref(null);
const appType = ref('native');
const nativeRoot = ref(null);
const currentTheme = ref('dark');

const iframeRef = ref(null);
const addonDependencies = ref({});

const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);
const scale = ref(props.initialScale || 1.0);
const pan = ref({ x: props.initialX || 100, y: props.initialY || 100 });
const size = ref({ w: 800, h: 600 });

const savedInternalState = ref(null);
const isMaximized = ref(false);
const isInteracting = ref(false);

let isDragging = ref(false);
let isResizing = ref(false);
let resizeType = '';
let startPos = { x: 0, y: 0 };
let startSize = { w: 0, h: 0 };
let saveTimeout = null;

const uiSchema = ref([]);
const appLogic = shallowRef(null);
const storageKey = computed(() => props.uniqueId ? `fw_inst_${props.uniqueId}` : null);

const activeUrl = ref(props.url || '');

const handleMenuClick = (actionId) => {
    if (appLogic.value && typeof appLogic.value.onMenuAction === 'function') {
        appLogic.value.onMenuAction(actionId);
    }
};

const scrollDock = (amount) => {
    if (actionDockRef.value) actionDockRef.value.scrollBy({ left: amount, behavior: 'smooth' });
};

const customPopup = reactive({ active: false, title: '', width: '400px', content: '', onMounted: null });
const closeCustomPopup = () => { customPopup.active = false; customPopup.content = ''; };
const openCustomPopup = async (config) => {
    customPopup.title = config.title || 'App Dialog';
    customPopup.width = config.width || '400px';
    customPopup.active = true;
    await nextTick();
    const container = document.getElementById(`triad-popup-body-${props.uniqueId}`);
    if (container) {
        container.innerHTML = config.content;
        if (typeof config.onMounted === 'function') config.onMounted(container);
    }
};

const injectChromePolyfill = (event) => {
    if (!iframeRef.value || !iframeRef.value.contentWindow) return;

    const win = iframeRef.value.contentWindow;
    let doc;

    // Bypass untuk Cross-Origin PC Local App agar tidak terjadi error DOM
    try {
        doc = event.target.contentDocument || win.document;
    } catch (crossOriginError) {
        // [MODIFIED] Logika bypass sudah benar, hanya menambahkan log konsol sesuai standar OS/AppDirectView agar debugging lebih mudah
        console.log("[Flowork System] Iframe menggunakan Cross-Origin (Local App). Bypass injeksi ekstensi demi keamanan SOP Browser.");
        return;
    }

    try {
        if (!win.chrome) win.chrome = {};
        win.chrome.storage = window.chrome.storage;
        win.chrome.tabs = window.chrome.tabs;
        win.chrome.runtime = window.chrome.runtime;
        win.chrome.notifications = window.chrome.notifications;
        win.chrome.scripting = window.chrome.scripting;
        win.chrome.bookmarks = window.chrome.bookmarks;
        win.chrome.history = window.chrome.history;

        win.chrome.__isFloworkPolyfill = true;
    } catch (error) {}

    try {
        if (Object.keys(addonDependencies.value).length > 0) {
            for (const [pkgName, pkgVersion] of Object.entries(addonDependencies.value)) {
                const globalSafeName = pkgName.replace(/[^a-zA-Z0-9]/g, '');

                if (!win[globalSafeName] && !window[globalSafeName]) {
                    const script = doc.createElement('script');
                    script.type = 'module';
                    script.textContent = `
                        import * as ${globalSafeName} from 'https://esm.sh/${pkgName}@${pkgVersion}';
                        window['${pkgName}'] = ${globalSafeName};
                        window['${globalSafeName}'] = ${globalSafeName};
                    `;
                    doc.head.appendChild(script);
                } else if (window[globalSafeName]) {
                    win[pkgName] = window[globalSafeName];
                    win[globalSafeName] = window[globalSafeName];
                }
            }
        }
    } catch (e) {}
};

const computedStyle = computed(() => {
    if (props.isDirectView) {
        return { position: 'fixed', inset: 0, width: '100%', height: '100%', transform: 'none', zIndex: 100, border: 'none', borderRadius: 0, boxShadow: 'none' };
    }

    if (isMaximized.value) {
        const HEADER_HEIGHT = '56px'; const FOOTER_HEIGHT = '80px'; const SIDEBAR_WIDTH = props.isSidebarOpen ? '70px' : '0px';
        return { position: 'fixed', top: HEADER_HEIGHT, bottom: FOOTER_HEIGHT, left: SIDEBAR_WIDTH, right: '0', width: 'auto', height: 'auto', transform: 'none', zIndex: 9000, borderRadius: '0', border: 'none', boxShadow: 'none' };
    }

    return {
        width: `${size.value.w}px`,
        height: `${size.value.h}px`,
        transform: `translate(${pan.value.x}px, ${pan.value.y}px) scale(${scale.value})`,
        transformOrigin: 'top left',
        zIndex: props.zIndex || 10,
        position: 'absolute',
        left: 0,
        top: 0,
        boxShadow: isDragging.value ? '0 50px 100px -20px rgba(0,0,0,0.5)' : '0 20px 50px rgba(0,0,0,0.2)'
    };
});

const toggleMaximize = () => { isMaximized.value = !isMaximized.value; if (!isMaximized.value) saveWindowConfig(); };
const handleMouseDown = () => { if (!props.isDirectView && !isMaximized.value) emit('mousedown'); };
const requestClose = () => emit('close');

const loadApp = async () => {
    if(!props.url) return;
    loading.value = true; error.value = null; appMenus.value = null; loadWindowConfig();
    await loadScriptApp();
};

const reloadApp = () => {
    if(appLogic.value?.unmount) try{appLogic.value.unmount()}catch(e){}
    loading.value = true;
    appMenus.value = null;
    setTimeout(() => { loadApp(); }, 300);
};

const startDrag = (e) => {
    if (props.isDirectView || isMaximized.value) return;
    emit('mousedown');
    isDragging.value = true;
    startPos = { x: e.clientX, y: e.clientY };
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
};

const onDragMove = (e) => {
    if (!isDragging.value) return;
    const gScale = props.globalScale || 1;
    pan.value.x += (e.clientX - startPos.x) / gScale;
    pan.value.y += (e.clientY - startPos.y) / gScale;
    startPos = { x: e.clientX, y: e.clientY };
};

const onDragEnd = () => {
    isDragging.value = false;
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
    saveWindowConfig();
};

const startResize = (e, type) => {
    isResizing.value = true;
    resizeType = type;
    startPos = { x: e.clientX, y: e.clientY };
    startSize = { w: size.value.w, h: size.value.h };
    window.addEventListener('mousemove', onResizeMove);
    window.addEventListener('mouseup', onResizeEnd);
};

const onResizeMove = (e) => {
    if (!isResizing.value) return;
    const dx = (e.clientX - startPos.x) / (props.globalScale || 1);
    const dy = (e.clientY - startPos.y) / (props.globalScale || 1);

    if (resizeType === 'right' || resizeType === 'both') size.value.w = Math.max(320, startSize.w + dx);
    if (resizeType === 'bottom' || resizeType === 'both') size.value.h = Math.max(200, startSize.h + dy);
    if (resizeType === 'left') {
        const newW = Math.max(320, startSize.w - dx);
        if (newW > 320) {
            pan.value.x += dx;
            size.value.w = newW;
        }
    }
};

const onResizeEnd = () => {
    isResizing.value = false;
    window.removeEventListener('mousemove', onResizeMove);
    window.removeEventListener('mouseup', onResizeEnd);
    saveWindowConfig();
};

const handleZoomWheel = (e) => {
    if (props.isDirectView || isMaximized.value) return;
    scale.value = Math.min(Math.max(scale.value * (e.deltaY > 0 ? 0.95 : 1.05), 0.3), 3.0);
    saveWindowConfig();
};

const handleIframeMessage = async (event) => {
    if (!iframeRef.value || event.source !== iframeRef.value.contentWindow) return;

    const data = event.data;
    if (!data) return;

    if (data.type === 'FLOWORK_ENGINE_TASK') {
        try {
            console.log(`[SandboxedApp Bridge] Meneruskan task P2P [${data.taskName}] ke Local Engine...`);

            const response = await executeEngineTask(data.taskName, data.payload);

            if (iframeRef.value && iframeRef.value.contentWindow) {
                iframeRef.value.contentWindow.postMessage({
                    type: 'FLOWORK_ENGINE_RESULT',
                    taskId: data.taskId,
                    response: response
                }, '*');
            }
        } catch (err) {
            if (iframeRef.value && iframeRef.value.contentWindow) {
                iframeRef.value.contentWindow.postMessage({
                    type: 'FLOWORK_ENGINE_RESULT',
                    taskId: data.taskId,
                    error: err.message
                }, '*');
            }
        }
    }

    if (data.type === 'FLOWORK_DOWNLOAD' && data.payload) {
        const a = document.createElement('a');
        a.href = data.payload.data;
        a.download = data.payload.name;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 500);
    }
};

const loadScriptApp = async () => {
    try {
        if (props.url && props.url.startsWith('virtual://')) {
            const vId = props.url.replace('virtual://', '');
            const virtualApps = appStore.customCanvasApps || [];
            let vApp = virtualApps.find(a => a.id === vId);

            if (!vApp) {
                if (vId === 'demo') {
                    vApp = {
                        id: 'demo',
                        templateHtml: '<div style="padding:20px; color:white; text-align:center;"><h2>🚀 Virtual Sandbox App</h2><button id="btn-test">Klik Saya</button></div>',
                        logicJs: 'return { mount(sys) { sys.root.querySelector("#btn-test").onclick = () => sys.toast("Custom App Berhasil Menembus Sistem!"); } }'
                    };
                } else {
                    throw new Error(`Custom App [${vId}] tidak ditemukan di RAM!`);
                }
            }

            appType.value = 'native';

            let instance;
            let rawLogic = (vApp.logicJs || '').trim();

            try {
                instance = new Function(rawLogic)();
            } catch (err1) {
                try {
                    let expression = rawLogic.replace(/module\.exports\s*=\s*/, '').trim();
                    if (expression.endsWith(';')) expression = expression.slice(0, -1);
                    instance = new Function(`return (${expression})`)();
                } catch(err2) {
                    throw new Error("Syntax Error di Kode JS Lo: " + err1.message);
                }
            }

            appMenus.value = instance?.menus || null;

            await nextTick();

            if (nativeRoot.value) {
                nativeRoot.value.innerHTML = vApp.templateHtml;
            }

            const currentLang = localStorage.getItem('flowork_lang') || 'en';

            const sys = {
                root: nativeRoot.value,
                path: 'virtual',
                close: requestClose,
                toast: (msg) => { if(sysDialog) sysDialog.alert(msg, 'Toast'); else alert(msg); },
                alert: async (msg, title) => { if(sysDialog) sysDialog.alert(msg, title); else alert(msg); },
                theme: currentTheme.value,
                lang: currentLang,
                t: {},
                reload: () => reloadApp(),
                setNav: (id) => { activeNav.value = id; },
                setSide: (id) => { activeSide.value = id; },
                setActionDock: (actions) => { if(appMenus.value) appMenus.value.actionDock = actions; },
                popup: openCustomPopup,
                closePopup: closeCustomPopup,
                copy: (text) => {
                    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => { if(sysDialog) sysDialog.alert("Copied to clipboard!", "Success"); });
                },
                download: (filename, base64Data) => {
                    const a = document.createElement('a'); a.href = base64Data; a.download = filename; a.click();
                },
                variables: {
                    get: (name) => { console.warn('variables store is disabled'); return null; },
                    save: async (name, value) => { console.warn('variables store is disabled'); return false; },
                    getRequired: () => [],
                    getLabel: (name) => name
                }
            };

            if (instance && instance.mount) {
                instance.mount(sys);
                appLogic.value = instance;
                loading.value = false;
            } else {
                throw new Error("Virtual App Error: Fungsi mount() tidak ditemukan.");
            }
            return;
        }

        // [TAMBAHAN KODE] Bypass mutlak untuk Offline PC Apps agar Canvas tidak me-log error 404 file .json / .html
        if (props.appData?.is_local) {
            appType.value = 'iframe';
            activeUrl.value = props.url;
            loading.value = false;
            return;
        }

        let bp = props.url.replace('/index.html', '').replace('/logic.js', '');
        if (bp.endsWith('/')) bp = bp.slice(0, -1);
        if(bp.includes('/desktop/') || bp.includes('/mobile/')) {
            bp = bp.replace('/desktop/', '/store/').replace('/mobile/', '/store/');
        }

        const resHtml = await fetch(`${bp}/template.html?t=${Date.now()}`);
        const templateStrRaw = resHtml.ok ? await resHtml.text() : '';

        const isSpaFallback = templateStrRaw.trim().toLowerCase().startsWith('<!doctype');

        if (!resHtml.ok || isSpaFallback) {
            let entryFile = 'index.html';

            try {
                const manifestRes = await fetch(`${bp}/manifest.json?t=${Date.now()}`);
                if (manifestRes.ok) {
                    const manifestText = await manifestRes.text();
                    if (!manifestText.trim().startsWith('<')) {
                        const manifest = JSON.parse(manifestText);
                        if (manifest.action && manifest.action.default_popup) {
                            entryFile = manifest.action.default_popup;
                        } else if (manifest.browser_action && manifest.browser_action.default_popup) {
                            entryFile = manifest.browser_action.default_popup;
                        } else if (manifest.side_panel && manifest.side_panel.default_path) {
                            entryFile = manifest.side_panel.default_path;
                        }
                    } else {
                        const resPopup = await fetch(`${bp}/popup.html?t=${Date.now()}`);
                        if(resPopup.ok && !(await resPopup.clone().text()).trim().toLowerCase().startsWith('<!doctype')) {
                            entryFile = 'popup.html';
                        }
                    }
                } else {
                    const resPopup = await fetch(`${bp}/popup.html?t=${Date.now()}`);
                    if(resPopup.ok) entryFile = 'popup.html';
                }
            } catch (e) {
                console.warn("[OS] Manifest parsing bypass: ", e);
            }

            try {
                const pkgRes = await fetch(`${bp}/package.json?t=${Date.now()}`);
                if (pkgRes.ok) {
                    const pkgText = await pkgRes.text();
                    if (!pkgText.trim().startsWith('<')) {
                        const pkgData = JSON.parse(pkgText);
                        addonDependencies.value = pkgData.dependencies || pkgData.devDependencies || {};
                    }
                }
            } catch (e) {}

            activeUrl.value = `${bp}/${entryFile}`.replace(/([^:]\/)\/+/g, "$1");
            appType.value = 'iframe';
            loading.value = false;
            return;
        }

        const [resI18n, resLogic] = await Promise.all([
            fetch(`${bp}/i18n.json?t=${Date.now()}`),
            fetch(`${bp}/logic.js?t=${Date.now()}`)
        ]);

        const templateStr = templateStrRaw;

        let appI18n = {};
        if (resI18n.ok) {
            const i18nText = await resI18n.text();
            if (!i18nText.trim().startsWith('<')) {
                try { appI18n = JSON.parse(i18nText); } catch(e) {}
            }
        }

        const logicStr = await resLogic.text();

        appType.value = 'native';

        let cleanLogic = logicStr.replace(/module\.exports\s*=\s*/, '').trim();
        if (cleanLogic.endsWith(';')) cleanLogic = cleanLogic.slice(0, -1);
        const moduleObj = { exports: {} };
        const executeLogic = new Function('module', `module.exports = ${cleanLogic}`);
        executeLogic(moduleObj);
        const instance = moduleObj.exports;

        if (instance && instance.menus) {
            appMenus.value = instance.menus;
            const defSide = instance.menus.sidebar?.find(m => m.active);
            if (defSide) activeSide.value = defSide.id;
        } else {
            appMenus.value = null;
        }

        await nextTick();

        const currentLang = localStorage.getItem('flowork_lang') || 'en';
        const dictionary = appI18n[currentLang] || appI18n['en'] || appI18n['id'] || {};
        appDict.value = dictionary;

        let renderedHtml = templateStr.replace(/\{\{t\.([\w_]+)\}\}/g, (match, key) => dictionary[key] !== undefined ? dictionary[key] : match);

        if(nativeRoot.value) {
            nativeRoot.value.innerHTML = renderedHtml;
        }

        const sys = {
            root: nativeRoot.value,
            path: bp,
            close: requestClose,
            toast: (msg) => { if(sysDialog) sysDialog.alert(msg, 'Toast'); else alert(msg); },
            alert: async (msg, title) => { if(sysDialog) sysDialog.alert(msg, title); else alert(msg); },
            theme: currentTheme.value,
            lang: currentLang,
            t: dictionary,
            reload: () => reloadApp(),
            setNav: (id) => { activeNav.value = id; },
            setSide: (id) => { activeSide.value = id; },
            setActionDock: (actions) => { if(appMenus.value) appMenus.value.actionDock = actions; },
            popup: openCustomPopup,
            closePopup: closeCustomPopup,
            copy: (text) => {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text).then(() => { if(sysDialog) sysDialog.alert("Copied to clipboard!", "Success"); });
                }
            },
            variables: {
                get: (name) => { console.warn('variables store is disabled'); return null; },
                save: async (name, value) => { console.warn('variables store is disabled'); return false; },
                getRequired: () => props.appData?.id ? appStore.getAppRequiredVars(props.appData.id) : [],
                getLabel: (name) => appStore.getKeyLabel(name)
            }
        };

        if(instance && instance.mount) {
            instance.mount(sys);
            appLogic.value = instance;
            loading.value = false;
        } else {
            throw new Error("Instance mount failed: Corrupted logic.");
        }
    } catch (e) {
        error.value = e.message;
        loading.value = false;
    }
};

const saveWindowConfig = () => {
    if (props.isDirectView || !storageKey.value) return;
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        const metrics = { x: pan.value.x, y: pan.value.y, w: size.value.w, h: size.value.h, scale: scale.value, internal: savedInternalState.value };
        sessionStorage.setItem(storageKey.value, JSON.stringify(metrics));
        emit('update-metrics', metrics);
    }, 500);
};

const loadWindowConfig = () => {
    if (props.isDirectView || !storageKey.value) return;
    const saved = sessionStorage.getItem(storageKey.value);
    if (saved) {
        try {
            const p = JSON.parse(saved);
            if (p.x) pan.value.x = p.x; if (p.y) pan.value.y = p.y;
            if (p.w) size.value.w = p.w; if (p.h) size.value.h = p.h;
            if (p.scale) scale.value = p.scale;
            if (p.internal) savedInternalState.value = p.internal;
        } catch (e) { }
    }
};

const handleInternalStateSave = (s) => { savedInternalState.value = s; saveWindowConfig(); };

onMounted(() => {
    initChromePolyfill();
    loadApp();

    window.addEventListener('message', handleIframeMessage);

    const h = document.querySelector('html');
    if(h){
        currentTheme.value = h.getAttribute('data-theme')||'dark';
        new MutationObserver(() => {
            const t = h.getAttribute('data-theme')||'dark';
            currentTheme.value = t;
            appLogic.value?.onThemeChange?.(t);
        }).observe(h, { attributes: true, attributeFilter: ['data-theme'] });
    }
});

onUnmounted(() => {
    appLogic.value?.unmount?.();
    window.removeEventListener('message', handleIframeMessage);
});
watch(() => props.url, loadApp);
</script>

<style scoped>
/* GUMMY V5.1 ENGINE STYLES (CARNIVAL) */
.app-content-wrapper {
    --win-bg: var(--bg-panel);
    --win-border: var(--border-color);
    --brand: #F72585;
    --yellow: #FEE440;
    --blue: #00BBF9;
    --green: #3DDC84;
    --text-dark: #1E1B4B;

    position: absolute;
    display: flex;
    flex-direction: column;
    background: var(--win-bg);
    border: 4px solid var(--win-border);
    border-radius: 2.5rem;
    overflow: hidden;
    padding: 44px 20px 50px 20px;
    box-sizing: border-box;
    pointer-events: auto;
    will-change: transform, width, height;
    transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.app-content-wrapper.is-dragging { cursor: grabbing; border-color: var(--brand); }
.app-content-wrapper.is-resizing { border-color: var(--blue); }

.app-screen {
    width: 100%;
    height: 100%;
    background: transparent;
    border-radius: 1.5rem;
    overflow: hidden;
    position: relative;
}

.app-layer {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.win-controls-group { display: flex; gap: 8px; align-items: center; }
.win-control-btn { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border-bottom: 3px solid rgba(0,0,0,0.2); transition: 0.1s; color: var(--text-dark); }
.win-control-btn:active { border-bottom-width: 0; transform: translateY(3px); }
.win-control-btn.close { background: var(--brand) !important; color: white; }
.win-control-btn.max { background: var(--blue) !important; color: white; }
.win-control-btn.reload-desk { background: var(--yellow) !important; color: var(--text-dark); }
.win-control-btn.fav.active { background: var(--green) !important; color: var(--text-dark); }
.win-control-btn.edit-app { background: #8A2BE2 !important; color: white; }

.app-drag-title { position: absolute; left: 50%; transform: translateX(-50%); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.5; pointer-events: none; }
.gesture-zone { position: absolute; pointer-events: auto; }
.gesture-zone.top { top: 0; left: 0; right: 0; height: 44px; cursor: grab; display: flex; align-items: center; padding: 0 16px; }
.gesture-zone.bottom { bottom: 0; left: 0; right: 0; height: 50px; cursor: ns-resize; display: flex; justify-content: center; align-items: flex-end; padding-bottom: 10px; }
.gesture-zone.left { top: 44px; bottom: 50px; left: 0; width: 20px; cursor: ew-resize; }
.gesture-zone.right { top: 44px; bottom: 50px; right: 0; width: 20px; cursor: ew-resize; }
.resize-corner { position: absolute; bottom: 0; right: 0; width: 30px; height: 30px; cursor: nwse-resize; z-index: 100; }
.home-indicator { width: 60px; height: 5px; background: var(--border-color); border-radius: 10px; opacity: 0.5; }

.state-overlay { position: absolute; inset: 0; background: var(--bg-core); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000; gap: 20px; }
.gummy-loader { width: 50px; height: 50px; border: 8px solid var(--border-color); border-top: 8px solid var(--brand); border-radius: 50%; animation: spin 1s infinite linear; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-card { width: 80%; padding: 30px; text-align: center; }
.error-msg { width: 100%; height: 100px; margin: 20px 0; padding: 15px; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
.error-actions { display: flex; gap: 10px; justify-content: center; }
.native-app-host { width: 100%; height: 100%; overflow-y: auto; scrollbar-width: none; }
.native-app-host::-webkit-scrollbar { display: none; }
.iframe-app-host { width: 100%; height: 100%; border: none; }

.triad-app-container { display: flex; flex-direction: column; height: 100%; width: 100%; }
.triad-top-bar { height: 60px; background: var(--bg-panel); border-bottom: 2px solid var(--win-border); display: flex; justify-content: space-between; align-items: center; padding: 0 15px; flex-shrink: 0; z-index: 50; }
.text-brand { color: var(--brand); }
.font-display { font-family: 'Fredoka', sans-serif; font-weight: 900; }

.triad-layout-body { flex: 1; display: flex; position: relative; overflow: hidden; height: 100%; width: 100%; }
.triad-sidebar { width: 70px; background: var(--bg-panel); border-right: 2px solid var(--win-border); display: flex; flex-direction: column; align-items: center; padding-top: 15px; gap: 5px; flex-shrink: 0; overflow-y: auto; }
.side-btn { background: none; border: none; color: #94A3B8; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 10px 0; width: 100%; cursor: pointer; font-size: 9px; font-weight: 800; border-left: 3px solid transparent; transition: 0.2s; }
.side-btn.active { color: var(--brand); border-left-color: var(--brand); background: rgba(0,0,0,0.2); }
.side-icon { font-size: 18px; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; border-radius: 0.8rem; }
.side-btn.active .side-icon { background: var(--brand); color: #1E1B4B; box-shadow: inset 0 -3px 0 rgba(0,0,0,0.2); }

.triad-workspace { flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden; height: 100%; }
.triad-scroll { flex: 1; overflow-y: auto; padding-bottom: 120px; }

.triad-dock-wrapper { position: absolute; bottom: 0; left: 0; width: 100%; z-index: 50; display: flex; flex-direction: column; align-items: center; }
.action-dock-outer { width: 100%; background: var(--bg-panel); border-top: 2px solid var(--win-border); padding: 8px 10px; display: flex; align-items: center; gap: 8px; }
.action-dock-inner { flex: 1; display: flex; gap: 10px; overflow-x: auto; padding: 5px 0; scrollbar-width: none; }
.action-dock-inner::-webkit-scrollbar { display: none; }

.btn-icon { background: var(--brand); color: #1E1B4B; border: 2px solid var(--win-border); border-bottom: 4px solid rgba(0,0,0,0.3); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.btn-icon:active { transform: translateY(3px); border-bottom-width: 1px; }
.btn-danger { background: #FF006E; color: #FFF; }
.btn-yellow { background: #FEE440; } .btn-green { background: #3DDC84; } .btn-blue { background: #00BBF9; } .btn-gray { background: #64748B; }

.triad-popup-overlay { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.85); z-index: 200000; display: flex; align-items: center; justify-content: center; padding: 15px; }
.universal-green-pop { background: #3DDC84 !important; border: 4px solid #1E1B4B !important; border-radius: 25px !important; box-shadow: 0 15px 0 #000 !important; color: #1E1B4B !important; }
.triad-popup-card { display: flex; flex-direction: column; overflow: hidden; max-height: 90%; }
.triad-popup-header { padding: 12px 20px; border-bottom: 3px solid rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; font-family: 'Fredoka', sans-serif; font-weight: 900; text-transform: uppercase; }
.btn-pop-close { width: 30px; height: 30px; border-radius: 50%; border: none; background: #FF006E; color: white; font-weight: 900; cursor: pointer; box-shadow: inset 0 -3px 0 rgba(0,0,0,0.2); }
.triad-popup-content { padding: 20px; overflow-y: auto; font-weight: 800; }
</style>
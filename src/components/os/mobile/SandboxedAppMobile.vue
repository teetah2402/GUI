//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/components/os/mobile/SandboxedAppMobile.vue
// STYLE     : Mobile First (Touch Drag, Auto Center, No Border Resize)
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="app-content-wrapper-m immersive-mode-m"
        :data-theme="currentTheme"
        :style="computedStyle"
        @mousedown="handleMouseDown">

    <div class="app-screen-m">
        <div class="app-layer-m">

            <div v-if="appType === 'native' && appMenus" class="triad-app-container-m">
                <header class="triad-top-bar-m">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <h1 class="font-display-m text-lg font-black italic" style="margin:0;">
                            {{ appDict.appName }}<span class="text-brand-m">{{ appDict.appNameHl }}</span>
                        </h1>
                    </div>
                    <div class="flex-actions-m">
                        <button @click="reloadApp" class="btn-icon-m bouncy-fx-m" style="width:30px; height:30px; font-size:12px;">🔄</button>
                    </div>
                </header>

                <div class="triad-layout-body-m">
                    <aside v-if="appMenus?.sidebar?.length" class="triad-sidebar-m hide-scrollbar">
                        <button v-for="btn in appMenus.sidebar" :key="btn.id"
                                class="side-btn-m" :class="{ active: activeSide === btn.id }"
                                @click="handleMenuClick(btn.id)"
                                :title="appDict[btn.labelKey]">
                            <div class="side-icon-m">{{ btn.icon }}</div>
                        </button>
                    </aside>

                    <div class="triad-workspace-m">
                        <div id="app-native-root" ref="nativeRoot" class="native-app-host-m custom-scroll triad-scroll-m"></div>

                        <div v-if="appMenus" class="triad-dock-wrapper-m">
                            <div v-if="appMenus?.actionDock?.length" class="action-dock-outer-m bouncy-up-m">
                                <div class="action-dock-inner-m hide-scrollbar" ref="actionDockRef">
                                    <button v-for="btn in appMenus.actionDock" :key="btn.id"
                                            @click="handleMenuClick(btn.id)"
                                            class="btn-icon-m bouncy-fx-m" :class="btn.color ? 'btn-' + btn.color + '-m' : ''">
                                        {{ btn.icon }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="appType === 'native' && !appMenus" ref="nativeRoot" class="native-app-host-m custom-scroll"></div>

            <iframe v-else-if="appType === 'iframe'" ref="iframeRef" @load="injectChromePolyfill" :src="activeUrl" class="iframe-app-host-m" frameborder="0"></iframe>

            <EngineRenderer v-else-if="appType === 'logic'" :schema="uiSchema" :initial-state="savedInternalState" @state-change="handleInternalStateSave" @action="handleAppAction" />
        </div>

        <Transition name="sys-pop">
            <div v-if="customPopup.active" class="triad-popup-overlay-m">
                <div class="triad-popup-card-m universal-green-pop-m" :style="{ width: '90%' }">
                    <div class="triad-popup-header-m">
                        <span>{{ customPopup.title }}</span>
                        <button @click="closeCustomPopup" class="btn-pop-close-m">✖</button>
                    </div>
                    <div :id="'triad-popup-body-' + uniqueId" class="triad-popup-content-m custom-scroll"></div>
                </div>
            </div>
        </Transition>

        <div v-if="loading" class="state-overlay-m">
            <div class="gummy-loader-m"></div>
            <span class="font-display-m tracking-[0.2em] uppercase text-xs">Booting Engine...</span>
        </div>

        <div v-if="error" class="state-overlay-m error-m">
            <div class="error-card-m gummy-board-m">
                <div class="error-title-m font-display-m">SYSTEM CRASH 💀</div>
                <textarea class="error-msg-m input-carved-m" readonly>{{ error }}</textarea>
                <div class="error-actions-m">
                    <button @click="reloadApp" class="btn-game-m">RELOAD</button>
                </div>
            </div>
        </div>
    </div>

    <div class="frame-controls-m" v-if="!isDirectView">
         <div class="gesture-zone-m top-m">
            <div class="win-controls-group-m">
                <button class="win-control-btn-m close-m" @click.stop="requestClose"><i class="mdi mdi-close"></i></button>

                <button v-if="url && url.startsWith('virtual://')" class="win-control-btn-m edit-app-m" @click.stop="$emit('edit-app', appData)">
                    <i class="mdi mdi-pencil"></i>
                </button>

                <div class="win-sep-m"></div>
                <button class="win-control-btn-m reload-desk-m" @click.stop="reloadApp"><i class="mdi mdi-refresh"></i></button>
                <button class="win-control-btn-m fav-m" :class="{ 'active': isFav }" @click.stop="$emit('toggle-favorite')">
                    <i class="mdi" :class="isFav ? 'mdi-star' : 'mdi-star-outline'"></i>
                </button>
            </div>
            <div class="app-drag-title-m font-display-m">{{ appData?.name || 'App' }}</div>
         </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, defineAsyncComponent, shallowRef, nextTick, inject, reactive } from 'vue';
import { useAppStore } from '@/store/apps';
import { useUiStore } from '@/store/ui';
import { initChromePolyfill } from '@/utils/chromePolyfill';
import { executeEngineTask } from '@/utils/systemBridge';

const EngineRenderer = defineAsyncComponent(() => import('@/components/engine/EngineRenderer.vue'));

const props = defineProps(['url', 'globalScale', 'initialX', 'initialY', 'initialScale', 'uniqueId', 'zIndex', 'isFav', 'isDirectView', 'appData', 'isSidebarOpen']);
const emit = defineEmits(['close', 'action', 'mousedown', 'update-metrics', 'toggle-favorite', 'edit-app']);

const sysDialog = inject('sys-dialog');
const appStore = useAppStore();
const uiStore = useUiStore();

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

const pan = ref({ x: props.initialX || 0, y: props.initialY || 0 });
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

const customPopup = reactive({ active: false, title: '', content: '', onMounted: null });
const closeCustomPopup = () => { customPopup.active = false; customPopup.content = ''; };
const openCustomPopup = async (config) => {
    customPopup.title = config.title || 'App Dialog';
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
    try { doc = event.target.contentDocument || win.document; } catch (e) { return; }

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
    return {
        width: `100%`,
        height: `100%`,
        transform: `translate(${pan.value.x}px, 0px) scale(1)`,
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: props.zIndex || 10,
        borderRadius: 0,
        border: 'none',
        boxShadow: 'none',
        paddingBottom: uiStore.isMobileDockOpen ? '80px' : '0px',
        transition: 'padding-bottom 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
    };
});

const handleMouseDown = () => { emit('mousedown'); };
const requestClose = () => emit('close');

const loadApp = async () => {
    if(!props.url) return;
    loading.value = true; error.value = null; appMenus.value = null; loadWindowConfig();
    await loadScriptApp();
};

const reloadApp = () => {
    if(appLogic.value?.unmount) try{appLogic.value.unmount()}catch(e){}
    loading.value = true; appMenus.value = null;
    setTimeout(() => { loadApp(); }, 300);
};

const handleIframeMessage = async (event) => {
    if (!iframeRef.value || event.source !== iframeRef.value.contentWindow) return;
    const data = event.data;
    if (!data) return;

    if (data.type === 'FLOWORK_ENGINE_TASK') {
        try {
            const response = await executeEngineTask(data.taskName, data.payload);
            if (iframeRef.value && iframeRef.value.contentWindow) {
                iframeRef.value.contentWindow.postMessage({ type: 'FLOWORK_ENGINE_RESULT', taskId: data.taskId, response: response }, '*');
            }
        } catch (err) {
            if (iframeRef.value && iframeRef.value.contentWindow) {
                iframeRef.value.contentWindow.postMessage({ type: 'FLOWORK_ENGINE_RESULT', taskId: data.taskId, error: err.message }, '*');
            }
        }
    }

    if (data.type === 'FLOWORK_DOWNLOAD' && data.payload) {
        const a = document.createElement('a'); a.href = data.payload.data; a.download = data.payload.name;
        document.body.appendChild(a); a.click(); setTimeout(() => document.body.removeChild(a), 500);
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
                        templateHtml: '<div style="padding:20px; color:white; text-align:center;"><h2>🚀 Mobile Sandbox</h2><button id="btn-test">Click Me</button></div>',
                        logicJs: 'return { mount(sys) { sys.root.querySelector("#btn-test").onclick = () => sys.toast("Custom App Works on Mobile!"); } }'
                    };
                } else {
                    throw new Error(`Custom App [${vId}] missing in RAM!`);
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
                } catch(err2) { throw new Error("Syntax Error in JS: " + err1.message); }
            }

            appMenus.value = instance?.menus || null;
            await nextTick();

            if (nativeRoot.value) nativeRoot.value.innerHTML = vApp.templateHtml;

            const currentLang = localStorage.getItem('flowork_lang') || 'en';
            const sys = {
                root: nativeRoot.value, path: 'virtual', close: requestClose,
                toast: (msg) => { if(sysDialog) sysDialog.alert(msg, 'Toast'); else alert(msg); },
                alert: async (msg, title) => { if(sysDialog) sysDialog.alert(msg, title); else alert(msg); },
                theme: currentTheme.value, lang: currentLang, t: {}, reload: () => reloadApp(),
                setNav: (id) => { activeNav.value = id; }, setSide: (id) => { activeSide.value = id; },
                setActionDock: (actions) => { if(appMenus.value) appMenus.value.actionDock = actions; },
                popup: openCustomPopup, closePopup: closeCustomPopup,
                copy: (text) => { if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => { if(sysDialog) sysDialog.alert("Copied to clipboard!", "Success"); }); },
                download: (filename, base64Data) => { const a = document.createElement('a'); a.href = base64Data; a.download = filename; a.click(); },
                variables: { get: () => null, save: async () => false, getRequired: () => [], getLabel: (name) => name }
            };

            if (instance && instance.mount) {
                instance.mount(sys); appLogic.value = instance; loading.value = false;
            } else { throw new Error("Virtual App Error: mount() not found."); }
            return;
        }

        if (props.appData?.is_local) {
            appType.value = 'iframe'; activeUrl.value = props.url; loading.value = false; return;
        }

        let bp = props.url.replace('/index.html', '').replace('/mobile.html', '').replace('/logic.js', '');
        if (bp.endsWith('/')) bp = bp.slice(0, -1);
        if(bp.includes('/desktop/') || bp.includes('/mobile/')) { bp = bp.replace('/desktop/', '/store/').replace('/mobile/', '/store/'); }

        const resHtml = await fetch(`${bp}/template.html?t=${Date.now()}`);
        const templateStrRaw = resHtml.ok ? await resHtml.text() : '';
        const isSpaFallback = templateStrRaw.trim().toLowerCase().startsWith('<!doctype');

        if (!resHtml.ok || isSpaFallback) {
            let entryFile = null;

            try {
                const resMobile = await fetch(`${bp}/mobile.html?t=${Date.now()}`);
                if (resMobile.ok) {
                    const mobileText = await resMobile.clone().text();
                    if (mobileText.includes('app.js')) {
                        entryFile = 'mobile.html';
                    }
                }
            } catch (e) { console.warn('[OS Mobile] Cek mobile.html gagal'); }

            if (!entryFile) {
                 entryFile = 'mobile.html';
                 try {
                    const manifestRes = await fetch(`${bp}/manifest.json?t=${Date.now()}`);
                    if (manifestRes.ok) {
                        const manifestText = await manifestRes.text();
                        if (!manifestText.trim().startsWith('<')) {
                            const manifest = JSON.parse(manifestText);
                            if (manifest.action && manifest.action.default_popup) entryFile = manifest.action.default_popup;
                            else if (manifest.browser_action && manifest.browser_action.default_popup) entryFile = manifest.browser_action.default_popup;
                            else if (manifest.side_panel && manifest.side_panel.default_path) entryFile = manifest.side_panel.default_path;
                        } else {
                            const resPopup = await fetch(`${bp}/popup.html?t=${Date.now()}`);
                            if(resPopup.ok && !(await resPopup.clone().text()).trim().toLowerCase().startsWith('<!doctype')) entryFile = 'popup.html';
                        }
                    } else {
                        const resPopup = await fetch(`${bp}/popup.html?t=${Date.now()}`);
                        if(resPopup.ok) entryFile = 'popup.html';
                    }
                } catch (e) {}
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
            appType.value = 'iframe'; loading.value = false; return;
        }

        const [resI18n, resLogic] = await Promise.all([fetch(`${bp}/i18n.json?t=${Date.now()}`), fetch(`${bp}/logic.js?t=${Date.now()}`)]);
        let appI18n = {};
        if (resI18n.ok) {
            const i18nText = await resI18n.text();
            if (!i18nText.trim().startsWith('<')) { try { appI18n = JSON.parse(i18nText); } catch(e) {} }
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
        } else { appMenus.value = null; }

        await nextTick();

        const currentLang = localStorage.getItem('flowork_lang') || 'en';
        const dictionary = appI18n[currentLang] || appI18n['en'] || appI18n['id'] || {};
        appDict.value = dictionary;

        let renderedHtml = templateStrRaw.replace(/\{\{t\.([\w_]+)\}\}/g, (match, key) => dictionary[key] !== undefined ? dictionary[key] : match);
        if(nativeRoot.value) nativeRoot.value.innerHTML = renderedHtml;

        const sys = {
            root: nativeRoot.value, path: bp, close: requestClose,
            toast: (msg) => { if(sysDialog) sysDialog.alert(msg, 'Toast'); else alert(msg); },
            alert: async (msg, title) => { if(sysDialog) sysDialog.alert(msg, title); else alert(msg); },
            theme: currentTheme.value, lang: currentLang, t: dictionary, reload: () => reloadApp(),
            setNav: (id) => { activeNav.value = id; }, setSide: (id) => { activeSide.value = id; },
            setActionDock: (actions) => { if(appMenus.value) appMenus.value.actionDock = actions; },
            popup: openCustomPopup, closePopup: closeCustomPopup,
            copy: (text) => { if (navigator.clipboard) { navigator.clipboard.writeText(text).then(() => { if(sysDialog) sysDialog.alert("Copied!", "Success"); }); } },
            variables: { get: () => null, save: async () => false, getRequired: () => props.appData?.id ? appStore.getAppRequiredVars(props.appData.id) : [], getLabel: (name) => appStore.getKeyLabel(name) }
        };

        if(instance && instance.mount) {
            instance.mount(sys); appLogic.value = instance; loading.value = false;
        } else { throw new Error("Instance mount failed."); }
    } catch (e) { error.value = e.message; loading.value = false; }
};

const saveWindowConfig = () => {
    if (props.isDirectView || !storageKey.value) return;
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        const metrics = { x: pan.value.x, y: pan.value.y, scale: scale.value, internal: savedInternalState.value };
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
            if (p.x) pan.value.x = p.x;
            if (p.scale) scale.value = p.scale;
            if (p.internal) savedInternalState.value = p.internal;
        } catch (e) { }
    }
};

const handleInternalStateSave = (s) => { savedInternalState.value = s; saveWindowConfig(); };

onMounted(() => {
    initChromePolyfill(); loadApp();
    window.addEventListener('message', handleIframeMessage);
    const h = document.querySelector('html');
    if(h){
        currentTheme.value = h.getAttribute('data-theme')||'dark';
        new MutationObserver(() => {
            const t = h.getAttribute('data-theme')||'dark';
            currentTheme.value = t; appLogic.value?.onThemeChange?.(t);
        }).observe(h, { attributes: true, attributeFilter: ['data-theme'] });
    }
});

onUnmounted(() => {
    appLogic.value?.unmount?.();
    window.removeEventListener('message', handleIframeMessage);
});
watch(() => props.url, loadApp);
watch(() => props.initialX, (newVal) => { pan.value.x = newVal; });
</script>

<style scoped>
.app-content-wrapper-m {
    --win-bg: var(--bg-panel, #121212);
    --win-border: var(--border-color, #333);
    --brand: #00ffcc; --yellow: #FEE440; --blue: #00BBF9; --green: #3DDC84;
    --text-dark: #000;

    position: absolute; display: flex; flex-direction: column;
    background: var(--win-bg); border: 2px solid var(--win-border);
    border-radius: 1.5rem; overflow: hidden;
    padding: 35px 5px 5px 5px; box-sizing: border-box;
    pointer-events: auto; will-change: transform;
    transition: box-shadow 0.3s ease, border-color 0.3s ease;
}
.app-content-wrapper-m.is-dragging-m { border-color: var(--brand); }
.app-screen-m { width: 100%; height: 100%; background: transparent; border-radius: 1rem; overflow: hidden; position: relative; }
.app-layer-m { width: 100%; height: 100%; overflow: hidden; }

.win-controls-group-m { display: flex; gap: 8px; align-items: center; }
.win-control-btn-m { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; border: none; color: var(--text-dark); transition: 0.1s; }
.win-control-btn-m.close-m { background: #FF006E; color: white; }
.win-control-btn-m.max-m { background: var(--blue); color: white; }
.win-control-btn-m.reload-desk-m { background: var(--yellow); }
.win-control-btn-m.fav-m.active { background: var(--green); }
.win-control-btn-m.edit-app-m { background: #8A2BE2; color: white; }

.app-drag-title-m { position: absolute; left: 50%; transform: translateX(-50%); font-size: 0.7rem; font-weight: 800; opacity: 0.6; pointer-events: none; white-space: nowrap; max-width: 120px; overflow: hidden; text-overflow: ellipsis; }
.gesture-zone-m { position: absolute; pointer-events: auto; }
.gesture-zone-m.top-m { top: 0; left: 0; right: 0; height: 35px; display: flex; align-items: center; padding: 0 10px; }

.state-overlay-m {
    position: absolute; inset: 0; background: rgba(0,0,0,0.95);
    /* USER RULE #1: Remove blur */
    /* backdrop-filter: blur(5px); */
    display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000; gap: 15px; color: #fff;
}

.gummy-loader-m { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid var(--brand); border-radius: 50%; animation: spinM 1s infinite linear; }
@keyframes spinM { to { transform: rotate(360deg); } }
.error-card-m { width: 90%; padding: 20px; text-align: center; background: rgba(20,0,0,0.9); border: 1px solid #FF006E; border-radius: 15px; }
.error-msg-m { width: 100%; height: 80px; margin: 15px 0; padding: 10px; font-family: monospace; font-size: 10px; background: rgba(0,0,0,0.5); color: #FF006E; border: none; }
.btn-game-m { background: #FF006E; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; }

.native-app-host-m { width: 100%; height: 100%; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.iframe-app-host-m { width: 100%; height: 100%; border: none; }

.triad-app-container-m { display: flex; flex-direction: column; height: 100%; width: 100%; }
.triad-top-bar-m { height: 50px; background: var(--bg-panel); border-bottom: 1px solid var(--win-border); display: flex; justify-content: space-between; align-items: center; padding: 0 10px; z-index: 50; }
.text-brand-m { color: var(--brand); }
.triad-layout-body-m { flex: 1; display: flex; position: relative; overflow: hidden; height: 100%; width: 100%; }

.triad-sidebar-m { width: 50px; background: rgba(0,0,0,0.2); border-right: 1px solid var(--win-border); display: flex; flex-direction: column; align-items: center; padding-top: 10px; gap: 5px; overflow-y: auto; }
.side-btn-m { background: none; border: none; color: #94A3B8; padding: 10px 0; width: 100%; cursor: pointer; border-left: 2px solid transparent; }
.side-btn-m.active { color: var(--brand); border-left-color: var(--brand); background: rgba(255,255,255,0.05); }
.side-icon-m { font-size: 16px; display: flex; justify-content: center; }

.triad-workspace-m { flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden; height: 100%; }
.triad-scroll-m { flex: 1; overflow-y: auto; padding-bottom: 60px; -webkit-overflow-scrolling: touch; }

.triad-dock-wrapper-m { position: absolute; bottom: 0; left: 0; width: 100%; z-index: 50; }
.action-dock-outer-m { width: 100%; background: var(--bg-panel); border-top: 1px solid var(--win-border); padding: 5px; display: flex; justify-content: center; }
.action-dock-inner-m { display: flex; gap: 10px; overflow-x: auto; padding: 5px; scrollbar-width: none; }
.btn-icon-m { background: var(--brand); color: #000; border: 1px solid rgba(0,0,0,0.5); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }

.triad-popup-overlay-m { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.8); z-index: 200000; display: flex; align-items: center; justify-content: center; }
.universal-green-pop-m { background: #3DDC84 !important; border-radius: 20px; overflow: hidden; }
.triad-popup-header-m { padding: 12px 15px; border-bottom: 2px solid rgba(0,0,0,0.1); display: flex; justify-content: space-between; font-weight: bold; color: #000; }
.btn-pop-close-m { background: #FF006E; color: #fff; border: none; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.triad-popup-content-m { padding: 15px; max-height: 60vh; overflow-y: auto; color: #000; }
.hide-scrollbar::-webkit-scrollbar { display: none; }
</style>
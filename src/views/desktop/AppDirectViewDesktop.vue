//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/views/desktop/AppDirectViewDesktop.vue
//#######################################################################

<template>
  <div class="os-root" :data-theme="currentTheme">
    <div class="os-bg">
        <div v-if="currentTheme !== 'light'" class="cyberpunk-scene">
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

    <div class="os-body-wrapper">
      <div class="os-body">
          <div class="os-main">
              <div class="os-viewport">
                    <div class="os-world">
                      <div class="single-app-wrapper full-screen-mode">

                          <div class="app-content-layer custom-scroll" :class="{'triad-active': appMenus}" v-show="!booting && !error && !deviceMismatch">

                              <header v-if="appMenus" class="triad-top-bar">
                                  <div style="display: flex; align-items: center; gap: 15px;">
                                      </div>
                                  </header>

                              <div :class="appMenus ? 'triad-layout-body' : 'legacy-body'">

                                  <aside v-if="appMenus?.sidebar?.length && !showLander" class="triad-sidebar custom-scrollbar">
                                      <button v-for="btn in appMenus.sidebar" :key="btn.id"
                                              class="side-btn" :class="{ active: activeSide === btn.id }"
                                              @click="handleMenuClick(btn.id)"
                                              :title="appDict[btn.labelKey]">
                                          <div class="side-icon">{{ btn.icon }}</div>
                                          <span>{{ appDict[btn.labelKey] }}</span>
                                      </button>
                                  </aside>

                                  <div :class="appMenus ? 'triad-workspace' : 'legacy-workspace'">

                                      <div v-show="showLander" class="lander-workspace custom-scrollbar">
                                          <div class="floating-stickers">
                                              <div class="sticker s1">🌟</div>
                                              <div class="sticker s2">✨</div>
                                              <div class="sticker s3">🚀</div>
                                              <div class="sticker s4">💥</div>
                                              <div class="sticker s5">🔥</div>
                                              <div class="sticker s6">💎</div>
                                              <div class="sticker s7">🍭</div>
                                              <div class="sticker s8">🌈</div>
                                          </div>

                                          <div class="lander-hero-container">
                                              <div class="organic-bg-blob blob-1"></div>
                                              <div class="organic-bg-blob blob-2"></div>

                                              <div class="bubble-gum-typography" v-html="landerContent" @click="handleLanderClick"></div>

                                              <button @click="startApp" class="btn-bubble-cta bottom-cta">🔥 LAUNCH APPLICATION</button>
                                          </div>
                                      </div>

                                      <div v-show="!showLander" style="width:100%; height:100%; display:flex; flex-direction:column;">
                                          <iframe ref="iframeRef" v-if="appType === 'iframe'" :src="appUrl" class="iframe-full" frameborder="0" @load="injectPolyfillIntoIframe"></iframe>
                                      </div>

                                      <div v-if="appMenus" class="triad-dock-wrapper">
                                          <div v-show="!showLander && appMenus?.actionDock?.length" class="action-dock-outer bouncy-up">
                                              <button class="btn-icon bouncy-fx" style="background: var(--bg-panel); color: var(--text-main); font-size:12px; width:35px; min-width:35px;" @click="scrollDock(-100)">❮</button>

                                              <div class="action-dock-inner custom-scrollbar" ref="actionDockRef">
                                                  <button v-for="btn in appMenus.actionDock" :key="btn.id"
                                                          @click="handleMenuClick(btn.id)"
                                                          class="btn-icon bouncy-fx" :class="btn.color ? 'btn-' + btn.color : ''"
                                                          :title="appDict[btn.labelKey]">
                                                      {{ btn.icon }}
                                                  </button>
                                              </div>

                                              <button class="btn-icon bouncy-fx" style="background: var(--bg-panel); color: var(--text-main); font-size:12px; width:35px; min-width:35px;" @click="scrollDock(100)">❯</button>
                                          </div>

                                          <nav v-if="appMenus?.mainDock?.length" class="main-dock">
                                              <button v-for="btn in appMenus.mainDock" :key="btn.id"
                                                      class="bouncy-fx" :class="{ active: activeNav === btn.id }"
                                                      @click="handleMenuClick(btn.id)">
                                                  <div class="nav-icon">{{ btn.icon }}</div>
                                                  <span>{{ appDict[btn.labelKey] }}</span>
                                              </button>
                                          </nav>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <Transition name="sys-pop">
                              <div v-if="customPopup.active" class="triad-popup-overlay">
                                  <div class="triad-popup-card universal-green-pop" :style="{ width: customPopup.width }">
                                      <div class="triad-popup-header">
                                          <span>{{ customPopup.title }}</span>
                                          <button @click="closeCustomPopup" class="btn-pop-close">✖</button>
                                      </div>
                                      <div id="triad-popup-body" class="triad-popup-content custom-scroll">
                                          </div>
                                  </div>
                              </div>
                          </Transition>

                          <Transition name="fade">
                            <div v-if="booting" class="state-overlay skeleton-boot">
                                <div class="skeleton-header"></div>
                                <div class="skeleton-body">
                                    <div class="skeleton-row w-75"></div>
                                    <div class="skeleton-row w-100"></div>
                                    <div class="skeleton-row w-50"></div>
                                </div>
                                <div class="loading-text">
                                    <div class="spinner-sm mr-2"></div> System Initializing...
                                </div>
                            </div>
                          </Transition>

                          <div v-if="error" class="state-overlay error">
                              <div class="err-icon">⚠️</div>
                              <div class="err-msg">{{ error }}</div>
                              <div class="err-sub">Silakan periksa konfigurasi addon atau terminal backend Anda.</div>
                              <div class="flex gap-2 mt-4">
                                <button @click="retryBoot" class="sys-btn secondary">Retry</button>
                                <button @click="goHome" class="sys-btn primary">EXIT</button>
                              </div>
                          </div>
                      </div>
                    </div>
              </div>
          </div>
      </div>
    </div>

    <Transition name="sys-pop">
      <div v-if="sysModal.active" class="sys-modal-backdrop" @mousedown.self="shakeModal">
        <div class="sys-modal-card universal-green-pop" :class="{ 'shake': sysModal.shaking }">
          <div class="sys-modal-header"><span>{{ sysModal.title }}</span></div>
          <div class="sys-modal-body"><p>{{ sysModal.message }}</p></div>
          <div class="sys-modal-footer">
            <button v-if="sysModal.type === 'confirm'" @click="resolveModal(false)" class="sys-btn secondary-dark">Cancel</button>
            <button @click="resolveModal(true)" class="sys-btn primary-dark">OK</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="sys-pop">
      <div v-if="extPopup.active" class="sys-modal-backdrop" @mousedown.self="shakeExtModal">
        <div class="sys-modal-card universal-green-pop" style="background: #FF006E !important; border-color: #1E1B4B !important;" :class="{ 'shake': extPopup.shaking }">
          <div class="sys-modal-header" style="color: white !important;"><span>{{ extPopupContent.title }}</span></div>
          <div class="sys-modal-body" style="color: white !important;">
            <p>{{ extPopupContent.body1 }}</p>
            <p style="font-size: 0.8rem; opacity: 0.8;">{{ extPopupContent.body2 }}</p>
          </div>
          <div class="sys-modal-footer">
            <button @click="extPopup.active = false" class="sys-btn secondary-dark" style="background: rgba(255,255,255,0.2); border-color: white; color: white;">{{ extPopupContent.btnClose }}</button>
            <a href="https://floworkos.com/extension" target="_blank" @click="extPopup.active = false" class="sys-btn primary-dark" style="background: #FEE440; color: #1E1B4B; text-decoration: none; display: flex; align-items: center; justify-content: center;">{{ extPopupContent.btnDownload }}</a>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="sys-pop">
      <div v-if="extUpdatePopup.active" class="sys-modal-backdrop" @mousedown.self="shakeExtUpdateModal">
        <div class="sys-modal-card universal-green-pop" style="background: #00BBF9 !important; border-color: #1E1B4B !important;" :class="{ 'shake': extUpdatePopup.shaking }">
          <div class="sys-modal-header" style="color: white !important;"><span>{{ extUpdatePopupContent.title }}</span></div>
          <div class="sys-modal-body" style="color: white !important;">
            <p>{{ extUpdatePopupContent.body1 }}</p>
            <p style="font-size: 0.8rem; opacity: 0.8;">{{ extUpdatePopupContent.body2 }}</p>
          </div>
          <div class="sys-modal-footer">
            <button @click="extUpdatePopup.active = false" class="sys-btn secondary-dark" style="background: rgba(255,255,255,0.2); border-color: white; color: white;">{{ extUpdatePopupContent.btnClose }}</button>
            <a href="https://floworkos.com/extension" target="_blank" @click="extUpdatePopup.active = false" class="sys-btn primary-dark" style="background: #1E1B4B; color: #FFFFFF; text-decoration: none; display: flex; align-items: center; justify-content: center;">{{ extUpdatePopupContent.btnDownload }}</a>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import MarkdownIt from 'markdown-it';
import { useAppStore } from '@/store/apps';
import { useUiStore } from '@/store/ui';
import { initChromePolyfill } from '@/utils/chromePolyfill';
import { executeEngineTask } from '@/utils/systemBridge';
import { useSocketStore } from '@/store/socket';

const props = defineProps(['appSlug']);
const router = useRouter();
const appStore = useAppStore();
const uiStore = useUiStore();
const socketStore = useSocketStore();

const booting = ref(true);
const error = ref(null);
const currentTheme = ref('dark');
const deviceMismatch = ref(false);

const actionDockRef = ref(null);
const appMenus = ref(null);
const appDict = ref({});
const activeNav = ref('');
const activeSide = ref('');

const addonDependencies = ref({});
const iframeRef = ref(null);

let scrollObserver = null;
const showLander = ref(false);
const landerContent = ref('');

const extPopup = reactive({ active: false, shaking: false });
const shakeExtModal = () => { extPopup.shaking = true; setTimeout(() => extPopup.shaking = false, 300); };

const extUpdatePopup = reactive({ active: false, shaking: false });
const shakeExtUpdateModal = () => { extUpdatePopup.shaking = true; setTimeout(() => extUpdatePopup.shaking = false, 300); };

const extPopupContent = computed(() => {
    const isID = uiStore.currentLang === 'id';
    return {
        title: isID ? 'Koneksi Gagal' : 'Connection Failed',
        body1: isID
            ? 'Aplikasi ini membutuhkan Flowork OS Bridge untuk berjalan dengan performa maksimal (God Mode).'
            : 'This application requires Flowork OS Bridge to run with maximum performance (God Mode).',
        body2: isID
            ? 'Silakan unduh dan pasang ekstensi melalui link di bawah ini.'
            : 'Please download and install the extension via the link below.',
        btnClose: isID ? 'Tutup' : 'Close',
        btnDownload: isID ? 'UNDUH' : 'DOWNLOAD'
    };
});

const extUpdatePopupContent = computed(() => {
    const isID = uiStore.currentLang === 'id';
    return {
        title: isID ? 'Pembaruan Wajib' : 'Update Required',
        body1: isID
            ? 'Versi Ekstensi Flowork OS Bridge Anda sudah usang. Mohon diperbarui agar aplikasi ini bisa berjalan.'
            : 'Your Flowork OS Bridge Extension is outdated. Please update it so this app can run.',
        body2: isID
            ? 'Silakan unduh versi terbaru melalui tautan di bawah ini.'
            : 'Please download the latest version from the link below.',
        btnClose: isID ? 'Tutup' : 'Close',
        btnDownload: isID ? 'PERBARUI SEKARANG' : 'UPDATE NOW'
    };
});

const isVersionLower = (installedVer, requiredVer) => {
    if (!installedVer) return true;
    const p1 = installedVer.split('.').map(Number);
    const p2 = requiredVer.split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const n1 = p1[i] || 0;
        const n2 = p2[i] || 0;
        if (n1 < n2) return true;
        if (n1 > n2) return false;
    }
    return false;
};

const checkExtensionConnection = () => {
    return new Promise((resolve) => {
        if (window.chrome?.runtime?.sendMessage) {
            const timeout = setTimeout(() => resolve({ connected: false, version: null }), 1000);
            try {
                window.chrome.runtime.sendMessage({ action: "ping" }, (res) => {
                    clearTimeout(timeout);
                    if (res && res.status === "connected") {
                        window.__floworkBridgeConnected = true;
                        resolve({ connected: true, version: res.version || "1.0.0" });
                    } else {
                        resolve({ connected: false, version: null });
                    }
                });
            } catch (e) {
                clearTimeout(timeout);
                resolve({ connected: false, version: null });
            }
        } else {
            if (window.__floworkBridgeConnected === true) {
                resolve({ connected: true, version: "1.0.0" });
            } else {
                resolve({ connected: false, version: null });
            }
        }
    });
};

const startApp = async () => {
    if (targetApp.value?.extention === 'needed') {
        const extStatus = await checkExtensionConnection();

        if (!extStatus.connected) {
            extPopup.active = true;
            return;
        }

        try {
            const regRes = await fetch('https://floworkos.com/store/registry.json?t=' + Date.now());
            const regData = await regRes.json();

            if (regData && regData.meta && regData.meta.extension_ver) {
                const requiredVer = regData.meta.extension_ver;
                const installedVer = extStatus.version;

                if (isVersionLower(installedVer, requiredVer)) {
                    extUpdatePopup.active = true;
                    return;
                }
            }
        } catch (e) {
            console.warn("Gagal mengambil meta version dari registry:", e);
        }
    }

    showLander.value = false;
    activeNav.value = 'sys_app';
};

const handleLanderClick = (e) => {
    if (e.target.closest('.injected-cta')) {
        startApp();
    }
};

const targetApp = ref(null);
const appType = ref('iframe');
const appUrl = ref('');
const customPopup = reactive({ active: false, title: '', width: '400px', content: '', onMounted: null });

const sysModal = reactive({ active: false, shaking: false, title: '', message: '', type: 'alert', resolve: null });
const triggerModal = (message, title='System', type='alert') => new Promise(resolve => { sysModal.active = true; sysModal.title = title; sysModal.message = message; sysModal.type = type; sysModal.resolve = resolve; });
const resolveModal = (res) => { sysModal.active = false; if(sysModal.resolve) sysModal.resolve(res); };
const shakeModal = () => { sysModal.shaking = true; setTimeout(() => sysModal.shaking = false, 300); };

const goHome = () => router.push('/');
const retryBoot = () => {
    error.value = null; deviceMismatch.value = false; appMenus.value = null; customPopup.active = false;
    addonDependencies.value = {};
    cleanupApp(); loadRegistry();
};

const cleanupApp = () => {
    booting.value = true;
    if (scrollObserver) {
        scrollObserver.disconnect();
        scrollObserver = null;
    }
};

const handleMenuClick = (actionId) => {
    if (actionId === 'sys_info') {
        showLander.value = true;
        activeNav.value = actionId;
        return;
    }
    if (actionId === 'sys_app') {
        startApp();
        return;
    }
    if (actionId === 'sys_refresh') {
        retryBoot();
        return;
    }
};

const scrollDock = (amount) => {
    if (actionDockRef.value) actionDockRef.value.scrollBy({ left: amount, behavior: 'smooth' });
};

const closeCustomPopup = () => { customPopup.active = false; customPopup.content = ''; };

const injectPolyfillIntoIframe = (event) => {
    try {
        const iframeWindow = event.target.contentWindow;
        let iframeDoc;

        try {
            iframeDoc = event.target.contentDocument || iframeWindow.document;
        } catch (crossOriginError) {
            console.log("[Flowork System] Iframe menggunakan Cross-Origin (Local App). Bypass injeksi ekstensi demi keamanan SOP Browser.");
            return;
        }

        if (iframeWindow) {
            if (!iframeWindow.chrome) iframeWindow.chrome = {};

            iframeWindow.chrome.storage = window.chrome.storage;
            iframeWindow.chrome.tabs = window.chrome.tabs;
            iframeWindow.chrome.runtime = window.chrome.runtime;
            iframeWindow.chrome.notifications = window.chrome.notifications;
            iframeWindow.chrome.scripting = window.chrome.scripting;
            iframeWindow.chrome.bookmarks = window.chrome.bookmarks;
            iframeWindow.chrome.history = window.chrome.history;

            iframeWindow.chrome.__isFloworkPolyfill = true;
        }

        if (Object.keys(addonDependencies.value).length > 0) {
            for (const [pkgName, pkgVersion] of Object.entries(addonDependencies.value)) {
                const globalSafeName = pkgName.replace(/[^a-zA-Z0-9]/g, '');

                if (!iframeWindow[globalSafeName] && !window[globalSafeName]) {
                    const script = iframeDoc.createElement('script');
                    script.type = 'module';
                    script.textContent = `
                        import * as ${globalSafeName} from 'https://esm.sh/${pkgName}@${pkgVersion}';
                        window['${pkgName}'] = ${globalSafeName};
                        window['${globalSafeName}'] = ${globalSafeName};
                    `;
                    iframeDoc.head.appendChild(script);
                } else {
                    if (!iframeWindow[globalSafeName] && window[globalSafeName]) {
                        iframeWindow[pkgName] = window[globalSafeName];
                        iframeWindow[globalSafeName] = window[globalSafeName];
                    }
                }
            }
        }
    } catch (e) {
        console.warn("[Flowork System] Gagal menyuntikkan Polyfill/Package:", e);
    }
};

const handleIframeMessage = async (event) => {
    if (!iframeRef.value || event.source !== iframeRef.value.contentWindow) return;

    const data = event.data;
    if (!data) return;

    if (data.type === 'FLOWORK_ENGINE_TASK') {
        try {
            console.log(`[AppDirect Bridge] Meneruskan task P2P [${data.taskName}] ke Local Engine...`);

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

const loadRegistry = async () => {
    try {
        const localSessionData = sessionStorage.getItem(`flowork_local_app_${props.appSlug}`);
        if (localSessionData) {
            targetApp.value = JSON.parse(localSessionData);
            bootApp();
            return;
        }

        if (appStore.installedApps.length === 0) await appStore.fetchInstalledApps();

        /* */

        // [ADDED] Gunakan getter universal dari store yang memindai baik Cloud Apps maupun Local Engine Apps
        targetApp.value = appStore.getAppBySlug(props.appSlug);

        // [ADDED] Jika tidak langsung ketemu, beri waktu 1.5 detik untuk menunggu koneksi WebSocket (Local Engine) selesai mengirim list aplikasi lokal
        if (!targetApp.value) {
            console.log(`[Flowork System] Aplikasi belum ditemukan. Menunggu sinkronisasi dari Local Engine (Socket)...`);
            await new Promise(resolve => setTimeout(resolve, 1500));
            targetApp.value = appStore.getAppBySlug(props.appSlug);
        }

        if (!targetApp.value && props.appSlug === 'gummy-template') {
             targetApp.value = { id: 'gummy-template', slug: 'gummy-template', desktop: 'yes', android: 'yes', name: 'Gummy Template' };
        }

        if (!targetApp.value) {
            error.value = `App "${props.appSlug}" not found in System Registry or Local Engine.`;
            booting.value = false;
        } else {
            if (targetApp.value.desktop === 'no') {
                deviceMismatch.value = true;
                booting.value = false;
                return;
            }
            bootApp();
        }
    } catch(e) { error.value = e.message; booting.value = false; }
};

const initScrollAnimations = () => {
    if (scrollObserver) {
        scrollObserver.disconnect();
    }
    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                setTimeout(() => {
                    if(entry.target) entry.target.style.transitionDelay = '0s';
                }, 1000);
            }
        });
    }, { root: null, threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    const container = document.querySelector('.lander-hero-container');
    if (container) {
        const elementsToAnimate = container.querySelectorAll('.bubble-gum-typography h1, .bubble-gum-typography h2, .bubble-gum-typography h3, .bubble-gum-typography p, .bubble-gum-typography ul, .bubble-gum-typography blockquote, .btn-bubble-cta');
        elementsToAnimate.forEach((el, index) => {
            el.classList.add('reveal-on-scroll');
            el.style.transitionDelay = `${(index % 3) * 0.15}s`;
            scrollObserver.observe(el);
        });
    }
};

const bootApp = async () => {
    booting.value = true;
    let basePath = `/store/${targetApp.value.slug || targetApp.value.id}`;

    if (targetApp.value.is_local) {
        basePath = `http://127.0.0.1:5000/local-apps/${targetApp.value.id}`;
    }

    try {
        try {
            const lang = uiStore.currentLang || 'en';
            let file = lang === 'id' ? 'readme_id.md' : 'readme_en.md';
            let mdRes = await fetch(`${basePath}/${file}?t=${Date.now()}`);

            if (!mdRes.ok && lang === 'id') mdRes = await fetch(`${basePath}/readme.md?t=${Date.now()}`);

            if (mdRes.ok) {
                const mdText = await mdRes.text();
                const mdParser = new MarkdownIt({ html: true, breaks: true, linkify: true });
                let parsedHtml = mdParser.render(mdText);

                const topCtaHtml = `
                    <div class="injected-cta-wrapper">
                        <button class="btn-bubble-cta top-cta injected-cta">🚀 OPEN WORKSPACE NOW</button>
                    </div>
                `;
                parsedHtml = parsedHtml.replace(/<\/h1>/i, `</h1>\n${topCtaHtml}`);

                landerContent.value = parsedHtml;
                showLander.value = true;
                await nextTick();
                initScrollAnimations();
            } else {
                showLander.value = false;
            }
        } catch (mdErr) {
            console.warn("Lander parsing skipped:", mdErr);
            showLander.value = false;
        }

        let entryFile = 'index.html';

        try {
            const manifestRes = await fetch(`${basePath}/manifest.json?t=${Date.now()}`);
            if (manifestRes.ok) {
                const manifest = await manifestRes.json();
                if (manifest.action && manifest.action.default_popup) {
                    entryFile = manifest.action.default_popup;
                } else if (manifest.browser_action && manifest.browser_action.default_popup) {
                    entryFile = manifest.browser_action.default_popup;
                } else if (manifest.side_panel && manifest.side_panel.default_path) {
                    entryFile = manifest.side_panel.default_path;
                }
            }
        } catch (e) {
            console.log(`[Flowork] Tidak ada manifest.json, fallback: index.html`);
        }

        // [MODIFIED] Menonaktifkan pencarian package.json khusus untuk Aplikasi PC Lokal agar tidak muncul log error 404
        if (!targetApp.value.is_local) {
            try {
                const pkgRes = await fetch(`${basePath}/package.json?t=${Date.now()}`);
                if (pkgRes.ok) {
                    const pkgData = await pkgRes.json();
                    addonDependencies.value = pkgData.dependencies || pkgData.devDependencies || {};
                }
            } catch (e) {}
        }

        appType.value = 'iframe';
        appUrl.value = `${basePath}/${entryFile}`.replace(/([^:]\/)\/+/g, "$1");

        appMenus.value = { mainDock: [] };
        const currentLang = uiStore.currentLang || 'en';
        appDict.value['sys_info_label'] = currentLang === 'id' ? 'Panduan' : 'Read Me';
        appDict.value['sys_app_label'] = currentLang === 'id' ? 'Aplikasi' : 'App Tool';
        appDict.value['sys_refresh_label'] = currentLang === 'id' ? 'Muat Ulang' : 'Refresh';

        appMenus.value.mainDock.push({ id: 'sys_info', icon: '💡', labelKey: 'sys_info_label' });
        appMenus.value.mainDock.push({ id: 'sys_refresh', icon: '🔄', labelKey: 'sys_refresh_label' });
        appMenus.value.mainDock.push({ id: 'sys_app', icon: '🚀', labelKey: 'sys_app_label' });

        booting.value = false;

        if (window.location.hash === '#openapp') {
            startApp();
        }

        activeNav.value = showLander.value ? 'sys_info' : 'sys_app';

    } catch (e) {
        booting.value = false;
        error.value = e.message;
    }
};

watch(() => uiStore.currentLang, () => {
    if (targetApp.value && !booting.value) {
        cleanupApp(); bootApp();
    }
});

onMounted(() => {
    initChromePolyfill();
    loadRegistry();

    window.addEventListener('message', handleIframeMessage);

    socketStore.connect();

    const updateTheme = () => { currentTheme.value = document.documentElement.getAttribute('data-theme') || 'dark'; };
    updateTheme();
    new MutationObserver(updateTheme).observe(document.documentElement, { attributes: true });
});

onUnmounted(() => {
    cleanupApp();
    window.removeEventListener('message', handleIframeMessage);
});
</script>

<style scoped>
/* ========================================================
   [ORIGINAL OS CORE & LAYOUT CSS]
   ======================================================== */
.iframe-full { width: 100%; height: 100%; border: none; display: block; background: transparent; }
.os-root {
    --bg-page: #050505; --text-main: #ffffff; --border: rgba(255, 255, 255, 0.1); --brand: #06b6d4; --card-bg: #1e1e23;
    position: fixed; inset: 0; padding-top: 10px; z-index: 50; display: flex; flex-direction: column; background: var(--bg-page); color: var(--text-main); font-family: 'Inter', sans-serif; overflow: hidden;
}
.os-root[data-theme="light"] { --bg-page: #f8fafc; --text-main: #1e293b; --card-bg: #ffffff; }

.os-body-wrapper, .os-body, .os-main, .os-viewport { flex: 1; display: flex; flex-direction: column; width: 100%; height: 100%; position: relative; overflow: hidden; }
.os-bg { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; background: var(--bg-page); }
.cyberpunk-scene { position: absolute; inset: 0; background: #020205; }
.cyber-grid-floor { position: absolute; width: 200%; height: 200%; top: -50%; left: -50%; background-image: linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px); background-size: 60px 60px; transform: rotateX(60deg); animation: grid-move 20s linear infinite; }
.os-world { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

.single-app-wrapper.full-screen-mode {
    width: 100%; height: 100%; max-width: 100vw; background: var(--card-bg); overflow: hidden; display: flex; flex-direction: column; border: none; margin: 0 auto;
}

.app-content-layer { flex: 1; position: relative; overflow: hidden; width: 100%; display: flex; flex-direction: column; height: 100%; }

/* ========================================================
   [OS TRIAD BRIDGE CSS]
   ======================================================== */
.triad-active {
    --bg-core: transparent; --bg-panel: rgba(25, 25, 30, 0.98); --text-main: #00BBF9;
    --brand: #00BBF9; --border: rgba(255,255,255,0.15); --accent-blue: #00BBF9;
    --accent-green: #3DDC84; --accent-yellow: #FEE440; --accent-pink: #FF006E;
    --text-muted: #94A3B8; --bg-input: rgba(0,0,0,0.4); --text-input: #FEE440;
    --text-btn: #1E1B4B; --bubble-gloss: rgba(255,255,255,0.15);
    color: var(--text-main); overflow: hidden;
}
.os-root[data-theme="light"] .triad-active {
    --bg-core: #F0F4FF; --bg-panel: #FFFFFF; --text-main: #1E1B4B; --brand: #00BBF9; --border: #CBD5E1;
    --text-muted: #64748B; --bg-input: rgba(0,0,0,0.05); --text-input: #1E1B4B; --bubble-gloss: rgba(255,255,255,0.6);
}

.triad-top-bar { height: 60px; background: var(--bg-panel); border-bottom: 4px solid var(--border); display: flex; justify-content: space-between; align-items: center; padding: 0 20px; flex-shrink: 0; z-index: 50; }
.triad-layout-body { flex: 1; display: flex; position: relative; overflow: hidden; height: 100%; width: 100%; }
.legacy-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; height: 100%; }

.triad-sidebar { width: 80px; background: var(--bg-panel); border-right: 4px solid var(--border); display: flex; flex-direction: column; align-items: center; padding-top: 15px; gap: 5px; flex-shrink: 0; overflow-y: auto; z-index: 60; }
.side-btn { background: none; border: none; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 10px 0; width: 100%; cursor: pointer; font-size: 10px; font-weight: 800; border-left: 4px solid transparent; transition: 0.2s; }
.side-btn.active { color: var(--brand); border-left: 4px solid var(--brand); background: rgba(0,0,0,0.2); }
.side-icon { font-size: 22px; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 1rem; transition: 0.3s; }
.side-btn.active .side-icon { background: var(--brand); color: var(--text-btn); box-shadow: inset 0 -4px 0 rgba(0,0,0,0.2), inset 0 4px 0 var(--bubble-gloss); }

.triad-workspace { flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden; height: 100%; width: 100%; }

.triad-dock-wrapper { position: absolute; bottom: 0; left: 0; width: 100%; z-index: 50; display: flex; flex-direction: column; align-items: center; }
.action-dock-outer { width: 100%; background: var(--bg-panel); border-top: 4px solid var(--border); padding: 10px 15px; display: flex; align-items: center; gap: 5px; box-shadow: 0 -10px 20px rgba(0,0,0,0.05); }
.action-dock-inner { flex: 1; display: flex; gap: 10px; overflow-x: auto; padding: 5px 0; scrollbar-width: none; scroll-behavior: smooth; }
.action-dock-inner::-webkit-scrollbar { display: none; }

.main-dock { height: 60px; width: 100%; background: var(--bg-panel); border-top: 4px solid var(--border); display: flex; justify-content: space-around; align-items: center; }
.main-dock button { background: none; border: none; color: var(--text-muted); font-size: 10px; font-weight: 800; display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; transition: 0.2s; }
.main-dock button.active { color: var(--brand); }
.main-dock button.active .nav-icon { background: var(--brand); color: var(--text-btn); padding: 5px 20px; border-radius: 2rem; box-shadow: inset 0 -4px 0 rgba(0,0,0,0.2), inset 0 4px 0 var(--bubble-gloss); }
.nav-icon { font-size: 16px; transition: 0.3s; padding: 5px 20px; border-radius: 2rem; }

.btn-icon { background: var(--brand); color: var(--text-btn); border: 3px solid var(--border); border-bottom: 5px solid rgba(0,0,0,0.3); border-radius: 50%; width: 45px; height: 45px; min-width: 45px; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.1s; box-shadow: inset 0 4px 0 var(--bubble-gloss); padding: 0; flex: 0 0 auto; }
.bouncy-fx:active, .btn-icon:active { transform: translateY(4px); border-bottom-width: 2px; margin-top: 4px; box-shadow: inset 0 2px 0 var(--bubble-gloss); }
.bouncy-up { animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes slideUp { 0% { transform: translateY(50px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }

/* ========================================================
   [PREMIUM LANDER CSS]
   ======================================================== */
.lander-workspace {
    flex: 1; overflow-y: auto; position: relative; padding: 50px 20px; padding-bottom: 150px; background: var(--bg-core, var(--bg-page));
}
.lander-workspace::before {
    content: ''; position: absolute; inset: 0; background-image: radial-gradient(circle at 10% 20%, rgba(255,0,110,0.1) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(0,187,249,0.1) 0%, transparent 20%); pointer-events: none;
}
.lander-hero-container { max-width: 800px; margin: 0 auto; position: relative; z-index: 10; }

.organic-bg-blob { position: absolute; filter: blur(60px); z-index: -1; opacity: 0.5; animation: slowSpin 20s linear infinite; transition: opacity 0.3s ease; }
.os-root[data-theme="dark"] .organic-bg-blob { opacity: 0.2; }
.blob-1 { top: 10%; left: -10%; width: 400px; height: 400px; background: #FF006E; border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
.blob-2 { top: 60%; right: -15%; width: 500px; height: 500px; background: #00BBF9; border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; animation-direction: reverse; }
@keyframes slowSpin { 100% { transform: rotate(360deg); } }

.floating-stickers { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.sticker { position: absolute; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)); animation: floatSticker ease-in-out infinite alternate; opacity: 0.8; }
.sticker.s1 { top: 15%; left: 5%; font-size: 5rem; animation-duration: 8s; }
.sticker.s2 { top: 25%; right: 8%; font-size: 7rem; animation-duration: 12s; animation-delay: -2s; transform: rotate(15deg); }
.sticker.s3 { top: 45%; left: 2%; font-size: 4.5rem; animation-duration: 9s; animation-delay: -5s; }
.sticker.s4 { top: 55%; right: 5%; font-size: 8rem; animation-duration: 14s; animation-delay: -1s; }
.sticker.s5 { top: 75%; left: 10%; font-size: 6rem; animation-duration: 11s; transform: rotate(-20deg); }
.sticker.s6 { top: 80%; right: 12%; font-size: 5rem; animation-duration: 10s; }
@keyframes floatSticker { 0% { transform: translateY(0) rotate(0deg) scale(1); } 50% { transform: translateY(-40px) rotate(20deg) scale(1.15); } 100% { transform: translateY(0) rotate(-10deg) scale(1); } }

.btn-bubble-cta, .bubble-gum-typography :deep(.btn-bubble-cta) {
    display: block; width: 100%; max-width: 600px; margin: 60px auto; padding: 25px; font-size: 26px; font-weight: 900; text-align: center; color: white; background: linear-gradient(135deg, #FF006E, #FEE440, #00BBF9, #3DDC84); background-size: 300% 300%; animation: rainbowMove 5s ease infinite; border: none; border-radius: 60px; cursor: pointer; box-shadow: 0 15px 30px rgba(255,0,110,0.4), inset 0 -6px 0 rgba(0,0,0,0.2), inset 0 8px 0 rgba(255,255,255,0.4); transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-transform: uppercase; letter-spacing: 3px;
}
.btn-bubble-cta:active, .bubble-gum-typography :deep(.btn-bubble-cta:active) { transform: translateY(10px); box-shadow: 0 5px 10px rgba(255,0,110,0.4), inset 0 -3px 0 rgba(0,0,0,0.2), inset 0 3px 0 rgba(255,255,255,0.4); }
@keyframes rainbowMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

.bubble-gum-typography { font-size: 1.15rem; color: var(--text-main); position: relative; }
.bubble-gum-typography :deep(.reveal-on-scroll) { opacity: 0; transform: translateY(50px) scale(0.95); transition: opacity 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); will-change: opacity, transform; }
.bubble-gum-typography :deep(.is-visible) { opacity: 1; transform: translateY(0) scale(1); }

.bubble-gum-typography :deep(h1) { font-family: 'Fredoka', 'Inter', sans-serif; font-size: 4.5rem; font-weight: 900; text-align: center; line-height: 1.1; background: linear-gradient(135deg, #FF006E, #00BBF9); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0px 8px 15px rgba(255,0,110,0.2)); margin-bottom: 20px; letter-spacing: -2px; }
.bubble-gum-typography :deep(.injected-cta-wrapper) { display: flex; justify-content: center; width: 100%; margin-bottom: 70px; }
.bubble-gum-typography :deep(h2) { font-family: 'Fredoka', 'Inter', sans-serif; font-size: 2.2rem; font-weight: 900; color: #1E1B4B; background: linear-gradient(135deg, #00BBF9, #FEE440); padding: 20px 40px; display: inline-block; margin-top: 60px; margin-bottom: 30px; border-radius: 70% 30% 30% 70% / 60% 40% 60% 40%; animation: blobMorph 5s ease-in-out infinite alternate; box-shadow: 10px 15px 30px rgba(0,187,249,0.3); }
.bubble-gum-typography :deep(h2:nth-of-type(even)) { background: linear-gradient(135deg, #FF006E, #FEE440); color: white; animation-direction: reverse; box-shadow: -10px 15px 30px rgba(255,0,110,0.3); }
@keyframes blobMorph { 0% { border-radius: 70% 30% 30% 70% / 60% 40% 60% 40%; } 100% { border-radius: 30% 70% 70% 30% / 40% 60% 40% 60%; } }

.bubble-gum-typography :deep(p) { line-height: 1.9; font-weight: 600; opacity: 0.85; margin-bottom: 25px; font-size: 1.25rem; }
.bubble-gum-typography :deep(ul) { list-style: none; padding: 0; margin-bottom: 30px; }
.bubble-gum-typography :deep(li) { position: relative; padding-left: 45px; margin-bottom: 15px; font-weight: 600; line-height: 1.7; font-size: 1.2rem; }
.bubble-gum-typography :deep(li::before) { content: '🍭'; position: absolute; left: 10px; top: 2px; font-size: 1.4rem; }
.bubble-gum-typography :deep(strong) { color: #FF006E; font-weight: 900; }
.bubble-gum-typography :deep(blockquote) { background: linear-gradient(135deg, #3DDC84, #00BBF9); color: #1E1B4B; padding: 50px; font-family: 'Fredoka', sans-serif; font-size: 1.8rem; font-weight: 900; font-style: italic; text-align: center; margin: 80px 0; border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; animation: blobMorph 7s ease-in-out infinite alternate; box-shadow: 0 20px 40px rgba(61, 220, 132, 0.4); }

/* ========================================================
   [SYSTEM POPUPS]
   ======================================================== */
.triad-popup-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); z-index: 200000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.universal-green-pop { background: #3DDC84 !important; border: 4px solid #1E1B4B !important; border-radius: 30px !important; box-shadow: 0 15px 0 #000 !important; color: #1E1B4B !important; }
.triad-popup-card { display: flex; flex-direction: column; overflow: hidden; max-width: 95vw; }
.triad-popup-header { padding: 15px 20px; border-bottom: 3px solid rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; font-family: 'Fredoka', sans-serif; font-weight: 900; text-transform: uppercase; }
.btn-pop-close { width: 35px; height: 35px; border-radius: 50%; border: none; background: #FF006E; color: white; font-weight: 900; cursor: pointer; box-shadow: inset 0 -3px 0 rgba(0,0,0,0.2); }
.triad-popup-content { padding: 20px; max-height: 70vh; overflow-y: auto; font-weight: 800; }
.sys-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 300000; display: flex; align-items: center; justify-content: center; }
.sys-modal-card { width: 90%; max-width: 350px; padding: 30px; text-align: center; }
.sys-modal-header { font-weight: 900; font-size: 1.3rem; margin-bottom: 15px; font-family: 'Fredoka', sans-serif; text-transform: uppercase; }
.sys-modal-body { font-size: 1rem; opacity: 0.9; margin-bottom: 25px; line-height: 1.5; font-weight: 800; }
.sys-modal-footer { display: flex; gap: 10px; justify-content: center; }
.sys-btn { padding: 12px 25px; border-radius: 50px; font-weight: 900; border: none; cursor: pointer; transition: 0.2s; }
.sys-btn.primary-dark { background: #1E1B4B; color: #FFFFFF; }
.sys-btn.secondary-dark { background: rgba(0,0,0,0.1); color: #1E1B4B; border: 2px solid #1E1B4B; }
.sys-btn:active { transform: scale(0.95); }

.shake { animation: sys-shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
@keyframes sys-shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
.sys-pop-enter-active .sys-modal-card, .sys-pop-enter-active .triad-popup-card { animation: bouncyIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.sys-pop-leave-active .sys-modal-card, .sys-pop-leave-active .triad-popup-card { transform: scale(0.8); transition: 0.3s; }
@keyframes bouncyIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes grid-move { 0% { background-position: 0 0; } 100% { background-position: 0 50px; } }
</style>
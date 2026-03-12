//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/views/mobile/AppDirectViewMobile.vue
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
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
                    <div class="os-world"
                         @touchstart="startTouch"
                         @touchmove="handleTouchMove"
                         @touchend="endTouch">

                      <div class="single-app-wrapper mobile-full"
                           :style="wrapperStyle">

                          <div class="app-content-layer custom-scroll" :class="{'triad-active': appMenus}" v-show="!booting && !error">

                              <header v-if="appMenus?.sidebar?.length" v-show="!(showLander && isMobile)" class="triad-top-bar">
                                  <div style="display: flex; align-items: center; gap: 15px;">
                                      <button @click="isSidebarOpen = !isSidebarOpen" class="btn-icon bouncy-fx" style="width:40px; height:40px; font-size:16px;">☰</button>
                                  </div>
                              </header>

                              <div :class="appMenus ? 'triad-layout-body' : 'legacy-body'">

                                  <div v-if="appMenus?.sidebar?.length && !showLander" class="sidebar-backdrop" :class="{'hidden': !isSidebarOpen}" @click="isSidebarOpen = false"></div>

                                  <aside v-if="appMenus?.sidebar?.length && !showLander" class="triad-sidebar mobile-sidebar custom-scrollbar" :class="{'open': isSidebarOpen}">
                                      <button v-for="btn in appMenus.sidebar" :key="btn.id"
                                              class="side-btn" :class="{ active: activeSide === btn.id }"
                                              @click="handleMenuClick(btn.id); isSidebarOpen = false"
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
                                          </div>

                                          <div class="lander-mobile-container">
                                              <div class="bubble-gum-typography" v-html="landerContent" @click="handleLanderClick"></div>
                                          </div>
                                      </div>

                                      <div v-show="!showLander" style="width:100%; height:100%; display:flex; flex-direction:column; position: relative;">

                                          <div v-if="(targetApp && targetApp.android === 'no') || isDesktopOnly" class="state-overlay error" style="position: absolute; inset: 0; z-index: 10; background: var(--bg-page);">
                                              <div class="err-icon" style="font-size: 3rem; margin-bottom: 15px;">🖥️</div>
                                              <div class="err-msg" style="font-size: 1.5rem; color: var(--brand); font-weight: 900; margin-bottom: 10px; font-family: 'Fredoka', sans-serif;">
                                                  {{ uiStore.currentLang === 'id' ? 'Khusus Desktop' : 'Desktop Only' }}
                                              </div>
                                              <div class="err-sub" style="text-align: center; padding: 0 30px; line-height: 1.5; font-weight: 600;">
                                                  {{ uiStore.currentLang === 'id' ? 'Aplikasi ini tidak dirancang untuk perangkat mobile. Silakan buka melalui perangkat Desktop.' : 'This application is not designed for mobile devices. Please open it via a Desktop device.' }}
                                              </div>
                                          </div>

                                          <iframe ref="iframeRef" v-if="appType === 'iframe' && !(targetApp?.android === 'no') && !isDesktopOnly" :src="appUrl" class="iframe-full" frameborder="0" @load="injectPolyfillIntoIframe"></iframe>
                                      </div>

                                      <div v-if="appMenus" v-show="!(showLander && isMobile)" class="triad-dock-wrapper">
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
                                  <div class="triad-popup-card universal-green-pop" :style="{ width: isMobile ? '90%' : customPopup.width }">
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
                              <div class="err-sub">Silakan periksa konfigurasi aplikasi di Registry.</div>
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
const isMobile = ref(true);
const scale = ref(1.0);

const actionDockRef = ref(null);
const appMenus = ref(null);
const appDict = ref({});
const activeNav = ref('');
const activeSide = ref('');
const isSidebarOpen = ref(false);
const isDesktopOnly = ref(false);

const targetApp = ref(null);
const appType = ref('iframe');
const appUrl = ref('');
const addonDependencies = ref({});
const iframeRef = ref(null);

let scrollObserver = null;
const showLander = ref(false);
const landerContent = ref('');

const startApp = () => {
    showLander.value = false;
    activeNav.value = 'sys_app';
};

const handleLanderClick = (e) => {
    if (e.target.closest('.injected-cta')) {
        startApp();
    }
};

const customPopup = reactive({ active: false, title: '', width: '400px', content: '', onMounted: null });

const sysModal = reactive({ active: false, shaking: false, title: '', message: '', type: 'alert', resolve: null });
const triggerModal = (message, title='System', type='alert') => new Promise(resolve => { sysModal.active = true; sysModal.title = title; sysModal.message = message; sysModal.type = type; sysModal.resolve = resolve; });
const resolveModal = (res) => { sysModal.active = false; if(sysModal.resolve) sysModal.resolve(res); };
const shakeModal = () => { sysModal.shaking = true; setTimeout(() => sysModal.shaking = false, 300); };

const goHome = () => router.push('/');
const retryBoot = () => {
    error.value = null; appMenus.value = null; addonDependencies.value = {};
    cleanupApp(); loadRegistry();
};

let lastPinchDist = 0;
const startTouch = (e) => { if (e.touches.length === 2) lastPinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); };
const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        if (lastPinchDist > 0) scale.value = Math.min(Math.max(scale.value * (dist / lastPinchDist), 0.5), 3.0);
        lastPinchDist = dist;
    }
};
const endTouch = () => { lastPinchDist = 0; };

const wrapperStyle = computed(() => ({ transform: `scale(${scale.value})` }));

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
        showLander.value = false;
        activeNav.value = actionId;
        return;
    }
    if (actionId === 'sys_reload') {
        window.location.hash = 'openapp';
        retryBoot();
        return;
    }
};

const scrollDock = (amount) => {
    if (actionDockRef.value) actionDockRef.value.scrollBy({ left: amount, behavior: 'smooth' });
};

const closeCustomPopup = () => { customPopup.active = false; customPopup.content = ''; };

const injectPolyfillIntoIframe = (event) => {
    const iframeWindow = event.target.contentWindow;
    const iframeDoc = event.target.contentDocument || iframeWindow.document;

    try {
        if (iframeWindow) {
            if (!iframeWindow.chrome) iframeWindow.chrome = {};
            iframeWindow.chrome.storage = window.chrome.storage;
            iframeWindow.chrome.tabs = window.chrome.tabs;
            iframeWindow.chrome.runtime = window.chrome.runtime;
            iframeWindow.chrome.notifications = window.chrome.notifications;
            iframeWindow.chrome.__isFloworkPolyfill = true;
        }
    } catch (e) {
        console.warn("[Flowork System] Peringatan injeksi Polyfill:", e);
    }

    try {
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
                } else if (!iframeWindow[globalSafeName] && window[globalSafeName]) {
                    iframeWindow[pkgName] = window[globalSafeName];
                    iframeWindow[globalSafeName] = window[globalSafeName];
                }
            }
        }
    } catch (e) {}
};

const executeOsLevelDownload = (payload) => {
    const { data, name } = payload;
    if (!data || !name) return;

    if (window.Capacitor || window.AndroidBridge) {
        triggerWebDownload(data, name);
    } else {
        triggerWebDownload(data, name);
    }
};

const triggerWebDownload = (dataUrl, filename) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

const handleIframeMessage = async (event) => {
    if (!iframeRef.value || event.source !== iframeRef.value.contentWindow) return;

    const data = event.data;
    if (!data) return;

    if (data.type === 'FLOWORK_ENGINE_TASK') {
        try {
            console.log(`[AppDirect Bridge Mobile] Meneruskan task P2P [${data.taskName}] ke Local Engine...`);
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
        executeOsLevelDownload(data.payload);
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

        if (appStore.installedApps.length === 0) {
            appStore.setDeviceType('mobile');
            await appStore.fetchInstalledApps();
        }

        targetApp.value = appStore.getAppBySlug(props.appSlug);

        if (!targetApp.value) {
            let retries = 0;
            while(retries < 15 && !targetApp.value) {
                await new Promise(r => setTimeout(r, 100));
                targetApp.value = appStore.getAppBySlug(props.appSlug);
                retries++;
            }
        }

        if (!targetApp.value) {
            error.value = `App "${props.appSlug}" not found in System Registry.`;
            booting.value = false;
        } else {
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
                    if (entry.target) entry.target.style.transitionDelay = '0s';
                }, 800);
            }
        });
    }, { root: null, threshold: 0.15, rootMargin: "0px 0px -20px 0px" });

    const container = document.querySelector('.lander-mobile-container');
    if (container) {
        const animElements = container.querySelectorAll('.bubble-gum-typography h1, .bubble-gum-typography h2, .bubble-gum-typography h3, .bubble-gum-typography p, .bubble-gum-typography ul, .bubble-gum-typography blockquote, .btn-bubble-cta, .bubble-gum-typography ol');
        animElements.forEach((el, i) => {
            el.classList.add('reveal-on-scroll');
            el.style.transitionDelay = `${(i % 3) * 0.15}s`;
            scrollObserver.observe(el);
        });
    }
};

const bootApp = async () => {
    booting.value = true;
    let appId = targetApp.value.slug || targetApp.value.id;
    let basePath = `/store/${appId}`;
    isDesktopOnly.value = false;

    if (targetApp.value.is_local) {
        appType.value = 'iframe';

        // [FIXED] Deteksi cerdas: Cek entry_point_mobile dulu, lalu default_popup, fallback terakhir mobile.html
        let localEntry = targetApp.value.entry_point_mobile || (targetApp.value.action && targetApp.value.action.default_popup) || 'mobile.html';

        appUrl.value = `http://localhost:5000/local-apps/${appId}/${localEntry}`;

        appMenus.value = { mainDock: [] };
        const currentLang = uiStore.currentLang || 'en';
        appDict.value['sys_app_label'] = currentLang === 'id' ? 'Aplikasi' : 'App Tool';
        appDict.value['sys_reload_label'] = currentLang === 'id' ? 'Muat Ulang' : 'Reload';

        appMenus.value.mainDock.push({ id: 'sys_app', icon: '🚀', labelKey: 'sys_app_label' });
        appMenus.value.mainDock.push({ id: 'sys_reload', icon: '🔄', labelKey: 'sys_reload_label' });

        showLander.value = false;
        activeNav.value = 'sys_app';
        booting.value = false;
        return;
    }

    try {
        try {
            const lang = uiStore.currentLang || 'en';
            let file = lang === 'id' ? 'readme_id.md' : 'readme_en.md';
            let mdRes = await fetch(`${basePath}/${file}?t=${Date.now()}`);

            if (!mdRes.ok && lang === 'id') {
                mdRes = await fetch(`${basePath}/readme_en.md?t=${Date.now()}`);
            }

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

                if (typeof window !== 'undefined' && window.DOMParser) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(parsedHtml, 'text/html');

                    const slides = [];
                    let currentSlide = doc.createElement('div');
                    currentSlide.className = 'feed-slide snap-align';
                    slides.push(currentSlide);

                    const childNodes = Array.from(doc.body.childNodes);
                    childNodes.forEach(node => {
                        if (node.tagName === 'H2') {
                            currentSlide = doc.createElement('div');
                            currentSlide.className = 'feed-slide snap-align';
                            slides.push(currentSlide);
                        }
                        currentSlide.appendChild(node);
                    });

                    doc.body.innerHTML = '';
                    const feedContainer = doc.createElement('div');
                    feedContainer.className = 'feed-container';

                    slides.forEach(slide => {
                        if (slide.childNodes.length > 0) feedContainer.appendChild(slide);
                    });

                    doc.body.appendChild(feedContainer);
                    parsedHtml = doc.body.innerHTML;
                }

                landerContent.value = parsedHtml;
                showLander.value = true;

                await nextTick();
                initScrollAnimations();
            } else {
                showLander.value = false;
            }
        } catch (mdErr) {
            showLander.value = false;
        }

        let entryFile = null;

        try {
            const resMobile = await fetch(`${basePath}/mobile.html?t=${Date.now()}`);
            if (resMobile.ok) {
                const mobileText = await resMobile.clone().text();
                if (mobileText.includes('app.js')) {
                    entryFile = 'mobile.html';
                }
            }
        } catch (e) { console.warn('[OS Mobile] Cek mobile.html gagal'); }

        if (!entryFile) {
            isDesktopOnly.value = true;
        } else {
            isDesktopOnly.value = false;
            try {
                const pkgRes = await fetch(`${basePath}/package.json?t=${Date.now()}`);
                if (pkgRes.ok) {
                    const pkgData = await pkgRes.json();
                    addonDependencies.value = pkgData.dependencies || pkgData.devDependencies || {};
                }
            } catch (e) {}

            appType.value = 'iframe';
            appUrl.value = `${basePath}/${entryFile}`.replace(/([^:]\/)\/+/g, "$1");
        }

        appMenus.value = { mainDock: [] };
        const currentLang = uiStore.currentLang || 'en';
        appDict.value['sys_info_label'] = currentLang === 'id' ? 'Panduan' : 'Read Me';
        appDict.value['sys_app_label'] = currentLang === 'id' ? 'Aplikasi' : 'App Tool';
        appDict.value['sys_reload_label'] = currentLang === 'id' ? 'Muat Ulang' : 'Reload';

        appMenus.value.mainDock.push({ id: 'sys_info', icon: '💡', labelKey: 'sys_info_label' });
        appMenus.value.mainDock.push({ id: 'sys_app', icon: '🚀', labelKey: 'sys_app_label' });
        appMenus.value.mainDock.push({ id: 'sys_reload', icon: '🔄', labelKey: 'sys_reload_label' });

        booting.value = false;
        activeNav.value = showLander.value ? 'sys_info' : 'sys_app';
        if (window.location.hash === '#openapp') {
            showLander.value = false;
            activeNav.value = 'sys_app';
        }

    } catch (e) {
        booting.value = false;
        error.value = e.message;
    }
};

const detectMobile = () => {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    isMobile.value = isTouch || isMobileUA || window.innerWidth <= 768;
};

watch(() => uiStore.currentLang, () => {
    if (targetApp.value && !booting.value) {
        cleanupApp();
        bootApp();
    }
});

onMounted(() => {
    socketStore.connect();
    detectMobile();
    initChromePolyfill();
    loadRegistry();
    const updateTheme = () => { currentTheme.value = document.documentElement.getAttribute('data-theme') || 'dark'; };
    updateTheme();
    new MutationObserver(updateTheme).observe(document.documentElement, { attributes: true });

    window.addEventListener('message', handleIframeMessage);
});

onUnmounted(() => {
    cleanupApp();
    window.removeEventListener('message', handleIframeMessage);
});
</script>

<style scoped>
.iframe-full { width: 100%; height: 100%; border: none; display: block; background: transparent; margin: 0; padding: 0; box-sizing: border-box; }

.os-root {
    --bg-page: #050505; --text-main: #ffffff; --border: rgba(255, 255, 255, 0.1); --brand: #06b6d4; --card-bg: rgba(30, 30, 35, 0.6); --card-bg-mobile: #121215;
    position: fixed; inset: 0; padding-top: 0; z-index: 50; display: flex; flex-direction: column; background: var(--bg-page); color: var(--text-main); font-family: 'Inter', sans-serif; overflow: hidden; margin: 0; box-sizing: border-box;
}

.os-root[data-theme="light"] { --bg-page: #f8fafc; --text-main: #1e293b; --card-bg: rgba(255,255,255,0.65); --card-bg-mobile: #f8fafc; }

.os-body-wrapper, .os-body, .os-main, .os-viewport { flex: 1; display: flex; flex-direction: column; width: 100%; height: 100%; position: relative; overflow: hidden; margin: 0; padding: 0; box-sizing: border-box; }
.os-bg { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; background: var(--bg-page); }
.cyberpunk-scene { position: absolute; inset: 0; background: #020205; perspective: 1000px; }
.cyber-grid-floor { position: absolute; width: 200%; height: 200%; top: -50%; left: -50%; background-image: linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px); background-size: 60px 60px; transform: rotateX(60deg); animation: grid-move 20s linear infinite; }
.os-world { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 0; margin: 0; }

.single-app-wrapper.full-screen-mode {
    width: 100%; height: 100%; max-width: 100vw; background: var(--card-bg); overflow: hidden; display: flex; flex-direction: column; border-radius: 0; border: none; margin: 0 auto;
}

@media (max-width: 768px) {
    .os-root { padding-top: 0 !important; }
    .single-app-wrapper.mobile-full { display: flex; flex-direction: column; width: 100% !important; height: 100% !important; max-width: 100vw !important; margin: 0 !important; background: var(--card-bg-mobile) !important; border: none !important; border-radius: 0 !important; }
}

.app-content-layer { flex: 1; position: relative; overflow: hidden; width: 100%; display: flex; flex-direction: column; height: 100%; margin: 0; padding: 0; }
.state-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-page); z-index: 100; }
.text-brand { color: var(--brand); }
@keyframes grid-move { 0% { background-position: 0 0; } 100% { background-position: 0 50px; } }

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

.triad-top-bar { height: 60px; background: var(--bg-panel); border-bottom: 4px solid var(--border); display: flex; justify-content: space-between; align-items: center; padding: 0 15px; flex-shrink: 0; z-index: 50; width: 100%; margin: 0; box-sizing: border-box; }

.triad-layout-body { flex: 1; display: flex; position: relative; overflow: hidden; height: 100%; width: 100%; }
.legacy-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; height: 100%; }

.triad-sidebar { width: 80px; background: var(--bg-panel); border-right: 4px solid var(--border); display: flex; flex-direction: column; align-items: center; padding-top: 15px; gap: 5px; z-index: 60; flex-shrink: 0; overflow-y: auto; }
.mobile-sidebar { position: absolute; left: 0; top: 0; bottom: 0; transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1); }
.mobile-sidebar.open { transform: translateX(0); }
.sidebar-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.6); z-index: 55; }

.side-btn { background: none; border: none; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 10px 0; width: 100%; cursor: pointer; transition: 0.2s; font-size: 10px; font-weight: 800; border-left: 4px solid transparent; }
.side-btn.active { color: var(--brand); border-left: 4px solid var(--brand); background: rgba(0,0,0,0.2); }
.side-icon { font-size: 22px; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 1rem; transition: 0.3s; }
.side-btn.active .side-icon { background: var(--brand); color: var(--text-btn); box-shadow: inset 0 -4px 0 rgba(0,0,0,0.2), inset 0 4px 0 var(--bubble-gloss); }

.triad-workspace { flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden; height: 100%; width: 100%; }
.legacy-workspace { flex: 1; display: flex; flex-direction: column; position: relative; overflow-y: auto; height: 100%; }
.triad-scroll { flex: 1; overflow-y: auto; position: relative; padding-bottom: 130px; box-sizing: border-box; }

.triad-dock-wrapper { position: absolute; bottom: 0; left: 0; width: 100%; z-index: 50; display: flex; flex-direction: column; align-items: center; }
.action-dock-outer { width: 100%; background: var(--bg-panel); border-top: 4px solid var(--border); padding: 10px 10px; display: flex; align-items: center; gap: 5px; box-shadow: 0 -10px 20px rgba(0,0,0,0.05); }
.action-dock-inner { flex: 1; display: flex; gap: 10px; overflow-x: auto; padding: 5px 0; scroll-behavior: smooth; scrollbar-width: none; }
.action-dock-inner::-webkit-scrollbar { display: none; }

.main-dock { height: 60px; width: 100%; background: var(--bg-panel); border-top: 4px solid var(--border); display: flex; justify-content: space-around; align-items: center; }
.main-dock button { background: none; border: none; color: var(--text-muted); font-size: 10px; font-weight: 800; display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; transition: 0.2s; }
.main-dock button.active { color: var(--brand); }
.main-dock button.active .nav-icon { background: var(--brand); color: var(--text-btn); padding: 5px 15px; border-radius: 2rem; box-shadow: inset 0 -4px 0 rgba(0,0,0,0.2), inset 0 4px 0 var(--bubble-gloss); }
.nav-icon { font-size: 16px; transition: 0.3s; padding: 5px 15px; border-radius: 2rem; }

.btn-icon { background: var(--brand); color: var(--text-btn); border: 3px solid var(--border); border-bottom: 5px solid rgba(0,0,0,0.3); border-radius: 50%; width: 45px; height: 45px; min-width: 45px; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.1s; box-shadow: inset 0 4px 0 var(--bubble-gloss); padding: 0; flex: 0 0 auto; }
.bouncy-fx:active, .btn-icon:active { transform: translateY(4px); border-bottom-width: 2px; margin-top: 4px; box-shadow: inset 0 2px 0 var(--bubble-gloss); }
.bouncy-up { animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes slideUp { 0% { transform: translateY(50px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
.custom-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
.custom-scrollbar::-webkit-scrollbar { display: none; }

.lander-workspace {
    flex: 1;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
    position: relative;
    padding: 0;
    background: var(--bg-core, var(--bg-page));
    background-image: radial-gradient(circle at 10% 20%, rgba(255,0,110,0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(0,187,249,0.08) 0%, transparent 40%);
}

.lander-mobile-container {
    width: 100%;
    position: relative;
    z-index: 10;
}

.floating-stickers { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.sticker { position: absolute; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.3)); animation: floatSticker ease-in-out infinite alternate; opacity: 0.3; }
.sticker.s1 { top: 5%; left: 5%; font-size: 3rem; animation-duration: 8s; }
.sticker.s2 { top: 20%; right: 5%; font-size: 4rem; animation-duration: 12s; transform: rotate(15deg); }
.sticker.s3 { top: 40%; left: -5%; font-size: 3.5rem; animation-duration: 9s; }
.sticker.s4 { top: 55%; right: -2%; font-size: 5rem; animation-duration: 14s; }
.sticker.s5 { top: 70%; left: 10%; font-size: 4rem; animation-duration: 11s; transform: rotate(-20deg); }
.sticker.s6 { top: 85%; right: 10%; font-size: 3rem; animation-duration: 10s; }
.sticker.s7 { top: 15%; left: 50%; font-size: 2.5rem; animation-duration: 13s; }
@keyframes floatSticker {
    0% { transform: translateY(0) rotate(0deg) scale(1); }
    50% { transform: translateY(-20px) rotate(15deg) scale(1.1); }
    100% { transform: translateY(0) rotate(-10deg) scale(1); }
}

.bubble-gum-typography :deep(.feed-slide) {
    scroll-snap-align: start;
    scroll-snap-stop: always;
    min-height: 100dvh;
    padding: 30px 20px 80px 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-bottom: 1px solid rgba(255,255,255,0.05);
}
.os-root[data-theme="light"] .bubble-gum-typography :deep(.feed-slide) {
    border-bottom: 1px solid rgba(0,0,0,0.05);
}

.bubble-gum-typography :deep(.reveal-on-scroll) {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
    transition: opacity 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    will-change: opacity, transform;
}
.bubble-gum-typography :deep(.is-visible) {
    opacity: 1;
    transform: translateY(0) scale(1);
}

.btn-bubble-cta,
.bubble-gum-typography :deep(.btn-bubble-cta) {
    display: block;
    width: 100%;
    margin: 30px 0;
    padding: 20px 10px;
    font-family: 'Fredoka', 'Inter', sans-serif;
    font-size: 1.3rem;
    font-weight: 900;
    text-align: center;
    color: white;
    background: linear-gradient(135deg, #FF006E, #FEE440, #00BBF9, #3DDC84);
    background-size: 300% 300%;
    animation: rainbowMove 5s ease infinite;
    border: 4px solid #1E1B4B;
    border-radius: 40px;
    cursor: pointer;
    box-shadow: 0 10px 0 #1E1B4B, inset 0 -4px 0 rgba(0,0,0,0.2), inset 0 5px 0 rgba(255,255,255,0.4);
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    text-transform: uppercase;
    letter-spacing: 1px;
}
.btn-bubble-cta:active,
.bubble-gum-typography :deep(.btn-bubble-cta:active) {
    transform: translateY(10px);
    box-shadow: 0 0 0 #1E1B4B, inset 0 -2px 0 rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.4);
}
@keyframes rainbowMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

.bubble-gum-typography {
    font-family: 'Inter', sans-serif;
    font-size: 1.05rem;
    color: var(--text-main);
    column-count: 1;
}

.bubble-gum-typography :deep(h1) {
    font-family: 'Fredoka', 'Inter', sans-serif;
    font-size: 2.8rem;
    font-weight: 900;
    text-align: center;
    line-height: 1.1;
    background: linear-gradient(135deg, #FF006E, #FEE440, #00BBF9);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0px 5px 0px rgba(0,0,0,0.1));
    margin-bottom: 5px;
    letter-spacing: -1px;
}

.bubble-gum-typography :deep(.injected-cta-wrapper) {
    width: 100%;
    margin-bottom: 40px;
}

.bubble-gum-typography :deep(h2) {
    font-family: 'Fredoka', 'Inter', sans-serif;
    font-size: 1.8rem;
    font-weight: 900;
    color: #1E1B4B;
    background: #00BBF9;
    padding: 12px 20px;
    border-radius: 20px;
    border: 3px solid #1E1B4B;
    box-shadow: 0 6px 0 #1E1B4B, inset 0 4px 0 rgba(255,255,255,0.4);
    display: inline-block;
    margin-top: 0;
    margin-bottom: 25px;
    transform: rotate(-1deg);
    align-self: flex-start;
}
.bubble-gum-typography :deep(.feed-slide:nth-of-type(even) h2) { background: #FF006E; color: white; transform: rotate(1deg); }

.bubble-gum-typography :deep(h3) { font-family: 'Fredoka', sans-serif; font-size: 1.3rem; color: #FEE440; margin-top: 20px; }
.bubble-gum-typography :deep(p) { line-height: 1.8; font-weight: 600; opacity: 0.9; margin-bottom: 20px; text-align: left; }

.bubble-gum-typography :deep(ul), .bubble-gum-typography :deep(ol) { list-style: none; padding: 0; margin-bottom: 20px; }
.bubble-gum-typography :deep(ol) { counter-reset: lander-counter; }

.bubble-gum-typography :deep(li) {
    position: relative;
    margin-bottom: 15px;
    font-weight: 600;
    line-height: 1.6;
    background: var(--bg-panel);
    padding: 15px 15px 15px 45px;
    border-radius: 15px;
    border: 2px solid var(--border);
    box-shadow: 0 5px 10px rgba(0,0,0,0.1);
}

.bubble-gum-typography :deep(ul li::before) { content: '🍭'; position: absolute; left: 12px; top: 14px; font-size: 1.1rem; }

.bubble-gum-typography :deep(ol li) { counter-increment: lander-counter; }
.bubble-gum-typography :deep(ol li::before) {
    content: counter(lander-counter);
    position: absolute; left: 10px; top: 12px; font-size: 0.95rem; font-weight: 900; color: white;
    background: #FF006E; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
    border-radius: 50%; border: 2px solid #1E1B4B; box-shadow: 0 2px 0 #1E1B4B;
}

.bubble-gum-typography :deep(blockquote) {
    border: 4px solid #1E1B4B; background: #3DDC84; color: #1E1B4B; padding: 25px; border-radius: 25px; font-family: 'Fredoka', sans-serif; font-size: 1.4rem; font-weight: 900; font-style: italic; box-shadow: 0 10px 0 #1E1B4B; text-align: center; margin: 20px 0; transform: scale(1.02);
}

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
.sys-btn { padding: 12px 25px; border-radius: 50px; font-weight: 900; border: none; cursor: pointer; font-family: 'Fredoka', sans-serif; transition: 0.2s; }
.sys-btn.primary-dark { background: #1E1B4B; color: #FFFFFF; }
.sys-btn.secondary-dark { background: rgba(0,0,0,0.1); color: #1E1B4B; border: 2px solid #1E1B4B; }
.sys-btn:active { transform: scale(0.95); }
.shake { animation: sys-shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
@keyframes sys-shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
.sys-pop-enter-active .sys-modal-card, .sys-pop-enter-active .triad-popup-card { animation: bouncyIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.sys-pop-leave-active .sys-modal-card, .sys-pop-leave-active .triad-popup-card { transform: scale(0.8); transition: 0.3s; }
@keyframes bouncyIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
</style>
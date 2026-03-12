//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/components/os/mobile/MobileDockMobile.vue
//#######################################################################

<template>
  <div class="mobile-dock-wrapper-root">

    <nav class="legal-drawer" :class="{ 'drawer-open': showLegal }" :style="themeStyles" aria-label="Site Directory Menu">
      <div class="legal-content">
        <div class="drawer-header"><span class="drawer-title">DIRECTORY</span><button class="btn-close" @click="showLegal = false"><i class="mdi mdi-close"></i></button></div>
        <div class="menu-grid">
          <router-link to="/about-us" class="menu-card" @click="showLegal = false"><div class="icon-box blue-grad"><i class="mdi mdi-information-variant"></i></div><span class="menu-text">About</span></router-link>
          <router-link to="/contact-us" class="menu-card" @click="showLegal = false"><div class="icon-box green-grad"><i class="mdi mdi-lifebuoy"></i></div><span class="menu-text">Support</span></router-link>
          <a href="/sitemap.xml" target="_blank" class="menu-card" @click="showLegal = false"><div class="icon-box purple-grad"><i class="mdi mdi-map-outline"></i></div><span class="menu-text">Sitemap</span></a>
          <router-link to="/store" class="menu-card" @click="showLegal = false"><div class="icon-box gold-grad"><i class="mdi mdi-store-outline"></i></div><span class="menu-text">Store</span></router-link>
        </div>
        <div class="legal-divider"></div>
        <div class="legal-list">
          <router-link to="/privacy-policy" class="list-item" @click="showLegal = false"><span class="list-label">Privacy Policy</span><i class="mdi mdi-chevron-right list-arrow"></i></router-link>
          <router-link to="/terms-of-service" class="list-item" @click="showLegal = false"><span class="list-label">Terms of Service</span><i class="mdi mdi-chevron-right list-arrow"></i></router-link>
          <router-link to="/dmca" class="list-item danger" @click="showLegal = false"><span class="list-label">DMCA Takedown</span><i class="mdi mdi-alert-circle-outline"></i></router-link>
        </div>
        <div class="legal-footer">&copy; {{ new Date().getFullYear() }} Flowork Corp.</div>
      </div>
    </nav>

    <div class="mobile-dock-container" :class="{ 'dock-hidden': hidden, 'mobile-collapsed': !uiStore.isMobileDockOpen }" :style="themeStyles" role="navigation">

      <div class="dock-toggle-handle" @click="uiStore.toggleMobileDock()">
        <svg v-if="!uiStore.isMobileDockOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>

      <div class="dock-centering-wrapper">
        <div class="dock-main-deck">
          <button type="button" class="dock-item fixed-btn nav-arrow" @click.stop="scrollListLeft"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>

          <div class="history-track hide-scrollbar" ref="recentsContainer" role="list">
              <slot name="history">
                  <div v-for="app in dockApps" :key="app.id || app.slug" class="dock-app-item" role="listitem" @click="launchApp(app)" :title="app.name" style="position: relative;">
                    <img :src="resolveIcon(app)" :alt="app.name" class="app-icon-img" loading="lazy" @error="fixIcon" />

                    <div class="delete-overlay" @click.stop="removeApp(app)">
                        <i class="mdi mdi-close-circle"></i>
                    </div>
                  </div>

                  <div v-if="dockApps.length === 0" class="empty-favorites" @click="handleSidebar" role="listitem">
                      <i class="mdi mdi-plus-circle-outline" style="font-size: 18px; margin-right: 5px;"></i><span class="empty-text">Add Favs</span>
                  </div>
              </slot>
          </div>

          <button type="button" class="dock-item fixed-btn nav-arrow" @click.stop="scrollListRight"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
          <div class="mini-divider"></div>
          <button type="button" class="dock-item fixed-btn" @click.stop="handleTheme"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg></button>
          <button type="button" class="dock-item fixed-btn" @click.stop="handleSidebar"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
          <button type="button" class="dock-item fixed-btn" :class="{ 'active-state': showLegal }" @click.stop="toggleLegal"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg></button>
        </div>
      </div>
    </div>

    <div class="drawer-backdrop" v-if="showLegal" @click="showLegal = false"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppStore } from '@/store/apps';
import { useUiStore } from '@/store/ui';

defineProps({ hidden: { type: Boolean, default: false } });
const emit = defineEmits(['sidebar', 'theme', 'share', 'back', 'home', 'options', 'info']);

const router = useRouter();
const route = useRoute();
const recentsContainer = ref(null);
const showLegal = ref(false);
const appStore = useAppStore();
const uiStore = useUiStore();

const currentTheme = ref('light');
let themeObserver = null;

const syncThemeFromGlobal = () => {
  const globalTheme = document.documentElement.getAttribute('data-theme');
  currentTheme.value = globalTheme || localStorage.getItem('flowork_os_theme') || 'light';
};

const themeStyles = computed(() => {
  const theme = currentTheme.value;
  const baseLight = { '--d-bg': 'rgba(255, 255, 255, 0.95)', '--d-text': '#64748b', '--d-text-hover': '#0f172a', '--d-item-bg': '#f1f5f9', '--d-shadow': '0 -10px 40px rgba(0,0,0,0.1)' };
  if (theme === 'dark') return { '--d-bg': 'rgba(18, 18, 18, 0.95)', '--d-text': '#aaaaaa', '--d-text-hover': '#ffffff', '--d-item-bg': 'rgba(255,255,255,0.05)', '--d-shadow': '0 -10px 40px rgba(0,0,0,0.5)' };
  return baseLight;
});

const favoriteApps = computed(() => appStore.getFavoriteAppsList.filter(app => app.android !== 'no'));

const dockApps = computed(() => {
    const favs = [...favoriteApps.value];
    const customs = appStore.customCanvasApps || [];

    customs.forEach(cApp => {
        if (!favs.find(f => (f.id === cApp.id || f.slug === cApp.slug || f.id === cApp.slug))) {
            favs.push(cApp);
        }
    });

    return favs;
});

const resolveIcon = (app) => {
  if ((app.id && app.id.startsWith('custom_')) || (app.slug && app.slug.startsWith('custom_'))) {
      return '/assets/icons/app_default.svg';
  }
  if (app.iconUrl) return app.iconUrl;
  let ico = app.icon || '/assets/icons/app_default.svg';
  if (ico.startsWith('http') || ico.startsWith('/')) return ico;
  const p = app.path || `/store/${app.slug || app.id}`;
  return `${p.replace(/\/$/, '')}/${ico}`;
};

const fixIcon = (e) => e.target.src = "/assets/icons/app_default.svg";
const vibrate = () => { if (typeof navigator !== 'undefined' && navigator.vibrate) try { navigator.vibrate(10); } catch(e){} };

const launchApp = (app) => {
  vibrate();
  const appId = app.id || app.slug;
  if (appStore.openApp) appStore.openApp(appId);
  if (route.path === '/canvas') { window.dispatchEvent(new CustomEvent('flowork-launch-app', { detail: app })); return; }
  if (route.path.startsWith('/flow/')) { window.location.href = `/flow/${appId}`; } else { router.push({ path: '/canvas', query: { app: appId, t: Date.now() } }); }
};

const removeApp = (app) => {
    vibrate();
    const targetId = app.id || app.slug;

    if (targetId && targetId.startsWith('custom_')) {
        if (appStore.deleteCustomApp) {
            appStore.deleteCustomApp(targetId);
        } else if (appStore.customCanvasApps) {
            const idx = appStore.customCanvasApps.findIndex(a => a.id === targetId || a.slug === targetId);
            if (idx !== -1) {
                appStore.customCanvasApps.splice(idx, 1);
                localStorage.setItem('flowork_custom_apps', JSON.stringify(appStore.customCanvasApps));
            }
        }
    } else {
        if (appStore.toggleFavorite) appStore.toggleFavorite(targetId);
    }
};

const handleSidebar = () => {
    vibrate();
    emit('sidebar');
    if (typeof uiStore.toggleLeftSidebar === 'function') uiStore.toggleLeftSidebar();
    window.dispatchEvent(new CustomEvent('flowork-toggle-sidebar'));
};
const handleTheme = () => { vibrate(); uiStore.toggleTheme(); emit('theme'); };
const toggleLegal = () => { vibrate(); showLegal.value = !showLegal.value; };
const scrollListLeft = () => { if (recentsContainer.value) recentsContainer.value.scrollBy({ left: -140, behavior: 'smooth' }); };
const scrollListRight = () => { if (recentsContainer.value) recentsContainer.value.scrollBy({ left: 140, behavior: 'smooth' }); };

onMounted(async () => {
  appStore.setDeviceType('mobile');
  if (appStore.installedApps.length === 0) await appStore.fetchInstalledApps();
  syncThemeFromGlobal();
  themeObserver = new MutationObserver((m) => { m.forEach((mu) => { if (mu.attributeName === 'data-theme') syncThemeFromGlobal(); }); });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
});
onUnmounted(() => { if (themeObserver) themeObserver.disconnect(); });
</script>

<style scoped>
.mobile-dock-wrapper-root { position: static; }

.mobile-dock-container {
    position: fixed; bottom: 0 !important; left: 0; width: 100%; height: 80px; padding-bottom: env(safe-area-inset-bottom, 20px); z-index: 99999; background-color: var(--d-bg);
    /* USER RULE #1: Remove blur */
    /* backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); */
    border-top: none; box-shadow: var(--d-shadow); color: var(--d-text); transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.3s; display: flex; align-items: center; justify-content: center;
}

.dock-hidden { transform: translateY(120%); }
.dock-toggle-handle { display: none; }
@media (max-width: 768px) {
  .mobile-dock-container.mobile-collapsed { transform: translateY(100%); }
  .dock-toggle-handle {
      display: flex; align-items: center; justify-content: center; position: absolute; top: -28px; left: 50%; transform: translateX(-50%); width: 60px; height: 28px; background-color: var(--d-bg);
      /* USER RULE #1: Remove blur */
      /* backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); */
      border-radius: 12px 12px 0 0; box-shadow: 0 -4px 10px rgba(0,0,0,0.1); cursor: pointer; z-index: 100000; color: var(--d-text);
  }
}
.dock-centering-wrapper { width: 100%; height: 100%; margin: 0 auto; display: flex; align-items: center; justify-content: center; position: relative; padding: 0 4px; max-width: 600px; }
.dock-main-deck { flex: 1; display: flex; align-items: center; justify-content: space-between; height: 100%; overflow: hidden; }
.history-track { flex: 1; height: 100%; display: flex; align-items: center; overflow-x: auto; -webkit-overflow-scrolling: touch; scroll-behavior: smooth; margin: 0 4px; padding: 0 4px; gap: 12px; mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent); }
.hide-scrollbar::-webkit-scrollbar { display: none; }
.dock-app-item { flex: 0 0 auto; width: 44px; height: 44px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.1s; background: var(--d-item-bg); border: 1px solid rgba(255,255,255,0.05); }
.dock-app-item:active { transform: scale(0.9); }
.app-icon-img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }

.delete-overlay {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 20px;
    height: 20px;
    background: #f43f5e;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    opacity: 0;
    transition: 0.2s;
    z-index: 2;
}
.dock-app-item:hover .delete-overlay { opacity: 1; }

.empty-favorites { display: flex; align-items: center; justify-content: center; width: 100%; opacity: 0.7; cursor: pointer; color: var(--d-text); border: 1px dashed rgba(128,128,128,0.3); border-radius: 8px; padding: 5px 10px; height: 40px; }
.empty-text { font-size: 0.75rem; font-weight: 600; }
.mini-divider { width: 1px; height: 24px; background: currentColor; margin: 0 4px; flex-shrink: 0; opacity: 0.1; }
.dock-item { flex: 0 0 auto; width: 48px; height: 100%; display: flex; align-items: center; justify-content: center; background: none; border: none; transition: 0.2s; cursor: pointer; color: var(--d-text); }
.dock-item:hover { color: var(--d-text-hover); }
.dock-item:active { transform: scale(0.92); }

.legal-drawer {
    position: fixed; bottom: 80px; left: 0; width: 100%; z-index: 10001; background: var(--d-bg);
    /* USER RULE #1: Remove blur */
    /* backdrop-filter: blur(20px); */
    border-top: none; box-shadow: 0 -20px 60px rgba(0,0,0,0.5); color: var(--d-text-hover); border-radius: 20px 20px 0 0; transform: translateY(150%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s; display: flex; justify-content: center; padding: 20px; padding-bottom: 40px;
}

.drawer-open { transform: translateY(0); }
.legal-content { width: 100%; max-width: 500px; }
.drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid rgba(128,128,128,0.1); }
.drawer-title { font-weight: 800; letter-spacing: 2px; }
.btn-close { background: var(--d-item-bg); border-radius: 50%; width: 36px; height: 36px; border: none; color: var(--d-text-hover); display: flex; align-items: center; justify-content: center; }
.menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.menu-card { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--d-item-bg); border-radius: 12px; text-decoration: none; color: var(--d-text-hover); }
.icon-box { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; }
.blue-grad { background: linear-gradient(135deg, #3b82f6, #06b6d4); }
.green-grad { background: linear-gradient(135deg, #10b981, #34d399); }
.purple-grad { background: linear-gradient(135deg, #8b5cf6, #d946ef); }
.gold-grad { background: linear-gradient(135deg, #f97316, #f43f5e); }
.legal-divider { height: 1px; background: rgba(128,128,128,0.1); margin: 20px 0; }
.legal-list { display: flex; flex-direction: column; gap: 8px; }
.list-item { display: flex; justify-content: space-between; padding: 12px; background: var(--d-item-bg); border-radius: 8px; color: var(--d-text-hover); text-decoration: none; }
.list-item.danger { color: #ff8a80; }
.legal-footer { text-align: center; margin-top: 20px; color: var(--d-text); font-size: 0.8rem; }

.drawer-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.9);
    z-index: 10000;
}
</style>
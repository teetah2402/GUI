//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\layouts\DefaultLayout.vue total lines 293 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <v-app class="flowork-app" :class="[{ 'is-immersive-mode': isImmersiveRoute }, currentTheme]">
    <v-main class="flowork-main reset-padding-layout">
      <div class="layout-container">
        <div class="content-area d-flex flex-column">
          <div class="header-wrapper-fit" v-if="!isImmersiveRoute">

            <template v-if="!authStore.isAuthenticated">
               <PublicHeader class="guest-header-override" />
            </template>

            <template v-else>
               <AppBar class="fit-height" />
            </template>

            </div>

          <div class="view-container-fit position-relative overflow-hidden">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
/* [FIXED] Menghilangkan sisa padding layout */
.reset-padding-layout {
  padding: 0 !important;
  --v-layout-top: 0px !important;
}

.layout-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.content-area {
  flex-grow: 1;
  height: 100%;
  overflow: hidden;
}

/* [MODIFIED] Menghapus 8dvh/80dvh/12dvh yang menyebabkan gape */
.header-wrapper-fit {
  height: auto !important;
  flex-shrink: 0;

  /* [ADDED] Pastikan header di atas konten */
  z-index: 50;
  position: relative;
}

.view-container-fit {
  flex-grow: 1 !important; /* Otomatis mengisi seluruh sisa layar */
  display: flex;
  flex-direction: column;
}

/* [ADDED] Style tambahan agar PublicHeader pas di dalam layout ini */
.guest-header-override {
  position: relative !important;
  width: 100%;
  z-index: 999;
}

.glass-effect { backdrop-filter: blur(12px); }
</style>
<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { useLocaleStore } from '@/store/locale';
import { storeToRefs } from 'pinia';

import AppBar from '@/components/AppBar.vue';

import PublicHeader from '@/components/layout/PublicHeader.vue';

const route = useRoute();
const authStore = useAuthStore();
const uiStore = useUiStore();
const localeStore = useLocaleStore();
const { loc } = storeToRefs(localeStore);
const currentTheme = ref('dark'); // Default theme

const isImmersiveRoute = computed(() => {
  const immersivePaths = ['/design', '/engines'];
  return immersivePaths.some(path => route.path.startsWith(path));
});

const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', value: 'dashboard', to: '/dashboard' },
  { title: 'Widgets', icon: 'mdi-view-grid-plus-outline', value: 'widgets', to: '/widgets' },
  { title: 'Designer', icon: 'mdi-vector-polyline', value: 'designer', to: '/design' },
  { title: 'My Engines', icon: 'mdi-server-network', value: 'engines', to: '/engines' },
];

function isRouteActive(path) {
  return route.path === path;
}

const isUserIdle = ref(false);
let idleTimer = null;

const resetIdleTimer = () => {
  isUserIdle.value = false;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    isUserIdle.value = true;
  }, 300000);
};

let themeObserver = null;

const applyThemeToLayout = (themeName) => {
  console.log(`[Layout] Theme changed to: ${themeName}`);
  currentTheme.value = themeName;
  const root = document.documentElement;

  if (themeName === 'light') {
    root.style.setProperty('--c-bg-app', '#F5F7FA');
    root.style.setProperty('--c-text-app', '#1A1A1A');
  } else {
    root.style.setProperty('--c-bg-app', '#0F111A');
    root.style.setProperty('--c-text-app', '#E0E0E0');
  }
};

onMounted(() => {
  window.addEventListener('mousemove', resetIdleTimer);
  window.addEventListener('keydown', resetIdleTimer);
  window.addEventListener('click', resetIdleTimer);
  window.addEventListener('scroll', resetIdleTimer);
  resetIdleTimer();

  const htmlElement = document.documentElement;
  applyThemeToLayout(htmlElement.getAttribute('data-theme') || 'dark');

  themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        const newTheme = htmlElement.getAttribute('data-theme');
        applyThemeToLayout(newTheme);
      }
    });
  });

  themeObserver.observe(htmlElement, { attributes: true });
});

onUnmounted(() => {
  window.removeEventListener('mousemove', resetIdleTimer);
  window.removeEventListener('keydown', resetIdleTimer);
  window.removeEventListener('click', resetIdleTimer);
  window.removeEventListener('scroll', resetIdleTimer);
  clearTimeout(idleTimer);

  if (themeObserver) {
    themeObserver.disconnect();
  }
});
</script>

<style scoped>
.flowork-app {
  background-color: var(--c-bg-app, #0F111A);
  color: var(--c-text-app, #E0E0E0);
  font-family: 'Inter', sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* [MODIFIED] Reset total padding agar Dashboard bisa mepet */
.reset-v-main-padding {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.flowork-main {
  height: 100dvh;
  overflow: hidden;
}

.layout-container {
  display: flex;
  height: 100%;
  width: 100%;
  position: relative;
}

.sidebar-area {
  width: 56px;
  flex-shrink: 0;
  z-index: 100;
  height: 100%;
}

.content-area {
  flex-grow: 1;
  height: 100%;
  overflow: hidden;
  position: relative;
}

/* [MODIFIED] Dinamis, tidak lagi dipaksa 8dvh */
.layout-header-wrapper {
  /* height: 8dvh; */ /* */
  height: auto !important;
  width: 100%;
  flex-shrink: 0;
  z-index: 50;
}

/* [MODIFIED] Flex 1 agar mengisi ruang sisa secara otomatis */
.view-container {
  /* height: 80dvh; */ /* */
  height: auto !important;
  flex: 1 !important;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* [MODIFIED] Footer ditiadakan tingginya jika kosong */
.layout-footer-wrapper {
  /* height: 12dvh; */ /* */
  height: auto !important;
  width: 100%;
  flex-shrink: 0;
  background: transparent;
  z-index: 50;
}

.main-sidebar {
  background: rgba(20, 20, 30, 0.6) !important;
  backdrop-filter: blur(12px);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-active { color: #00F5FF !important; background: rgba(0, 245, 255, 0.1); }
.logo-glow { filter: drop-shadow(0 0 8px rgba(0, 245, 255, 0.5)); transition: transform 0.3s; }
.logo-glow:hover { transform: rotate(180deg); }
.nav-btn:hover { color: #00F5FF; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.idle-watcher-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle, transparent 20%, #000 90%);
  z-index: 99999;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

.idle-watcher-overlay.active {
  opacity: 1;
  background-color: rgba(0,0,0,0.85);
  pointer-events: auto;
}

.idle-content {
  text-align: center;
  transform: scale(0.9);
  transition: transform 0.5s;
}

.active .idle-content {
  transform: scale(1);
}

.glow-text {
  text-shadow: 0 0 20px rgba(0, 245, 255, 0.8);
}
</style>

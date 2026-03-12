//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/App.vue
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <v-app :data-theme="uiStore.currentTheme" :class="{ 'immersive-app-mode': isImmersivePage }">
    <GuestLayout>
      <router-view v-slot="{ Component }">
        <keep-alive :include="['AppStore', 'CanvasApp']" :max="3">
          <component :is="Component" :key="routeKey" />
        </keep-alive>
      </router-view>
    </GuestLayout>
  </v-app>
</template>

<script setup>
import { onMounted, computed, ref, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import { useUiStore } from '@/store/ui';

// [TAMBAHAN KODE] Meng-import P2P Store untuk menggantikan Socket lama
import { useP2PStore } from '@/store/p2p';

import GuestLayout from '@/layouts/GuestLayout.vue';

const CookieConsentBanner = defineAsyncComponent(() => import('@/components/CookieConsentBanner.vue'));

const route = useRoute();
const uiStore = useUiStore();

// [TAMBAHAN KODE] Inisialisasi P2P Store
const p2pStore = useP2PStore();

const isMobileBrowser = ref(window.innerWidth < 960);

const isImmersivePage = computed(() => {
    const immersiveRoutes = [
        'FlowDesigner', 'AppRunner', 'CanvasOS', 'AppDirectView'
    ];
    const isCanvasOrFlow = route.path === '/' ||
           route.name === 'CanvasOS' ||
           route.path.startsWith('/flow/') ||
           route.name === 'AppDirectView';

    return immersiveRoutes.includes(route.name) || isCanvasOrFlow || route.path.includes('/canvas');
});

const routeKey = computed(() => {
  if (route.name === 'AppStore' || route.path.startsWith('/store')) {
    return 'static-store-key';
  }

  if (route.name === 'CanvasOS') {
    const hasQuery = Object.keys(route.query).length > 0;
    if (!hasQuery) {
      return 'static-home-desktop';
    } else {
      return route.fullPath;
    }
  }

  return route.fullPath;
});

onMounted(async () => {
  uiStore.initTheme();

  // [TAMBAHAN KODE] Menjalankan proses jabat tangan P2P WebRTC saat aplikasi pertama kali dimuat
  p2pStore.connect();

  window.addEventListener('resize', () => { isMobileBrowser.value = window.innerWidth < 960; }, { passive: true });
});
</script>

<style>
/* PERFORMANCE CSS: ZERO LATENCY */
html, body {
  overflow: hidden !important;
  height: 100% ;
  width: 100% ;
  margin: 0;
  padding: 0;
  background-color: var(--c-bg-page, #000000) !important;
  transition: background-color 0.3s ease;
}

.v-application, .v-application__wrap {
  background-color: transparent !important;
  background: transparent !important;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.v-main { --v-layout-bottom: 0px !important; padding-bottom: 0px !important; }

.public-main {
  flex-grow: 1;
  overflow: hidden;
  padding-top: 0 !important;
  position: relative;
  z-index: 1;
  height: 100vh;
  background-color: transparent !important;
  contain: content;
}

.force-fullscreen, .no-padding-main, .immersive-layout { padding: 0 !important; margin: 0 !important; height: 100vh !important; overflow: hidden !important; }
.main-content-wrapper { height: 100vh !important; display: flex; flex-direction: column; overflow: hidden; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

::-webkit-scrollbar { display: none !important; width: 0 !important; }
* { scrollbar-width: none !important; }
</style>
//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/layouts/GuestLayout.vue
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="guest-layout-wrapper" :data-theme="currentTheme">

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

    <div class="public-header-container">
      <PublicHeader
        @toggle-sidebar="toggleRightSidebar"
        class="guest-header"
      />
    </div>

    <main class="guest-main" :class="{
        'with-dock': showDock && !isLanderPage,
        'lander-mode': isLanderPage,
        'flow-mode': isFlowPage,
        'header-collapsed': !uiStore.isMobileHeaderOpen,
        'dock-collapsed': !uiStore.isMobileDockOpen
    }">
      <slot></slot>
    </main>

    <GuestLeftSidebar
      :is-open="isLeftSidebarOpen"
      @close="isLeftSidebarOpen = false"
    />

    <GuestSidebar
      :is-open="isRightSidebarOpen"
      @close="isRightSidebarOpen = false"
    />

    <Teleport to="body">
      <div v-if="!isLanderPage && !isHideDockRoute">
        <MobileDock
          :hidden="!showDock"
          @sidebar="toggleLeftSidebar"
          @theme="syncThemeFromGlobal"
          style="z-index: 999999; pointer-events: auto;"
        />
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUiStore } from '@/store/ui';

import PublicHeader from '@/components/layout/PublicHeader.vue';
import MobileDock from '@/components/os/MobileDock.vue';
import GuestSidebar from '@/components/layout/GuestSidebar.vue';
import GuestLeftSidebar from '@/components/layout/GuestLeftSidebar.vue';

const route = useRoute();
const uiStore = useUiStore();
const isRightSidebarOpen = ref(false);
const isLeftSidebarOpen = ref(false);
const showDock = ref(true);
const currentTheme = ref('dark');

const isLanderPage = computed(() => {
    return route.path === '/' || route.name === 'Lander';
});

const isFlowPage = computed(() => {
    return route.path.startsWith('/flow/') || route.name === 'AppDirectView' || route.name === 'FlowDesigner';
});

const isHideDockRoute = computed(() => {
    return route.meta?.hideMobileDock === true || isFlowPage.value;
});

const toggleRightSidebar = () => {
  isRightSidebarOpen.value = !isRightSidebarOpen.value;
  if (isRightSidebarOpen.value) isLeftSidebarOpen.value = false;
};

const toggleLeftSidebar = () => {
  isLeftSidebarOpen.value = !isLeftSidebarOpen.value;
  if (isLeftSidebarOpen.value) isRightSidebarOpen.value = false;
};

const syncThemeFromGlobal = () => {
  const globalTheme = document.documentElement.getAttribute('data-theme');
  currentTheme.value = globalTheme || localStorage.getItem('flowork_os_theme') || 'dark';
};

let lastScrollY = 0;
const handleScroll = () => {
  const currentScrollY = window.scrollY;
  if (!isLanderPage.value) {
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      showDock.value = false;
    } else {
      showDock.value = true;
    }
  }
  lastScrollY = currentScrollY;
};

let themeObserver = null;

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  syncThemeFromGlobal();
  themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (m.attributeName === 'data-theme') syncThemeFromGlobal();
    });
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  if (themeObserver) themeObserver.disconnect();
});
</script>

<style scoped>
.guest-layout-wrapper { position: relative; min-height: 100vh; width: 100%; overflow-x: hidden; background-color: var(--bg-page); transition: background-color 0.3s ease; }
.guest-layout-wrapper[data-theme="light"] { --bg-page: #f8fafc; }
.guest-layout-wrapper[data-theme="dark"] { --bg-page: #050505; }
.guest-layout-wrapper[data-theme="hacker"] { --bg-page: #000000; }
.guest-main { position: relative; z-index: 1; min-height: 100vh; width: 100%; box-sizing: border-box; }
.public-header-container { position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; }

/* OS BG STYLES COPIED VERBATIM... */
.os-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.cyberpunk-scene { position: absolute; inset: 0; background: #020205; perspective: 1000px; }
.cyber-grid-floor { position: absolute; width: 200%; height: 200%; top: -50%; left: -50%; background-image: linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px); background-size: 60px 60px; transform: rotateX(60deg); animation: grid-move 20s linear infinite; filter: drop-shadow(0 0 2px #06b6d4); }
.cyber-horizon-glow { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 50% 0%, #06b6d4 0%, transparent 60%); opacity: 0.15; mix-blend-mode: screen; }
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
</style>

<style>
/* 1. DESKTOP SAFE ZONE */
.guest-main {
  padding-top: 80px !important;
  padding-bottom: 120px !important;
}

/* Biarkan padding-top: 0 di sini jika landing page memang didesain transparan tertimpa header */
.guest-main.lander-mode {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.guest-main.flow-mode {
  padding-bottom: 0 !important;
}

/* 2. MOBILE SAFE ZONE & FIX GAP */
@media (max-width: 768px) {
  .guest-main {
    padding-top: 70px !important;
    padding-bottom: 140px !important;
    transition: padding-top 0.4s cubic-bezier(0.2, 0.8, 0.2, 1),
                padding-bottom 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .guest-main.header-collapsed {
    padding-top: 0 !important;
  }

  .guest-main.dock-collapsed {
    padding-bottom: 0 !important;
  }

  .guest-main.lander-mode {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  .guest-main.flow-mode {
    padding-bottom: 0 !important;
  }
}

/* 3. SCROLL FIX */
.guest-sidebar-panel .custom-scroll,
.guest-sidebar-panel .app-grid-container,
.guest-sidebar-panel .scrollable-content,
aside .custom-scroll {
  padding-bottom: 120px !important;
}

[class*="sidebar"] .content-wrapper,
[class*="drawer"] .scroll-area {
  padding-bottom: 120px !important;
}
</style>
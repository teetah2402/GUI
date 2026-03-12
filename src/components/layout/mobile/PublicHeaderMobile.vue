//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\components\layout\mobile\PublicHeaderMobile.vue
//#######################################################################

<template>
  <header class="public-header" :class="{ 'scrolled': isScrolled, 'mobile-collapsed': !uiStore.isMobileHeaderOpen }" :style="themeStyles">

    <div class="header-toggle-handle" @click="uiStore.toggleMobileHeader()">
       <svg v-if="!uiStore.isMobileHeaderOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
       <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
    </div>

    <div class="center-container px-safe">
      <div class="header-content">

        <div class="brand-wrapper" @click="navigate('/store')">
          <div class="brand-icon">
             <img src="/logo-android.svg" alt="Flowork Logo" class="logo-svg" width="42" height="42" />
          </div>
          <div class="brand-text">
            <h1 class="header-title">Flowork</h1>
            <span class="header-subtitle">OS & Cloud</span>
          </div>
        </div>

        <div class="mobile-nav-toggle" style="display: flex; gap: 8px; align-items: center;">

          <button class="menu-btn-modern" @click="toggleLang" title="Switch Language" style="font-weight: 800; font-family: monospace; font-size: 0.8rem;">
            {{ currentLang.toUpperCase() }}
          </button>

          <button class="menu-btn-modern" @click="$emit('toggle-sidebar')" aria-label="Toggle Menu">
            <i class="mdi mdi-menu" style="font-size: 24px;"></i>
          </button>
        </div>

      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useUiStore } from '@/store/ui';

const router = useRouter();
const route = useRoute();
const emit = defineEmits(['toggle-sidebar', 'toggle-lang']);

const uiStore = useUiStore();
const isScrolled = ref(false);
const currentTheme = ref('dark');
const currentLang = ref('en');
let themeObserver = null;


const navigate = (path) => { router.push(path); };

const toggleLang = () => {
    currentLang.value = currentLang.value === 'en' ? 'id' : 'en';
    localStorage.setItem('flowork_lang', currentLang.value);
    emit('toggle-lang', currentLang.value);
};

const syncThemeFromGlobal = () => {
  const globalTheme = document.documentElement.getAttribute('data-theme');
  currentTheme.value = globalTheme || localStorage.getItem('flowork_os_theme') || 'dark';
};

const themeStyles = computed(() => {
  const theme = currentTheme.value;
  const base = { '--h-bg': 'rgba(15, 17, 26, 0.95)', '--h-text': '#ffffff', '--h-text-muted': '#94a3b8', '--h-pill-hover': 'rgba(255,255,255,0.05)', '--h-shadow': '0 4px 30px rgba(0,0,0,0.5)' };
  if (theme === 'light') return { '--h-bg': 'rgba(255, 255, 255, 0.98)', '--h-text': '#0f172a', '--h-text-muted': '#64748b', '--h-pill-hover': 'rgba(0,0,0,0.05)', '--h-shadow': '0 4px 20px rgba(0,0,0,0.08)' };
  if (theme === 'hacker') return { '--h-bg': 'rgba(0, 0, 0, 0.98)', '--h-text': '#00ff00', '--h-text-muted': '#008f00', '--h-pill-hover': 'rgba(0, 255, 0, 0.1)', '--h-shadow': '0 4px 20px rgba(0,255,0,0.1)' };
  return base;
});

const handleScroll = () => { isScrolled.value = window.scrollY > 20; };

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  const saved = localStorage.getItem('flowork_lang');
  if(saved) currentLang.value = saved;
  syncThemeFromGlobal();
  themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((m) => { if (m.attributeName === 'data-theme') syncThemeFromGlobal(); });
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  if (themeObserver) themeObserver.disconnect();
});
</script>

<style scoped>
.public-header {
    position: fixed; top: 0; left: 0; right: 0; width: 100%; z-index: 1000;
    background: var(--h-bg); color: var(--h-text); box-shadow: var(--h-shadow);
    /* USER RULE #1: Remove blur */
    /* backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); */
    height: 70px; display: flex; align-items: center;
    transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.3s, box-shadow 0.4s;
    box-sizing: border-box;
}
.public-header.mobile-collapsed { transform: translateY(calc(-100% - 1px)); box-shadow: none; }
.header-toggle-handle { display: flex; align-items: center; justify-content: center; position: absolute; bottom: -28px; left: 50%; transform: translateX(-50%); width: 60px; height: 28px; background-color: var(--h-bg); border-radius: 0 0 12px 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); cursor: pointer; z-index: 100000; color: var(--h-text); border-top: 1px solid var(--h-bg); }
.center-container { width: 100%; padding: 0 10px; }
.header-content { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.brand-wrapper { display: flex; align-items: center; cursor: pointer; }
.brand-icon { width: 42px; height: 42px; margin-right: 12px; }
.logo-svg { width: 100%; height: 100%; object-fit: contain; }
.brand-text { display: flex; flex-direction: column; line-height: 1; }
.header-title { font-size: 1.2rem; font-weight: 800; margin: 0; color: var(--h-text); }
.header-subtitle { font-size: 0.75rem; font-weight: 600; color: var(--h-text-muted); }
.menu-btn-modern { width: 40px; height: 40px; border-radius: 12px; border: 1px solid rgba(128,128,128,0.3); background: transparent; cursor: pointer; color: var(--h-text); opacity: 0.7; }
.blog-btn:hover { background: rgba(233, 30, 99, 0.15); color: #e91e63; border-color: rgba(233, 30, 99, 0.3); opacity: 1; }
</style>
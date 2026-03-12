//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\components\layout\desktop\PublicHeaderDesktop.vue
//#######################################################################

<template>
  <header class="public-header" :class="{ 'scrolled': isScrolled /*, 'hide-on-lander': isLanderRoute */ }" :style="themeStyles">
    <div class="center-container">
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

        <nav class="desktop-nav">
          <button class="nav-pill canvas-btn" :class="{ active: currentActive === 'canvas' }" @click="navigate('/canvas')">
            <span class="nav-icon-bg"><i class="mdi mdi-view-dashboard-variant"></i></span>
            <span class="nav-text">Canvas</span>
          </button>

          <button class="nav-pill flow-btn" :class="{ active: currentActive === 'flow-designer' }" @click="navigate('/flow-designer')">
            <span class="nav-icon-bg"><i class="mdi mdi-sitemap"></i></span>
            <span class="nav-text">Flow Builder</span>
          </button>

          <button class="nav-pill store-btn" :class="{ active: currentActive === 'store' }" @click="navigate('/store')">
            <span class="nav-icon-bg"><i class="mdi mdi-storefront"></i></span>
            <span class="nav-text">App Store</span>
          </button>

          <button class="nav-pill blog-btn" :class="{ active: currentActive === 'blog' }" @click="navigate('/blog')">
            <span class="nav-icon-bg"><i class="mdi mdi-newspaper-variant-outline"></i></span>
            <span class="nav-text">Journal</span>
          </button>

          <div class="nav-divider"></div>

          <button class="nav-pill lang-btn" @click="toggleLang" title="Switch Language">
             <i class="mdi mdi-web"></i>
             <span class="lang-text">{{ currentLang.toUpperCase() }}</span>
          </button>

          <div class="nav-divider"></div>

          <button class="nav-pill login-btn" :class="{ active: currentActive === 'login' }" @click="navigate('/login')">
            <span class="nav-icon-bg"><i class="mdi mdi-login"></i></span>
            <span class="nav-text">Login</span>
          </button>
          <button class="nav-pill register-btn" :class="{ active: currentActive === 'register' }" @click="navigate('/register')">
            <span class="nav-icon-bg"><i class="mdi mdi-rocket-launch"></i></span>
            <span class="nav-text">Join Free</span>
          </button>
        </nav>

      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted, onUnmounted, computed } from 'vue';

const router = useRouter();
const route = useRoute();
const emit = defineEmits(['toggle-sidebar', 'toggle-lang']);

const isScrolled = ref(false);
const currentLang = ref('en');
const currentTheme = ref('dark');
let themeObserver = null;

const isLanderRoute = computed(() => route.name === 'Lander' || route.path === '/');

const syncThemeFromGlobal = () => {
  const globalTheme = document.documentElement.getAttribute('data-theme');
  currentTheme.value = globalTheme || localStorage.getItem('flowork_os_theme') || 'dark';
};

const themeStyles = computed(() => {
  const theme = currentTheme.value;
  const base = {
    '--h-bg': 'rgba(15, 17, 26, 0.85)',
    '--h-text': '#ffffff',
    '--h-text-muted': '#94a3b8',
    '--h-pill-hover': 'rgba(255,255,255,0.05)',
    '--h-shadow': '0 4px 30px rgba(0,0,0,0.5)'
  };
  if (theme === 'light') {
    return {
      '--h-bg': 'rgba(255, 255, 255, 0.9)',
      '--h-text': '#0f172a',
      '--h-text-muted': '#64748b',
      '--h-pill-hover': 'rgba(0,0,0,0.05)',
      '--h-shadow': '0 4px 20px rgba(0,0,0,0.08)'
    };
  } else if (theme === 'hacker') {
    return {
      '--h-bg': 'rgba(0, 0, 0, 0.95)',
      '--h-text': '#00ff00',
      '--h-text-muted': '#008f00',
      '--h-pill-hover': 'rgba(0, 255, 0, 0.1)',
      '--h-shadow': '0 4px 20px rgba(0,255,0,0.1)'
    };
  }
  return base;
});

const currentActive = computed(() => {
  const path = route.path;
  if (path === '/') return 'home';
  if (path.startsWith('/canvas')) return 'canvas';
  if (path.startsWith('/flow-designer')) return 'flow-designer'; // [NEW] Active state
  if (path.startsWith('/store')) return 'store';
  if (path.startsWith('/blog')) return 'blog';
  if (path.startsWith('/login')) return 'login';
  if (path.startsWith('/register')) return 'register';
  return '';
});

const navigate = (path) => { router.push(path); };

const toggleLang = () => {
    currentLang.value = currentLang.value === 'en' ? 'id' : 'en';
    localStorage.setItem('flowork_lang', currentLang.value);
    emit('toggle-lang', currentLang.value);
};

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
.public-header { position: fixed; top: 0; left: 0; right: 0; width: 100%; z-index: 1000; background: var(--h-bg); color: var(--h-text); box-shadow: var(--h-shadow); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); height: 80px; display: flex; align-items: center; transition: background-color 0.3s, height 0.3s; }
.public-header.scrolled { box-shadow: 0 10px 30px rgba(0,0,0,0.5); height: 70px; }
.center-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 20px; height: 100%; display: flex; align-items: center; }
.header-content { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.brand-wrapper { display: flex; align-items: center; cursor: pointer; }
.brand-icon { width: 42px; height: 42px; margin-right: 12px; }
.logo-svg { width: 100%; height: 100%; object-fit: contain; }
.brand-text { display: flex; flex-direction: column; line-height: 1; }
.header-title { font-size: 1.2rem; font-weight: 800; margin: 0; color: var(--h-text); }
.header-subtitle { font-size: 0.75rem; font-weight: 600; color: var(--h-text-muted); }
.desktop-nav { display: flex; align-items: center; gap: 8px; }
.nav-pill { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: transparent; border: 1px solid transparent; color: var(--h-text-muted); border-radius: 12px; cursor: pointer; transition: all 0.25s ease; font-weight: 600; font-size: 0.9rem; }
.nav-icon-bg { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-size: 1.1rem; transition: all 0.25s ease; color: inherit; }
.nav-pill:hover { background: var(--h-pill-hover); color: var(--h-text); }
.nav-pill.lang-btn { font-size: 0.8rem; border: 1px solid rgba(128,128,128,0.3); opacity: 0.8; }
.lang-text { font-weight: 700; letter-spacing: 0.5px; }
.nav-pill.active { background: rgba(128,128,128,0.1); color: var(--h-text); }
.nav-pill.canvas-btn.active { background: rgba(3, 169, 244, 0.15); color: #03a9f4; border-color: rgba(3, 169, 244, 0.3); }

/* [NEW] CSS State Flow Builder Button */
.nav-pill.flow-btn.active { background: rgba(255, 170, 0, 0.15); color: #ffaa00; border-color: rgba(255, 170, 0, 0.3); }

.nav-pill.store-btn.active { background: rgba(0, 230, 118, 0.15); color: #00e676; border-color: rgba(0, 230, 118, 0.3); }
.nav-pill.blog-btn.active { background: rgba(233, 30, 99, 0.15); color: #e91e63; border-color: rgba(233, 30, 99, 0.3); }
.nav-pill.login-btn.active { background: rgba(156, 39, 176, 0.15); color: #d05ce3; border-color: rgba(156, 39, 176, 0.3); }
.nav-pill.register-btn.active { background: rgba(255, 152, 0, 0.15); color: #ff9800; border-color: rgba(255, 152, 0, 0.3); }
.nav-divider { width: 1px; height: 24px; background: currentColor; opacity: 0.2; margin: 0 4px; }
</style>
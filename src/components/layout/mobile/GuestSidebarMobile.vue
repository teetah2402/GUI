//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\components\layout\mobile\GuestSidebarMobile.vue
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="guest-sidebar-wrapper">
    <transition name="fade">
      <div v-if="isOpen" class="sidebar-backdrop" @click="$emit('close')"></div>
    </transition>

    <div class="guest-sidebar" :class="{ 'is-open': isOpen }" :style="themeStyles">

      <div class="sidebar-header">
        <h3 class="orbitron-title">NAVIGATION</h3>
        <button class="close-btn" @click="$emit('close')" aria-label="Close Sidebar">
          <i class="mdi mdi-close"></i>
        </button>
      </div>

      <div class="sidebar-content">
        <div class="nav-section">
          <div class="section-label">MENU</div>
          <router-link to="/" class="nav-item" @click="$emit('close')">
            <i class="mdi mdi-home-variant-outline icon"></i><span>Home</span>
          </router-link>

          <router-link to="/canvas" class="nav-item" @click="$emit('close')">
            <i class="mdi mdi-vector-square icon"></i><span>Canvas</span>
          </router-link>

          <router-link to="/flow-designer" class="nav-item" @click="$emit('close')">
            <i class="mdi mdi-sitemap-outline icon"></i><span>Flow Designer</span>
          </router-link>

          <router-link to="/store" class="nav-item" @click="$emit('close')">
            <i class="mdi mdi-storefront-outline icon"></i><span>App Store</span>
          </router-link>

          <router-link to="/blog" class="nav-item" @click="$emit('close')">
            <i class="mdi mdi-newspaper-variant-outline icon"></i><span>Blog</span>
          </router-link>
        </div>

        <div class="divider"></div>

        <div class="nav-section">
          <div class="section-label">ACCESS</div>
          <router-link to="/login" class="nav-item highlight" @click="$emit('close')">
            <i class="mdi mdi-login icon"></i><span>Login</span>
          </router-link>
          <router-link to="/register" class="nav-item accent" @click="$emit('close')">
            <i class="mdi mdi-rocket-launch-outline icon"></i><span>Register</span>
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

defineProps({ isOpen: Boolean });
defineEmits(['close']);

const currentTheme = ref('dark');
let themeObserver = null;

const syncThemeFromGlobal = () => {
  const globalTheme = document.documentElement.getAttribute('data-theme');
  currentTheme.value = globalTheme || localStorage.getItem('flowork_os_theme') || 'dark';
};

const themeStyles = computed(() => {
  const theme = currentTheme.value;
  const base = {
    '--sb-bg': '#1e2025', '--sb-border': 'rgba(255, 255, 255, 0.1)', '--sb-text': '#ffffff', '--sb-muted': '#64748b',
    '--sb-icon': '#94a3b8', '--sb-accent': '#00dc82', '--sb-hover': 'rgba(255, 255, 255, 0.05)', '--sb-backdrop': 'rgba(0,0,0,0.6)'
  };

  if (theme === 'light') {
    return {
      '--sb-bg': '#ffffff', '--sb-border': '#e2e8f0', '--sb-text': '#0f172a', '--sb-muted': '#94a3b8',
      '--sb-icon': '#64748b', '--sb-accent': '#2563eb', '--sb-hover': '#f1f5f9', '--sb-backdrop': 'rgba(0,0,0,0.2)'
    };
  } else if (theme === 'hacker') {
    return {
      '--sb-bg': '#000000', '--sb-border': '#003300', '--sb-text': '#00ff00', '--sb-muted': '#008f00',
      '--sb-icon': '#00bb00', '--sb-accent': '#00ff00', '--sb-hover': 'rgba(0, 50, 0, 0.5)', '--sb-backdrop': 'rgba(0, 20, 0, 0.8)'
    };
  }
  return base;
});

onMounted(() => {
  syncThemeFromGlobal();
  themeObserver = new MutationObserver((m) => {
    m.forEach((mu) => { if (mu.attributeName === 'data-theme') syncThemeFromGlobal(); });
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
});

onUnmounted(() => { if (themeObserver) themeObserver.disconnect(); });
</script>

<style scoped>
.guest-sidebar-wrapper { position: fixed; inset: 0; pointer-events: none; z-index: 2000; }
.sidebar-backdrop { position: absolute; inset: 0; background: var(--sb-backdrop, rgba(0,0,0,0.6)); pointer-events: auto; transition: background 0.3s; }
.guest-sidebar { position: absolute; top: 0; bottom: 0; right: 0; width: 300px; background: var(--sb-bg); border-left: 1px solid var(--sb-border); color: var(--sb-text); transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); pointer-events: auto; display: flex; flex-direction: column; box-shadow: -5px 0 20px rgba(0,0,0,0.2); }
.guest-sidebar.is-open { transform: translateX(0); }
.sidebar-header { padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--sb-border); }
.orbitron-title { color: var(--sb-accent); margin: 0; letter-spacing: 2px; font-family: 'Orbitron', sans-serif; font-weight: 700; }
.close-btn { background: none; border: none; color: var(--sb-text); font-size: 1.5rem; cursor: pointer; transition: transform 0.2s; }
.close-btn:hover { transform: rotate(90deg); color: var(--sb-accent); }
.sidebar-content { padding: 20px; overflow-y: auto; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 12px; color: var(--sb-text); text-decoration: none; border-radius: 8px; margin-bottom: 5px; transition: all 0.2s; }
.nav-item:hover { background: var(--sb-hover); transform: translateX(-2px); }
.nav-item.accent { background: var(--sb-accent); color: #000; font-weight: 600; margin-top: 10px; }
.nav-item.accent .icon { color: #000; }
.icon { font-size: 1.2rem; color: var(--sb-icon); transition: color 0.2s; }
.nav-item:hover .icon { color: var(--sb-accent); }
.divider { height: 1px; background: var(--sb-border); margin: 20px 0; opacity: 0.5; }
.section-label { font-size: 0.7rem; color: var(--sb-muted); margin-bottom: 8px; font-weight: 800; letter-spacing: 1px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
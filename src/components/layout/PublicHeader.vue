//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\components\layout\PublicHeader.vue
//#######################################################################

<template>
  <component :is="activeComponent" @toggle-sidebar="$emit('toggle-sidebar')" @toggle-lang="handleToggleLang" />
</template>

<script setup>
import { shallowRef, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useUiStore } from '@/store/ui'; // [ADD - IMPORT STORE UNTUK GLOBAL LANG REAKTIF]

const PublicHeaderDesktop = defineAsyncComponent(() => import('./desktop/PublicHeaderDesktop.vue'));
const PublicHeaderMobile = defineAsyncComponent(() => import('./mobile/PublicHeaderMobile.vue'));

// ADDED: Daftarkan emit toggle-lang
const emit = defineEmits(['toggle-sidebar', 'toggle-lang']);

const uiStore = useUiStore(); // [ADD - INIT UISTORE]
const activeComponent = shallowRef(null);

const checkDevice = () => {
  activeComponent.value = window.innerWidth < 960 ? PublicHeaderMobile : PublicHeaderDesktop;
};

// [ADD - HANDLER UNTUK MERUBAH STATE GLOBAL BAHASA TANPA RELOAD]
const handleToggleLang = (lang) => {
  if (uiStore.setLang) {
    uiStore.setLang(lang);
  } else {
    uiStore.currentLang = lang;
  }
  document.documentElement.lang = lang; // Aksesibilitas SEO
  emit('toggle-lang', lang);
};

onMounted(() => {
  checkDevice();
  window.addEventListener('resize', checkDevice);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkDevice);
});
</script>
//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\components\layout\GuestLeftSidebar.vue total lines 45 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <component :is="activeComponent" :is-open="isOpen" @close="$emit('close')" />
</template>

<script setup>
/* [ADD - DYNAMIC LOGIC WITH STORE SYNC] */
import { shallowRef, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useAppStore } from '@/store/apps'; // [ADD - STORE IMPORT]

const GuestLeftSidebarDesktop = defineAsyncComponent(() => import('./desktop/GuestLeftSidebarDesktop.vue'));
const GuestLeftSidebarMobile = defineAsyncComponent(() => import('./mobile/GuestLeftSidebarMobile.vue'));

const props = defineProps({ isOpen: Boolean });
defineEmits(['close']);

const appStore = useAppStore(); // [ADD - STORE INSTANCE]
const activeComponent = shallowRef(null);

const checkDevice = () => {
  const isMobile = window.innerWidth < 768;
  const newDeviceType = isMobile ? 'mobile' : 'desktop';

  if (appStore.deviceType !== newDeviceType) {
    appStore.setDeviceType(newDeviceType);
    appStore.fetchInstalledApps(true);
  }

  activeComponent.value = isMobile ? GuestLeftSidebarMobile : GuestLeftSidebarDesktop;
};

onMounted(() => {
  checkDevice();
  window.addEventListener('resize', checkDevice);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkDevice);
});
</script>

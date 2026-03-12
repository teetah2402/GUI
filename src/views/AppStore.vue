//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\AppStore.vue total lines 43 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <component :is="activeComponent" />

  </template>

<script setup>
/* [ADD - DYNAMIC GATEWAY LOGIC] */
import { shallowRef, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useAppStore } from '@/store/apps'; // [ADD - IMPORT STORE]

const AppStoreDesktop = defineAsyncComponent(() => import('./desktop/AppStoreDesktop.vue'));
const AppStoreMobile = defineAsyncComponent(() => import('./mobile/AppStoreMobile.vue'));

const appStore = useAppStore(); // [ADD - STORE INSTANCE]
const activeComponent = shallowRef(null);

const checkDevice = () => {
  const isMobile = window.innerWidth < 768;
  const newDeviceType = isMobile ? 'mobile' : 'desktop';

  if (appStore.deviceType !== newDeviceType) {
    appStore.setDeviceType(newDeviceType);
    appStore.fetchInstalledApps(true); // Force refetch when device type changes
  }

  activeComponent.value = isMobile ? AppStoreMobile : AppStoreDesktop;
};

onMounted(() => {
  checkDevice();
  window.addEventListener('resize', checkDevice);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkDevice);
});
</script>

//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\AppDirectView.vue
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################
<template>
  <component :is="activeComponent" v-bind="$props" />
</template>
<script setup>
import { shallowRef, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useAppStore } from '@/store/apps';
const AppDirectViewDesktop = defineAsyncComponent(() => import('./desktop/AppDirectViewDesktop.vue'));
const AppDirectViewMobile = defineAsyncComponent(() => import('./mobile/AppDirectViewMobile.vue'));
const props = defineProps(['appSlug']);
const appStore = useAppStore();
const activeComponent = shallowRef(null);
const checkDevice = () => {
  const isMobile = window.innerWidth < 768;
  const newDeviceType = isMobile ? 'mobile' : 'desktop';
  if (appStore.deviceType !== newDeviceType) {
    appStore.setDeviceType(newDeviceType);
    appStore.fetchInstalledApps(true); // Paksa sinkronisasi registry
  }
  activeComponent.value = isMobile ? AppDirectViewMobile : AppDirectViewDesktop;
};
onMounted(() => {
  checkDevice();
  window.addEventListener('resize', checkDevice);
});
onUnmounted(() => {
  window.removeEventListener('resize', checkDevice);
});
</script>
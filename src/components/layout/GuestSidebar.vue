//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\components\layout\GuestSidebar.vue total lines 35 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <component :is="activeComponent" :is-open="isOpen" @close="$emit('close')" />

  </template>

<script setup>
/* [ADD - DYNAMIC LOGIC] */
import { shallowRef, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
const GuestSidebarDesktop = defineAsyncComponent(() => import('./desktop/GuestSidebarDesktop.vue'));
const GuestSidebarMobile = defineAsyncComponent(() => import('./mobile/GuestSidebarMobile.vue'));

defineProps({ isOpen: Boolean });
defineEmits(['close']);

const activeComponent = shallowRef(null);

const checkDevice = () => {
  activeComponent.value = window.innerWidth < 960 ? GuestSidebarMobile : GuestSidebarDesktop;
};

onMounted(() => {
  checkDevice();
  window.addEventListener('resize', checkDevice);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkDevice);
});
</script>

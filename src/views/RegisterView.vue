//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\RegisterView.vue total lines 32 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <component :is="activeComponent" />

  </template>

<script setup>
/* [ADD - DYNAMIC LOGIC] */
import { shallowRef, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
const RegisterDesktop = defineAsyncComponent(() => import('./desktop/RegisterDesktop.vue'));
const RegisterMobile = defineAsyncComponent(() => import('./mobile/RegisterMobile.vue'));

const activeComponent = shallowRef(null);

const checkDevice = () => {
  activeComponent.value = window.innerWidth < 900 ? RegisterMobile : RegisterDesktop;
};

onMounted(() => {
  checkDevice();
  window.addEventListener('resize', checkDevice);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkDevice);
});
</script>

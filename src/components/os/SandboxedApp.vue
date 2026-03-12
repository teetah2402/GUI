//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\components\os\SandboxedApp.vue total lines 34 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <component
    :is="activeComponent"
    v-bind="$props"
    @close="$emit('close')"
    @mousedown="$emit('mousedown')"
    @action="$emit('action', $event)"
    @update-metrics="$emit('update-metrics', $event)"
    @toggle-favorite="$emit('toggle-favorite')"
  />

  </template>

<script setup>
/* [ADD - DYNAMIC GATEWAY LOGIC] */
import { shallowRef, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
const SandboxedAppDesktop = defineAsyncComponent(() => import('./desktop/SandboxedAppDesktop.vue'));
const SandboxedAppMobile = defineAsyncComponent(() => import('./mobile/SandboxedAppMobile.vue'));

const props = defineProps(['url', 'globalScale', 'initialX', 'initialY', 'initialScale', 'uniqueId', 'zIndex', 'isFav', 'isDirectView', 'appData', 'isSidebarOpen']);
defineEmits(['close', 'action', 'mousedown', 'update-metrics', 'toggle-favorite']);

const activeComponent = shallowRef(null);
const checkDevice = () => { activeComponent.value = window.innerWidth < 768 ? SandboxedAppMobile : SandboxedAppDesktop; };

onMounted(() => { checkDevice(); window.addEventListener('resize', checkDevice); });
onUnmounted(() => { window.removeEventListener('resize', checkDevice); });
</script>

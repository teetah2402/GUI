//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\UniversalLoader.vue total lines 40 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="w-full h-full">
    <component :is="activeComponent" v-if="activeComponent" />

    <div v-else class="h-screen bg-[#171925] flex flex-col items-center justify-center text-center p-6">
      <div class="text-[#54d7f6] mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h1 class="text-4xl font-bold text-white mb-2 tracking-widest font-mono">404 NOT FOUND</h1>
      <p class="text-gray-400 mb-8 max-w-md">Modul aplikasi "<strong>{{ route.params.appPrefix }}</strong>" tidak terdaftar di sistem Flowork.</p>

      <router-link to="/" class="px-6 py-3 border border-[#54d7f6] text-[#54d7f6] rounded hover:bg-[#54d7f6] hover:text-[#171925] font-bold transition">
        KEMBALI KE DASHBOARD
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const appMap = {
  'promo': defineAsyncComponent(() => import('@/views/apps/PromoView.vue')),

};

const activeComponent = computed(() => {
  const prefix = route.params.appPrefix;
  return appMap[prefix] || null;
});
</script>

//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/views/FlowDesigner.vue
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="flow-designer-wrapper">
    <component :is="activeComponent" v-if="activeComponent" />

    <div v-else class="loading-screen">
       <div class="spinner"></div>
       <p>Loading Workspace...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineAsyncComponent, markRaw, shallowRef } from 'vue';

// STATE FOR RESPONSIVE CHECK
const isMobile = ref(false);
const activeComponent = shallowRef(null);

// LAZY LOAD MODULES (ON-DEMAND)
const FlowDesignerDesktop = defineAsyncComponent(() =>
    import('@/views/desktop/FlowDesignerDesktop.vue')
);
const FlowDesignerMobile = defineAsyncComponent(() =>
    import('@/views/mobile/FlowDesignerMobile.vue')
);

// VIEWPORT SCANNER FUNCTION
const checkViewport = () => {
    const mobileBreakpoint = 768;
    const currentIsMobile = window.innerWidth <= mobileBreakpoint;

    if (currentIsMobile !== isMobile.value || !activeComponent.value) {
        isMobile.value = currentIsMobile;
        // ATOMIC ISOLATION: Inject the correct layout based on screen size
        activeComponent.value = isMobile.value
            ? markRaw(FlowDesignerMobile)
            : markRaw(FlowDesignerDesktop);
    }
};

onMounted(() => {
    checkViewport();
    window.addEventListener('resize', checkViewport);
});

onUnmounted(() => {
    window.removeEventListener('resize', checkViewport);
});
</script>

<style scoped>
.flow-designer-wrapper {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: var(--bg, #0f172a);
}
.loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    color: var(--text-mute, #94a3b8);
}
.spinner {
    width: 40px; height: 40px;
    border: 3px solid rgba(255,255,255,0.1);
    border-top-color: var(--accent-1, #6366f1);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\WorkflowEditor.vue total lines 59 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <DefaultLayout>
    <template #toolbox>
      <Toolbox />
    </template>
    <template #main-content>
      <WorkflowCanvas />
    </template>
    <template #properties-panel>
      <NodeProperties />
    </template>
  </DefaultLayout>
</template>

<script setup>
import { onMounted } from 'vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Toolbox from '@/components/Toolbox.vue';
import WorkflowCanvas from '@/components/WorkflowCanvas.vue';
import NodeProperties from '@/components/NodeProperties.vue';
import { useComponentStore } from '@/store/components';
import { useUiStore } from '@/store/ui'; // [ADDED BY FOWORK DEV]

const componentStore = useComponentStore();
const uiStore = useUiStore(); // [ADDED BY FOWORK DEV]

onMounted(async () => {
  console.log("[WorkflowEditor] Initializing Unified Registry...");

  try {
    if (!componentStore.unifiedRegistry?.hasFetched) {
      await componentStore.fetchAllComponents();
      console.log("[WorkflowEditor] Unified Registry Hydration COMPLETE.");
    } else {
      console.log("[WorkflowEditor] Registry already hydrated, skipping network call.");
    }
  } catch (error) {
    console.error("[WorkflowEditor] Failed to hydrate components:", error);
    uiStore.showNotification({
      text: "Failed to load components. Workflow may be restricted.",
      color: 'warning'
    });
  }

});
</script>

<style scoped>
/* [ADDED BY FOWORK DEV] Ensure smooth layout transition */
.v-layout {
  background-color: transparent !important;
}
</style>

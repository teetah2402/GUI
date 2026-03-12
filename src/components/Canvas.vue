//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\components\Canvas.vue total lines 57 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="canvas-wrapper">
    <VueFlow v-model="elements" @node-click="onNodeClick" @pane-click="onPaneClick" fit-view-on-init>
      <Background />
      <Controls />

      <template #node-default="{ data, id }">
        <CustomNode
          :module-id="data.moduleId"
          :manifest="data.manifest"
          :node-id="id"
        />
      </template>

    </VueFlow>
  </div>
</template>

<script setup>
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { storeToRefs } from 'pinia';
import { useWorkflowStore } from '@/store/workflow';
import { useUiStore } from '@/store/ui';
import CustomNode from './CustomNode.vue';

const workflowStore = useWorkflowStore();
const uiStore = useUiStore();

const { elements } = storeToRefs(workflowStore);
const { setSelectedNode, clearSelectedNode } = workflowStore;

const onNodeClick = (event, { node }) => {
  setSelectedNode(node);
  uiStore.setActiveRightPanel('properties');
};

const onPaneClick = () => {
  clearSelectedNode();
  uiStore.closeRightPanel();
};

</script>

<style>
.canvas-wrapper {
  height: 100%;
  width: 100%;
}
</style>

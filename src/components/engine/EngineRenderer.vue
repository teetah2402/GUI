//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\components\engine\EngineRenderer.vue total lines 56 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="engine-renderer">
    <component
      v-for="(node, index) in schema"
      :key="node.id || index"
      :is="resolveComponent(node.type)"
      v-bind="node.props"
      :class="node.props?.class"
      @click.stop="emitAction(node)"
      @input="emitInput(node, $event)"
    >
      <EngineRenderer
        v-if="node.children && node.children.length"
        :schema="node.children"
        @action="$emit('action', $event)"
      />

      <template v-else-if="node.text">{{ node.text }}</template>
    </component>
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

const props = defineProps(['schema']);
const emit = defineEmits(['action']);


const resolveComponent = (type) => {
  return components[type] || 'div';
};

const emitAction = (node) => {
  if (node.action) {
    emit('action', { id: node.id, action: node.action, payload: node.payload });
  }
};

const emitInput = (node, event) => {
  if (node.model) {
    const val = event.target ? event.target.value : event;
    emit('action', { action: 'update_model', key: node.model, value: val });
  }
};
</script>

<style scoped>
.engine-renderer { width: 100%; display: contents; }
</style>

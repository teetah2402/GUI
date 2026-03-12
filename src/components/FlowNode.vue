//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/components/FlowNode.vue
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="custom-flow-node" :class="{ 'is-selected': selected }" :data-theme="uiStore.currentTheme" :style="dynamicStyles">

    <div class="node-header">
      <div class="node-icon-wrapper">
        <span class="node-icon">{{ data.icon || '📦' }}</span>
      </div>
      <div class="node-title">{{ data.displayName || 'Module' }}</div>

      <div class="status-led"></div>
    </div>

    <div class="node-body">

      <div class="port-area input-area">
        <Handle
          type="target"
          :position="Position.Left"
          id="target-1"
          class="custom-handle input-handle"
        />
        <span class="port-label in-label">IN</span>
      </div>

      <div class="body-divider"></div>

      <div class="port-area output-area dynamic-port-container">
        <div v-for="(outItem, index) in (data.outputs || ['out'])" :key="index" class="output-wrapper">
          <span class="port-label out-label">
              {{ (typeof outItem === 'string' ? outItem : (outItem.label || 'OUT')).toUpperCase() }}
          </span>
          <Handle
            type="source"
            :position="Position.Right"
            :id="typeof outItem === 'object' && outItem.id ? outItem.id : ('out-' + index)"
            class="custom-handle output-handle"
          />
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import { useUiStore } from '@/store/ui';

const uiStore = useUiStore();
const props = defineProps({
    data: { type: Object, required: true },
    selected: { type: Boolean, default: false }
});

// [UPDATE] Menambahkan pengubah background node dengan efek transparan
const dynamicStyles = computed(() => {
    if (props.data.customColor || props.data.color) {
        const themeColor = props.data.customColor || props.data.color; // [ADD] Fallback ke property color dari Python
        return {
            '--node-bg': `${themeColor}22`,         // Background Node 20% Transparan
            '--node-header-bg': `${themeColor}44`,  // Background Header 40% Transparan
            '--node-border': themeColor,
            '--neon-cyan': themeColor,
            '--led-active': themeColor,
            'border-color': themeColor,
            'box-shadow': props.selected ? `0 0 15px ${themeColor}80` : ''
        };
    }
    return {};
});
</script>

<style scoped>
/* ========================================================
   THEME VARIABLES (Dark Mode Default)
   ======================================================== */
.custom-flow-node {
    --node-bg: #111111;
    --node-border: #333333;
    --node-text: #ffffff;
    --node-text-muted: #aaaaaa;
    --node-header-bg: rgba(255,255,255,0.03);
    --handle-bg: #222222;
    --node-shadow: rgba(0,0,0,0.5);

    --neon-cyan: #00ffcc;
    --neon-magenta: #ff00ff;
    --led-active: #00ff88;

    background-color: var(--node-bg);
    border: 1px solid var(--node-border);
    border-radius: 6px;
    min-width: 170px;
    box-shadow: 0 4px 15px var(--node-shadow);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    overflow: visible;
    color: var(--node-text);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* ========================================================
   LIGHT MODE OVERRIDES
   ======================================================== */
.custom-flow-node[data-theme="light"] {
    --node-bg: #ffffff;
    --node-border: #cbd5e1;
    --node-text: #1e293b;
    --node-text-muted: #64748b;
    --node-header-bg: #f8fafc;
    --handle-bg: #ffffff;
    --node-shadow: rgba(0,0,0,0.08);
}

.custom-flow-node.is-selected {
    border-color: var(--neon-cyan);
    box-shadow: 0 0 15px rgba(0, 255, 204, 0.5);
}

.node-header {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: var(--node-header-bg);
    border-bottom: 1px solid var(--node-border);
    gap: 10px;
    position: relative;
    transition: background 0.3s;
}

.node-icon-wrapper { font-size: 18px; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; }
.node-title { font-weight: 700; font-size: 12px; letter-spacing: 0.8px; text-transform: uppercase; flex-grow: 1; color: var(--node-text); }

.status-led {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--node-border);
    border: 1px solid var(--node-border);
    transition: all 0.3s ease;
}

.node-body { display: flex; align-items: center; justify-content: space-between; padding: 10px 15px; position: relative; }
.body-divider { width: 1px; height: 20px; background-color: var(--node-border); }

.dynamic-port-container { display: flex; flex-direction: column; gap: 12px; align-items: flex-end; }
.output-wrapper { display: flex; align-items: center; gap: 8px; position: relative; width: 100%; justify-content: flex-end; }

.port-area { display: flex; align-items: center; gap: 8px; position: relative; flex: 1; }
.input-area { justify-content: flex-start; }
.output-area { justify-content: flex-end; }

.port-label { font-size: 10px; font-weight: 800; letter-spacing: 0.5px; transition: all 0.3s ease; user-select: none; }
.in-label, .out-label { color: var(--node-text-muted); }

.custom-flow-node:hover .in-label { color: var(--neon-cyan); text-shadow: 0 0 5px var(--neon-cyan); }
.custom-flow-node:hover .out-label { color: var(--neon-magenta); text-shadow: 0 0 5px var(--neon-magenta); }

:deep(.custom-handle) {
    width: 12px;
    height: 12px;
    background-color: var(--handle-bg);
    border: 2px solid var(--node-border);
    border-radius: 50%;
    transition: all 0.2s ease;
    box-shadow: none;
}

:deep(.input-handle) { left: -21px !important; }
:deep(.output-handle) { right: -21px !important; }

:deep(.input-handle:hover) { background-color: var(--neon-cyan); border-color: var(--neon-cyan); transform: scale(1.3); box-shadow: 0 0 10px var(--neon-cyan); }
:deep(.output-handle:hover) { background-color: var(--neon-magenta); border-color: var(--neon-magenta); transform: scale(1.3); box-shadow: 0 0 10px var(--neon-magenta); }

/* =========================================
   WORKING/GLOWING STATE STYLES
   ========================================= */

:deep(.flowork-node-glowing) .status-led { background-color: var(--led-active); border-color: var(--led-active); box-shadow: 0 0 8px var(--led-active); animation: led-pulse 1.5s infinite; }
:deep(.flowork-node-glowing) .in-label { color: var(--neon-cyan); text-shadow: 0 0 5px var(--neon-cyan); }
:deep(.flowork-node-glowing) .out-label { color: var(--neon-magenta); text-shadow: 0 0 5px var(--neon-magenta); }
:deep(.flowork-node-glowing) :deep(.input-handle) { border-color: var(--neon-cyan); background-color: #112a25; }
:deep(.flowork-node-glowing) :deep(.output-handle) { border-color: var(--neon-magenta); background-color: #2a1125; }

@keyframes led-pulse {
    0% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.1); box-shadow: 0 0 12px var(--led-active); }
    100% { opacity: 0.6; transform: scale(1); }
}

/* =========================================
   ERROR/FAILED STATE STYLES
   ========================================= */

:deep(.flowork-node-failed) {
    border-color: #ff4444 !important;
    background: #2a1111 !important;
    box-shadow: 0 0 15px rgba(255, 68, 68, 0.6), inset 0 0 10px rgba(255, 68, 68, 0.2) !important;
    animation: error-shake 0.5s ease-in-out, error-pulse 1s infinite !important;
}

:deep(.flowork-node-failed) .status-led { background-color: #ff4444; border-color: #ff4444; box-shadow: 0 0 8px #ff4444; animation: led-pulse-error 0.5s infinite; }
:deep(.flowork-node-failed) .in-label, :deep(.flowork-node-failed) .out-label { color: #ff4444 !important; text-shadow: 0 0 5px #ff4444 !important; }
:deep(.flowork-node-failed) :deep(.input-handle), :deep(.flowork-node-failed) :deep(.output-handle) { border-color: #ff4444 !important; background-color: #3a1111 !important; }

@keyframes error-pulse {
    0% { box-shadow: 0 0 15px rgba(255, 68, 68, 0.4), inset 0 0 5px rgba(255, 68, 68, 0.1); transform: scale(1); }
    50% { box-shadow: 0 0 25px rgba(255, 68, 68, 0.8), inset 0 0 15px rgba(255, 68, 68, 0.4); transform: scale(1.02); }
    100% { box-shadow: 0 0 15px rgba(255, 68, 68, 0.4), inset 0 0 5px rgba(255, 68, 68, 0.1); transform: scale(1); }
}

@keyframes led-pulse-error {
    0% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.3); box-shadow: 0 0 15px #ff4444; }
    100% { opacity: 0.2; transform: scale(1); }
}

@keyframes error-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
}
</style>
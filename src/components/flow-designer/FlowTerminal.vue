//#######################################################################
// File NAME : src/components/flow-designer/FlowTerminal.vue
//#######################################################################
<template>
  <div class="terminal-panel" :class="{ 'is-collapsed': !isLogOpen }">
      <div class="terminal-header" @click="isLogOpen = !isLogOpen" title="Toggle System Log">
          <span>System Log</span>
          <span class="toggle-icon">{{ isLogOpen ? '▼' : '▲' }}</span>
      </div>
      <div class="terminal-content" id="terminal-content" v-show="isLogOpen">
          <div v-if="executionLogs.length === 0" class="terminal-empty">No logs available. Run a flow to see output.</div>
          <div v-for="log in executionLogs" :key="log.id" :class="['log-line', 'log-' + log.type]">
              <span class="log-time">[{{ log.time }}]</span>
              <span class="log-sender">[{{ log.sender }}]</span>
              <span class="log-msg">{{ log.message }}</span>
              <pre v-if="log.data" class="log-json">{{ JSON.stringify(log.data, null, 2) }}</pre>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useFlowStore } from '@/store/flowWorkflow';

const { executionLogs } = storeToRefs(useFlowStore());
const isLogOpen = ref(false);

watch(executionLogs, async () => {
    if (!isLogOpen.value && executionLogs.value.length > 0) {
        isLogOpen.value = true;
    }
    await nextTick();
    const terminal = document.getElementById('terminal-content');
    if (terminal) {
        terminal.scrollTop = terminal.scrollHeight;
    }
}, { deep: true });
</script>

<style scoped>
.terminal-panel { height: 250px; flex-shrink: 0; background: var(--fd-bg-terminal); border-top: 1px solid var(--fd-border); display: flex; flex-direction: column; z-index: 5; transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s; }
.terminal-panel.is-collapsed { height: 35px; }
.terminal-header { background: var(--fd-bg-header); padding: 0 15px; height: 35px; font-size: 12px; color: var(--fd-text-muted); border-bottom: 1px solid var(--fd-border); font-weight: bold; text-transform: uppercase; flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; transition: background 0.2s; }
.terminal-header:hover { background: var(--fd-item-hover); color: #00ffcc; }
.toggle-icon { font-size: 14px; font-weight: bold; }
.terminal-content { flex: 1; overflow-y: auto; padding: 10px; font-family: monospace; font-size: 12px; scroll-behavior: smooth; }
.terminal-empty { color: var(--fd-text-muted); font-style: italic; }
.log-line { margin-bottom: 6px; line-height: 1.4; word-wrap: break-word;}
.log-time { color: var(--fd-text-muted); margin-right: 8px; }
.log-sender { color: #aa88ff; font-weight: bold; margin-right: 8px; }
.log-json { background: var(--fd-input-bg); padding: 8px; border-radius: 4px; border: 1px solid var(--fd-border); color: #00aaff; margin-top: 4px; margin-left: 20px; font-size: 11px; white-space: pre-wrap; }
.log-info .log-msg { color: var(--fd-text-main); }
.log-success .log-msg { color: #00ffcc; font-weight: bold; }
.log-error .log-msg { color: #ff4444; font-weight: bold; }
.log-system .log-msg { color: #ffaa00; font-style: italic; }
</style>
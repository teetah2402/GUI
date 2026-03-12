//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : src/components/FlowCanvas.vue
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="canvas-wrapper" @drop="onDrop" @dragover.prevent @contextmenu.prevent :data-theme="uiStore.currentTheme" :style="dynamicCanvasStyle">

    <div class="canvas-engine-status" :class="{ 'is-online': socketStore.isConnected }">
      <span class="status-dot"></span>
      <span class="status-text">{{ socketStore.isConnected ? 'Engine Ready' : 'Engine Offline' }}</span>
      <span class="vitals-text" v-if="socketStore.isConnected && socketStore.currentEngineStatus.cpuPercent !== null">
          [ CPU: {{ socketStore.currentEngineStatus.cpuPercent }}% | RAM: {{ socketStore.currentEngineStatus.memoryPercent }}% ]
      </span>
    </div>

    <div v-if="nodes.length === 0" class="canvas-watermark">
      <div class="watermark-scene">
        <h1 class="watermark-title" data-text="Flowork OS">Flowork OS</h1>
        <p class="watermark-subtitle">Drag & Drop modules here to start building</p>
      </div>
    </div>

    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      @connect="onConnect"
      @node-click="onNodeClick"
      @nodeContextMenu="onNodeContextMenu"
      @edgeContextMenu="onEdgeContextMenu"
      @pane-click="hideContextMenu"
      @paneContextMenu="onPaneContextMenu"
      class="flowork-neon-theme"
    >
      <Background :pattern-color="uiStore.currentTheme === 'light' ? '#cbd5e1' : '#333333'" :gap="20" />
      <Controls />

      <template #node-custom="props">
          <FlowNode
            :data="props.data"
            :selected="props.selected"
            :class="{
              'flowork-node-glowing': executingNodes[props.id],
              'flowork-node-failed': failedNodes[props.id]
            }"
          />
      </template>

    </VueFlow>

    <div v-if="contextMenu.show" class="context-menu" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
      <template v-if="contextMenu.type === 'node'">
        <button @click="copyNode(contextMenu.id)" class="menu-btn copy-btn">
          <span class="icon">📑</span> Copy Module
        </button>
        <div class="menu-btn color-picker-wrapper">
          <span class="icon">🎨</span> Node Color
          <input type="color" @input="(e) => changeNodeColor(e, contextMenu.id)" class="color-picker-input">
        </div>
        <div class="menu-divider"></div>
        <button @click="debugNode(contextMenu.id)" class="menu-btn debug-btn">
          <span class="icon">🐛</span> Debug Module
        </button>
        <button @click="viewTimelineLog(contextMenu.id)" class="menu-btn timeline-btn">
          <span class="icon">📜</span> Timeline Log
        </button>
        <div class="menu-divider"></div>
        <button @click="deleteItem(contextMenu.id)" class="menu-btn delete-btn">
          <span class="icon">🗑️</span> Delete Module
        </button>
      </template>

      <template v-if="contextMenu.type === 'edge'">
        <button @click="deleteItem(contextMenu.id)" class="menu-btn delete-btn">
          <span class="icon">✂️</span> Cut Cable
        </button>
      </template>

      <template v-if="contextMenu.type === 'pane'">
        <div class="menu-btn color-picker-wrapper">
          <span class="icon">🖌️</span> Canvas Color
          <input type="color" v-model="flowStore.canvasBgColor" class="color-picker-input">
        </div>
        <button @click="flowStore.canvasBgColor = ''" class="menu-btn">
          <span class="icon">🔄</span> Reset Canvas
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { useFlowStore } from '@/store/flowWorkflow';
import { useUiStore } from '@/store/ui';
import { useSocketStore } from '@/store/socket'; // [ADD] Import Socket store
import { storeToRefs } from 'pinia';

import FlowNode from './FlowNode.vue';

import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';

const uiStore = useUiStore();
const flowStore = useFlowStore();
const socketStore = useSocketStore(); // [ADD] Inisialisasi Socket store

const { nodes, edges, executingNodes, failedNodes, nodeOutputs, executionLogs, canvasBgColor } = storeToRefs(flowStore);

const { screenToFlowCoordinate, removeNodes, removeEdges } = useVueFlow();

const contextMenu = ref({ show: false, x: 0, y: 0, id: null, type: '' });

// [NEW] Computed style untuk ubah warna Canvas sesuka hati
const dynamicCanvasStyle = computed(() => {
    if (canvasBgColor.value) {
        return { backgroundColor: canvasBgColor.value };
    }
    return {};
});

watch(executingNodes, (newVal) => {
    edges.value.forEach(edge => {
        if (newVal[edge.source] && !failedNodes.value[edge.source]) {
            edge.animated = true;
            edge.style = { stroke: '#00ffcc', strokeWidth: 3, filter: 'drop-shadow(0 0 8px #00ffcc)' };
        } else if (failedNodes.value[edge.source]) {
            edge.animated = false;
            edge.style = { stroke: '#ff4444', strokeWidth: 2 };
        } else {
            edge.animated = false;
            edge.style = { stroke: '#888', strokeWidth: 2 };
        }
    });
}, { deep: true });

function onDrop(event) {
    event.preventDefault();
    const dataStr = event.dataTransfer.getData('application/json');
    if (!dataStr) return;

    const nodeData = JSON.parse(dataStr);
    const position = screenToFlowCoordinate({ x: event.clientX, y: event.clientY });

    const newNodeId = `flow_node_${Date.now()}`;
    const newNode = {
        id: newNodeId,
        type: 'custom',
        position,
        data: { ...nodeData, config: {} }
    };

    if (nodeData.properties) {
        nodeData.properties.forEach(p => {
            newNode.data.config[p.name] = p.default || '';
        });
    }

    flowStore.addNode(newNode);
}

function onConnect(params) {
    params.id = `edge_${params.source}_${params.target}_${Date.now()}`;
    params.style = { stroke: '#888', strokeWidth: 2 };
    flowStore.addEdge(params);
}

function onNodeClick(e) {
    hideContextMenu();
    const clickedNode = nodes.value.find(n => n.id === e.node.id);
    if (clickedNode) flowStore.setSelectedNode(clickedNode);
}

function onNodeContextMenu({ event, node }) {
    event.preventDefault();
    event.stopPropagation();
    contextMenu.value = { show: true, x: event.clientX, y: event.clientY, id: node.id, type: 'node' };
}

function onEdgeContextMenu({ event, edge }) {
    event.preventDefault();
    event.stopPropagation();
    contextMenu.value = { show: true, x: event.clientX, y: event.clientY, id: edge.id, type: 'edge' };
}

// [NEW] Fungsi Context Menu untuk klik kanan di ruang kosong (Canvas)
function onPaneContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    contextMenu.value = { show: true, x: event.clientX, y: event.clientY, id: null, type: 'pane' };
}

function hideContextMenu() {
    contextMenu.value.show = false;
}

// [NEW] Fungsi Copy Node
function copyNode(id) {
    hideContextMenu();
    const nodeToCopy = nodes.value.find(n => n.id === id);
    if (!nodeToCopy) return;

    const newNodeId = `flow_node_${Date.now()}`;
    // Clone datanya supaya nggak tabrakan kalau dimodifikasi
    const clonedData = JSON.parse(JSON.stringify(nodeToCopy.data));

    const newNode = {
        id: newNodeId,
        type: nodeToCopy.type,
        // Geser sedikit posisi copy-nya biar nggak numpuk pas
        position: { x: nodeToCopy.position.x + 50, y: nodeToCopy.position.y + 50 },
        data: clonedData
    };

    flowStore.addNode(newNode);
    uiStore.showNotification({ text: "Module disalin!", color: "success" });
}

// [NEW] Fungsi Update Warna Node
function changeNodeColor(event, id) {
    const node = nodes.value.find(n => n.id === id);
    if (node) {
        node.data.customColor = event.target.value;
    }
}

function deleteItem(id) {
    if (contextMenu.value.type === 'node') {
        removeNodes([id], true);
    } else if (contextMenu.value.type === 'edge') {
        removeEdges([id]);
    }

    flowStore.removeElement(id);
    hideContextMenu();
}

function debugNode(id) {
    hideContextMenu();
    const output = nodeOutputs.value[id];
    const nodeData = nodes.value.find(el => el.id === id);
    if (nodeData) {
        flowStore.setSelectedNode(nodeData);
        flowStore.addLog("Debugger", `Debugging Node [${nodeData.data.displayName}]`, "system", output || { status: "No output yet. Run the flow first." });
    }
}

function viewTimelineLog(id) {
    hideContextMenu();
    const nodeData = nodes.value.find(el => el.id === id);
    if (nodeData) {
        flowStore.setSelectedNode(nodeData);
        const nodeHistory = executionLogs.value.filter(log =>
            log.sender === nodeData.data.displayName ||
            (log.message && log.message.includes(id)) ||
            (log.data && JSON.stringify(log.data).includes(id))
        );

        flowStore.addLog(
            "Timeline",
            `Fetching historical events for [${nodeData.data.displayName}]`,
            "info",
            nodeHistory.length > 0 ? nodeHistory : { status: "No timeline recorded yet." }
        );
    }
}
</script>

<style scoped>
.canvas-wrapper {
    --ctx-bg: #1a1a1a;
    --ctx-border: #333333;
    --ctx-hover: #333333;
    --ctx-text: #dddddd;
    --ctx-shadow: rgba(0,0,0,0.8);
    width: 100%; height: 100%; position: relative;
    /* Tambahan transition agar perubahan background mulus */
    transition: background-color 0.3s ease;
}

/* [ADD] Styling untuk Engine Status Transparan di Canvas */
.canvas-engine-status {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 68, 68, 0.1);
    border: 1px solid rgba(255, 68, 68, 0.2);
    padding: 6px 12px;
    border-radius: 8px;
    color: rgba(255, 68, 68, 0.7);
    font-size: 12px;
    font-weight: bold;
    font-family: monospace;
    pointer-events: none; /* Supaya klik tembus dan tidak mengganggu area drag */
    backdrop-filter: blur(2px);
    transition: all 0.3s ease;
}

.canvas-engine-status .status-dot {
    width: 8px; height: 8px; background-color: rgba(255, 68, 68, 0.7); border-radius: 50%;
    box-shadow: 0 0 5px rgba(255, 68, 68, 0.5); animation: pulse-offline 2s infinite;
}

.canvas-engine-status.is-online {
    background: rgba(0, 255, 204, 0.1); border-color: rgba(0, 255, 204, 0.2); color: rgba(0, 255, 204, 0.7);
}

.canvas-engine-status.is-online .status-dot {
    background-color: rgba(0, 255, 204, 0.7); box-shadow: 0 0 5px rgba(0, 255, 204, 0.5); animation: pulse-online 2s infinite;
}
.canvas-engine-status .vitals-text { color: rgba(255, 255, 255, 0.5); font-weight: normal; margin-left: 4px; }


.canvas-wrapper[data-theme="light"] {
    --ctx-bg: #ffffff;
    --ctx-border: #cbd5e1;
    --ctx-hover: #f1f5f9;
    --ctx-text: #1e293b;
    --ctx-shadow: rgba(0,0,0,0.15);
}

/* ========================================================
   WATERMARK HOLOGRAM DIAM, TRANSPARAN, DAN CENTER
   ======================================================== */
.canvas-watermark {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    pointer-events: none;
    user-select: none;
}

.watermark-scene {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.watermark-title {
    font-size: 6rem;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5rem;
    position: relative;

    color: transparent;
    -webkit-text-stroke: 1px rgba(0, 255, 204, 0.15);

    background: linear-gradient(
        110deg,
        rgba(0, 255, 204, 0.05) 0%,
        rgba(0, 255, 204, 0.05) 40%,
        rgba(255, 255, 255, 0.8) 50%,
        rgba(0, 255, 204, 0.05) 60%,
        rgba(0, 255, 204, 0.05) 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;

    animation: hologram-shine 3s linear infinite;
    filter: drop-shadow(0 0 10px rgba(0, 255, 204, 0.1));
}

.watermark-title::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    color: transparent;
    -webkit-text-stroke: 2px rgba(0, 255, 204, 0.6);
    text-shadow: 0 0 15px rgba(0, 255, 204, 0.4);
    z-index: 2;
    animation: hologram-scan 4s linear infinite;
}

.watermark-subtitle {
    display: block;
    font-size: 1.2rem;
    font-weight: 600;
    margin-top: 15px;
    letter-spacing: 0.2rem;
    text-transform: uppercase;
    color: transparent;

    -webkit-text-stroke: 1px rgba(0, 255, 204, 0.05);

    background: linear-gradient(
        110deg,
        rgba(0, 255, 204, 0.02) 40%,
        rgba(255, 255, 255, 0.25) 50%,
        rgba(0, 255, 204, 0.02) 60%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;

    animation: hologram-shine 3s linear infinite 1.5s;
}

.canvas-wrapper[data-theme="light"] .watermark-title {
    -webkit-text-stroke: 1px rgba(0, 0, 0, 0.25);
    background: linear-gradient(
        110deg,
        rgba(0, 0, 0, 0.05) 0%,
        rgba(0, 0, 0, 0.1) 40%,
        rgba(0, 0, 0, 0.6) 50%,
        rgba(0, 0, 0, 0.1) 60%,
        rgba(0, 0, 0, 0.05) 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.1));
}
.canvas-wrapper[data-theme="light"] .watermark-title::after {
    -webkit-text-stroke: 2px rgba(0, 0, 0, 0.2);
    text-shadow: 0 0 15px rgba(0, 0, 0, 0.15);
}
.canvas-wrapper[data-theme="light"] .watermark-subtitle {
    -webkit-text-stroke: 1px rgba(0, 0, 0, 0.3);
    background: linear-gradient(
        110deg,
        rgba(0, 0, 0, 0.1) 40%,
        rgba(0, 0, 0, 0.7) 50%,
        rgba(0, 0, 0, 0.1) 60%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
}

@keyframes hologram-shine {
    0% { background-position: 200% center; }
    100% { background-position: -200% center; }
}

@keyframes hologram-scan {
    0%, 100% { clip-path: polygon(0 0%, 100% 0%, 100% 2%, 0 2%); opacity: 0; }
    10% { opacity: 1; }
    50% { clip-path: polygon(0 50%, 100% 50%, 100% 52%, 0 52%); }
    90% { opacity: 1; }
    95% { clip-path: polygon(0 100%, 100% 100%, 100% 102%, 0 102%); opacity: 0.5; }
}

/* ======================================================== */

.flowork-node-glowing {
    border-color: #00ffcc !important;
    background: #112a25 !important;
    box-shadow: 0 0 15px rgba(0, 255, 204, 0.6), inset 0 0 10px rgba(0, 255, 204, 0.2) !important;
    transform: scale(1.05);
}

.flowork-node-glowing :deep(.vue-flow__handle) {
    background-color: #00ffcc !important;
    box-shadow: 0 0 8px #00ffcc;
}

.context-menu {
    position: fixed;
    background: var(--ctx-bg);
    border: 1px solid var(--ctx-border);
    border-radius: 6px;
    padding: 6px;
    min-width: 160px;
    box-shadow: 0 10px 25px var(--ctx-shadow);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: background 0.2s, border 0.2s;
}

.menu-btn {
    background: transparent;
    border: none;
    color: var(--ctx-text);
    text-align: left;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
}

.menu-btn:hover { background: var(--ctx-hover); }
.menu-divider { height: 1px; background: var(--ctx-border); margin: 2px 0; }

.copy-btn:hover { color: #00aaff; }
.debug-btn:hover { color: #00ffcc; }
.timeline-btn:hover { color: #aa88ff; }
.delete-btn { color: #ff4444; }
.delete-btn:hover { background: rgba(255, 68, 68, 0.1); }

/* [NEW] Style untuk menu color picker */
.color-picker-wrapper {
    position: relative;
    justify-content: space-between;
}
.color-picker-input {
    width: 20px;
    height: 20px;
    border: none;
    padding: 0;
    background: transparent;
    cursor: pointer;
    border-radius: 50%;
    overflow: hidden;
}
.color-picker-input::-webkit-color-swatch-wrapper { padding: 0; }
.color-picker-input::-webkit-color-swatch { border: 1px solid var(--ctx-border); border-radius: 4px; }
</style>
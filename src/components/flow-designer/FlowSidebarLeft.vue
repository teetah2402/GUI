//#######################################################################
// File NAME : src/components/flow-designer/FlowSidebarLeft.vue
//#######################################################################
<template>
  <aside class="flow-sidebar">
    <div class="sidebar-header">
        <h3 class="sidebar-title">{{ activeView === 'modules' ? 'Modules' : '📝 Workflow Notes' }}</h3>
        <button @click="toggleView" class="btn-toggle-view" :title="activeView === 'modules' ? 'Open Notes' : 'Back to Modules'">
            {{ activeView === 'modules' ? '🗒️ <' : 'Modules >' }}
        </button>
    </div>

    <div v-show="activeView === 'modules'" class="sidebar-content-wrapper">
        <div class="search-container">
        <input type="text" v-model="searchQuery" placeholder="Search modules..." class="search-input" />
        </div>

        <div class="node-list">
        <div v-if="filteredNodes.length === 0" class="empty-search">No modules found.</div>

        <div
            v-for="(node, index) in filteredNodes"
            :key="node?.name || index"
            class="node-item"
            :class="{ 'is-offline': isNodeOffline(node) }"
            :draggable="!isNodeOffline(node)"
            @dragstart="onDragStart($event, node)"
        >
            <span class="node-icon">{{ getNodeIcon(node) }}</span>
            <div class="node-info">
                <span class="node-name">
                    {{ node?.displayName || 'Unknown Module' }}
                    <span class="node-badge" :class="getBadgeClass(node)">{{ getBadgeText(node) }}</span>
                </span>
                <span class="node-desc">{{ node?.description }}</span>
            </div>

            <div v-if="node?.name?.startsWith('custom.')" class="node-actions">
                <button @click.stop="$emit('edit-custom-module', node)" class="btn-node-action" title="Edit Module">✏️</button>
                <button @click.stop="deleteCustomModule(node.name)" class="btn-node-action btn-delete-action" title="Delete Module">🗑️</button>
            </div>
        </div>
        </div>
    </div>

    <div v-show="activeView === 'note'" class="sidebar-content-wrapper note-wrapper">
        <p class="note-hint">Catatan ini akan tersimpan otomatis dan ikut terkirim saat workflow di-share.</p>
        <textarea
            v-model="workflowNote"
            class="note-textarea"
            placeholder="Tulis catatan, to-do list, atau dokumentasi alur kerja Anda di sini..."></textarea>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useFlowStore } from '@/store/flowWorkflow';
import { useFlowRegistryStore } from '@/store/flowRegistry';
import { useUiStore } from '@/store/ui';
import { useSocketStore } from '@/store/socket';

defineEmits(['edit-custom-module']);

const flowStore = useFlowStore();
const uiStore = useUiStore();
const registryStore = useFlowRegistryStore();
const socketStore = useSocketStore();

const { customNodes, workflowNote } = storeToRefs(flowStore);
const { availableNodes } = storeToRefs(registryStore);

const searchQuery = ref('');
const activeView = ref('modules');

function toggleView() {
    activeView.value = activeView.value === 'modules' ? 'note' : 'modules';
}

const combinedNodes = computed(() => {
    return [...(availableNodes.value || []), ...(customNodes.value || [])];
});

const filteredNodes = computed(() => {
    if (!searchQuery.value) return combinedNodes.value;
    const query = searchQuery.value.toLowerCase();
    return combinedNodes.value.filter(node =>
        (node?.displayName?.toLowerCase().includes(query)) ||
        (node?.name?.toLowerCase().includes(query)) ||
        (node?.description?.toLowerCase().includes(query))
    );
});

function getNodeIcon(node) {
    if (node?.icon) return node.icon;
    if (node?.name?.startsWith('engine.')) return '⚙️';
    if (node?.name?.startsWith('custom.')) return '🛠️';
    return '🌐';
}

function isNodeOffline(node) {
    if (node?.name?.startsWith('engine.')) {
        return !socketStore.isConnected;
    }
    return false;
}

function getBadgeText(node) {
    if (node?.name?.startsWith('engine.')) {
        return socketStore.isConnected ? 'Hardware (Ready)' : 'Hardware (Offline)';
    }
    if (node?.name?.startsWith('custom.')) return 'Custom Build';
    return 'Cloud Server';
}

function getBadgeClass(node) {
    if (node?.name?.startsWith('engine.')) {
        return socketStore.isConnected ? 'badge-engine-online' : 'badge-engine-offline';
    }
    if (node?.name?.startsWith('custom.')) return 'badge-custom';
    return 'badge-server';
}

function onDragStart(event, nodeData) {
    if (event.dataTransfer) {
        // [CRITICAL FIX]: Kirim object aslinya secara UTUH.
        // Jangan membuat ulang/memfilter object agar tidak menghilangkan 'properties' form
        event.dataTransfer.setData('application/json', JSON.stringify(nodeData));
        event.dataTransfer.effectAllowed = 'move';
    }
}

function deleteCustomModule(nodeName) {
    if (confirm("Are you sure you want to delete this module? Any nodes using it will break.")) {
        flowStore.deleteCustomNode(nodeName);
        uiStore.showNotification({ text: "Module Deleted!", color: "success" });
    }
}
</script>

<style scoped>
.flow-sidebar { width: 300px; background-color: var(--fd-bg-panel); border-right: 1px solid var(--fd-border); display: flex; flex-direction: column; z-index: 10; transition: all 0.3s ease; }
.sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid var(--fd-border); background: var(--fd-bg-header); flex-shrink: 0; }
.sidebar-title { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--fd-text-muted); }
.btn-toggle-view { background: rgba(0, 255, 204, 0.1); border: 1px solid #00ffcc; color: #00ffcc; padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: bold; transition: 0.2s;}
.btn-toggle-view:hover { background: #00ffcc; color: #000; }
.sidebar-content-wrapper { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.search-container { padding: 12px 15px; border-bottom: 1px solid var(--fd-border); background: var(--fd-bg-header); flex-shrink: 0; }
.search-input { width: 100%; padding: 8px 12px; background: var(--fd-input-bg); border: 1px solid var(--fd-border); color: var(--fd-text-main); border-radius: 4px; outline: none; font-size: 12px; transition: border-color 0.2s;}
.search-input:focus { border-color: #00ffcc; }
.empty-search { text-align: center; color: var(--fd-text-muted); font-size: 12px; padding: 20px 0; font-style: italic; }
.node-list { flex: 1; overflow-y: auto; padding: 10px; }

.node-item { display: flex; align-items: center; padding: 12px; background-color: var(--fd-item-bg); margin-bottom: 8px; border-radius: 6px; cursor: grab; border: 1px solid transparent; transition: all 0.2s ease; position: relative; }
.node-item:hover:not(.is-offline) { border-color: #00ffcc; background-color: var(--fd-item-hover); }
.node-item.is-offline { opacity: 0.4; cursor: not-allowed; filter: grayscale(100%); }

.node-icon { font-size: 24px; margin-right: 12px; }
.node-info { display: flex; flex-direction: column; flex: 1; }

.node-name { font-weight: 600; font-size: 13px; color: var(--fd-text-main); display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.node-badge { font-size: 9px; padding: 2px 6px; border-radius: 12px; font-weight: bold; letter-spacing: 0.5px; }
.badge-server { background: rgba(52, 152, 219, 0.2); color: #3498db; border: 1px solid rgba(52, 152, 219, 0.3); }
.badge-custom { background: rgba(241, 196, 15, 0.2); color: #f1c40f; border: 1px solid rgba(241, 196, 15, 0.3); }
.badge-engine-online { background: rgba(46, 204, 113, 0.2); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); }
.badge-engine-offline { background: rgba(231, 76, 60, 0.2); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.3); }

.node-desc { font-size: 11px; color: var(--fd-text-muted); margin-top: 4px; line-height: 1.3; }
.node-actions { display: none; position: absolute; right: 10px; top: 50%; transform: translateY(-50%); gap: 5px; background: var(--fd-item-hover); padding: 4px; border-radius: 4px; }
.node-item:hover:not(.is-offline) .node-actions { display: flex; }
.btn-node-action { background: transparent; border: none; cursor: pointer; padding: 4px; font-size: 12px; border-radius: 4px; transition: 0.2s; }
.btn-node-action:hover { background: rgba(255, 255, 255, 0.1); transform: scale(1.1); }
.btn-delete-action:hover { background: rgba(255, 68, 68, 0.2); }

.note-wrapper { padding: 15px; display: flex; flex-direction: column; }
.note-hint { font-size: 11px; color: #aa88ff; font-style: italic; margin-top: 0; margin-bottom: 15px; line-height: 1.4; }
.note-textarea { flex: 1; width: 100%; background: var(--fd-input-bg); border: 1px solid var(--fd-border); color: var(--fd-text-main); border-radius: 6px; padding: 12px; font-size: 13px; line-height: 1.5; outline: none; resize: none; font-family: sans-serif; box-sizing: border-box; }
.note-textarea:focus { border-color: #aa88ff; box-shadow: 0 0 5px rgba(170, 136, 255, 0.2); }
</style>
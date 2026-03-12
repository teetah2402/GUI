//#######################################################################
// File NAME : src/components/flow-designer/FlowHeader.vue
//#######################################################################
<template>
  <header class="flow-header">
    <div class="header-left">
      <button @click="$emit('toggle-sidebar')" class="btn-hamburger" title="Toggle Node Panel">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
      <h2>Flowork Neural Builder <span class="badge">Edge</span></h2>
    </div>

    <div class="header-actions">
      <button @click="$emit('open-custom-modal')" class="btn-action btn-custom" title="Create Custom Javascript Module">Build Module</button>

      <input type="file" ref="fileInput" @change="handleFileUpload" accept=".json,application/json" style="display: none" />

      <button @click="triggerUpload" class="btn-action" title="Upload JSON Workflow">Import</button>
      <button @click="downloadFlow" class="btn-action" title="Download as JSON">Export</button>

      <button @click="openLibraryPage" class="btn-action btn-library" title="Explore Workflow Templates">Library</button>
      <button @click="$emit('open-share-modal')" class="btn-action btn-share" title="Get Shareable Link">Share</button>

      <a href="https://extension.floworkos.com" target="_blank" class="btn-action btn-extension" title="Download Chrome Extension">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        Chrome Ext
      </a>
      <a href="https://update.floworkos.com" target="_blank" class="btn-action btn-engine" title="Download/Update Local Engine">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
        Engine
      </a>

      <div class="header-divider"></div>

      <div class="header-divider"></div>

      <button @click="flowStore.clearCanvas()" class="btn-clear" :disabled="isExecuting">Clear Canvas</button>
      <button @click="runCurrentFlow" class="btn-run" :disabled="isExecuting">
          {{ isExecuting ? 'Executing...' : 'Run Flow' }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useFlowStore } from '@/store/flowWorkflow';
import { useUiStore } from '@/store/ui';
import { executeFlow } from '@/utils/flowRunner';
import { useSocketStore } from '@/store/socket'; // [ADD] Import Socket/Engine Store

defineEmits(['toggle-sidebar', 'open-custom-modal', 'open-share-modal']);

const flowStore = useFlowStore();
const uiStore = useUiStore();
const socketStore = useSocketStore(); // [ADD] Inisialisasi store untuk membaca status engine

// [UPDATE] Ambil workflowNote
const { nodes, edges, customNodes, isExecuting, workflowNote } = storeToRefs(flowStore);
const fileInput = ref(null);

function triggerUpload() {
    if (fileInput.value) fileInput.value.click();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed.nodes && parsed.edges) {
                nodes.value = parsed.nodes;
                edges.value = parsed.edges;

                if (parsed.customNodes && Array.isArray(parsed.customNodes)) {
                    customNodes.value = parsed.customNodes;
                }

                // [NEW] Parsing Note jika ada
                if (parsed.workflowNote !== undefined) {
                    workflowNote.value = parsed.workflowNote;
                } else {
                    workflowNote.value = '';
                }

                flowStore.addLog("System", `Workflow [${file.name}] imported successfully.`, "success");
                uiStore.showNotification({ text: "Workflow Imported!", color: "success" });
            } else {
                throw new Error("Invalid Flowork JSON format");
            }
        } catch (err) {
            flowStore.addLog("System", `Failed to parse JSON: ${err.message}`, "error");
            uiStore.showNotification({ text: "Invalid JSON File", color: "error" });
        }
        event.target.value = null;
    };
    reader.readAsText(file);
}

function downloadFlow() {
    try {
        // [UPDATE] Sisipkan workflowNote ke Export Data
        const flowData = {
            nodes: nodes.value,
            edges: edges.value,
            customNodes: customNodes.value,
            workflowNote: workflowNote.value
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flowData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `flowork_workflow_${Date.now()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        flowStore.addLog("System", "Workflow exported to JSON file successfully.", "success");
    } catch(e) {
        flowStore.addLog("System", "Failed to export workflow.", "error");
    }
}

function openLibraryPage() {
    window.open('/library', '_blank');
}

function runCurrentFlow() {
    // [ADD] Peringatan ringan jika user mencoba run tapi engine offline (Opsional, tapi sangat membantu UX)
    if (!socketStore.isConnected) {
        const hasEngineNode = nodes.value.some(n => n.data.name.startsWith('engine.'));
        if (hasEngineNode) {
            uiStore.showNotification({
                text: "Peringatan: Flow Anda mengandung node Engine fisik, tapi Engine Lokal sedang offline.",
                color: "warning"
            });
        }
    }

    executeFlow(nodes.value, edges.value);
}
</script>

<style scoped>
.flow-header { height: 50px; background-color: var(--fd-bg-header); border-bottom: 1px solid var(--fd-border); display: flex; align-items: center; padding: 0 20px; justify-content: space-between; flex-shrink: 0; transition: background 0.3s; }
.header-left { display: flex; align-items: center; gap: 15px; }
.btn-hamburger { background: transparent; border: none; color: var(--fd-text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 6px; border-radius: 4px; transition: 0.2s; }
.btn-hamburger:hover { background: var(--fd-item-hover); color: var(--fd-text-main); }
.badge { font-size: 10px; background: #ffaa00; color: #000; padding: 2px 6px; border-radius: 4px; vertical-align: top; margin-left: 5px; font-weight: bold;}
.header-actions { display: flex; align-items: center; gap: 10px; }
.btn-action { background: transparent; color: var(--fd-text-main); border: 1px solid var(--fd-border); padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px; }
a.btn-action { text-decoration: none; } /* [ADD] Reset text-decoration untuk link baru */

/* Default button hovers */
.btn-action:hover { background: var(--fd-item-hover); border-color: #00ffcc; color: #00ffcc;}
.btn-share:hover { border-color: #aa88ff; color: #aa88ff;}
.btn-custom:hover { border-color: #ffaa00; color: #ffaa00;}
.btn-library:hover { border-color: #00aaff; color: #00aaff;}

/* [ADD] Warna khusus untuk tombol Extension (Biru) */
.btn-extension { border-color: #3b82f6; color: #3b82f6; }
.btn-extension:hover { background: rgba(59, 130, 246, 0.1); border-color: #60a5fa; color: #60a5fa !important; }

/* [ADD] Warna khusus untuk tombol Engine (Oranye) */
.btn-engine { border-color: #f97316; color: #f97316; }
.btn-engine:hover { background: rgba(249, 115, 22, 0.1); border-color: #fb923c; color: #fb923c !important; }

.header-divider { width: 1px; height: 24px; background: var(--fd-border); margin: 0 5px; }

/* CSS untuk Engine Status Badge (Dipertahankan meski dikomentari pada HTML) */
.engine-status-badge { display: flex; align-items: center; gap: 6px; background: rgba(255, 68, 68, 0.1); border: 1px solid rgba(255, 68, 68, 0.3); padding: 4px 10px; border-radius: 6px; color: #ff4444; font-size: 11px; font-weight: bold; font-family: monospace; transition: all 0.3s ease; }
.engine-status-badge .status-dot { width: 8px; height: 8px; background-color: #ff4444; border-radius: 50%; box-shadow: 0 0 5px #ff4444; animation: pulse-offline 2s infinite; }
.engine-status-badge.is-online { background: rgba(0, 255, 204, 0.1); border-color: rgba(0, 255, 204, 0.3); color: #00ffcc; }
.engine-status-badge.is-online .status-dot { background-color: #00ffcc; box-shadow: 0 0 5px #00ffcc; animation: pulse-online 2s infinite; }
.vitals-text { color: #888; font-weight: normal; margin-left: 4px; }

@keyframes pulse-offline { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
@keyframes pulse-online { 0% { box-shadow: 0 0 0 0 rgba(0, 255, 204, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(0, 255, 204, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 255, 204, 0); } }

.btn-clear { background: transparent; color: #ff4444; border: 1px solid #ff4444; padding: 6px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-clear:hover:not(:disabled) { background: #ff4444; color: #fff; }
.btn-clear:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-run { background: #00ffcc; color: #000; border: none; padding: 6px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: 0.2s; box-shadow: 0 0 10px rgba(0, 255, 204, 0.2);}
.btn-run:hover:not(:disabled) { background: #00e6b8; transform: translateY(-1px); }
.btn-run:disabled { background: #555; color: #888; cursor: not-allowed; box-shadow: none; }
</style>
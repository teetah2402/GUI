//#######################################################################
// File NAME : src/components/flow-designer/FlowSidebarRight.vue
//#######################################################################
<template>
  <aside class="flow-properties">

    <template v-if="selectedNode">
        <button @click="showNote = !showNote" class="note-out-toggle" :title="showNote ? 'Close Note' : 'Open Note'">
            <span class="icon-pulse" v-if="!showNote">◀</span>
            <span v-else>▶</span>
        </button>

        <div class="note-side-panel" :class="{ 'is-open': showNote }">
            <div class="note-header">
                <span>📝 Module Notes</span>
                <span class="note-status" v-if="selectedNode.data?.note">✓ Saved</span>
            </div>

            <div v-if="selectedNode.data?.note" class="native-note-box">
                <pre>{{ selectedNode.data.note }}</pre>
            </div>

            <textarea
                v-model="selectedNode.data.customNote"
                class="note-textarea"
                placeholder="Write your custom notes, reminders, or documentation for this module here..."
            ></textarea>

            <div class="note-footer">
                <span class="footer-icon">⚡</span> Auto-saved to Workspace
            </div>
        </div>

        <div class="prop-main-content">
            <div class="sidebar-title prop-title-bar">
                <span>Parameters</span>
                <button @click="flowStore.clearSelectedNode()" class="btn-close-prop" title="Close Parameters">✕</button>
            </div>

            <div class="prop-header">
                <span class="prop-header-icon">{{ selectedNode.data?.icon || selectedNode.icon || '⚙️' }}</span>
                <div class="prop-header-info">
                    <span class="prop-header-name">{{ selectedNode.data?.displayName || selectedNode.displayName || selectedNode.name }}</span>
                    <span class="prop-header-id">{{ selectedNode.id }}</span>
                </div>
            </div>

            <div class="prop-form-area" v-if="(selectedNode.properties?.length || selectedNode.data?.properties?.length) && selectedNode.data?.config">
                <div v-for="prop in (selectedNode.properties || selectedNode.data.properties)" :key="prop.name" class="form-group" v-show="shouldShowProp(prop, selectedNode.data.config)">
                    <label :for="prop.name">{{ prop.displayName }}</label>

                    <select v-if="prop.type === 'options'" :id="prop.name" v-model="selectedNode.data.config[prop.name]" class="form-control">
                        <option v-for="opt in prop.options" :key="opt" :value="opt">{{ opt }}</option>
                    </select>

                    <div v-else-if="prop.type === 'file'">
                        <input type="file" :id="prop.name" @change="(e) => handleLocalFileSelect(e, prop.name)" class="form-control" style="padding: 6px; cursor: pointer;" />
                        <p class="field-hint" style="color: #00ffcc; font-weight: bold;" v-if="selectedNode.data.config[prop.name] && typeof selectedNode.data.config[prop.name] === 'string' && selectedNode.data.config[prop.name].startsWith('data:')">
                            ✓ File loaded securely
                        </p>
                    </div>

                    <div v-else-if="prop.type === 'folder'">
                        <div style="display: flex; gap: 8px;">
                            <input type="text" :id="prop.name" v-model="selectedNode.data.config[prop.name]" class="form-control" :placeholder="prop.description || 'Pilih folder tujuan...'" />
                            <button @click.prevent="openNativeFolderPicker(prop.name)" class="btn-browse-folder">Browse</button>
                        </div>
                        <p v-if="prop.description" class="field-hint">{{ prop.description }}</p>
                    </div>

                    <input v-else-if="prop.type === 'string'" type="text" :id="prop.name" v-model="selectedNode.data.config[prop.name]" class="form-control" :placeholder="prop.description || 'Enter ' + prop.displayName.toLowerCase()" />
                    <p v-if="prop.description" class="field-hint">{{ prop.description }}</p>
                </div>
            </div>
            <div v-else class="no-props-msg"><p>No parameters required.</p></div>

            <h3 class="sidebar-title mt-top">Node Output</h3>
            <div class="output-area">
                <div v-if="executingNodes[selectedNode.id]" class="loading-state">⚙ Processing data...</div>
                <pre v-else-if="nodeOutputs[selectedNode.id]" class="json-viewer">{{ JSON.stringify(nodeOutputs[selectedNode.id], null, 2) }}</pre>
                <div v-else class="empty-state">No output data yet.</div>
            </div>
        </div>
    </template>

    <div v-else class="empty-panel">
        <span class="empty-panel-icon">🖱️</span>
        <p>Pilih Node di kanvas untuk melihat pengaturan dan catatan.</p>
    </div>

  </aside>
</template>

<script setup>
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useFlowStore } from '@/store/flowWorkflow';
import { useUiStore } from '@/store/ui';
// [MODIFIED] Import socket store
import { useSocketStore } from '@/store/socket';

const flowStore = useFlowStore();
const uiStore = useUiStore();
const socketStore = useSocketStore(); // [MODIFIED]
const { selectedNode, nodeOutputs, executingNodes } = storeToRefs(flowStore);

const showNote = ref(false);

watch(() => selectedNode.value?.id, (newId) => {
    if (newId && selectedNode.value) {
        const node = selectedNode.value;

        if (!node.data) node.data = {};
        if (!node.data.config) node.data.config = {};

        const activeProps = node.properties || node.data.properties || [];

        if (activeProps && Array.isArray(activeProps)) {
            activeProps.forEach(prop => {
                if (node.data.config[prop.name] === undefined && prop.default !== undefined) {
                    node.data.config[prop.name] = prop.default;
                }
            });
        }
    }
    showNote.value = false;
}, { immediate: true });

function shouldShowProp(prop, config) {
    if (!prop || !prop.showIf || !config) return true;
    const targetValue = config[prop.showIf.field];
    if (Array.isArray(prop.showIf.value)) {
        return prop.showIf.value.includes(targetValue);
    }
    return targetValue === prop.showIf.value;
}

function handleLocalFileSelect(event, propName) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        if (!selectedNode.value.data.config) selectedNode.value.data.config = {};
        selectedNode.value.data.config[propName] = e.target.result;

        uiStore.showNotification({ text: `File loaded: ${file.name}`, color: "success" });
    };
    reader.readAsDataURL(file);
}

// [MODIFIED] Fungsi untuk memanggil Native OS Picker via Socket.IO
async function openNativeFolderPicker(propName) {
    try {
        const selectedPath = await socketStore.pickFolder();
        if (selectedPath) {
            if (!selectedNode.value.data.config) selectedNode.value.data.config = {};
            selectedNode.value.data.config[propName] = selectedPath;
        }
    } catch (error) {
        console.log("Pemilihan folder dibatalkan atau gagal: ", error);
    }
}
</script>

<style scoped>
.flow-properties { width: 300px; background-color: var(--fd-bg-panel); display: flex; flex-direction: column; z-index: 20; transition: all 0.3s ease; border-left: 1px solid var(--fd-border); position: relative; }
.prop-main-content { display: flex; flex-direction: column; width: 100%; height: 100%; background-color: var(--fd-bg-panel); z-index: 25; position: relative; }

.note-out-toggle { position: absolute; left: -28px; top: 50%; transform: translateY(-50%); width: 28px; height: 70px; background: #1a1a1a; border: 1px solid #3DDC84; border-right: none; border-radius: 8px 0 0 8px; color: #3DDC84; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 30; box-shadow: -3px 0 10px rgba(61, 220, 132, 0.2); transition: background 0.2s, color 0.2s; }
.note-out-toggle:hover { background: #3DDC84; color: #000; }
.icon-pulse { font-size: 14px; animation: pulse-left 1.5s infinite; }
@keyframes pulse-left { 0% { transform: translateX(0); } 50% { transform: translateX(-3px); } 100% { transform: translateX(0); } }

.note-side-panel { position: absolute; left: 0; top: 0; bottom: 0; width: 300px; background: #111111; border-left: 1px solid #3DDC84; z-index: 15; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: translateX(0); display: flex; flex-direction: column; box-shadow: -5px 0 20px rgba(0,0,0,0.5); }
.note-side-panel.is-open { transform: translateX(-100%); }
.note-header { padding: 15px; border-bottom: 1px solid #289a5b; background: #1a1a1a; color: #3DDC84; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; display: flex; justify-content: space-between; align-items: center; }
.note-status { font-size: 10px; background: rgba(61, 220, 132, 0.2); padding: 2px 6px; border-radius: 4px; color: #3DDC84; }

.native-note-box { padding: 15px; background: rgba(61, 220, 132, 0.1); border-bottom: 1px solid #3DDC84; }
.native-note-box pre { font-family: monospace; font-size: 11px; color: #3DDC84; white-space: pre-wrap; margin: 0; }

.note-textarea { flex: 1; width: 100%; background: #3DDC84 !important; border: none !important; color: #002244 !important; padding: 20px; font-size: 14px; font-weight: 600; font-family: monospace; line-height: 1.6; resize: none; outline: none !important; }
.note-textarea::placeholder { color: rgba(0, 34, 68, 0.6) !important; font-style: italic; font-weight: normal; }

.note-footer { padding: 10px 15px; background: #289a5b; color: #000; font-size: 11px; text-align: right; font-weight: bold; border-top: 1px solid #1e7543; }
.footer-icon { font-size: 12px; margin-right: 4px; }

.prop-title-bar { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--fd-border); color: var(--fd-text-muted); background: var(--fd-bg-header); flex-shrink: 0; }
.btn-close-prop { background: transparent; border: none; color: var(--fd-text-muted); cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.btn-close-prop:hover { color: #ff4444; transform: scale(1.2); }
.sidebar-title { padding: 15px; margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--fd-border); color: var(--fd-text-muted); background: var(--fd-bg-header); flex-shrink: 0; }
.mt-top { border-top: 1px solid var(--fd-border); margin-top: 0; }
.prop-header { display: flex; align-items: center; padding: 15px; background-color: var(--fd-item-bg); border-bottom: 1px solid var(--fd-border); gap: 12px; flex-shrink: 0; transition: background 0.3s; }
.prop-header-icon { font-size: 32px; }
.prop-header-info { display: flex; flex-direction: column; }
.prop-header-name { font-weight: bold; font-size: 15px; color: var(--fd-text-main); }
.prop-header-id { font-size: 10px; color: var(--fd-text-muted); font-family: monospace; margin-top: 2px;}

.prop-form-area { flex: 1; padding: 15px; overflow-y: auto; }
.no-props-msg { flex: 1; padding: 20px 15px; text-align: center; color: var(--fd-text-muted); font-size: 12px; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 12px; color: var(--fd-text-muted); font-weight: 600; }
.form-control { width: 100%; padding: 10px; background: var(--fd-input-bg); border: 1px solid var(--fd-border); color: var(--fd-text-main); border-radius: 4px; outline: none; font-size: 13px; }
.form-control:focus { border-color: #00ffcc; box-shadow: 0 0 5px rgba(0, 255, 204, 0.2); }
.field-hint { font-size: 10px; color: var(--fd-text-muted); margin-top: 4px; margin-bottom: 0; line-height: 1.3;}

/* [MODIFIED] Tombol CSS untuk Browse Folder */
.btn-browse-folder { background: #3DDC84; color: #111; border: none; padding: 0 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px; transition: background 0.2s; white-space: nowrap; }
.btn-browse-folder:hover { background: #289a5b; }

.output-area { height: 250px; flex-shrink: 0; padding: 15px; background: var(--fd-input-bg); overflow-y: auto; border-top: 1px solid var(--fd-border); }
.json-viewer { background: var(--fd-json-bg); padding: 10px; border-radius: 6px; border: 1px solid var(--fd-border); color: #00aaff; font-size: 11px; font-family: monospace; white-space: pre-wrap; margin: 0; user-select: text; }
.empty-state, .loading-state { text-align: center; font-size: 12px; color: var(--fd-text-muted); padding: 20px 0; font-style: italic; }
.loading-state { color: #00ffcc; animation: pulse 1.5s infinite; }
@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }

.empty-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center; color: var(--fd-text-muted); }
.empty-panel-icon { font-size: 40px; margin-bottom: 15px; opacity: 0.5; }
</style>
//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/store/flowWorkflow.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export const useFlowStore = defineStore('flowWorkflow', () => {

    const nodes = ref([]);
    const edges = ref([]);

    // State untuk menyimpan module/node buatan user
    const customNodes = ref([]);

    // State untuk menyimpan Catatan Workflow (Note)
    const workflowNote = ref('');

    // [NEW] State untuk warna custom background Canvas
    const canvasBgColor = ref('');

    // State untuk Custom UI Debugger Popup
    const isDebugPopupOpen = ref(false);
    const debugPopupTitle = ref('');
    const debugPopupContent = ref('');

    const elements = computed(() => [...nodes.value, ...edges.value]);

    const selectedNode = ref(null);
    const isExecuting = ref(false);

    const nodeOutputs = ref({});
    const executingNodes = ref({});
    const failedNodes = ref({});
    const executionLogs = ref([]);

    // ==========================================
    // AUTO-SAVE ENGINE (SESSION STORAGE)
    // [FIX] Menggunakan sessionStorage agar multi-tab tidak saling bentrok/menimpa
    // ==========================================
    let saveTimeout = null;

    function saveFlowToLocal() {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            try {
                const flowData = {
                    nodes: nodes.value,
                    edges: edges.value,
                    customNodes: customNodes.value,
                    workflowNote: workflowNote.value,
                    canvasBgColor: canvasBgColor.value // [NEW] Simpan warna canvas
                };
                sessionStorage.setItem('flowork_autosave', JSON.stringify(flowData));
            } catch (e) {
                console.error("Auto-save failed:", e);
            }
        }, 500);
    }

    function loadFlowFromLocal() {
        try {
            const saved = sessionStorage.getItem('flowork_autosave');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.nodes && Array.isArray(parsed.nodes)) {
                    nodes.value = parsed.nodes;
                }
                if (parsed.edges && Array.isArray(parsed.edges)) {
                    edges.value = parsed.edges;
                }
                if (parsed.customNodes && Array.isArray(parsed.customNodes)) {
                    customNodes.value = parsed.customNodes;
                }
                if (parsed.workflowNote !== undefined) {
                    workflowNote.value = parsed.workflowNote;
                }
                // [NEW] Load warna canvas
                if (parsed.canvasBgColor !== undefined) {
                    canvasBgColor.value = parsed.canvasBgColor;
                }
                addLog("System", "Previous workflow restored from Auto-Save (Session).", "system");
            }
        } catch (e) {
            console.error("Failed to load auto-save:", e);
        }
    }

    // Trigger auto-save setiap ada perubahan di canvas
    // [NEW] Tambah pantauan ke canvasBgColor
    watch([nodes, edges, customNodes, workflowNote, canvasBgColor], () => {
        saveFlowToLocal();
    }, { deep: true });
    // ==========================================


    function addNode(node) { nodes.value.push(node); }
    function addEdge(edge) { edges.value.push(edge); }

    function addCustomNode(nodeDef) { customNodes.value.push(nodeDef); }

    function updateCustomNode(nodeName, updatedDef) {
        const index = customNodes.value.findIndex(n => n.name === nodeName);
        if (index !== -1) {
            customNodes.value[index] = updatedDef;
        }
    }

    function deleteCustomNode(nodeName) {
        customNodes.value = customNodes.value.filter(n => n.name !== nodeName);
    }

    function setSelectedNode(node) { selectedNode.value = node; }
    function clearSelectedNode() { selectedNode.value = null; }

    function openDebugPopup(title, content) {
        debugPopupTitle.value = title;
        debugPopupContent.value = content;
        isDebugPopupOpen.value = true;
    }

    function closeDebugPopup() {
        isDebugPopupOpen.value = false;
        debugPopupTitle.value = '';
        debugPopupContent.value = '';
    }

    function clearCanvas() {
        nodes.value = [];
        edges.value = [];
        workflowNote.value = '';
        canvasBgColor.value = ''; // [NEW] Reset warna canvas
        selectedNode.value = null;
        isExecuting.value = false;
        nodeOutputs.value = {};
        executingNodes.value = {};
        failedNodes.value = {};
        executionLogs.value = [];

        sessionStorage.removeItem('flowork_autosave');
        addLog("System", "Canvas cleared. Ready for new flow.", "system");
    }

    function removeElement(id) {
        nodes.value = nodes.value.filter(n => n.id !== id);
        edges.value = edges.value.filter(e => e.id !== id);

        if (selectedNode.value && selectedNode.value.id === id) {
            selectedNode.value = null;
        }
    }

    function setNodeOutput(nodeId, data) {
        nodeOutputs.value = { ...nodeOutputs.value, [nodeId]: data };
    }

    function setNodeExecuting(nodeId, status) {
        executingNodes.value = { ...executingNodes.value, [nodeId]: status };
    }

    function setNodeFailed(nodeId, status) {
        failedNodes.value = { ...failedNodes.value, [nodeId]: status };
    }

    function clearOutputs() {
        nodeOutputs.value = {};
        executingNodes.value = {};
        failedNodes.value = {};
        executionLogs.value = [];
    }

    function addLog(sender, message, type = 'info', data = null) {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        executionLogs.value.push({
            id: Date.now() + Math.random(),
            time,
            sender,
            message,
            type,
            data
        });
    }

    return {
        elements, nodes, edges, customNodes, workflowNote, canvasBgColor, selectedNode, isExecuting, nodeOutputs, executingNodes, failedNodes, executionLogs,
        isDebugPopupOpen, debugPopupTitle, debugPopupContent,
        addNode, addEdge, addCustomNode, updateCustomNode, deleteCustomNode, removeElement, setSelectedNode, clearSelectedNode, clearCanvas,
        setNodeOutput, setNodeExecuting, setNodeFailed, clearOutputs, addLog,
        saveFlowToLocal, loadFlowFromLocal,
        openDebugPopup, closeDebugPopup
    };
});
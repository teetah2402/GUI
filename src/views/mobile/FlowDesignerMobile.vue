//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/views/mobile/FlowDesignerMobile.vue
// STYLE     : Vertical Linear with Bottom Sheet & Debugger Terminal
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="mobile-flow-container" :data-theme="uiTheme">

    <header class="mobile-header glass-panel">
        <button class="icon-btn" @click="goBack">
            <i class="mdi mdi-arrow-left"></i>
        </button>
        <div class="header-title">
            <h2 class="flow-name">{{ flowStore.workflowNote || 'My Workflow' }}</h2>
            <span class="flow-status">
                <span class="status-dot" :class="{'executing-dot': flowStore.isExecuting}"></span>
                {{ flowStore.isExecuting ? 'Running...' : 'Draft' }}
            </span>
        </div>
        <button class="icon-btn primary-glow" @click="runFlow" :disabled="flowStore.isExecuting">
            <i class="mdi mdi-play"></i>
        </button>
    </header>

    <div class="mobile-toolbar scrollable-menu glass-panel hide-scrollbar">
        <input type="file" ref="fileInput" @change="handleFileUpload" accept=".json,application/json" style="display: none" />

        <button class="tool-btn" @click="goToLibrary">
            <i class="mdi mdi-view-grid-outline"></i> Library
        </button>

        <button class="tool-btn" @click="openBuildModuleSheet">
            <i class="mdi mdi-hammer-wrench"></i> Build
        </button>

        <button class="tool-btn" @click="triggerUpload">
            <i class="mdi mdi-upload"></i> Import
        </button>

        <button class="tool-btn" @click="downloadFlow">
            <i class="mdi mdi-download"></i> Export
        </button>

        <button class="tool-btn" @click="openTerminal">
            <i class="mdi mdi-console-line"></i> Logs
        </button>

        <button class="tool-btn danger-action" @click="openClearAllConfirm">
            <i class="mdi mdi-delete-sweep-outline"></i> Clear
        </button>
    </div>

    <main class="vertical-canvas">
        <div class="nodes-list">

            <template v-for="(node, index) in computedLinearNodes" :key="node.id">
                <div class="node-card" @click="openNodeConfig(node)" :class="{'has-error': flowStore.failedNodes[node.id], 'is-running': flowStore.executingNodes[node.id]}">

                    <div class="node-icon" :style="{ background: (node.data.customColor || node.data.color || '#6366f1') + '44', border: '1px solid ' + (node.data.customColor || node.data.color || '#6366f1'), color: (node.data.customColor || node.data.color || '#fff') }">
                        <i v-if="getNodeIcon(node.data).startsWith('mdi-')" :class="['mdi', getNodeIcon(node.data)]"></i>
                        <span v-else>{{ getNodeIcon(node.data) }}</span>
                    </div>

                    <div class="node-details">
                        <h3 class="node-title">{{ node.data.displayName || node.data.label || node.data.name || 'Module' }}</h3>
                        <p class="node-subtitle">{{ node.data.description || node.data.subtitle || 'Tap to configure' }}</p>
                    </div>

                    <div class="node-action">
                        <div class="status-led-mobile"></div>
                    </div>
                </div>

                <div v-if="getAvailableOutputs(node).length > 1" class="branch-tabs-container">
                    <div class="branch-tabs">
                        <button v-for="port in getAvailableOutputs(node)" :key="port"
                                class="branch-tab"
                                :class="{'active': (activeBranches[node.id] || getAvailableOutputs(node)[0]) === port}"
                                @click="activeBranches[node.id] = port">
                            {{ port.toUpperCase() }}
                        </button>
                    </div>
                </div>

                <div class="connector-wrapper">
                    <div class="vertical-line" :class="{'line-executing': flowStore.executingNodes[node.id] && !flowStore.failedNodes[node.id]}"></div>
                </div>
            </template>

            <div class="empty-drop-zone" @click="openNodeSelector()">
                <span>{{ computedLinearNodes.length === 0 ? 'Add First Trigger' : 'Add Next Action' }}</span>
            </div>

        </div>
    </main>

    <div class="bottom-sheet-overlay" v-if="isSheetOpen || isTerminalOpen || isBuildModuleOpen" @click="closeAllSheets"></div>

    <div class="bottom-sheet terminal-sheet" :class="{ 'is-open': isTerminalOpen }">
        <div class="sheet-handle" @click="closeAllSheets"></div>
        <div class="sheet-header">
            <h3>Execution Logs</h3>
            <div class="sheet-header-actions">
                <button class="header-danger-btn" @click="flowStore.clearOutputs" title="Clear Logs">
                    <i class="mdi mdi-delete-sweep-outline"></i>
                </button>
                <button class="close-btn" @click="closeAllSheets"><i class="mdi mdi-close"></i></button>
            </div>
        </div>
        <div class="sheet-content terminal-content hide-scrollbar">
            <div v-if="flowStore.executionLogs.length === 0" class="empty-log">No logs available. Run the flow first.</div>
            <div v-for="log in flowStore.executionLogs" :key="log.id" :class="['log-entry', `log-${log.type}`]">
                <span class="log-time">[{{ log.time }}]</span>
                <span class="log-sender">{{ log.sender }}:</span>
                <span class="log-message">{{ log.message }}</span>
            </div>
        </div>
    </div>

    <div class="bottom-sheet" :class="{ 'is-open': isSheetOpen }">
        <div class="sheet-handle" @click="closeAllSheets"></div>

        <div class="sheet-header">
            <h3>{{ sheetMode === 'select' ? 'Add New Node' : 'Configure Node' }}</h3>

            <div class="sheet-header-actions">
                <button v-if="sheetMode === 'config'" class="header-info-btn" @click="debugActiveNode" title="Debug Module">
                    <i class="mdi mdi-bug-outline"></i>
                </button>
                <button v-if="sheetMode === 'config'" class="header-danger-btn" @click="openDeleteConfirm" title="Delete Module">
                    <i class="mdi mdi-trash-can-outline"></i>
                </button>
                <button class="close-btn" @click="closeAllSheets"><i class="mdi mdi-close"></i></button>
            </div>
        </div>

        <div class="sheet-content">
            <div v-if="sheetMode === 'select'" class="node-picker-container">
                <div class="search-bar-wrapper">
                    <i class="mdi mdi-magnify search-icon"></i>
                    <input type="text" v-model="searchQuery" placeholder="Search modules..." class="flow-input search-input">
                </div>

                <div v-if="filteredNodesList.length === 0" class="empty-search">No modules found.</div>

                <div class="node-picker-grid">
                    <div class="picker-item" v-for="rNode in filteredNodesList" :key="rNode.name" @click="addSelectedNode(rNode)">
                        <div class="p-icon" :style="{ background: (rNode.customColor || rNode.color || '#3b82f6') + '44', border: '1px solid ' + (rNode.customColor || rNode.color || '#3b82f6'), color: (rNode.customColor || rNode.color || '#fff') }">
                            <i v-if="getNodeIcon(rNode).startsWith('mdi-')" :class="['mdi', getNodeIcon(rNode)]"></i>
                            <span v-else>{{ getNodeIcon(rNode) }}</span>
                        </div>
                        <span>{{ rNode.displayName || rNode.name }}</span>
                    </div>
                </div>
            </div>

            <div v-if="sheetMode === 'config' && activeNode" class="node-config-form">
                <div class="form-group">
                    <label>Node Custom Name</label>
                    <input type="text" v-model="activeNode.data.displayName" class="flow-input" placeholder="e.g., Fetch User Data">
                </div>

                <template v-if="activeNodeRegistry && activeNodeRegistry.properties">
                    <div v-for="(prop, pIndex) in activeNodeRegistry.properties" :key="pIndex" class="form-group" v-show="shouldShowProp(prop, activeNode.data.config)">
                        <label :for="prop.name">{{ prop.displayName || prop.name || prop.id }}</label>

                        <select v-if="prop.type === 'options'" :id="prop.name" v-model="activeNode.data.config[prop.name || prop.id]" class="flow-input flow-select">
                            <option v-for="opt in prop.options" :key="opt" :value="opt">{{ opt }}</option>
                        </select>

                        <div v-else-if="prop.type === 'file'">
                            <input type="file" :id="prop.name" @change="(e) => handleLocalFileSelect(e, prop.name || prop.id)" class="flow-input file-input-m" />
                            <p class="field-hint-m success-text" v-if="activeNode.data.config[prop.name || prop.id] && typeof activeNode.data.config[prop.name || prop.id] === 'string' && activeNode.data.config[prop.name || prop.id].startsWith('data:')">
                                ✓ File loaded securely
                            </p>
                        </div>

                        <div v-else-if="prop.type === 'folder'">
                            <div class="folder-picker-wrapper">
                                <input type="text" :id="prop.name" v-model="activeNode.data.config[prop.name || prop.id]" class="flow-input folder-input" :placeholder="prop.description || 'Select target folder...'" />
                                <button @click.prevent="openNativeFolderPicker(prop.name || prop.id)" class="btn-glow-primary small-btn">Browse</button>
                            </div>
                        </div>

                        <input v-else type="text" :id="prop.name" v-model="activeNode.data.config[prop.name || prop.id]" class="flow-input" :placeholder="prop.description || `Enter ${prop.displayName || prop.name}`" />

                        <p v-if="prop.description" class="field-hint-m">{{ prop.description }}</p>
                    </div>
                </template>

                <div class="sheet-action-row">
                    <button class="btn-glow-primary full-width" @click="closeAllSheets">Save Changes</button>
                </div>
            </div>
        </div>
    </div>

    <div class="bottom-sheet build-module-sheet" :class="{ 'is-open': isBuildModuleOpen }">
        <div class="sheet-handle" @click="closeAllSheets"></div>
        <div class="sheet-header">
            <h3><span style="color: #00ffcc;">✨</span> AI Module Builder</h3>
            <button class="close-btn" @click="closeAllSheets"><i class="mdi mdi-close"></i></button>
        </div>
        <div class="sheet-content">
            <p class="modal-subtitle-m">Describe your logic, and Gemini AI will build the Javascript module for you.</p>

            <div class="form-group">
                <label>Gemini API Key</label>
                <input type="password" v-model="geminiApiKey" class="flow-input ai-input-m" placeholder="AIzaSy..." />
            </div>

            <div class="form-group">
                <label>Prompt / Description</label>
                <textarea v-model="aiPrompt" class="flow-input ai-input-m" rows="4" placeholder="e.g. Create a module that extracts the domain name from an 'email' string parameter."></textarea>
            </div>

            <button @click="generateWithAI" class="btn-glow-primary full-width ai-gen-btn" :disabled="isGeneratingAI">
                {{ isGeneratingAI ? '⏳ Generating...' : '🤖 Generate & Add to Canvas' }}
            </button>

            </div>
    </div>

    <div v-if="isDeleteConfirmOpen" class="custom-modal-overlay" @click.self="isDeleteConfirmOpen = false">
        <div class="custom-confirm-modal">
            <div class="confirm-icon danger-glow">
                <i class="mdi mdi-alert-outline"></i>
            </div>
            <h3>Delete Module?</h3>
            <p>Are you sure you want to remove this module from your workflow? This action cannot be undone.</p>
            <div class="confirm-actions">
                <button class="btn-outline" @click="isDeleteConfirmOpen = false">Cancel</button>
                <button class="btn-danger-solid" @click.stop="confirmDeleteActiveNode">Yes, Delete</button>
            </div>
        </div>
    </div>

    <div v-if="isClearAllConfirmOpen" class="custom-modal-overlay" @click.self="isClearAllConfirmOpen = false">
        <div class="custom-confirm-modal">
            <div class="confirm-icon danger-glow">
                <i class="mdi mdi-delete-sweep"></i>
            </div>
            <h3>Clear Canvas?</h3>
            <p>Are you sure you want to delete ALL nodes and reset the workflow? This action cannot be undone.</p>
            <div class="confirm-actions">
                <button class="btn-outline" @click="isClearAllConfirmOpen = false">Cancel</button>
                <button class="btn-danger-solid" @click.stop="executeClearAll">Yes, Clear All</button>
            </div>
        </div>
    </div>

    <div v-if="flowStore.isDebugPopupOpen" class="debug-modal-overlay">
        <div class="debug-modal">
            <div class="debug-header">
                <h3><i class="mdi mdi-bug"></i> {{ flowStore.debugPopupTitle }}</h3>
                <button class="close-btn" @click="flowStore.closeDebugPopup()"><i class="mdi mdi-close"></i></button>
            </div>
            <div class="debug-body">
                <pre class="json-viewer">{{ formatJSON(flowStore.debugPopupContent) }}</pre>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useFlowStore } from '@/store/flowWorkflow';
import { useFlowRegistryStore } from '@/store/flowRegistry';
import { useUiStore } from '@/store/ui';
import { useSocketStore } from '@/store/socket';
import { executeFlow } from '@/utils/flowRunner';

const router = useRouter();
const route = useRoute();
const uiStore = useUiStore();
const flowStore = useFlowStore();
const flowRegistry = useFlowRegistryStore();
const socketStore = useSocketStore();

const uiTheme = ref(localStorage.getItem('flowork_os_theme') || 'dark');

const isSheetOpen = ref(false);
const isTerminalOpen = ref(false);
const isBuildModuleOpen = ref(false);
const isDeleteConfirmOpen = ref(false);
const isClearAllConfirmOpen = ref(false);

const sheetMode = ref('select');
const activeNode = ref(null);
const searchQuery = ref('');
const fileInput = ref(null);

let sheetTimeout = null;

const geminiApiKey = ref(localStorage.getItem('gemini_api_key') || '');
const aiPrompt = ref('');
const isGeneratingAI = ref(false);

const activeBranches = ref({});

onMounted(async () => {
    if (route.query.id) {
        try {
            uiStore.showNotification({ text: "Mengambil workflow dari cloud...", color: "info" });
            const res = await fetch(`/api/v1/flow/share?id=${route.query.id}`);
            if (!res.ok) throw new Error("Link kadaluarsa atau tidak ditemukan.");

            const parsed = await res.json();
            if (parsed.nodes && parsed.edges) {
                flowStore.nodes = parsed.nodes;
                flowStore.edges = parsed.edges;

                if (parsed.customNodes) {
                    flowStore.customNodes = parsed.customNodes;
                }

                if (parsed.workflowNote !== undefined) {
                    flowStore.workflowNote = parsed.workflowNote;
                } else {
                    flowStore.workflowNote = '';
                }

                flowStore.addLog("System", "Cloud workflow loaded successfully.", "success");
                uiStore.showNotification({ text: "Cloud Workflow Loaded!", color: "success" });
                router.replace({ query: {} });
            }
        } catch (e) {
            flowStore.addLog("System", `Failed to load cloud workflow: ${e.message}`, "error");
            uiStore.showNotification({ text: "Gagal memuat dari Cloud.", color: "error" });
            flowStore.loadFlowFromLocal();
        }
    }
    else if (route.query.shared) {
        try {
            const decoded = decodeURIComponent(atob(route.query.shared));
            const parsed = JSON.parse(decoded);

            if (parsed.nodes && parsed.edges) {
                flowStore.nodes = parsed.nodes;
                flowStore.edges = parsed.edges;

                if (parsed.customNodes) {
                    flowStore.customNodes = parsed.customNodes;
                }

                if (parsed.workflowNote !== undefined) {
                    flowStore.workflowNote = parsed.workflowNote;
                } else {
                    flowStore.workflowNote = '';
                }

                flowStore.addLog("System", "Shared workflow loaded successfully from URL.", "success");
                uiStore.showNotification({ text: "Shared Workflow Loaded!", color: "success" });

                router.replace({ query: {} });
            }
        } catch (e) {
            flowStore.addLog("System", "Failed to load shared workflow. Link might be broken or too large.", "error");
            uiStore.showNotification({ text: "Failed to load shared link.", color: "error" });
            flowStore.loadFlowFromLocal();
        }
    } else {
        flowStore.loadFlowFromLocal();
    }
});

const goToLibrary = () => {
    window.open('https://floworkos.com/library', '_blank');
};

const activeNodeRegistry = computed(() => {
    if (!activeNode.value) return null;
    return flowRegistry.availableNodes.find(n => n.name === (activeNode.value.data.name || activeNode.value.data.type));
});

const filteredNodesList = computed(() => {
    if (!searchQuery.value) return flowRegistry.availableNodes;
    const query = searchQuery.value.toLowerCase();
    return flowRegistry.availableNodes.filter(node =>
        (node.displayName && node.displayName.toLowerCase().includes(query)) ||
        (node.name && node.name.toLowerCase().includes(query)) ||
        (node.description && node.description.toLowerCase().includes(query))
    );
});

function getAvailableOutputs(node) {
    const registryDef = flowRegistry.availableNodes.find(n => n.name === (node.data.name || node.data.type));
    if (registryDef && registryDef.outputs && Array.isArray(registryDef.outputs)) {
        return registryDef.outputs;
    }
    if (node.data.outputs && Array.isArray(node.data.outputs)) return node.data.outputs;
    return ['main'];
}

const computedLinearNodes = computed(() => {
    if (flowStore.nodes.length === 0) return [];

    const visible = [];
    let visited = new Set();

    let currentNodes = flowStore.nodes.filter(n => !flowStore.edges.some(e => e.target === n.id));
    if (currentNodes.length === 0) currentNodes = [flowStore.nodes[0]];

    while (currentNodes.length > 0) {
        const node = currentNodes.shift();
        if (visited.has(node.id)) continue;
        visited.add(node.id);
        visible.push(node);

        const outputs = getAvailableOutputs(node);
        if (outputs.length > 1) {
            if (!activeBranches.value[node.id]) {
                activeBranches.value[node.id] = outputs[0];
            }
            const activePort = activeBranches.value[node.id];

            const activeEdge = flowStore.edges.find(e => e.source === node.id && (e.sourceHandle === activePort || e.label === activePort));
            if (activeEdge) {
                const nextNode = flowStore.nodes.find(n => n.id === activeEdge.target);
                if (nextNode) currentNodes.push(nextNode);
            }
        } else {
            const edge = flowStore.edges.find(e => e.source === node.id);
            if (edge) {
                const nextNode = flowStore.nodes.find(n => n.id === edge.target);
                if (nextNode) currentNodes.push(nextNode);
            }
        }
    }
    return visible;
});

function getNodeIcon(nodeData) {
    if (nodeData?.icon) return nodeData.icon;
    if (nodeData?.name?.startsWith('engine.')) return '⚙️';
    if (nodeData?.name?.startsWith('custom.')) return '🛠️';
    return '📦';
}

const goBack = () => {
    router.push('/canvas');
};

const formatJSON = (data) => {
    try {
        return typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
    } catch (e) {
        return data;
    }
};

const runFlow = () => {
    if(flowStore.nodes.length === 0) {
        uiStore.showNotification({ text: "Workflow is empty!", color: "error" });
        return;
    }
    uiStore.showNotification({ text: "Execution Started", color: "success" });
    executeFlow(flowStore.nodes, flowStore.edges);
};

const triggerUpload = () => {
    if (fileInput.value) fileInput.value.click();
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed.nodes && parsed.edges) {
                flowStore.nodes = parsed.nodes;
                flowStore.edges = parsed.edges;

                if (parsed.customNodes && Array.isArray(parsed.customNodes)) {
                    flowStore.customNodes = parsed.customNodes;
                }
                if (parsed.workflowNote !== undefined) {
                    flowStore.workflowNote = parsed.workflowNote;
                }

                flowStore.addLog("System", `Workflow [${file.name}] imported successfully.`, "success");
                uiStore.showNotification({ text: "Workflow Imported!", color: "success" });
            } else {
                throw new Error("Invalid Flowork JSON format");
            }
        } catch (err) {
            uiStore.showNotification({ text: "Invalid JSON File", color: "error" });
        }
        event.target.value = null;
    };
    reader.readAsText(file);
};

const downloadFlow = () => {
    try {
        const flowData = {
            nodes: flowStore.nodes,
            edges: flowStore.edges,
            customNodes: flowStore.customNodes,
            workflowNote: flowStore.workflowNote
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flowData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `flowork_mobile_${Date.now()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        uiStore.showNotification({ text: "Exported Successfully", color: "success" });
    } catch(e) {
        uiStore.showNotification({ text: "Export Failed", color: "error" });
    }
};

const openTerminal = () => {
    if (sheetTimeout) clearTimeout(sheetTimeout);
    isSheetOpen.value = false;
    isBuildModuleOpen.value = false;
    isTerminalOpen.value = true;
};

const openNodeSelector = () => {
    if (sheetTimeout) clearTimeout(sheetTimeout);
    searchQuery.value = '';
    sheetMode.value = 'select';
    isTerminalOpen.value = false;
    isBuildModuleOpen.value = false;
    isSheetOpen.value = true;
};

const openNodeConfig = (node) => {
    if (sheetTimeout) clearTimeout(sheetTimeout);

    if (!node.data.config) node.data.config = {};
    const activeProps = node.properties || node.data.properties || [];
    if (activeProps && Array.isArray(activeProps)) {
        activeProps.forEach(prop => {
            if (node.data.config[prop.name] === undefined && prop.default !== undefined) {
                node.data.config[prop.name] = prop.default;
            }
        });
    }

    activeNode.value = node;
    sheetMode.value = 'config';
    isTerminalOpen.value = false;
    isBuildModuleOpen.value = false;
    isSheetOpen.value = true;
};

const openBuildModuleSheet = () => {
    if (sheetTimeout) clearTimeout(sheetTimeout);
    isSheetOpen.value = false;
    isTerminalOpen.value = false;
    isBuildModuleOpen.value = true;
};

const closeAllSheets = () => {
    isSheetOpen.value = false;
    isTerminalOpen.value = false;
    isBuildModuleOpen.value = false;
    isDeleteConfirmOpen.value = false;
    isClearAllConfirmOpen.value = false;
    if (sheetTimeout) clearTimeout(sheetTimeout);
    sheetTimeout = setTimeout(() => { activeNode.value = null; }, 300);
};

async function generateWithAI() {
    if (!geminiApiKey.value || !aiPrompt.value) {
        uiStore.showNotification({ text: "API Key and Prompt are required!", color: "error" });
        return;
    }

    localStorage.setItem('gemini_api_key', geminiApiKey.value);
    isGeneratingAI.value = true;

    try {
        const promptSystem = `
        You are an expert JavaScript developer building a module for a visual node-based workflow system (like n8n).
        Based on this user request: "${aiPrompt.value}"

        Generate a valid JSON object containing exactly these fields:
        {
            "displayName": "Short clear name (string)",
            "icon": "One single emoji (string)",
            "description": "Short description (string)",
            "properties": "JSON array string of input fields schema. Allowed types: 'string', 'options'. Example: '[{\"name\":\"param1\",\"displayName\":\"Param 1\",\"type\":\"string\",\"default\":\"\"}]'",
            "executeCode": "String containing ONLY the javascript body of an async execute function. You have access to 'node' and 'inputData'. You must return an object. Example: 'const p = node.data.config.param1; return { ...inputData, result: p };'"
        }

        DO NOT wrap the response in markdown code blocks (\`\`\`json). RETURN PURE RAW JSON ONLY.
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${geminiApiKey.value}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptSystem }] }]
            })
        });

        if (!response.ok) throw new Error("Failed to connect to AI server. Check your API Key.");

        const data = await response.json();
        let resultText = data.candidates[0].content.parts[0].text;
        resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

        const generatedModule = JSON.parse(resultText);

        let propsString = generatedModule.properties;
        if (typeof propsString !== 'string') propsString = JSON.stringify(propsString, null, 2);

        let parsedProps = [];
        if (propsString.trim() !== '') parsedProps = JSON.parse(propsString);

        const newNodeDef = {
            name: `custom.node_${Date.now()}`,
            displayName: generatedModule.displayName || 'AI Custom Module',
            description: generatedModule.description || 'AI generated module',
            icon: generatedModule.icon || '🤖',
            group: ['action'], inputs: ['main'], outputs: ['main'],
            properties: parsedProps,
            executeCode: generatedModule.executeCode,
            color: '#f59e0b'
        };

        flowStore.addCustomNode(newNodeDef);
        addSelectedNode(newNodeDef);

        uiStore.showNotification({ text: "AI Module built & added to canvas!", color: "success" });

    } catch (error) {
        console.error(error);
        uiStore.showNotification({ text: "AI Generation failed: " + error.message, color: "error" });
    } finally {
        isGeneratingAI.value = false;
        aiPrompt.value = '';
    }
}

const addSelectedNode = (rNode) => {
    const newNodeId = `flow_node_${Date.now()}`;
    const yPos = (flowStore.nodes.length + 1) * 150;

    const newNode = {
        id: newNodeId,
        type: 'custom',
        position: { x: 250, y: yPos },
        data: {
            ...rNode,
            config: {}
        }
    };

    if (rNode.properties) {
        rNode.properties.forEach(prop => {
            const propName = prop.name || prop.id;
            newNode.data.config[propName] = prop.default !== undefined ? prop.default : '';
        });
    }

    const visiblePath = computedLinearNodes.value;
    const prevNode = visiblePath.length > 0 ? visiblePath[visiblePath.length - 1] : null;

    flowStore.addNode(newNode);

    if (prevNode) {
        const outputs = getAvailableOutputs(prevNode);
        let sourceHandle = 'main';
        if (outputs.length > 1) {
            sourceHandle = activeBranches.value[prevNode.id] || outputs[0];
        }

        flowStore.addEdge({
            id: `edge_${prevNode.id}_${newNodeId}_${Date.now()}`,
            source: prevNode.id,
            target: newNodeId,
            sourceHandle: sourceHandle,
            label: sourceHandle !== 'main' ? sourceHandle : '',
            style: { stroke: '#888', strokeWidth: 2 }
        });
    }

    closeAllSheets();
};

const openDeleteConfirm = () => {
    isDeleteConfirmOpen.value = true;
};

const confirmDeleteActiveNode = () => {
    if (activeNode.value) {
        const idToDelete = activeNode.value.id;

        const inEdge = flowStore.edges.find(e => e.target === idToDelete);
        const outEdges = flowStore.edges.filter(e => e.source === idToDelete);

        if (inEdge && outEdges.length === 1) {
            flowStore.addEdge({
                id: `edge_${inEdge.source}_${outEdges[0].target}_${Date.now()}`,
                source: inEdge.source,
                target: outEdges[0].target,
                sourceHandle: inEdge.sourceHandle,
                label: inEdge.label,
                style: { stroke: '#888', strokeWidth: 2 }
            });
        }

        flowStore.removeElement(idToDelete);

        if (activeBranches.value[idToDelete]) {
            delete activeBranches.value[idToDelete];
        }

        uiStore.showNotification({ text: "Module Deleted", color: "success" });
        closeAllSheets();
    }
};

const openClearAllConfirm = () => {
    if (flowStore.nodes.length === 0) {
        uiStore.showNotification({ text: "Canvas is already empty", color: "info" });
        return;
    }
    closeAllSheets();
    isClearAllConfirmOpen.value = true;
};

const executeClearAll = () => {
    flowStore.nodes = [];
    flowStore.edges = [];
    flowStore.executionLogs = [];
    activeBranches.value = {};
    isClearAllConfirmOpen.value = false;
    uiStore.showNotification({ text: "Canvas Cleared Successfully", color: "success" });
};

const debugActiveNode = () => {
    if (activeNode.value) {
        const id = activeNode.value.id;
        const output = flowStore.nodeOutputs[id];
        const titleName = activeNode.value.data.displayName || activeNode.value.data.name || 'Node';
        flowStore.openDebugPopup(`Debugging [${titleName}]`, output || { status: "No output yet. Run the flow first." });
        closeAllSheets();
    }
};

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
        if (!activeNode.value.data.config) activeNode.value.data.config = {};
        activeNode.value.data.config[propName] = e.target.result;
        uiStore.showNotification({ text: `File loaded: ${file.name}`, color: "success" });
    };
    reader.readAsDataURL(file);
}

async function openNativeFolderPicker(propName) {
    try {
        const selectedPath = await socketStore.pickFolder();
        if (selectedPath) {
            if (!activeNode.value.data.config) activeNode.value.data.config = {};
            activeNode.value.data.config[propName] = selectedPath;
        }
    } catch (error) {
        console.log("Folder selection cancelled or failed: ", error);
    }
}
</script>

<style scoped>
.mobile-flow-container {
    height: 100vh;
    width: 100%;
    background: var(--bg, #020205);
    color: var(--text, #ffffff);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: 'Space Grotesk', sans-serif;
}

.mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    height: 70px;
    border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
    z-index: 10;
}
.glass-panel {
    background: rgba(15, 23, 42, 0.95);
    /* USER RULE #1: Comment out blur for Android performance */
    /* backdrop-filter: blur(12px); */
}
.header-title { text-align: center; }
.flow-name { font-size: 1.1rem; font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.flow-status { font-size: 0.75rem; color: var(--text-mute, #94a3b8); display: flex; align-items: center; justify-content: center; gap: 5px; margin-top: 4px; }
.status-dot { width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; box-shadow: 0 0 8px #94a3b8; }
.executing-dot { background: #10b981; animation: pulseGlow 1.5s infinite; }
@keyframes pulseGlow { 0% { box-shadow: 0 0 5px #10b981; } 50% { box-shadow: 0 0 15px #10b981; } 100% { box-shadow: 0 0 5px #10b981; } }

.icon-btn {
    width: 40px; height: 40px;
    border-radius: 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border, rgba(255,255,255,0.1));
    color: var(--text, #fff);
    font-size: 1.2rem;
    display: flex; align-items: center; justify-content: center;
}
.icon-btn:disabled { opacity: 0.5; }
.primary-glow {
    background: var(--accent-1, #00ffcc);
    color: #000;
    border: none;
    box-shadow: 0 4px 15px rgba(0, 255, 204, 0.4);
}

.scrollable-menu {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
    z-index: 9;
    overflow-x: auto;
    gap: 12px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
}
.scrollable-menu::-webkit-scrollbar {
    display: none;
}

.tool-btn {
    flex: 0 0 auto;
    white-space: nowrap;
    background: transparent;
    border: 1px solid var(--border, rgba(255,255,255,0.2));
    color: var(--text, #fff);
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
}
.tool-btn:active { background: rgba(255,255,255,0.1); border-color: var(--accent-1, #00ffcc); }
.tool-btn i { font-size: 1.1rem; color: var(--accent-2, #00aaff); }

.tool-btn.danger-action { border-color: rgba(239, 68, 68, 0.4); color: #ff8a80; }
.tool-btn.danger-action:active { background: rgba(239, 68, 68, 0.15); border-color: #ef4444; }
.tool-btn.danger-action i { color: #ef4444; }

.vertical-canvas {
    flex: 1;
    overflow-y: auto;
    padding: 20px 20px 100px 20px;
    -webkit-overflow-scrolling: touch;
}
.nodes-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
}

.node-card {
    width: 100%;
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid var(--border, rgba(255,255,255,0.1));
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 3;
}
.node-card:active { transform: scale(0.98); border-color: var(--accent-1, #00ffcc); }

.node-card.is-running {
    border-color: #00ffcc;
    box-shadow: 0 0 20px rgba(0, 255, 204, 0.4), inset 0 0 10px rgba(0, 255, 204, 0.2);
    background: rgba(0, 255, 204, 0.05);
    animation: nodePulse 1.5s infinite;
}
.node-card.is-running .status-led-mobile {
    background-color: #00ffcc;
    box-shadow: 0 0 10px #00ffcc;
    animation: ledBlink 1s infinite;
}
.node-card.has-error {
    border-color: #ff4444;
    box-shadow: 0 0 20px rgba(255, 68, 68, 0.4), inset 0 0 10px rgba(255, 68, 68, 0.2);
    background: rgba(255, 68, 68, 0.05);
    animation: nodeShake 0.5s ease-in-out;
}
.node-card.has-error .status-led-mobile { background-color: #ff4444; box-shadow: 0 0 10px #ff4444; }

@keyframes nodePulse { 0% { box-shadow: 0 0 15px rgba(0, 255, 204, 0.3); transform: scale(1); } 50% { box-shadow: 0 0 25px rgba(0, 255, 204, 0.6); transform: scale(1.02); } 100% { box-shadow: 0 0 15px rgba(0, 255, 204, 0.3); transform: scale(1); } }
@keyframes ledBlink { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; transform: scale(1.2); } }
@keyframes nodeShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-5px); } }

.status-led-mobile { width: 10px; height: 10px; border-radius: 50%; background-color: var(--border, rgba(255,255,255,0.2)); transition: all 0.3s; }
.node-icon { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: inset 0 -2px 5px rgba(0,0,0,0.2); }
.node-details { flex: 1; overflow: hidden; }
.node-title { font-size: 1rem; font-weight: 700; margin: 0 0 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text); }
.node-subtitle { font-size: 0.8rem; color: var(--text-mute, #94a3b8); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.node-action { padding: 5px; display: flex; align-items: center; justify-content: center; }

.branch-tabs-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 10px;
    margin-bottom: 5px;
    position: relative;
    z-index: 2;
}
.branch-tabs {
    display: flex;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid var(--border, rgba(255,255,255,0.2));
    border-radius: 20px;
    padding: 4px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.4);
}
.branch-tab {
    background: transparent;
    border: none;
    color: var(--text-mute, #94a3b8);
    padding: 6px 18px;
    border-radius: 16px;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.5px;
}
.branch-tab.active {
    background: var(--accent-1, #00ffcc);
    color: #000;
    box-shadow: 0 2px 8px rgba(0, 255, 204, 0.4);
}

.connector-wrapper { display: flex; flex-direction: column; align-items: center; height: 40px; width: 100%; }
.vertical-line { width: 2px; flex: 1; background: var(--border, rgba(255,255,255,0.2)); transition: all 0.3s; }
.line-executing { background: #00ffcc; box-shadow: 0 0 8px #00ffcc; }

.empty-drop-zone {
    width: 100%; border: 2px dashed var(--border, rgba(255,255,255,0.2)); border-radius: 16px; padding: 20px;
    display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--text-mute, #94a3b8); font-weight: 600;
    background: rgba(255,255,255,0.02); margin-top: 10px;
}
.empty-drop-zone:active { background: rgba(255,255,255,0.05); }

.bottom-sheet-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 40; /* USER RULE #1: Remove blur */ /* backdrop-filter: blur(2px); */ }
.bottom-sheet {
    position: fixed; bottom: -100%; left: 0; width: 100%; background: var(--bg, #0f172a);
    border-top-left-radius: 24px; border-top-right-radius: 24px; border-top: 1px solid var(--border, rgba(255,255,255,0.1));
    z-index: 50; padding: 15px 20px 30px 20px; transition: bottom 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    box-shadow: 0 -10px 40px rgba(0,0,0,0.5); max-height: 85vh; display: flex; flex-direction: column;
}
.bottom-sheet.is-open { bottom: 0; }
.sheet-handle { width: 40px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin: 0 auto 15px auto; flex-shrink: 0; }
.sheet-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0; }
.sheet-header h3 { font-size: 1.2rem; font-weight: 700; margin: 0; }

.sheet-header-actions { display: flex; align-items: center; gap: 10px; }
.header-danger-btn { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.header-danger-btn:active { background: rgba(239, 68, 68, 0.3); }
.header-info-btn { background: rgba(0, 255, 204, 0.1); border: 1px solid rgba(0, 255, 204, 0.3); color: #00ffcc; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.header-info-btn:active { background: rgba(0, 255, 204, 0.3); }
.close-btn { background: none; border: none; color: var(--text-mute, #94a3b8); font-size: 24px; }

.sheet-content { overflow-y: auto; flex: 1; padding-bottom: 20px; }

.terminal-sheet { height: 70vh; }
.terminal-content { background: #000; border-radius: 12px; padding: 10px; font-family: monospace; font-size: 0.8rem; overflow-y: auto; border: 1px solid #333; }
.empty-log { color: #555; text-align: center; padding: 20px; }
.log-entry { padding: 4px 0; border-bottom: 1px dashed #222; word-wrap: break-word; }
.log-time { color: #888; margin-right: 6px; }
.log-sender { color: #00aaff; font-weight: bold; margin-right: 6px; }
.log-message { color: #ddd; }
.log-error .log-message { color: #ff4444; }
.log-success .log-message { color: #00ffcc; }
.log-system .log-sender { color: #aa88ff; }

.build-module-sheet .sheet-content { display: flex; flex-direction: column; gap: 15px; }
.modal-subtitle-m { font-size: 0.9rem; color: var(--text-mute); margin-top: -10px; margin-bottom: 10px; line-height: 1.4; }
.ai-input-m { background: rgba(0,255,204,0.05); border-color: rgba(0,255,204,0.2); }
.ai-input-m:focus { border-color: #00ffcc; }
.ai-gen-btn { background: #00aaff; color: white; margin-top: 10px; }
.generated-preview { background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; text-align: center; border: 1px dashed rgba(255,255,255,0.2); }
.preview-badge { font-size: 0.85rem; color: #00ffcc; font-weight: bold; }

.custom-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; /* backdrop-filter: blur(5px); */ }
.custom-confirm-modal { background: var(--bg, #1e293b); width: 100%; max-width: 320px; border-radius: 20px; padding: 25px; text-align: center; border: 1px solid var(--border); box-shadow: 0 15px 40px rgba(0,0,0,0.6); animation: modalPop 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes modalPop { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
.confirm-icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 15px auto; }
.danger-glow { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); box-shadow: 0 0 20px rgba(239, 68, 68, 0.2); }
.custom-confirm-modal h3 { margin: 0 0 10px 0; font-size: 1.3rem; color: var(--text); }
.custom-confirm-modal p { margin: 0 0 25px 0; font-size: 0.9rem; color: var(--text-mute); line-height: 1.5; }
.confirm-actions { display: flex; gap: 10px; }
.confirm-actions button { flex: 1; padding: 14px; border-radius: 12px; font-weight: bold; font-size: 0.95rem; border: none; cursor: pointer; transition: transform 0.2s; }
.confirm-actions button:active { transform: scale(0.96); }
.btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
.btn-danger-solid { background: #ef4444; color: #fff; }

.debug-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 1001; display: flex; align-items: center; justify-content: center; padding: 20px; /* backdrop-filter: blur(5px); */ }
.debug-modal { background: var(--bg, #1e293b); width: 100%; max-width: 400px; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 10px 40px rgba(0,0,0,0.5); overflow: hidden; display: flex; flex-direction: column; max-height: 80vh; }
.debug-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--border); }
.debug-header h3 { margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px; color: #00ffcc; }
.debug-body { padding: 20px; overflow-y: auto; flex: 1; background: #0b1120; }
.json-viewer { margin: 0; font-family: monospace; font-size: 0.85rem; color: #a6e22e; white-space: pre-wrap; word-break: break-word; }

.search-bar-wrapper { position: relative; margin-bottom: 15px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-mute, #94a3b8); font-size: 1.2rem; }
.search-input { width: 100%; padding-left: 40px !important; }
.empty-search { text-align: center; padding: 20px; color: var(--text-mute); font-style: italic; }

.node-picker-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
.picker-item { background: rgba(255,255,255,0.03); border: 1px solid var(--border, rgba(255,255,255,0.1)); border-radius: 16px; padding: 15px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.picker-item:active { background: rgba(255,255,255,0.08); }
.p-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.picker-item span { font-size: 0.9rem; font-weight: 600; text-align: center; }

.node-config-form { display: flex; flex-direction: column; gap: 15px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 0.85rem; color: var(--text-mute, #94a3b8); font-weight: 600; text-transform: capitalize; }
.flow-input { background: rgba(0,0,0,0.3); border: 1px solid var(--border, rgba(255,255,255,0.1)); color: var(--text, #fff); padding: 14px; border-radius: 12px; font-family: inherit; font-size: 1rem; width: 100%; box-sizing: border-box; }
.flow-input:focus { outline: none; border-color: var(--accent-1, #00ffcc); }

.flow-select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 14px center; background-size: 16px; padding-right: 40px; }
.file-input-m { padding: 10px !important; cursor: pointer; }
.folder-picker-wrapper { display: flex; gap: 8px; width: 100%; }
.folder-input { flex: 1; min-width: 0; }
.small-btn { padding: 0 15px; border-radius: 8px; font-size: 0.9rem; font-weight: bold; background: var(--text); color: var(--bg); border: none; flex-shrink: 0; transition: transform 0.1s; }
.small-btn:active { transform: scale(0.95); }
.field-hint-m { font-size: 0.75rem; color: var(--text-mute); margin: 0; padding-left: 2px; }
.success-text { color: #00ffcc; font-weight: bold; }

.sheet-action-row { display: flex; gap: 10px; margin-top: 15px; }
.btn-glow-primary.full-width { flex: 1; padding: 16px; border-radius: 12px; background: var(--text); color: var(--bg); font-weight: bold; border: none; transition: transform 0.2s; }
.btn-glow-primary.full-width:active { transform: scale(0.98); }
</style>
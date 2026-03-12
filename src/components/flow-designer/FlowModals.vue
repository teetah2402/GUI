//#######################################################################
// File NAME : src/components/flow-designer/FlowModals.vue
//#######################################################################
<template>
  <div v-if="isCustomNodeModalOpen" class="share-modal-overlay">
      <div class="share-modal" style="width: 800px; max-width: 95vw;">
          <div class="modal-header">
              <h3>{{ editingCustomNodeId ? 'Edit Custom Module' : 'Build Custom Module' }}</h3>
              <button @click="isCustomNodeModalOpen = false" class="btn-close-modal" title="Close">✕</button>
          </div>

          <div class="modal-body" style="max-height: 70vh; overflow-y: auto; display: flex; gap: 20px;">
              <div style="flex: 1;">
                  <p class="modal-subtitle">Create your own Javascript module. It will be available in the sidebar.</p>
                  <div class="form-group">
                      <label>Module Name (Display)</label>
                      <input type="text" v-model="customNodeForm.displayName" class="form-control" placeholder="e.g. My Text Formatter" />
                  </div>
                  <div class="form-group">
                      <label>Module Icon (Emoji)</label>
                      <input type="text" v-model="customNodeForm.icon" class="form-control" placeholder="e.g. 📝" maxlength="2"/>
                  </div>
                  <div class="form-group">
                      <label>Description</label>
                      <input type="text" v-model="customNodeForm.description" class="form-control" placeholder="What does this module do?" />
                  </div>
                  <div class="form-group">
                      <label>Parameters Schema (JSON Array)</label>
                      <textarea v-model="customNodeForm.properties" class="form-control json-editor" rows="4" placeholder='[{"name":"myParam","displayName":"My Parameter","type":"string"}]'></textarea>
                      <p class="field-hint">Define input fields for your module. Must be a valid JSON array.</p>
                  </div>
                  <div class="form-group">
                      <label>Execution Logic (JavaScript)</label>
                      <textarea v-model="customNodeForm.executeCode" class="form-control js-editor" rows="6" placeholder="return { processed: inputData.payload + ' modified' };"></textarea>
                      <p class="field-hint">Variables available: <code>node</code> (current node data) and <code>inputData</code> (data from previous node). Use <code>await</code> if needed. Must return an object.</p>
                  </div>
              </div>

              <div style="width: 300px; background: rgba(0,255,204,0.05); padding: 15px; border-radius: 8px; border: 1px solid rgba(0,255,204,0.2);">
                  <h4 style="margin-top: 0; color: #00ffcc; font-size: 13px; margin-bottom: 10px; display: flex; align-items: center; gap: 5px;">
                      <span>✨</span> AI Module Builder
                  </h4>
                  <p style="font-size: 10px; color: var(--fd-text-muted); line-height: 1.4; margin-bottom: 15px;">
                      Describe what you want the module to do, and <b>Gemini 3.1 Pro Preview</b> will instantly write the code and fill the form for you.
                  </p>

                  <div class="form-group">
                      <label>Gemini API Key</label>
                      <input type="password" v-model="geminiApiKey" class="form-control ai-input" placeholder="AIzaSy..." />
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" style="font-size: 9px; color: #00aaff; text-decoration: none;">Get Free Key</a>
                  </div>

                  <div class="form-group">
                      <label>Prompt</label>
                      <textarea v-model="aiPrompt" class="form-control ai-input" rows="6" placeholder="e.g. Create a module that extracts the domain name from an 'emailAddress' string parameter. Return 'domain' and 'username' as output variables."></textarea>
                  </div>

                  <button @click="generateWithAI" class="btn-confirm" style="width: 100%; background: #00aaff; color: #fff;" :disabled="isGeneratingAI">
                      {{ isGeneratingAI ? '⏳ Generating...' : '🤖 Generate Module' }}
                  </button>
              </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: space-between;">
              <div style="display: flex; gap: 10px;">
                  <input type="file" ref="moduleFileInput" @change="handleModuleUpload" accept=".json,application/json" style="display: none" />
                  <button @click="triggerModuleUpload" class="btn-action" title="Import Module JSON">📥 Import</button>
                  <button @click="downloadCustomModule" class="btn-action" title="Export Module JSON">📤 Export</button>
                  <button @click="openTutorialUrl" class="btn-action" title="Read Custom Module Tutorial" style="border-color: #aa88ff; color: #aa88ff;">📖 Tutorial</button>
              </div>
              <div style="display: flex; gap: 10px;">
                  <button @click="isCustomNodeModalOpen = false" class="btn-cancel">Cancel</button>
                  <button @click="saveCustomNode" class="btn-confirm" style="background: #00ffcc; color: #000;">
                      {{ editingCustomNodeId ? '💾 Update Module' : '➕ Save Module' }}
                  </button>
              </div>
          </div>
      </div>
  </div>

  <div v-if="isShareModalOpen" class="share-modal-overlay">
      <div class="share-modal">
          <div class="modal-header">
              <h3>Share SEO Setup</h3>
              <button @click="isShareModalOpen = false" class="btn-close-modal" title="Close">✕</button>
          </div>
          <div class="modal-body">
              <p class="modal-subtitle">Fill in the SEO metadata to make the preview look great when shared on social media or chat.</p>
              <div class="form-group">
                  <label>Workflow Title</label>
                  <input type="text" v-model="shareForm.title" class="form-control" placeholder="Example: Auto Reply Bot" />
              </div>
              <div class="form-group">
                  <label>Workflow Description</label>
                  <textarea v-model="shareForm.desc" class="form-control" rows="3" placeholder="Example: This workflow automatically replies to incoming messages..."></textarea>
              </div>
              <div class="form-group">
                  <label>Keywords</label>
                  <input type="text" v-model="shareForm.keywords" class="form-control" placeholder="Example: bot, ai, automation, flowork" />
              </div>
          </div>
          <div class="modal-footer">
              <button @click="isShareModalOpen = false" class="btn-cancel">Cancel</button>
              <button @click="executeShare" class="btn-confirm" :disabled="isSharing">
                  {{ isSharing ? '⏳ Generating Link...' : '🔗 Generate & Copy Link' }}
              </button>
          </div>
      </div>
  </div>

  <div v-if="isDebugPopupOpen" class="share-modal-overlay">
      <div class="share-modal" style="width: 700px; max-width: 95%;">
          <div class="modal-header" style="background: #ffaa00; border-radius: 8px 8px 0 0;">
              <h3 style="color: #000; display: flex; align-items: center; gap: 8px; font-weight: bold;">
                  <span style="font-size: 20px;">🐞</span> {{ debugPopupTitle }}
              </h3>
              <div style="display: flex; gap: 10px;">
                  <button @click="copyDebugContent" class="btn-action" style="background: rgba(0,0,0,0.8); color: #ffaa00; border: none; font-weight: bold;" title="Copy to Clipboard">📋 Copy</button>
                  <button @click="flowStore.closeDebugPopup()" class="btn-close-modal" style="color: #000;" title="Tutup">✕</button>
              </div>
          </div>
          <div class="modal-body" style="background: var(--fd-bg-terminal); max-height: 60vh; overflow-y: auto; padding: 0; border-bottom: 1px solid #333;">
              <pre class="json-viewer" style="margin: 0; border: none; border-radius: 0; font-size: 13px; padding: 20px; user-select: text;">{{ debugPopupContent }}</pre>
          </div>
          <div class="modal-footer" style="background: var(--fd-bg-header); border-top: none;">
              <button @click="flowStore.closeDebugPopup()" class="btn-confirm" style="background: #ffaa00; color: #000; width: 100%;">OK, Mengerti</button>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useFlowStore } from '@/store/flowWorkflow';
import { useUiStore } from '@/store/ui';

const flowStore = useFlowStore();
const uiStore = useUiStore();
const { nodes, edges, customNodes, workflowNote, isDebugPopupOpen, debugPopupTitle, debugPopupContent } = storeToRefs(flowStore);

const isShareModalOpen = ref(false);
const shareForm = ref({ title: '', desc: '', keywords: '' });
const isSharing = ref(false);

const isCustomNodeModalOpen = ref(false);
const editingCustomNodeId = ref(null);
const moduleFileInput = ref(null);

// AI State Variables
const geminiApiKey = ref(localStorage.getItem('gemini_api_key') || '');
const aiPrompt = ref('');
const isGeneratingAI = ref(false);

const defaultCustomNodeForm = {
    displayName: '', icon: '🛠', description: '',
    properties: '[\n  {\n    "name": "textInput",\n    "displayName": "Text Input",\n    "type": "string",\n    "default": "Hello World"\n  }\n]',
    executeCode: 'const val = node.data.config.textInput || "";\nreturn {\n  success: true,\n  message: val + " (processed)"\n};'
};
const customNodeForm = ref({ ...defaultCustomNodeForm });

// EXPOSE METHOD
const openShareModal = () => {
    isShareModalOpen.value = true;
    shareForm.value = { title: '', desc: '', keywords: '' };
};

const openCustomNodeModal = (node = null) => {
    if (node) {
        editingCustomNodeId.value = node.name;
        customNodeForm.value = {
            displayName: node.displayName, icon: node.icon, description: node.description,
            properties: JSON.stringify(node.properties, null, 2), executeCode: node.executeCode
        };
    } else {
        editingCustomNodeId.value = null;
        customNodeForm.value = { ...defaultCustomNodeForm };
    }
    isCustomNodeModalOpen.value = true;
};

defineExpose({ openShareModal, openCustomNodeModal });

// LOGIKA GENERATE AI MENGGUNAKAN GEMINI 3.1 PRO PREVIEW
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

        // Update API endpoint ke Gemini 3.1 Pro Preview
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

        // Bersihkan sisa markdown jika ada
        resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

        const generatedModule = JSON.parse(resultText);

        // OTOMATIS MENGISI FORM DI SEBELAH KIRI
        customNodeForm.value.displayName = generatedModule.displayName;
        customNodeForm.value.icon = generatedModule.icon;
        customNodeForm.value.description = generatedModule.description;

        let propsString = generatedModule.properties;
        if (typeof propsString !== 'string') propsString = JSON.stringify(propsString, null, 2);

        customNodeForm.value.properties = propsString;
        customNodeForm.value.executeCode = generatedModule.executeCode;

        uiStore.showNotification({ text: "Module successfully generated by AI!", color: "success" });

    } catch (error) {
        console.error(error);
        uiStore.showNotification({ text: "AI Generation failed: " + error.message, color: "error" });
    } finally {
        isGeneratingAI.value = false;
    }
}

// LOGIKA SHARE & CUSTOM NODE BAWAAN (TIDAK ADA YANG DIHAPUS)
async function executeShare() {
    try {
        isSharing.value = true;
        uiStore.showNotification({ text: "Generating short link in Cloud...", color: "info" });

        const flowData = {
            nodes: nodes.value,
            edges: edges.value,
            customNodes: customNodes.value,
            workflowNote: workflowNote.value,
            seo: shareForm.value
        };

        const response = await fetch('/api/v1/flow/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(flowData) });
        if (!response.ok) throw new Error("Failed to save to Cloudflare KV Database.");
        const result = await response.json();
        const shareUrl = `${window.location.origin}${window.location.pathname}?id=${result.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            flowStore.addLog("System", "Shareable short link copied to clipboard!", "success");
            uiStore.showNotification({ text: "Short Link copied to clipboard!", color: "success" });
            isShareModalOpen.value = false;
        });
    } catch (err) {
        flowStore.addLog("System", `Failed to generate share link: ${err.message}`, "error");
        uiStore.showNotification({ text: "Failed to generate share link.", color: "error" });
    } finally {
        isSharing.value = false;
    }
}

function saveCustomNode() {
    try {
        let parsedProps = [];
        if (customNodeForm.value.properties.trim() !== '') parsedProps = JSON.parse(customNodeForm.value.properties);
        const newNodeDef = {
            name: editingCustomNodeId.value || `custom.node_${Date.now()}`,
            displayName: customNodeForm.value.displayName || 'Custom Module',
            description: customNodeForm.value.description || 'User defined module',
            icon: customNodeForm.value.icon || '🛠',
            group: ['action'], inputs: ['main'], outputs: ['main'],
            properties: parsedProps, executeCode: customNodeForm.value.executeCode
        };
        if (editingCustomNodeId.value) {
            flowStore.updateCustomNode(editingCustomNodeId.value, newNodeDef);
            uiStore.showNotification({ text: "Module Updated!", color: "success" });
        } else {
            flowStore.addCustomNode(newNodeDef);
            uiStore.showNotification({ text: "Module Saved!", color: "success" });
        }
        isCustomNodeModalOpen.value = false;
    } catch (e) {
        uiStore.showNotification({ text: "Invalid JSON in Properties schema", color: "error" });
    }
}

function triggerModuleUpload() { if (moduleFileInput.value) moduleFileInput.value.click(); }
function handleModuleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed.name && parsed.executeCode && parsed.name.startsWith('custom.')) {
                const existingNode = customNodes.value.find(n => n.name === parsed.name);
                if (existingNode) flowStore.updateCustomNode(parsed.name, parsed);
                else flowStore.addCustomNode(parsed);
                isCustomNodeModalOpen.value = false;
                uiStore.showNotification({ text: "Custom Module Imported Successfully!", color: "success" });
            } else throw new Error("Invalid JSON format or not a Flowork Module.");
        } catch (err) {
            uiStore.showNotification({ text: err.message, color: "error" });
        }
        event.target.value = null;
    };
    reader.readAsText(file);
}

function downloadCustomModule() {
    try {
        let parsedProps = [];
        if (customNodeForm.value.properties.trim() !== '') parsedProps = JSON.parse(customNodeForm.value.properties);
        const exportData = {
            name: editingCustomNodeId.value || `custom.node_${Date.now()}`, displayName: customNodeForm.value.displayName || 'Custom Module',
            description: customNodeForm.value.description || 'User defined module', icon: customNodeForm.value.icon || '🛠',
            group: ['action'], inputs: ['main'], outputs: ['main'], properties: parsedProps, executeCode: customNodeForm.value.executeCode
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${exportData.name}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    } catch(e) {
        uiStore.showNotification({ text: "Export Failed: Invalid Properties Schema", color: "error" });
    }
}

function openTutorialUrl() { window.open('https://floworkos.com/blog/tutorial-custom-module', '_blank'); }

function copyDebugContent() {
    navigator.clipboard.writeText(debugPopupContent.value).then(() => {
        uiStore.showNotification({ text: "Debug data copied!", color: "success" });
    }).catch(err => {
        uiStore.showNotification({ text: "Failed to copy data.", color: "error" });
    });
}
</script>

<style scoped>
/* CSS UNTUK MODALS */
.share-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(5px); }
.share-modal { background: var(--fd-bg-panel); border: 1px solid var(--fd-border); border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; flex-direction: column; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid var(--fd-border); background: var(--fd-bg-header); border-radius: 8px 8px 0 0; }
.modal-header h3 { margin: 0; font-size: 14px; color: var(--fd-text-main); text-transform: uppercase; letter-spacing: 1px;}
.btn-close-modal { background: none; border: none; color: var(--fd-text-muted); cursor: pointer; font-size: 16px; transition: 0.2s;}
.btn-close-modal:hover { color: #ff4444; }
.modal-body { padding: 20px; }
.modal-subtitle { font-size: 12px; color: var(--fd-text-muted); margin-top: 0; margin-bottom: 15px; line-height: 1.4; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 15px 20px; border-top: 1px solid var(--fd-border); background: var(--fd-bg-header); border-radius: 0 0 8px 8px; }
.btn-cancel { background: transparent; color: var(--fd-text-main); border: 1px solid var(--fd-border); padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; transition: 0.2s; }
.btn-cancel:hover { background: var(--fd-item-hover); }
.btn-confirm { background: #aa88ff; color: #fff; border: none; padding: 8px 15px; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-confirm:hover:not(:disabled) { box-shadow: 0 0 10px rgba(170, 136, 255, 0.4); opacity: 0.9; }
.btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-action { background: transparent; color: var(--fd-text-main); border: 1px solid var(--fd-border); padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
.btn-action:hover { background: var(--fd-item-hover); }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 12px; color: var(--fd-text-muted); font-weight: 600; }
.form-control { width: 100%; padding: 10px; background: var(--fd-input-bg); border: 1px solid var(--fd-border); color: var(--fd-text-main); border-radius: 4px; outline: none; font-size: 13px; }
.form-control:focus { border-color: #00ffcc; box-shadow: 0 0 5px rgba(0, 255, 204, 0.2); }
textarea.form-control { resize: vertical; font-family: monospace; }
.field-hint { font-size: 10px; color: var(--fd-text-muted); margin-top: 4px; margin-bottom: 0; line-height: 1.3;}
.json-viewer { background: var(--fd-json-bg); padding: 10px; border-radius: 6px; border: 1px solid var(--fd-border); color: #00aaff; font-size: 11px; font-family: monospace; white-space: pre-wrap; margin: 0; user-select: text; }

/* AI INPUT STYLES */
.ai-input { background: rgba(0,0,0,0.3) !important; border-color: rgba(0,255,204,0.3) !important; }
.ai-input:focus { border-color: #00ffcc !important; }
</style>
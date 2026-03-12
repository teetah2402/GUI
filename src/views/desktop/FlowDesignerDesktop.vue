//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : src/views/FlowDesigner.vue
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="flow-designer-layout" :data-theme="uiStore.currentTheme">
    <FlowHeader
        @toggle-sidebar="isLeftSidebarOpen = !isLeftSidebarOpen"
        @open-custom-modal="openCustomNodeModal"
        @open-share-modal="openShareModal"
    />

    <div class="flow-workspace">
      <FlowSidebarLeft
          v-show="isLeftSidebarOpen"
          @edit-custom-module="editCustomModule"
      />

      <main class="flow-main-area">
        <div class="flow-canvas-container">
            <div class="canvas-absolute-layer">
                <FlowCanvas />
            </div>
        </div>

        <FlowTerminal />
      </main>

      <FlowSidebarRight v-if="selectedNode" />
    </div>

    <FlowModals ref="modalsRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useFlowStore } from '@/store/flowWorkflow';
import { useUiStore } from '@/store/ui';
import { useSocketStore } from '@/store/socket'; // [ADD] Import Socket Store untuk pengecekan Hybrid Engine

import FlowCanvas from '@/components/FlowCanvas.vue';
import FlowHeader from '@/components/flow-designer/FlowHeader.vue';
import FlowSidebarLeft from '@/components/flow-designer/FlowSidebarLeft.vue';
import FlowSidebarRight from '@/components/flow-designer/FlowSidebarRight.vue';
import FlowTerminal from '@/components/flow-designer/FlowTerminal.vue';
import FlowModals from '@/components/flow-designer/FlowModals.vue';

const route = useRoute();
const router = useRouter();
const flowStore = useFlowStore();
const uiStore = useUiStore();
const socketStore = useSocketStore(); // [ADD] Inisialisasi Socket

// [UPDATE] Ambil workflowNote
const { selectedNode, nodes, edges, customNodes, workflowNote } = storeToRefs(flowStore);

const isLeftSidebarOpen = ref(true);
const modalsRef = ref(null);

function openCustomNodeModal() {
    modalsRef.value?.openCustomNodeModal();
}

function editCustomModule(node) {
    modalsRef.value?.openCustomNodeModal(node);
}

function openShareModal() {
    modalsRef.value?.openShareModal();
}

onMounted(async () => {
    // [ADD] Picu koneksi socket otomatis saat ruang kerja Canvas/Designer dimuat
    socketStore.connect();

    // [ADD] Tunda peringatan 3 detik untuk memberi waktu handshake selesai
    setTimeout(() => {
        if (!socketStore.isConnected) {
            uiStore.showNotification({
                text: "Engine Lokal belum aktif. Modul (Python/C++) di Canvas tidak dapat dieksekusi. Harap jalankan aplikasi desktop Flowork.",
                color: "warning"
            });
        }
    }, 3000);

    if (route.query.id) {
        try {
            uiStore.showNotification({ text: "Mengambil workflow dari cloud...", color: "info" });
            const res = await fetch(`/api/v1/flow/share?id=${route.query.id}`);
            if (!res.ok) throw new Error("Link kadaluarsa atau tidak ditemukan.");

            const parsed = await res.json();
            if (parsed.nodes && parsed.edges) {
                nodes.value = parsed.nodes;
                edges.value = parsed.edges;

                if (parsed.customNodes) {
                    customNodes.value = parsed.customNodes;
                }

                // [NEW] Set workflowNote dari database Cloudflare KV
                if (parsed.workflowNote !== undefined) {
                    workflowNote.value = parsed.workflowNote;
                } else {
                    workflowNote.value = '';
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
                nodes.value = parsed.nodes;
                edges.value = parsed.edges;

                if (parsed.customNodes) {
                    customNodes.value = parsed.customNodes;
                }

                // [NEW] Backwards compatibility untuk load dari URL Base64
                if (parsed.workflowNote !== undefined) {
                    workflowNote.value = parsed.workflowNote;
                } else {
                    workflowNote.value = '';
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
</script>

<style scoped>
/* VARIABLE GLOBAL UNTUK SEMUA COMPONENT ANAK */
.flow-designer-layout {
    --fd-bg-main: #121212;
    --fd-bg-panel: #1e1e1e;
    --fd-bg-header: #1a1a1a;
    --fd-bg-terminal: #0d0d0d;
    --fd-border: #333333;
    --fd-text-main: #e0e0e0;
    --fd-text-muted: #888888;
    --fd-item-bg: #2a2a2a;
    --fd-item-hover: #333333;
    --fd-input-bg: #111111;
    --fd-json-bg: #000000;

    display: flex; flex-direction: column; height: calc(100vh - 80px); width: 100%;
    background-color: var(--fd-bg-main); color: var(--fd-text-main); overflow: hidden; font-family: sans-serif;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.flow-designer-layout[data-theme="light"] {
    --fd-bg-main: #f1f5f9;
    --fd-bg-panel: #ffffff;
    --fd-bg-header: #ffffff;
    --fd-bg-terminal: #f8fafc;
    --fd-border: #cbd5e1;
    --fd-text-main: #1e293b;
    --fd-text-muted: #64748b;
    --fd-item-bg: #f8fafc;
    --fd-item-hover: #e2e8f0;
    --fd-input-bg: #ffffff;
    --fd-json-bg: #f1f5f9;
}

@media (max-width: 768px) {
    .flow-designer-layout { height: calc(100vh - 70px); }
}

.flow-workspace { display: flex; flex: 1; overflow: hidden; position: relative; }
.flow-main-area { display: flex; flex-direction: column; flex: 1; position: relative; overflow: hidden; transition: all 0.3s ease; }
.flow-canvas-container { flex: 1; position: relative; }
.canvas-absolute-layer { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
</style>
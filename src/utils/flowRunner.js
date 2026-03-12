//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/utils/flowRunner.js
//#######################################################################

import { useFlowStore } from '@/store/flowWorkflow';
import { useFlowRegistryStore } from '@/store/flowRegistry';
import { useSocketStore } from '@/store/socket';

export async function executeFlow(nodes, edges) {
    const flowStore = useFlowStore();

    flowStore.clearOutputs();
    flowStore.isExecuting = true;
    flowStore.addLog("Runner", "=== STARTING FLOW EXECUTION ===", "system");

    const triggerNodes = nodes.filter(node => !edges.some(edge => edge.target === node.id));

    if (triggerNodes.length === 0) {
        flowStore.addLog("Engine", "Tidak ada Trigger Node yang ditemukan (Node yang tidak memiliki input).", "error");
        flowStore.isExecuting = false;
        return;
    }

    // [MODIFIED] Membuat State Manajemen agar tahan dari Reload Browser (Buku Catatan)
    const initialState = {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
        currentNodeId: triggerNodes[0].id,
        currentData: null,
        waitingExecutionId: null,
        status: 'running'
    };
    localStorage.setItem('flowork_recovery_state', JSON.stringify(initialState));

    await runCoreLoop(initialState, nodes, edges);

    /* [ZOMBIE CODE] Dinonaktifkan karena loop telah direfaktor ke dalam fungsi runCoreLoop agar bisa dipanggil juga oleh fungsi Resume
    let currentNode = triggerNodes[0];
    let currentData = null;
    const AsyncFunction = ...
    while(currentNode) { ... }
    */
}

// [ADD] Fungsi Cerdas untuk Menyambung Kembali Jaringan yang Terputus
export async function resumeFlow() {
    const stateStr = localStorage.getItem('flowork_recovery_state');
    if (!stateStr) return;

    const state = JSON.parse(stateStr);
    if (state.status !== 'running') return;

    const flowStore = useFlowStore();
    if (flowStore.isExecuting) return;

    flowStore.isExecuting = true;
    flowStore.addLog("Runner", "=== ♻️ MELANJUTKAN SESI YANG TERPUTUS (AUTO-RECOVERY) ===", "system");

    await runCoreLoop(state, null, null);
}

// [MODIFIED] Inti putaran loop dipisah agar bisa digunakan untuk Eksekusi Baru maupun Resume
async function runCoreLoop(state, liveNodes = null, liveEdges = null) {
    const flowStore = useFlowStore();
    const registryStore = useFlowRegistryStore();
    const socketStore = useSocketStore();
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

    const activeNodes = liveNodes || state.nodes;
    const activeEdges = liveEdges || state.edges;

    let currentNode = activeNodes.find(n => n.id === state.currentNodeId);
    let currentData = state.currentData;

    while (currentNode) {
        // [MODIFIED] Catat terus posisi terakhir node yang sedang dihitung ke dalam memori perantara
        state.currentNodeId = currentNode.id;
        state.currentData = currentData;
        localStorage.setItem('flowork_recovery_state', JSON.stringify(state));

        const nodeType = currentNode.data.name;
        const nodeName = currentNode.data.displayName || currentNode.id;

        let executorFunction = registryStore.nodeExecutors[nodeType];

        if (!executorFunction && nodeType.startsWith('custom.')) {
            const customNodeDef = flowStore.customNodes.find(n => n.name === nodeType);
            if (customNodeDef && customNodeDef.executeCode) {
                try {
                    executorFunction = new AsyncFunction('node', 'inputData', 'alert', 'console', 'flowStore', customNodeDef.executeCode);
                } catch (compileError) {
                    flowStore.setNodeFailed(currentNode.id, true);
                    flowStore.addLog("Compiler", `Gagal mengkompilasi: ${compileError.message}`, "error");
                    break;
                }
            }
        }
        else if (!executorFunction && nodeType.startsWith('engine.')) {
            executorFunction = async (node, inputData) => {
                return new Promise((resolve, reject) => {
                    if (!socketStore.isConnected) {
                        reject(new Error("Local Engine tidak terkoneksi."));
                        return;
                    }

                    let executionId = state.waitingExecutionId;

                    if (!executionId) {
                        // Eksekusi tugas baru ke Engine
                        executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                        state.waitingExecutionId = executionId;
                        localStorage.setItem('flowork_recovery_state', JSON.stringify(state));

                        const mergedInputData = {
                            ...(inputData || {}),
                            ...(node.data.config || {})
                        };

                        socketStore.sendMessage({
                            type: 'engine:execute_node',
                            execution_id: executionId,
                            node_type: nodeType,
                            node_id: node.id,
                            input_data: mergedInputData,
                            node_config: node.data
                        });
                    } else {
                        // [MODIFIED] Ini terjadi saat F5! Hanya mendengarkan balasan, tanpa menyuruh Engine ulang
                        flowStore.addLog(nodeName, `📡 Memulihkan koneksi & mendengarkan hasil dari proses yang sedang berjalan...`, "info");
                    }

                    // [MODIFIED] Timeout dinaikkan dari 60 detik menjadi 30 Menit untuk YT Downloader besar
                    const timeout = setTimeout(() => {
                        socketStore.socket.off(`engine_response_${executionId}`);
                        reject(new Error("Timeout: Local Engine terlalu lama memproses data (30 Menit)."));
                    }, 1800000);

                    socketStore.socket.once(`engine_response_${executionId}`, (response) => {
                        clearTimeout(timeout);
                        state.waitingExecutionId = null; // Hapus tugas tunggu setelah sukses
                        localStorage.setItem('flowork_recovery_state', JSON.stringify(state));

                        if (response && response.error) {
                            reject(new Error(response.error));
                        } else if (response) {
                            resolve(response.data);
                        } else {
                            reject(new Error("Respons Engine kosong."));
                        }
                    });
                });
            };
        }

        if (executorFunction) {
            try {
                if(currentNode.class !== undefined) currentNode.class = 'flowork-node-glowing';
                flowStore.setNodeExecuting(currentNode.id, true);

                if (!state.waitingExecutionId) {
                    if (nodeType.startsWith('engine.')) {
                        flowStore.addLog(nodeName, `Menunggu eksekusi dari Local Engine...`, "info");
                    } else {
                        flowStore.addLog(nodeName, `Mengeksekusi node...`, "info");
                    }
                }

                if (nodeType.startsWith('custom.')) {
                    currentData = await executorFunction(currentNode, currentData, window.alert, window.console, flowStore);
                } else {
                    currentData = await executorFunction(currentNode, currentData);
                }

                flowStore.setNodeOutput(currentNode.id, currentData);

                if(currentNode.class !== undefined) currentNode.class = '';
                flowStore.setNodeExecuting(currentNode.id, false);
                flowStore.addLog(nodeName, `Eksekusi berhasil.`, "success", currentData);

                let activeOutputHandle = 'out-0';
                if (currentData && currentData.activeOutputIndex !== undefined) {
                    activeOutputHandle = `out-${currentData.activeOutputIndex}`;
                }

                let nextEdge = activeEdges.find(edge => edge.source === currentNode.id && edge.sourceHandle === activeOutputHandle);

                if (!nextEdge) {
                    nextEdge = activeEdges.find(edge => edge.source === currentNode.id);
                }

                if (nextEdge) {
                    if(nextEdge.animated !== undefined) nextEdge.animated = true;
                    if(nextEdge.style !== undefined) nextEdge.style = { stroke: '#00ffcc', strokeWidth: 3 };

                    currentNode = activeNodes.find(n => n.id === nextEdge.target);
                    flowStore.addLog("Runner", `Meneruskan data ke node selanjutnya...`, "system");

                    await new Promise(resolve => setTimeout(resolve, 300));
                } else {
                    currentNode = null;
                }

            } catch (error) {
                if(currentNode.class !== undefined) currentNode.class = 'flowork-node-failed';
                flowStore.setNodeExecuting(currentNode.id, false);
                flowStore.setNodeFailed(currentNode.id, true);
                flowStore.addLog(nodeName, `Gagal mengeksekusi: ${error.message}`, "error");
                break;
            }
        } else {
            flowStore.setNodeFailed(currentNode.id, true);
            flowStore.addLog("Engine", `Modul/Logic untuk [${nodeType}] tidak ditemukan.`, "error");
            break;
        }
    }

    if (liveEdges) {
        liveEdges.forEach(edge => {
            edge.animated = false;
            edge.style = {};
        });
    }

    flowStore.isExecuting = false;
    flowStore.addLog("Runner", "=== FLOW EXECUTION COMPLETED ===", "system");
    localStorage.removeItem('flowork_recovery_state');
}
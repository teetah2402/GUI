//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : src/flow_nodes/debugger/debugger.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { useFlowStore } from '@/store/flowWorkflow';

export default {
    name: 'flow.debugger',
    displayName: 'Debugger Output',
    description: "Displays data from the previous node in a Custom UI Popup. Click the '<' button in parameters to read full instructions.",
    icon: '🐞',
    group: ['action'],
    inputs: ['main'],
    outputs: ['main'],

    // [NEW] Panduan dokumentasi di Slide-Out Panel
    note: `💡 HOW TO USE DEBUGGER:
1. Connect the output of any node to this Debugger node.
2. When the flow runs, it will capture the exact JSON output from the previous node.
3. A popup will appear automatically showing the formatted data.

ℹ️ PRO TIP:
This is a 'Pass-Through' node, meaning it doesn't modify or break your data. You can place it safely in the middle of a workflow chain to inspect data while letting the workflow continue running.`,

    properties: [
        {
            name: 'title_debug',
            displayName: 'Popup Title',
            type: 'string',
            default: 'PREVIOUS NODE DEBUG RESULT:'
        }
    ],
    execute: async (node, inputData) => {
        // Initialize access to Pinia Store / Inisiasi akses ke Pinia Store
        const flowStore = useFlowStore();

        // Get title from UI input parameters / Ambil title dari input parameter UI
        const title = node.data?.config?.title_debug || "DEBUG INFO:";

        // Print to F12 Console for backup / Print juga ke F12 Console buat backup
        console.log(`[DEBUGGER NODE: ${title}]`, inputData);

        let dataString = "";

        // Process formatting JSON for pretty display in Popup UI / Proses formatting JSON agar cantik di Popup UI
        if (!inputData) {
            dataString = "[ NULL / NO DATA ]\nEnsure this node is connected from another node that has an output.";
        } else {
            try {
                const getCircularReplacer = () => {
                    const seen = new WeakSet();
                    return (key, value) => {
                        if (typeof value === "object" && value !== null) {
                            if (seen.has(value)) {
                                return "[Circular Reference / Data Too Complex]";
                            }
                            seen.add(value);
                        }
                        return value;
                    };
                };
                dataString = JSON.stringify(inputData, getCircularReplacer(), 2);
            } catch (err) {
                dataString = `[JSON Format Failed: ${err.message}]\nCheck Browser Console (F12) to see the raw data structure.`;
            }
        }

        // Display Custom Vue UI Popup via Pinia State / Tampilkan Custom Vue UI Popup melalui State Pinia
        flowStore.openDebugPopup(title, dataString);

        // Forward original data (Pass-Through) / Meneruskan kembali data aslinya (Pass-Through)
        return inputData || { debug_status: "no_data" };
    }
};
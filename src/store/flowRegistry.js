//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : src/store/flowRegistry.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFlowRegistryStore = defineStore('flowRegistry', () => {
    const availableNodes = ref([]);
    const nodeExecutors = ref({});

    // [UPDATE PENTING]
    // Menggunakan **/*.js agar Vite men-scan hingga ke dalam sub-folder tanpa batas kedalaman.
    // Contoh yang akan terbaca: src/flow_nodes/telegram/telegram.js
    const modules = import.meta.glob('../flow_nodes/**/*.js', { eager: true });

    for (const path in modules) {
        const moduleData = modules[path].default;

        // [VALIDASI CERDAS]
        // Pastikan file yang di-load benar-benar berformat Node Flowork
        // Mencegah file helper (misal: formatText.js) ikut ter-render jadi Node di UI
        if (moduleData && moduleData.name && typeof moduleData.execute === 'function') {
            const { execute, ...uiMetadata } = moduleData;

            availableNodes.value.push(uiMetadata);
            nodeExecutors.value[uiMetadata.name] = execute;

            console.log(`[Auto-Discovery] Node terdaftar: ${uiMetadata.name} (dari ${path})`);
        }
    }

    // [ADD] Fungsi untuk menampung & mendaftarkan node fisik dari Local Engine
    function registerEngineNodes(nodes) {
        // Bersihkan node engine lama agar tidak duplikat saat reconnect/refresh
        availableNodes.value = availableNodes.value.filter(n => !n.name.startsWith('engine.'));

        if (nodes && nodes.length > 0) {

            // [MODIFIED] Menyelaraskan skema Engine Go dengan standar UI Vue
            // Jika Engine mengirimkan "parameters", kita petakan paksa menjadi "properties" agar muncul di Sidebar Kanan
            const adaptedNodes = nodes.map(node => {
                return {
                    ...node,
                    properties: node.properties || node.parameters || []
                };
            });

            availableNodes.value.push(...adaptedNodes);
            console.log(`[Auto-Discovery] ${adaptedNodes.length} Node Engine fisik berhasil disuntikkan ke Sidebar dengan mapping Properties.`);

            /* [ZOMBIE CODE] Dinonaktifkan karena objek langsung dimasukkan tanpa ada proses mapping properties
            availableNodes.value.push(...nodes);
            console.log(`[Auto-Discovery] ${nodes.length} Node Engine fisik berhasil disuntikkan ke Sidebar.`);
            */
        }
    }

    return {
        availableNodes,
        nodeExecutors,
        registerEngineNodes // [ADD] Expose fungsi agar bisa dipanggil Socket
    };
});
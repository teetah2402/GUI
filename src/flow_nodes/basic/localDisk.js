//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/flow_nodes/basic/localDisk.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export default {
    name: 'flow.localDisk',
    displayName: 'Local Disk',
    description: "Loads a single local file into memory (Base64). Click the '<' button to read full instructions.",
    icon: '💻',
    group: ['input', 'action'], // Bisa ditaruh di awal alur (input) atau di tengah (action)
    inputs: ['main'],
    outputs: ['main'],
    defaults: { name: 'Local Disk' },

    note: `💡 HOW TO USE LOCAL DISK:
1. Click 'Choose File' in the parameters panel to select a file from your computer.
2. The file will be converted to a Base64 string and loaded securely into your browser's memory without hitting a server.

ℹ️ WHAT'S NEXT:
You can connect this node to 'Google Drive' or any 'HTTP Request' node that accepts Base64 file uploads. The file data will be passed as {{local_disk_result.data}}.`,

    properties: [
        {
            name: 'selectedFile',
            displayName: 'Select Local File',
            type: 'file', // Akan memicu input type="file" di FlowSidebarRight.vue
            description: 'Choose a file to load into workflow memory (Base64).'
        }
    ],

    execute: async (node, inputData) => {
        const config = node.data?.config || {};
        // const mode = config.mode || 'Select 1 File (Base64)';

        // if (mode === 'Select 1 File (Base64)') {
        const fileData = config.selectedFile; // Berupa string Base64 Data URL

        if (!fileData) {
            throw new Error("Local Disk Error: No file selected.");
        }

        // Ekstrak metadata dari string Data URL: "data:image/png;base64,iVBORw0KGgo..."
        let mimeType = 'application/octet-stream';
        const mimeMatch = fileData.match(/^data:(.*?);base64,/);
        if (mimeMatch && mimeMatch[1]) {
            mimeType = mimeMatch[1];
        }

        const fileName = config.fileName || 'uploaded_file';

        // Hitung estimasi ukuran dari base64
        const base64Length = fileData.length - (fileData.indexOf(',') + 1);
        const sizeInBytes = Math.ceil((base64Length * 3) / 4);

        console.log(`[Local Disk Node] File loaded: ${fileName} (${mimeType})`);

        // Menggabungkan data dari node sebelumnya (jika ada) dengan data file ini
        return {
            ...inputData,
            local_disk_result: {
                type: 'file',
                name: fileName,
                mimeType: mimeType,
                size_bytes: sizeInBytes,
                data: fileData // Berisi string Data URL (Base64) yang siap disambungkan ke node GDrive Advanced Upload
            }
        };
    }
};
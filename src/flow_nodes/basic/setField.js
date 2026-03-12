//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/flow_nodes/basic/setField.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export default {
    name: 'flow.setField',
    displayName: 'Set / Inject Data',
    description: "Adds or overwrites a variable in the data flow. Click the '<' button to read full instructions.",
    icon: '🗂️',
    group: ['action'], // Termasuk kategori aksi pemrosesan
    inputs: ['main'],
    outputs: ['main'],
    defaults: { name: 'Set / Inject Data' },

    // [NEW] Panduan dokumentasi di Slide-Out Panel
    note: `💡 HOW TO USE SET / INJECT DATA:
1. 'Variable Name': Enter the exact JSON key you want to create or update (e.g., 'user_id' or 'status').
2. 'Data Content': Enter the value you want to assign to this key.

ℹ️ PRO TIP:
This node is perfect for adding hardcoded values to your workflow data before sending it to an API or another application. It merges the new key-value pair seamlessly into the existing data flow without removing previous data.`,

    // UI Form untuk user memasukkan Nama Key dan Isi Value
    properties: [
        {
            name: 'keyName',
            displayName: 'Variable Name (JSON Key)',
            type: 'string',
            default: 'my_custom_key',
            description: 'Example: status, username, or process_result'
        },
        {
            name: 'keyValue',
            displayName: 'Data Content (Value)',
            type: 'string',
            default: 'This is new data',
            description: 'Value content for the variable above'
        }
    ],

    execute: async (node, inputData) => {
        // 1. Ambil settingan dari UI
        const key = node.data?.config?.keyName || 'new_field';
        const value = node.data?.config?.keyValue || '';

        // 2. Siapkan wadah data baru. Jika inputData kosong, buat objek JSON kosong.
        // Jika sudah ada data dari node sebelumnya, kita clone agar tidak merusak referensi asli (Immutable behavior)
        let processedData = inputData ? { ...inputData } : {};

        // 3. Suntikkan (Inject) data baru ke dalam objek JSON
        processedData[key] = value;

        // Print log ke console (opsional untuk tracking)
        console.log(`[Set Data Node] Injecting key '${key}' with value '${value}'`);

        // 4. Lemparkan kembali data yang sudah ditambahkan field barunya
        return processedData;
    }
};
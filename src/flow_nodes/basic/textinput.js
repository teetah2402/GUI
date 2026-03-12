//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/flow_nodes/basic/textInput.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export default {
    name: 'flow.textInput',
    displayName: 'Text / Prompt',
    description: "Saves static text or prompt to pass to the next node. Click the '<' button to read full instructions.",
    icon: '📝',
    group: ['input'], // Masuk kategori input di sidebar
    inputs: ['main'], // Menerima jalur kabel masuk
    outputs: ['main'], // Mengeluarkan jalur kabel keluar
    defaults: { name: 'Text / Prompt' },

    note: `💡 HOW TO USE TEXT / PROMPT:
1. Type any static text, message, or AI prompt into the 'Text Content' field.
2. This node will start the flow (or pass-through) and send your text to the next node.

ℹ️ PRO TIP:
The text you type here will be available to the next connected node under the {{prompt}} variable. You can use it to feed an AI module, HTTP Request, or a dynamic email body.`,

    // Ini bagian penting untuk merender form input di UI (Sidebar Kanan)
    properties: [
        {
            name: 'promptText',
            displayName: 'Text Content / Prompt',
            type: 'string', // Tipe string akan merender <input type="text"> sesuai FlowDesigner.vue lo
            default: 'Hello, this is basic text...',
            description: 'This text will be passed to the next node.'
        }
    ],

    // Logika yang dieksekusi saat tombol "Run Flow" ditekan
    execute: async (node, inputData) => {
        // Ambil data yang diketik user di sidebar properties
        const userText = node.data?.config?.promptText || '';

        // Print ke console untuk tracking log (opsional)
        console.log(`[Text Node] Passing text:`, userText);

        // Kembalikan objek JSON. Ini akan otomatis ditangkap oleh flowRunner.js
        // dan dilempar menjadi `inputData` di node yang tersambung berikutnya.
        return {
            status: "success",
            prompt: userText,
            previous_data: inputData || null // Tetap bawa data dari node sebelumnya kalau node ini ditaro di tengah
        };
    }
};
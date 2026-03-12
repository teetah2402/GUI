//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/flow_nodes/basic/delay.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export default {
    name: 'flow.delay',
    displayName: 'Delay / Timer',
    description: "Pauses workflow execution for a specified duration. Click the '<' button in parameters to read full instructions.",
    icon: '⏳',
    group: ['action'],
    inputs: ['main'],
    outputs: ['main'],
    defaults: { name: 'Delay / Timer' },

    // [NEW] Panduan dokumentasi di Slide-Out Panel
    note: `💡 HOW TO USE DELAY:
1. Enter the number of seconds you want to pause the workflow in the 'Delay Amount' field.
2. Useful for rate-limiting API calls (preventing spam) or waiting for an external process to finish.

ℹ️ PRO TIP:
Like the Debugger, this is a 'Pass-Through' node. It holds the data from the previous node and passes it exactly as-is to the next node after the timer finishes without modifying anything.`,

    properties: [
        {
            name: 'delayAmount',
            displayName: 'Delay Amount (Seconds)',
            type: 'string', // Tetap string karena input form bawaan di FlowDesigner lo adalah text
            default: '3',
            description: 'Enter a number in seconds (e.g., 3)'
        }
    ],

    execute: async (node, inputData) => {
        // 1. Ambil nilai delay dari UI, pastikan diconvert ke angka
        let seconds = parseFloat(node.data?.config?.delayAmount);

        // 2. Proteksi (Fallback): Kalau user masukin huruf atau kosong, jadikan 3 detik
        if (isNaN(seconds) || seconds <= 0) {
            seconds = 3;
        }

        // Print log ke console (opsional untuk tracking)
        console.log(`[Delay Node] Holding data flow for ${seconds} seconds...`);

        // 3. Inti dari Delay: Bikin promise yang nge-hold eksekusi (async/await)
        await new Promise(resolve => setTimeout(resolve, seconds * 1000));

        console.log(`[Delay Node] Delay finished! Resuming data...`);

        // 4. Lemparkan kembali data ASLI dari node sebelumnya utuh tanpa diubah
        return inputData || { status: "success", info: "Passed delay node without input data" };
    }
};
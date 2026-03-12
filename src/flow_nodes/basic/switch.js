//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : src/flow_nodes/basic/switch.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export default {
    name: 'flow.switch',
    displayName: 'Switch / Router',
    description: "Routes data up to 24 different paths based on a variable. Click the '<' button to read full instructions.",
    icon: '🔀',
    group: ['logic'],
    inputs: ['main'],
    // Mendefinisikan 25 jalur output (Index 0-23 untuk Routes, Index 24 untuk Default)
    outputs: [
        'Route 1', 'Route 2', 'Route 3', 'Route 4', 'Route 5',
        'Route 6', 'Route 7', 'Route 8', 'Route 9', 'Route 10',
        'Route 11', 'Route 12', 'Route 13', 'Route 14', 'Route 15',
        'Route 16', 'Route 17', 'Route 18', 'Route 19', 'Route 20',
        'Route 21', 'Route 22', 'Route 23', 'Route 24', 'Default'
    ],
    defaults: { name: 'Switch Router' },

    note: `💡 HOW TO USE SWITCH / ROUTER:
1. 'Target Variable (Key)': Enter the JSON key from the previous node you want to evaluate (e.g., 'category' or 'command').
2. Fill in 'Route 1 Value', 'Route 2 Value', etc., with the exact text matches you expect.
3. Connect the corresponding output ports on the node to different downstream paths.

ℹ️ DEFAULT ROUTE:
If the variable doesn't exactly match any of your defined Route Values, the flow will automatically proceed through the bottom-most 'Default' output port.`,

    properties: [
        {
            name: 'keyName',
            displayName: 'Target Variable (Key Input)',
            type: 'string',
            default: 'status',
            description: 'Key JSON dari node sebelumnya untuk dievaluasi isinya.'
        },
        // Auto generate 24 input fields untuk membandingkan nilainya
        ...Array.from({ length: 24 }, (_, i) => ({
            name: `val${i + 1}`,
            displayName: `Route ${i + 1} Value`,
            type: 'string',
            default: '',
            description: `Arahkan ke Route ${i + 1} jika valuenya sama persis dengan teks ini.`
        }))
    ],

    execute: async (node, inputData) => {
        // 1. Ambil config
        const config = node.data?.config || {};
        const key = config.keyName || 'status';

        // 2. Ambil nilai target dari data yang masuk (Proteksi jika data null)
        const rawTarget = inputData && inputData[key] !== undefined ? inputData[key] : undefined;
        const targetValue = rawTarget !== undefined ? String(rawTarget).trim() : null;

        console.log(`[Switch] Evaluating Key: '${key}' | Value: '${targetValue}'`);

        // Default ke port paling bawah (Index 24 = 'Default')
        let indexToUse = 24;

        // 3. Logika Perbandingan Dinamis (Looping 24 kali)
        for (let i = 1; i <= 24; i++) {
            const compareValue = config[`val${i}`];

            // FIX: Hanya bandingkan jika compareValue diisi di UI agar tidak "False Positive"
            if (compareValue !== undefined && compareValue !== '' && targetValue !== null) {
                if (targetValue === String(compareValue).trim()) {
                    indexToUse = i - 1; // Set ke index (0-23)
                    console.log(`[Switch] Match found at Route ${i}`);
                    break; // Berhenti jika sudah ketemu yang cocok
                }
            }
        }

        if (indexToUse === 24) {
            console.log(`[Switch] No match found. Routing to 'Default'`);
        }

        // 4. Return data dengan activeOutputIndex
        return {
            ...inputData,
            activeOutputIndex: indexToUse
        };
    }
};
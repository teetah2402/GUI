//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/flow_nodes/basic/textManipulation.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export default {
    name: 'flow.textManipulation',
    displayName: 'Text Manipulation',
    description: "Changes text format (Uppercase, Replace, Trim). Click the '<' button to read full instructions.",
    icon: '🔤',
    group: ['action'],
    inputs: ['main'],
    outputs: ['main'],
    defaults: { name: 'Text Manipulation' },

    note: `💡 HOW TO USE TEXT MANIPULATION:
1. 'Target Variable': Enter the JSON key containing the text you want to format (default is 'prompt').
2. 'Operation': Choose the formatting action (UPPERCASE, lowercase, Replace, or Trim).
3. 'Output Key': The result will be saved under this new key name.

ℹ️ REPLACE OPERATION:
If you choose 'Replace', the 'Find Word' field acts globally (it replaces ALL occurrences of that exact word in the text with the 'Replace With' value).`,

    properties: [
        {
            name: 'targetKey',
            displayName: 'Target Variable (Input Key)',
            type: 'string',
            default: 'prompt',
            description: 'JSON key from previous node containing the text.'
        },
        {
            name: 'operation',
            displayName: 'Operation',
            type: 'options',
            options: ['UPPERCASE', 'lowercase', 'Replace', 'Trim'],
            default: 'UPPERCASE'
        },
        {
            name: 'replaceSource',
            displayName: 'Find Word (For Replace only)',
            type: 'string',
            default: '',
            showIf: { field: 'operation', value: 'Replace' }
        },
        {
            name: 'replaceTarget',
            displayName: 'Replace With',
            type: 'string',
            default: '',
            showIf: { field: 'operation', value: 'Replace' }
        },
        {
            name: 'outputKey',
            displayName: 'Save Result to Key',
            type: 'string',
            default: 'manipulated_text',
            description: 'The new JSON key where the modified text will be stored.'
        }
    ],

    execute: async (node, inputData) => {
        const config = node.data?.config || {};
        const targetKey = config.targetKey || 'prompt';
        const outputKey = config.outputKey || 'manipulated_text';
        const operation = config.operation || 'UPPERCASE';
        const replaceSource = config.replaceSource || '';
        const replaceTarget = config.replaceTarget || '';

        // 1. Proteksi kalau inputData kosong
        if (!inputData) {
            throw new Error(`Text Manipulation: No input data received.`);
        }

        // 2. Proteksi kalau key yang dicari nggak ada
        if (inputData[targetKey] === undefined) {
            throw new Error(`Text Manipulation: Variable '${targetKey}' not found in incoming data.`);
        }

        // 3. Ekstrak teks asli
        let textValue = String(inputData[targetKey]);
        let resultText = textValue;

        // 4. Eksekusi Operasi sesuai pilihan user
        switch (operation) {
            case 'UPPERCASE':
                resultText = textValue.toUpperCase();
                break;
            case 'lowercase':
                resultText = textValue.toLowerCase();
                break;
            case 'Replace':
                if (replaceSource) {
                    // Gunakan regex global 'g' agar me-replace semua kata yang cocok, bukan cuma 1 kata pertama
                    const regex = new RegExp(replaceSource, 'g');
                    resultText = textValue.replace(regex, replaceTarget);
                }
                break;
            case 'Trim':
                resultText = textValue.trim();
                break;
        }

        console.log(`[Text Manipulation] Process: '${textValue}' -> '${resultText}'`);

        // 5. Kembalikan data dengan struktur baru (gabungan data lama + data hasil manipulasi)
        return {
            ...inputData,
            [outputKey]: resultText
        };
    }
};
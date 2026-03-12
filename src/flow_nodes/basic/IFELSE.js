//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/flow_nodes/basic/ifFilter.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export default {
    name: 'flow.ifFilter',
    displayName: 'If / Filter',
    description: "Conditional branching. Splits flow into True/False paths. Click the '<' button to read full instructions.",
    icon: '⚖️',
    group: ['logic'],
    inputs: ['main'],
    // Node ini dirancang memiliki dua output port: True (index 0) dan False (index 1)
    outputs: ['true', 'false'],
    defaults: { name: 'If / Filter' },

    note: `💡 HOW TO USE IF / FILTER:
1. 'Target Variable (Key)': Enter the name of the JSON key from the previous node you want to check (e.g., 'status' or 'age').
2. 'Match Condition': Select the logic operator (Equals, Contains, Greater Than, etc.).
3. 'Value to Match': Enter the value to compare against.

ℹ️ PRO TIP:
This node has two outputs (True and False). Connect the top output for the 'True' path, and the bottom output for the 'False' path.`,

    properties: [
        {
            name: 'keyName',
            displayName: 'Target Variable (Key)',
            type: 'string',
            default: 'prompt',
            description: 'JSON variable name from the previous node to check.'
        },
        {
            name: 'condition',
            displayName: 'Match Condition',
            type: 'options',
            options: ['Equals (=)', 'Not Equals (!=)', 'Contains', 'Greater Than (>)', 'Less Than (<)'],
            default: 'Equals (=)'
        },
        {
            name: 'matchValue',
            displayName: 'Value to Match',
            type: 'string',
            default: '',
            description: 'The value to compare against the target variable.'
        }
    ],

    execute: async (node, inputData) => {
        const config = node.data?.config || {};
        const key = config.keyName || 'prompt';
        const condition = config.condition || 'Equals (=)';
        const matchValue = config.matchValue || '';

        // 1. Lakukan Pengecekan Eksistensi Input
        if (!inputData) {
            console.log(`[If/Filter] No input data received. Routing to FALSE.`);
            return { activeOutputIndex: 1, _filter_error: "No input data" }; // Jalur False
        }

        // 2. Ambil Value dari Key yang dituju
        const actualValue = inputData[key];

        if (actualValue === undefined) {
            console.log(`[If/Filter] Key '${key}' not found, routing to FALSE.`);
            return {
                ...inputData,
                activeOutputIndex: 1, // Jalur False
                _filter_error: "Variable not found"
            };
        }

        let isPassed = false;
        const strActual = String(actualValue).toLowerCase();
        const strMatch = String(matchValue).toLowerCase();

        // 3. Logika Perbandingan
        switch(condition) {
            case 'Equals (=)':
                isPassed = (strActual === strMatch);
                break;
            case 'Not Equals (!=)':
                isPassed = (strActual !== strMatch);
                break;
            case 'Contains':
                isPassed = strActual.includes(strMatch);
                break;
            case 'Greater Than (>)':
                isPassed = parseFloat(actualValue) > parseFloat(matchValue);
                break;
            case 'Less Than (<)':
                isPassed = parseFloat(actualValue) < parseFloat(matchValue);
                break;
        }

        console.log(`[If/Filter] Checking: '${actualValue}' ${condition} '${matchValue}' -> Result: ${isPassed}`);

        // 4. Return data dengan activeOutputIndex untuk menentukan jalur di flowRunner.js
        return {
            ...inputData,
            // Jika isPassed true, gunakan output 0 (True), jika false gunakan output 1 (False)
            activeOutputIndex: isPassed ? 0 : 1
        };
    }
};
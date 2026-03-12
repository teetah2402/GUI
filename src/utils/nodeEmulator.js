//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/utils/nodeEmulator.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * UNIVERSAL NODE EMULATOR
 * Membungkus modul mentah dari n8n agar bisa jalan langsung di Flowork Edge
 * tanpa perlu mengubah 1 baris kode pun dari file aslinya.
 */

export function adaptRawNode(RawNodeClass) {
    // 1. Instansiasi class asli n8n
    const instance = new RawNodeClass();
    const rawMeta = instance.description;

    // 2. Mapping UI Otomatis (White-labeled)
    // Otomatis ubah struktur JSON UI n8n menjadi standar kanvas Flowork
    const flowMetadata = {
        name: `flow.${rawMeta.name}`, // Ganti prefix n8n menjadi flow
        displayName: rawMeta.displayName,
        description: rawMeta.description,
        icon: rawMeta.icon || '📦',
        group: rawMeta.group || ['action'],
        inputs: ['main'], // Sederhanakan port
        outputs: ['main'],

        // Looping otomatis semua properti (input form) asli bawaan n8n
        properties: rawMeta.properties.map(p => ({
            name: p.name,
            displayName: p.displayName,
            type: p.type === 'options' ? 'options' : 'string', // Normalisasi tipe
            options: p.options ? p.options.map(opt => opt.value || opt.name) : [],
            default: p.default || ''
        }))
    };

    // 3. Environment Mocking (Membajak fungsi eksekusi n8n)
    const execute = async (floworkNode, inputData) => {

        // Kita buat "Objek Palsu" yang bertindak sebagai mesin n8n (Mock Context)
        const fakeN8nContext = {
            // Fungsi yang paling sering dipanggil n8n untuk baca form
            getNodeParameter: (parameterName, itemIndex, fallbackValue) => {
                const val = floworkNode.data.config[parameterName];
                return val !== undefined ? val : fallbackValue;
            },

            // Fungsi untuk baca data dari node sebelumnya
            getInputData: () => {
                return [{ json: inputData || {} }];
            },

            // Fungsi utilitas n8n (bisa kita tambah seiring waktu)
            helpers: {
                returnJsonArray: (items) => items,
                request: async (options) => {
                    // Jika node n8n pakai this.helpers.request, kita alihkan ke fetch bawaan browser
                    const res = await fetch(options.url || options.uri, {
                        method: options.method || 'GET',
                        headers: options.headers,
                        body: options.body ? JSON.stringify(options.body) : undefined
                    });
                    return await res.json();
                }
            }
        };

        // JALANKAN LOGIKA ASLI N8N MENGGUNAKAN KONTEKS PALSU
        // instance.execute() milik n8n akan mengira dia jalan di server n8n
        const result = await instance.execute.call(fakeN8nContext);

        return result;
    };

    // Kembalikan objek gabungan UI & Eksekusi untuk Flowork
    return { ...flowMetadata, execute };
}
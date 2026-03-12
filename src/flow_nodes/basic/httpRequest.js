//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/flow_nodes/http-request/httpRequest.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export default {
    name: 'flow.httpRequest',
    displayName: 'HTTP Request',
    description: "Sends custom HTTP requests (GET, POST, PUT, DELETE) to any external REST API. Click the '<' button in parameters to read full instructions.",
    icon: '🌐',
    group: ['action'], // Masuk kategori action/pemrosesan
    inputs: ['main'],  // Punya kabel masuk
    outputs: ['main'], // Punya kabel keluar
    defaults: { name: 'HTTP Request' },

    // [NEW] Panduan dokumentasi di Slide-Out Panel
    note: `💡 HOW TO USE HTTP REQUEST:
1. Endpoint URL: Provide the full URL of the external API (e.g., https://api.example.com/v1/users).
2. Method: Select 'GET' to retrieve data, or 'POST' / 'PUT' to send data.
3. Headers: Must be written in valid JSON format. Commonly used for authentication.
   Example: { "Authorization": "Bearer YOUR_TOKEN", "Content-Type": "application/json" }
4. Body Payload: Required if you are using POST or PUT. Must be a valid JSON string.

ℹ️ OUTPUT:
The response from the API will be merged with your existing workflow data under the properties 'http_status' and 'http_response'.`,

    // Form input untuk di sidebar kanan UI
    properties: [
        {
            name: 'url',
            displayName: 'API Endpoint URL',
            type: 'string',
            default: 'https://jsonplaceholder.typicode.com/posts/1', // URL API Publik yang valid untuk testing
            description: 'Enter the full URL of the external API.'
        },
        {
            name: 'method',
            displayName: 'HTTP Method',
            type: 'options',
            options: ['GET', 'POST', 'PUT', 'DELETE'],
            default: 'GET'
        },
        {
            name: 'headers',
            displayName: 'Headers (JSON Format)',
            type: 'string',
            default: '{"Content-Type": "application/json"}',
            description: 'Add authentication or custom headers in JSON format.'
        },
        {
            name: 'body',
            displayName: 'Body Payload (JSON Format)',
            type: 'string',
            default: '{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}', // Contoh body yang valid untuk test POST
            description: 'Map the JSON body payload for POST/PUT requests.'
        }
    ],

    // Logika Eksekusi Node
    execute: async (node, inputData) => {
        // 1. Tarik semua konfigurasi dari UI
        const url = node.data?.config?.url || '';
        const method = node.data?.config?.method || 'GET';
        const headersString = node.data?.config?.headers || '{}';
        const bodyString = node.data?.config?.body || '{}';

        // 2. Keamanan: Pastikan URL tidak kosong
        if (!url) {
            throw new Error("HTTP Request Failed: API Endpoint URL is required.");
        }

        console.log(`[HTTP Request Node] Sending ${method} request to ${url}...`);

        // 3. Parsing Headers dengan aman
        let headers = {};
        try {
            headers = JSON.parse(headersString);
        } catch (error) {
            console.warn("[HTTP Request Node] Failed to parse headers JSON, continuing with empty headers.");
        }

        // 4. Siapkan opsi fetch
        const fetchOptions = {
            method: method,
            headers: headers
        };

        // Jika method bukan GET atau HEAD, masukkan Body Payload
        if (method !== 'GET' && method !== 'HEAD') {
            try {
                // Pastikan body yang dikirim formatnya string JSON yang valid
                fetchOptions.body = typeof bodyString === 'string' ? bodyString : JSON.stringify(bodyString);
            } catch (error) {
                fetchOptions.body = bodyString;
            }
        }

        // 5. Eksekusi pemanggilan API
        try {
            const response = await fetch(url, fetchOptions);

            // Coba parsing response sebagai JSON dulu, kalau gagal jadiin text biasa
            const responseData = await response.json().catch(() => null);
            const textData = responseData ? null : await response.text().catch(() => null);

            console.log(`[HTTP Request Node] Request successful! Status: ${response.status}`);

            // 6. Lemparkan hasil response digabung dengan data dari node sebelumnya
            return {
                ...inputData, // Mempertahankan data dari node sebelumnya
                http_status: response.status,
                http_response: responseData || textData || "No response body received."
            };

        } catch (error) {
            // Tangkap error jika API down / URL salah
            console.error(`[HTTP Request Node] Error making request:`, error);
            throw new Error(`HTTP Request Error: ${error.message}`);
        }
    }
};
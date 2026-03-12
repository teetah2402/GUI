//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/flow_nodes/google/googleDrive.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export default {
    name: 'flow.googleDrive',
    displayName: 'Google Drive',
    // Deskripsi dibikin pendek agar sidebar kiri tetap rapi
    description: "Cloud file storage service. Uploads, searches, or creates folders. Click the '<' button in parameters to read full instructions.",
    icon: '📁',
    group: ['action'],
    inputs: ['main'],
    outputs: ['main'],

    // [NEW] Panduan dokumentasi dimasukkan sebagai default note
    // Akan otomatis muncul di panel Slide-Out Hijau Android saat modul diklik
    note: `💡 HOW TO GET OAUTH2 TOKEN:
1. Open Google Cloud Console (console.cloud.google.com).
2. Create a new Project, go to "Library", search and enable "Google Drive API".
3. Go to "Credentials", create an "OAuth 2.0 Client ID".
4. Open Google OAuth2 Playground (developers.google.com/oauthplayground).
5. Input scope: https://www.googleapis.com/auth/drive then Authorize APIs.
6. Click "Exchange authorization code for tokens", copy the generated "Access token".
7. Paste the token into the 'OAuth2 Token' field.

ℹ️ DYNAMIC VARIABLES & BATCH UPLOAD:
- You can retrieve data from previous nodes using the {{variable_name}} format.
- To upload multiple files (Batch Upload Folder), connect a 'Local Disk' node (set to folder mode) to this node, and type {{local_disk_result.files}} in the 'File Content' field.`,

    defaults: { name: 'Google Drive' },

    properties: [
        {
            name: 'actionType',
            displayName: 'Action',
            type: 'options',
            options: ['Upload File', 'Create Folder', 'Search File'],
            default: 'Upload File'
        },
        {
            name: 'oauthToken',
            displayName: 'OAuth2 Token (Bearer)',
            type: 'string',
            default: '',
            description: 'Access token for Google API authentication (Needs Drive scopes).'
        },
        {
            name: 'fileName',
            displayName: 'File / Folder Name',
            type: 'string',
            default: 'New_File_Flowork',
            description: 'Name for the file/folder. Supports {{variable.path}}.',
            showIf: { field: 'actionType', value: ['Upload File', 'Create Folder', 'Search File'] }
        },
        {
            name: 'parentFolderId',
            displayName: 'Parent Folder ID',
            type: 'string',
            default: '',
            description: 'Optional: ID of the folder where the file will be placed.',
            showIf: { field: 'actionType', value: ['Upload File', 'Create Folder'] }
        },
        {
            name: 'contentFormat',
            displayName: 'Content Format',
            type: 'options',
            options: ['Text', 'Base64 (For Binary Files)'],
            default: 'Text',
            description: 'Pilih Text untuk teks biasa, atau Base64 untuk file zip, image, mp4, dll.',
            showIf: { field: 'actionType', value: ['Upload File'] }
        },
        {
            name: 'fileContent',
            displayName: 'File Content',
            type: 'string',
            default: 'Content from {{prompt}}',
            description: 'The content you want to upload (Text or Base64 string).',
            showIf: { field: 'actionType', value: ['Upload File'] }
        },
        {
            name: 'mimeType',
            displayName: 'Mime Type',
            type: 'string',
            default: 'text/plain',
            description: 'e.g., text/plain, application/zip, image/jpeg, video/mp4.',
            showIf: { field: 'actionType', value: ['Upload File'] }
        }
    ],

    execute: async (node, inputData) => {
        const config = node.data?.config || {};
        const actionType = config.actionType || 'Upload File';
        const oauthToken = config.oauthToken || '';

        if (!oauthToken) {
            throw new Error("Google Drive Error: OAuth2 Token is required.");
        }

        console.log(`[Google Drive Node] Executing ${actionType}...`);

        const applyTemplate = (str) => {
            if (typeof str !== 'string' || !inputData) return str;

            // Jika format adalah tepat "{{variabel}}", bisa mengekstrak Array Folder langsung tanpa diubah ke string
            const exactMatch = str.match(/^\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}$/);
            if (exactMatch) {
                const val = exactMatch[1].split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : undefined, inputData);
                if (val !== undefined) return val;
            }

            return str.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (match, varPath) => {
                const val = varPath.split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : undefined, inputData);
                return val !== undefined ? (typeof val === 'object' ? JSON.stringify(val) : val) : match;
            });
        };

        const headers = {
            'Authorization': `Bearer ${oauthToken}`,
            'Content-Type': 'application/json'
        };

        try {
            let resultData = null;

            if (actionType === 'Create Folder') {
                const folderName = applyTemplate(config.fileName || 'New Folder');
                const body = {
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder'
                };
                if (config.parentFolderId) body.parents = [config.parentFolderId];

                const response = await fetch('https://www.googleapis.com/drive/v3/files', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(body)
                });
                resultData = await response.json();
                if (!response.ok) throw new Error(resultData.error?.message || "Failed to Create Folder.");
            }
            else if (actionType === 'Search File') {
                const searchName = applyTemplate(config.fileName || '');
                const query = searchName ? `name contains '${searchName}' and trashed = false` : 'trashed = false';
                const endpoint = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id, name, mimeType)`;

                const response = await fetch(endpoint, { method: 'GET', headers });
                resultData = await response.json();
                if (!response.ok) throw new Error(resultData.error?.message || "Failed to Search File.");
            }
            else if (actionType === 'Upload File') {
                const contentPayload = applyTemplate(config.fileContent || '');
                const format = config.contentFormat || 'Text';

                // Deteksi otomatis jika input adalah ARRAY (Mode Batch Folder)
                let itemsToUpload = [];
                if (Array.isArray(contentPayload)) {
                    itemsToUpload = contentPayload;
                } else {
                    // Mode lawas dibungkus array supaya pakai fungsi loop yang sama (Zero Logic Mutation)
                    itemsToUpload = [{
                        name: applyTemplate(config.fileName || 'upload.txt'),
                        mimeType: applyTemplate(config.mimeType || 'text/plain'),
                        data: contentPayload,
                        isSingle: true
                    }];
                }

                let uploadedResults = [];

                // Loop mengunggah file SATU PER SATU agar tidak meledakkan RAM
                for (let i = 0; i < itemsToUpload.length; i++) {
                    const item = itemsToUpload[i];
                    const name = item.name || applyTemplate(config.fileName || 'upload.txt');
                    const mime = item.type || item.mimeType || applyTemplate(config.mimeType || 'text/plain');

                    const metadata = { name, mimeType: mime };
                    if (config.parentFolderId) metadata.parents = [config.parentFolderId];

                    const boundary = '-------314159265358979323846';
                    const delimiter = "\r\n--" + boundary + "\r\n";
                    const close_delim = "\r\n--" + boundary + "--";

                    const metadataBlob = new Blob([
                        delimiter,
                        'Content-Type: application/json; charset=UTF-8\r\n\r\n',
                        JSON.stringify(metadata),
                        delimiter,
                        'Content-Type: ' + mime + '\r\n\r\n'
                    ], { type: 'text/plain' });

                    let fileDataBlob;

                    // BACA OBJEK BINER LANGSUNG KALAU ADA!
                    if (item.rawFile) {
                        fileDataBlob = item.rawFile;
                    }
                    else if (format === 'Base64 (For Binary Files)' && item.data) {
                        const cleanBase64 = item.data.replace(/^data:.*?;base64,/, '').replace(/\s+/g, '');
                        const binaryString = atob(cleanBase64);
                        const len = binaryString.length;
                        const bytes = new Uint8Array(len);
                        for (let j = 0; j < len; j++) {
                            bytes[j] = binaryString.charCodeAt(j);
                        }
                        fileDataBlob = new Blob([bytes], { type: mime });
                    } else {
                        // Mode Text Biasa
                        fileDataBlob = new Blob([item.data || ''], { type: mime });
                    }

                    const endBlob = new Blob([close_delim], { type: 'text/plain' });

                    const finalBody = new Blob([metadataBlob, fileDataBlob, endBlob]);

                    console.log(`[Google Drive Node] Uploading (${i + 1}/${itemsToUpload.length}): ${name}...`);

                    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${oauthToken}`,
                            'Content-Type': `multipart/related; boundary=${boundary}`
                        },
                        body: finalBody
                    });

                    const resData = await response.json();
                    if (!response.ok) throw new Error(resData.error?.message || `Failed to Upload File: ${name}`);

                    uploadedResults.push(resData);
                }

                // Jika hanya upload 1 file maka return objek biasa (seperti dulu), jika Batch return Array Log result
                resultData = uploadedResults.length === 1 && itemsToUpload[0].isSingle ? uploadedResults[0] : uploadedResults;
            }

            console.log(`[Google Drive Node] Action '${actionType}' completed successfully!`);

            return {
                ...inputData,
                google_drive_result: resultData
            };

        } catch (error) {
            console.error(`[Google Drive Node] API Error:`, error);
            throw new Error(`Google Drive Execution Error: ${error.message}`);
        }
    }
};
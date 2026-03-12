//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/flow_nodes/google-sheets/googleSheets.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export default {
    name: 'flow.googleSheets',
    displayName: 'Google Sheets',
    // Deskripsi diperpendek agar sidebar tidak melar
    description: "Cloud-based spreadsheet software. Reads, appends, updates, or deletes rows. Click the '<' button in parameters to read full instructions.",
    icon: '📊',
    group: ['action'],
    inputs: ['main'],
    outputs: ['main'],

    // [NEW] Panduan dokumentasi lengkap di Slide-Out Panel
    note: `💡 HOW TO GET OAUTH2 TOKEN:
1. Open Google Cloud Console (console.cloud.google.com).
2. Create a new Project, go to "Library", search and enable "Google Sheets API".
3. Go to "Credentials", create an "OAuth 2.0 Client ID".
4. Open Google OAuth2 Playground (developers.google.com/oauthplayground).
5. Input scope: https://www.googleapis.com/auth/spreadsheets then Authorize APIs.
6. Click "Exchange authorization code for tokens", copy the generated "Access token".
7. Paste the token into the 'OAuth2 Token' field.

📊 HOW TO GET SPREADSHEET ID:
Open your Google Sheet in the browser. The ID is the long string in the URL between "/d/" and "/edit".
Example: docs.google.com/spreadsheets/d/1BxiMVs0X_5_example/edit
👉 The ID is: 1BxiMVs0X_5_example

ℹ️ DYNAMIC VARIABLES USAGE:
You can retrieve data from previous nodes using the {{variable_name}} format.
Example: Fill the 'Row Data' field with {{ai_result}} or {{webhook_data.name}}.`,

    defaults: { name: 'Google Sheets' },

    properties: [
        {
            name: 'actionType',
            displayName: 'Action',
            type: 'options',
            options: ['Read Row', 'Append Row', 'Update Row', 'Delete Row'],
            default: 'Append Row'
        },
        {
            name: 'oauthToken',
            displayName: 'OAuth2 Token (Bearer)',
            type: 'string',
            default: '',
            description: 'Access token for Google API authentication.'
        },
        {
            name: 'spreadsheetId',
            displayName: 'Spreadsheet ID',
            type: 'string',
            default: '',
            description: 'The exact ID of the Google Sheet (found in the URL).'
        },
        {
            name: 'range',
            displayName: 'Sheet Name & Range',
            type: 'string',
            default: 'Sheet1!A:Z',
            description: 'e.g., "Sheet1!A:Z" or "Data!A1:D10".',
            showIf: { field: 'actionType', value: ['Read Row', 'Append Row', 'Update Row'] }
        },
        {
            name: 'rowData',
            displayName: 'Row Data (JSON Array)',
            type: 'string',
            default: '["{{data1}}", "{{data2}}"]',
            description: 'Data to insert. Must be a valid JSON array of strings/numbers.',
            showIf: { field: 'actionType', value: ['Append Row', 'Update Row'] }
        },
        {
            name: 'sheetName',
            displayName: 'Sheet Name (For Delete)',
            type: 'string',
            default: 'Sheet1',
            description: 'The exact name of the tab/worksheet (e.g., "Sheet1").',
            showIf: { field: 'actionType', value: ['Delete Row'] }
        },
        {
            name: 'rowIndex',
            displayName: 'Row Index to Delete (0-based)',
            type: 'string',
            default: '1',
            description: 'The row index to delete. 0 is the first row, 1 is the second row, etc.',
            showIf: { field: 'actionType', value: ['Delete Row'] }
        }
    ],

    execute: async (node, inputData) => {
        const config = node.data?.config || {};
        const actionType = config.actionType || 'Append Row';
        const oauthToken = config.oauthToken || '';

        if (!oauthToken) {
            throw new Error("Google Sheets Error: OAuth2 Token is required.");
        }

        console.log(`[Google Sheets Node] Executing ${actionType}...`);

        const applyTemplate = (str) => {
            if (typeof str !== 'string' || !inputData) return str;
            return str.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (match, varPath) => {
                const val = varPath.split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : undefined, inputData);
                return val !== undefined ? (typeof val === 'object' ? JSON.stringify(val) : val) : match;
            });
        };

        const spreadsheetId = applyTemplate(config.spreadsheetId || '');
        if (!spreadsheetId) {
            throw new Error("Google Sheets Error: Spreadsheet ID is required.");
        }

        let fetchOptions = {
            headers: {
                'Authorization': `Bearer ${oauthToken}`,
                'Content-Type': 'application/json'
            }
        };

        try {
            let resultData = null;
            let apiUrl = '';

            if (actionType === 'Read Row') {
                const range = applyTemplate(config.range || 'Sheet1!A:Z');
                apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
                fetchOptions.method = 'GET';

                const response = await fetch(apiUrl, fetchOptions);
                resultData = await response.json();

                if (!response.ok) throw new Error(resultData.error?.message || "Failed to Read Row.");
            }
            else if (actionType === 'Append Row' || actionType === 'Update Row') {
                const range = applyTemplate(config.range || 'Sheet1!A:Z');
                let rawDataStr = applyTemplate(config.rowData || '[]');
                let valuesToInsert = [];

                try {
                    valuesToInsert = JSON.parse(rawDataStr);
                    if (!Array.isArray(valuesToInsert)) {
                        valuesToInsert = [valuesToInsert];
                    }
                    if (valuesToInsert.length > 0 && !Array.isArray(valuesToInsert[0])) {
                        valuesToInsert = [valuesToInsert];
                    }
                } catch(e) {
                    valuesToInsert = [[rawDataStr]];
                }

                if (actionType === 'Append Row') {
                    apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
                    fetchOptions.method = 'POST';
                } else {
                    apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
                    fetchOptions.method = 'PUT';
                }

                fetchOptions.body = JSON.stringify({
                    values: valuesToInsert
                });

                const response = await fetch(apiUrl, fetchOptions);
                resultData = await response.json();

                if (!response.ok) throw new Error(resultData.error?.message || `Failed to ${actionType}.`);
            }
            else if (actionType === 'Delete Row') {
                const sheetName = applyTemplate(config.sheetName || 'Sheet1');
                const rowIndex = parseInt(applyTemplate(config.rowIndex || '1'), 10);

                const getSheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?includeGridData=false`;
                const getSheetRes = await fetch(getSheetUrl, { method: 'GET', headers: fetchOptions.headers });
                const sheetInfo = await getSheetRes.json();

                if (!getSheetRes.ok) throw new Error(sheetInfo.error?.message || "Failed to retrieve spreadsheet info.");

                const sheet = sheetInfo.sheets.find(s => s.properties.title === sheetName);
                if (!sheet) throw new Error(`Sheet name '${sheetName}' not found in the spreadsheet.`);

                const sheetId = sheet.properties.sheetId;

                apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
                fetchOptions.method = 'POST';
                fetchOptions.body = JSON.stringify({
                    requests: [
                        {
                            deleteDimension: {
                                range: {
                                    sheetId: sheetId,
                                    dimension: "ROWS",
                                    startIndex: rowIndex,
                                    endIndex: rowIndex + 1
                                }
                            }
                        }
                    ]
                });

                const response = await fetch(apiUrl, fetchOptions);
                resultData = await response.json();

                if (!response.ok) {
                    throw new Error(resultData.error?.message || "Failed to Delete Row.");
                }
            }

            console.log(`[Google Sheets Node] Action '${actionType}' completed successfully!`);

            return {
                ...inputData,
                google_sheets_result: resultData
            };

        } catch (error) {
            console.error(`[Google Sheets Node] API Error:`, error);
            throw new Error(`Google Sheets Execution Error: ${error.message}`);
        }
    }
};
//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/flow_nodes/google/gmail.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export default {
    name: 'flow.gmail',
    displayName: 'Gmail',
    description: "Google's email service. Sends, reads, or drafts emails. Click the '<' button in parameters to read full instructions.",
    icon: '📧',
    group: ['action'],
    inputs: ['main'],
    outputs: ['main'],

    // [NEW] Panduan dokumentasi dimasukkan sebagai default note
    // Akan otomatis muncul di panel Slide-Out Hijau Android saat modul diklik
    note: `💡 HOW TO GET OAUTH2 TOKEN:
1. Open Google Cloud Console (console.cloud.google.com).
2. Create a new Project, go to "Library", search and enable "Gmail API".
3. Go to "Credentials", create an "OAuth 2.0 Client ID".
4. Open Google OAuth2 Playground (developers.google.com/oauthplayground).
5. Input scope: https://mail.google.com/ then Authorize APIs.
6. Click "Exchange authorization code for tokens", copy the generated "Access token".
7. Paste the token into the 'OAuth2 Token' field.

ℹ️ DYNAMIC VARIABLES USAGE:
You can retrieve data from previous nodes using the {{variable_name}} format.
Example: Fill the 'To' field with {{client_email}} or the 'Body' with {{ai_generated_result}}.`,

    defaults: { name: 'Gmail' },

    properties: [
        {
            name: 'actionType',
            displayName: 'Action',
            type: 'options',
            options: ['Send Email', 'Draft Email', 'Read Emails'],
            default: 'Send Email'
        },
        {
            name: 'oauthToken',
            displayName: 'OAuth2 Token (Bearer)',
            type: 'string',
            default: '',
            description: 'Access token for Google API authentication (Needs Gmail scopes).'
        },
        {
            name: 'toEmail',
            displayName: 'To (Recipient Email)',
            type: 'string',
            default: '',
            description: 'Target email address. Use {{variable}} to get from previous node.',
            showIf: { field: 'actionType', value: ['Send Email', 'Draft Email'] }
        },
        {
            name: 'subject',
            displayName: 'Subject',
            type: 'string',
            default: 'New Notification from Flowork',
            description: 'Email subject.',
            showIf: { field: 'actionType', value: ['Send Email', 'Draft Email'] }
        },
        {
            name: 'bodyText',
            displayName: 'Body (HTML / Text)',
            type: 'string',
            default: '<p>Hello, this is a message from <b>{{prompt}}</b></p>',
            description: 'The content of your email. HTML tags are supported.',
            showIf: { field: 'actionType', value: ['Send Email', 'Draft Email'] }
        },
        {
            name: 'maxResults',
            displayName: 'Max Results (Read)',
            type: 'string',
            default: '5',
            description: 'Number of recent emails to fetch.',
            showIf: { field: 'actionType', value: ['Read Emails'] }
        }
    ],

    execute: async (node, inputData) => {
        const config = node.data?.config || {};
        const actionType = config.actionType || 'Send Email';
        const oauthToken = config.oauthToken || '';

        if (!oauthToken) {
            throw new Error("Gmail Error: OAuth2 Token is required.");
        }

        console.log(`[Gmail Node] Executing ${actionType}...`);

        // Helper untuk parse variabel {{nama_variabel}}
        const applyTemplate = (str) => {
            if (typeof str !== 'string' || !inputData) return str;
            return str.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, varName) => {
                return inputData[varName] !== undefined ? inputData[varName] : match;
            });
        };

        // Helper untuk Base64URL encoding (Wajib buat Gmail API)
        const encodeBase64Url = (str) => {
            return btoa(unescape(encodeURIComponent(str)))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
        };

        let fetchOptions = {
            headers: {
                'Authorization': `Bearer ${oauthToken}`,
                'Content-Type': 'application/json'
            }
        };

        try {
            let resultData = null;

            if (actionType === 'Send Email' || actionType === 'Draft Email') {
                const toEmail = applyTemplate(config.toEmail || '');
                const subject = applyTemplate(config.subject || '');
                const bodyText = applyTemplate(config.bodyText || '');

                if (!toEmail) {
                    throw new Error("Recipient email (To) is required.");
                }

                // Susun struktur email standar RFC 2822
                const emailLines = [
                    `To: ${toEmail}`,
                    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
                    `Content-Type: text/html; charset=utf-8`,
                    `MIME-Version: 1.0`,
                    ``,
                    bodyText
                ];
                const emailRaw = emailLines.join('\r\n');
                const encodedMessage = encodeBase64Url(emailRaw);

                fetchOptions.method = 'POST';

                // >>> Pisahkan Payload untuk Send dan Draft <<<
                if (actionType === 'Send Email') {
                    fetchOptions.body = JSON.stringify({ raw: encodedMessage });
                } else {
                    // Draft wajib dibungkus object "message"
                    fetchOptions.body = JSON.stringify({ message: { raw: encodedMessage } });
                }

                const endpoint = actionType === 'Send Email'
                    ? 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'
                    : 'https://gmail.googleapis.com/gmail/v1/users/me/drafts';

                const response = await fetch(endpoint, fetchOptions);
                resultData = await response.json();

                if (!response.ok) {
                    throw new Error(resultData.error?.message || `Failed to ${actionType}.`);
                }
            }
            else if (actionType === 'Read Emails') {
                const maxResults = config.maxResults || '5';

                const listEndpoint = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;

                fetchOptions.method = 'GET';
                const listResponse = await fetch(listEndpoint, fetchOptions);
                const listData = await listResponse.json();

                if (!listResponse.ok) {
                    throw new Error(listData.error?.message || "Failed to list emails.");
                }

                const detailedMessages = [];
                if (listData.messages && listData.messages.length > 0) {
                    for (const msg of listData.messages) {
                        const detailEndpoint = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`;
                        const detailResponse = await fetch(detailEndpoint, fetchOptions);
                        const detailData = await detailResponse.json();

                        if (detailResponse.ok) {
                            const headers = detailData.payload?.headers || [];
                            const subjectHeader = headers.find(h => h.name === 'Subject');
                            const fromHeader = headers.find(h => h.name === 'From');

                            detailedMessages.push({
                                id: msg.id,
                                threadId: msg.threadId,
                                from: fromHeader ? fromHeader.value : '(Unknown)',
                                subject: subjectHeader ? subjectHeader.value : '(No Subject)',
                                snippet: detailData.snippet
                            });
                        }
                    }
                }

                resultData = {
                    messages: detailedMessages,
                    nextPageToken: listData.nextPageToken,
                    resultSizeEstimate: listData.resultSizeEstimate
                };
            }

            console.log(`[Gmail Node] Action '${actionType}' completed successfully!`);

            return {
                ...inputData,
                gmail_result: resultData
            };

        } catch (error) {
            console.error(`[Gmail Node] API Error:`, error);
            throw new Error(`Gmail Execution Error: ${error.message}`);
        }
    }
};
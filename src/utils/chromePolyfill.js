//#######################################################################
// WEBSITE https://floworkos.com
// FUNGSI: Berserk Deep Proxy - Anti-Shadow Property Stabilizer
// C:\Users\User\Music\web\src\utils\chromePolyfill.js
//#######################################################################

const extMetaTag = document.querySelector('meta[name="flowork-ext-id"]');
let FLOWORK_BRIDGE_ID = extMetaTag ? extMetaTag.content : null;

const nativeSendMessage = window.chrome?.runtime?.sendMessage;
let isBridgeConnected = false;

if (!FLOWORK_BRIDGE_ID) {
    console.warn("⚠️ [Flowork System] Ekstensi Flowork OS Bridge tidak terdeteksi atau belum aktif.");
} else if (nativeSendMessage && FLOWORK_BRIDGE_ID) {
    try {
        nativeSendMessage.call(chrome.runtime, FLOWORK_BRIDGE_ID, { action: "ping" }, (res) => {
            const err = chrome.runtime.lastError;
            if (err) {
                console.error("❌ [Flowork System] BRIDGE GAGAL KONEK!");
                console.error(`Penyebab: ID Ekstensi "${FLOWORK_BRIDGE_ID}" menolak koneksi.`);
            } else if (res?.status === "connected") {
                isBridgeConnected = true;
                // [KODE BARU] Set flag global untuk deteksi handal di sisi UI
                window.__floworkBridgeConnected = true;
                console.log("🟢 [Flowork System] GOD MODE AKTIF SECARA OTOMATIS!");
            }
        });
    } catch (e) {}
}

export const initChromePolyfill = () => {
    if (window.__floworkProxyLocked) {
        console.warn("🔄 [Flowork System] Proxy sudah terkunci. Melewati injeksi ulang.");
        return;
    }

    const createNeuralProxy = (pathSegments = []) => {
        const proxyTarget = () => {};
        return new Proxy(proxyTarget, {
            get: (target, prop) => {
                if (prop === 'then' || prop === 'catch' || typeof prop === 'symbol' || prop === 'prototype') return undefined;
                return createNeuralProxy([...pathSegments, String(prop)]);
            },
            apply: (target, thisArg, args) => {
                const apiPath = pathSegments.join('.');
                const callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;

                if (isBridgeConnected && nativeSendMessage && FLOWORK_BRIDGE_ID) {
                    return new Promise((resolve, reject) => {
                        console.log(`[Flowork Proxy] Exec: chrome.${apiPath}`);
                        try {
                            nativeSendMessage.call(chrome.runtime, FLOWORK_BRIDGE_ID, {
                                action: 'execute_api',
                                payload: { api: apiPath, args: args }
                            }, (response) => {
                                const error = chrome.runtime.lastError;
                                if (error || (response && !response.success)) {
                                    console.error(`❌ [Flowork Proxy] Bridge Gagal di ${apiPath}:`, error?.message || response?.error);

                                    if (response?.error === "APP_DISABLED_BY_USER_OR_SYSTEM" || response?.error === "APP_DISABLED_BY_USER") {
                                        if (callback) callback(null);
                                        return reject(new Error(response.error));
                                    }
                                }
                                const finalData = (!error && response?.success) ? response.data : (apiPath.includes('query') ? [] : {});
                                if (callback) callback(finalData);
                                resolve(finalData);
                            });
                        } catch (err) { resolve(apiPath.includes('query') ? [] : {}); }
                    });
                }
                const fallback = apiPath.includes('query') ? [] : {};
                if (callback) callback(fallback);
                return Promise.resolve(fallback);
            }
        });
    };

    const HIJACKED_APIS = ['tabs', 'scripting', 'storage', 'notifications', 'runtime', 'bookmarks', 'history'];

    const baseChrome = window.chrome || {};

    const handler = {
        get: (target, prop) => {
            if (prop === '__isFloworkPolyfill') return true;

            const propName = String(prop);

            if (HIJACKED_APIS.includes(propName)) {
                if (propName === 'runtime') {
                    return {
                        // [KODE DIPERBAIKI] Mengembalikan status "connected" jika bridge aktif agar deteksi UI akurat
                        sendMessage: (msg, cb) => {
                            if (typeof cb === 'function') {
                                const status = (msg?.action === 'ping' && isBridgeConnected) ? "connected" : "ok";
                                cb({ status: status });
                            }
                        },
                        getManifest: () => ({ name: "Flowork OS", version: "6.0" }),
                        id: "flowork-universal-runtime"
                    };
                }
                return createNeuralProxy([propName]);
            }

            try {
                const val = target[prop];
                if (val !== undefined) return val;
            } catch (e) {}

            return createNeuralProxy([propName]);
        }
    };

    try {
        const neuralChrome = new Proxy(baseChrome, handler);

        if (window.chrome) {
            try { delete window.chrome; } catch(e) {}
        }

        Object.defineProperty(window, 'chrome', {
            value: neuralChrome,
            writable: false,
            configurable: false
        });

        if (!window.browser) window.browser = window.chrome;
        window.__floworkProxyLocked = true;
        console.log("🟢 [Flowork System] Universal Berserk Proxy diaktifkan & TERKUNCI!");
    } catch (e) {
        console.error("❌ Failed to mount Proxy", e);
        window.chrome = new Proxy(baseChrome, handler);
    }
};
//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/utils/systemBridge.js
//#######################################################################

import { useSocketStore } from '@/store/socket';

export const detectEnvironment = () => {
    if (typeof chrome !== 'undefined' && chrome.extension) {
        return 'chrome_ext';
    }
    if (typeof window !== 'undefined' && (window.Capacitor || window.AndroidBridge || window.cordova)) {
        return 'mobile_webview';
    }
    return 'web';
};

export const universalDownload = async (data, filename) => {
    const env = detectEnvironment();
    let url = data;
    if (data instanceof Blob) {
        url = URL.createObjectURL(data);
    }
    try {
        if (env === 'chrome_ext' && typeof chrome.downloads !== 'undefined') {
            chrome.downloads.download({ url: url, filename: filename, saveAs: true });
        }
        else {
            forceDOMDownload(url, filename);
        }
    } catch (error) {
        console.error('[System Bridge] Download gagal:', error);
    } finally {
        if (data instanceof Blob) {
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        }
    }
};

const forceDOMDownload = (url, filename) => {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export const executeEngineTask = async (taskName, payload = {}) => {
    const env = detectEnvironment();
    const socketStore = useSocketStore();

    if (!socketStore.isConnected) {
        throw new Error("Local Engine tidak terdeteksi. Pastikan engine Golang berjalan.");
    }

    return new Promise((resolve, reject) => {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const responseEvent = `engine_task_result_${taskId}`;

        const timeout = setTimeout(() => {
            socketStore.socket.off(responseEvent);
            reject(new Error(`Timeout: Local Engine memakan waktu terlalu lama saat mengeksekusi [${taskName}].`));
        }, 120000);

        socketStore.socket.once(responseEvent, (response) => {
            clearTimeout(timeout);
            if (response.error) {
                reject(new Error(response.error));
            } else {
                resolve(response.data);
            }
        });

        console.log(`[System Bridge] Mengirim delegasi task [${taskName}] ke Local Engine...`);
        socketStore.socket.emit('engine:execute_task', {
            task_id: taskId,
            task_name: taskName,
            payload: payload,
            environment: env
        });
    });
};
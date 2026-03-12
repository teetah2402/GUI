//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\api\core.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import axios from 'axios';
// ZOMBIE CODE: import { useAuthStore } from '@/store/auth';
import { ethers } from 'ethers';

export const CURRENT_PAYLOAD_VERSION = 2;
export const DEFAULT_API_TIMEOUT = 60000;

export const getContentBaseUrl = () => '/api/v1';

// [ADD] Fungsi getGatewayUrl yang sebelumnya hilang sehingga menyebabkan error saat build
export const getGatewayUrl = () => {
    return localStorage.getItem('flowork_gateway_url') || (import.meta.env && import.meta.env.VITE_GATEWAY_URL) || window.location.origin;
};

const toHttps = (url) => {
    if (typeof url === 'string' && url.startsWith('http:')) {
        if (window.location.protocol === 'https:' || window.location.hostname.includes('floworkos.com')) {
            return url.replace(/^http:\/\//i, 'https://');
        }
    }
    return url;
}

const axiosConfig = {
    timeout: DEFAULT_API_TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
    transformRequest: [function (data, headers) {
        return JSON.stringify(data);
    }],
};

export const apiClient = axios.create({ ...axiosConfig, baseURL: '/' });
export const cloudApiClient = axios.create({ ...axiosConfig, baseURL: '/api/v1' });
export const contentApiClient = axios.create({ ...axiosConfig, baseURL: getContentBaseUrl() });

export const getAuthHeaders = async (fullUrl, method = 'GET') => {
    const headers = {};
    // ZOMBIE CODE: const authStore = useAuthStore();

    let token = localStorage.getItem('flowork_gateway_token') || localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['x-gateway-token'] = token;
    }

    const tunnelToken = localStorage.getItem('flowork_tunnel_token');
    if (tunnelToken) {
        headers['cf-access-client-id'] = localStorage.getItem('cf_client_id');
        headers['cf-access-client-secret'] = localStorage.getItem('cf_client_secret');
    }

    // [ADD] Deklarasi variabel agar tidak terkena ReferenceError saat build
    let privateKey = null;

    if (!privateKey) {
        try {
            const localAuth = localStorage.getItem('wallet_auth');
            if (localAuth) {
                const parsed = JSON.parse(localAuth);
                if (parsed.privateKey) privateKey = parsed.privateKey;
            }
        } catch (e) {}
    }

    if (privateKey) {
        try {
            const wallet = new ethers.Wallet(privateKey);
            const timestamp = Math.floor(Date.now() / 1000);
            const messageToSign = `flowork_api_auth|${wallet.address}|${timestamp}`;
            const signature = await wallet.signMessage(messageToSign);

            headers['X-User-Address'] = wallet.address;
            headers['X-Signature'] = signature;
            headers['X-Signed-Message'] = messageToSign;
            headers['X-Payload-Version'] = CURRENT_PAYLOAD_VERSION;
        } catch (e) {
            console.error("[API] Sign Error:", e);
        }
    }

    const activeEngineId = localStorage.getItem('flowork_active_engine_id');
    if (activeEngineId) headers['X-Flowork-Engine-ID'] = activeEngineId;

    return headers;
};

const dynamicUrlInterceptor = (config) => {
    const currentGatewayUrl = getGatewayUrl();
    const newBaseUrl = `${currentGatewayUrl}/api/v1`;

    if (config.url.startsWith('/api/v1')) {
        config.baseURL = currentGatewayUrl;
    } else {
        config.baseURL = newBaseUrl;
    }

    if (config.baseURL) config.baseURL = toHttps(config.baseURL);

    return config;
};

const cryptoInterceptor = async config => {
    let fullUrl = config.baseURL || '';
    if (!fullUrl.endsWith('/') && !config.url.startsWith('/')) fullUrl += '/';
    fullUrl += config.url;

    fullUrl = toHttps(fullUrl);
    config.url = config.url.replace(/^http:\/\//i, 'https://');
    if (config.baseURL) config.baseURL = toHttps(config.baseURL);

    const authHeaders = await getAuthHeaders(fullUrl, config.method);
    config.headers = { ...config.headers, ...authHeaders };
    return config;
};

apiClient.interceptors.request.use(dynamicUrlInterceptor, error => Promise.reject(error));
apiClient.interceptors.request.use(cryptoInterceptor, error => Promise.reject(error));
cloudApiClient.interceptors.request.use(cryptoInterceptor, error => Promise.reject(error));
contentApiClient.interceptors.request.use(cryptoInterceptor, error => Promise.reject(error));

export function handleApiError(error, context, options = {}) {
    console.error(`[API Error] ${context}:`, error);

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return { error: 'Connection timed out.' };
    }

    if (error.response) {
        if (error.response.status === 401 && !options.suppressLogout) {
            // ZOMBIE CODE: const authStore = useAuthStore();
            // ZOMBIE CODE: authStore.handleLogoutError();
        }
        return error.response.data || { error: `HTTP Error ${error.response.status}` };
    } else if (error.request) {
        return { error: 'Network Error.' };
    } else {
        return { error: `Request Error: ${error.message}` };
    }
}

export const wsOnlyError = (context = '') => Promise.resolve({ error: `WS Only (${context})` });
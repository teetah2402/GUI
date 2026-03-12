//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/store/socket.js
//#######################################################################

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { io } from 'socket.io-client';
import { useUiStore } from './ui';
import { useFlowRegistryStore } from './flowRegistry';
import { useAppStore } from './apps'; // [TAMBAHAN KODE] Import App Store
import { getGatewayUrl } from '@/api';

// Mengimpor fungsi Resume untuk menyelamatkan nyawa UI
import { resumeFlow } from '@/utils/flowRunner';

const PAYLOAD_VERSION = '1.0';

export const useSocketStore = defineStore('socket', () => {
    const socket = ref(null);
    const isConnecting = ref(false);
    const connectionError = ref(null);
    const resolvedGatewayUrl = ref(null);
    const isGracePeriod = ref(true);
    const currentEngineStatus = ref({
        isBusy: false,
        cpuPercent: null,
        memoryPercent: null
    });
    const engineVitals = ref(null);

    const isConnected = computed(() => socket.value?.connected || false);
    const isDevEngine = computed(() => {
        return false;
    });

    const joinAgentSession = async () => {};
    const sendAgentInput = async () => {};

    async function connect() {
        if (socket.value?.connected) return;
        if (isConnecting.value) return;
        isConnecting.value = true;
        isGracePeriod.value = true;
        setTimeout(() => { if (!isConnected.value) isGracePeriod.value = false; }, 3000);
        connectionError.value = null;
        const gatewayUrl = getGatewayUrl();
        resolvedGatewayUrl.value = gatewayUrl;
        const socketPath = "/api/socket.io";
        const socketNamespace = "/gui-socket";
        const baseSocketUrl = "http://127.0.0.1:5000";
        const socketUrl = baseSocketUrl + socketNamespace;

        let targetEngineId = localStorage.getItem('flowork_selected_engine_id');

        const queryParams = {};
        if (targetEngineId) queryParams.engine_id = targetEngineId;

        try {
            const newSocket = io(socketUrl, {
                path: socketPath,
                transports: ['polling'],
                autoConnect: false,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 60000,
                ackTimeout: 60000,
                query: queryParams
            });

            socket.value = newSocket;
            socket.value.connect();

            newSocket.on('connect', () => {
                console.log('[Socket] ✅ Berhasil nembus ke Local Engine via Polling!');
            });

            newSocket.on('engine:online', (engineData) => {
                const uiStore = useUiStore();
                uiStore.showNotification({
                    text: `Local Engine Terhubung! Siap mengeksekusi modul fisik.`,
                    color: "success"
                });

                // Minta Nodes (Untuk Flow Designer)
                newSocket.emit('engine:get_nodes', { v: PAYLOAD_VERSION, payload: {} });

                // [TAMBAHAN KODE] Minta Aplikasi Offline (Untuk App Store)
                newSocket.emit('engine:get_apps', { v: PAYLOAD_VERSION, payload: {} });

                // Jika pengguna menekan F5/Reload saat Flow sedang berjalan
                setTimeout(() => {
                    resumeFlow();
                }, 1500);
            });

            newSocket.on('engine:nodes_list', (response) => {
                if (response && response.data) {
                    const registryStore = useFlowRegistryStore();
                    registryStore.registerEngineNodes(response.data);
                }
            });

            // [TAMBAHAN KODE] Tangkap Aplikasi Offline & injek ke Memori
            newSocket.on('engine:apps_list', (response) => {
                if (response && response.data) {
                    const appStore = useAppStore();
                    appStore.registerLocalApps(response.data);
                }
            });

            newSocket.on('engine:vitals', (vitals) => {
                engineVitals.value = vitals;
                currentEngineStatus.value = {
                    isBusy: vitals.is_busy || false,
                    cpuPercent: vitals.cpu_percent || 0,
                    memoryPercent: vitals.memory_percent || 0
                };
            });

            newSocket.on('disconnect', () => {
                console.warn('[Socket] Terputus dari Local Engine.');
                currentEngineStatus.value = { isBusy: false, cpuPercent: null, memoryPercent: null };

                // [TAMBAHAN KODE] Bersihkan etalase jika PC mati
                const appStore = useAppStore();
                appStore.clearLocalApps();
            });

        } catch (error) {
            isConnecting.value = false;
            isGracePeriod.value = false;
        }
    }

    function disconnect() {
        if (socket.value) {
            socket.value.disconnect();
            socket.value = null;
        }
        isConnecting.value = false;
        connectionError.value = null;
        resolvedGatewayUrl.value = null;
        currentEngineStatus.value = { isBusy: false, cpuPercent: null, memoryPercent: null };
        engineVitals.value = null;
        isGracePeriod.value = false;

        // [TAMBAHAN KODE] Bersihkan memori manual putus
        const appStore = useAppStore();
        appStore.clearLocalApps();
    }

    async function sendMessage(payload) {
        if (!isConnected.value || !socket.value) {
            useUiStore().showConnectEngineDialog();
            throw new Error("Socket not connected");
        }

        const eventName = payload.type;
        if (!eventName) return;

        if (!payload.target_engine_id) {
            payload.target_engine_id = localStorage.getItem('flowork_selected_engine_id');
        }

        const versionedPayload = {
            v: PAYLOAD_VERSION,
            payload: { ...payload }
        };
        try {
            socket.value.emit(eventName, versionedPayload);
        } catch (error) {
            console.error(`[SocketStore] Error emitting '${eventName}':`, error);
        }
    }

    function pickFolder() {
        return new Promise((resolve, reject) => {
            if (!isConnected.value || !socket.value) {
                reject(new Error("Engine tidak terhubung."));
                return;
            }

            const reqId = Date.now().toString();
            const eventName = `engine_folder_picked_${reqId}`;

            const listener = (response) => {
                socket.value.off(eventName, listener);
                if (response && response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response ? response.path : null);
                }
            };

            socket.value.on(eventName, listener);
            socket.value.emit('engine:pick_folder', { request_id: reqId });
        });
    }

    async function dispatchAppEvent(appId, eventName, eventData = {}) {
        if (!isConnected.value) return;

        const payload = {
            type: 'gw:dispatch_event',
            payload: {
                event_name: eventName,
                event_data: eventData,
                source: 'gui_user_action',
                target_app_id: appId
            }
        };

        await sendMessage(payload);
    }

    function switchEngine(newEngineId) {
        if (isConnected.value || socket.value) {
            socket.value.disconnect();
            socket.value = null;
        }
        localStorage.setItem('flowork_selected_engine_id', newEngineId);
        setTimeout(() => { connect(); }, 200);
    }

    return {
        socket, isConnected, isConnecting, connectionError, resolvedGatewayUrl,
        currentEngineStatus, engineVitals, isDevEngine, isGracePeriod,
        connect, disconnect, sendMessage, switchEngine,
        joinAgentSession, sendAgentInput,
        dispatchAppEvent,
        pickFolder
    };
});
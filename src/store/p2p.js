//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/store/p2p.js
//#1. File ini menggantikan socket.js (Arsitektur WebRTC P2P).
//#2. Menjalin koneksi peer-to-peer langsung ke Local Engine pengguna.
//#######################################################################

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUiStore } from './ui';
import { getGatewayUrl } from '@/api';

const PAYLOAD_VERSION = '1.0';
export const useP2PStore = defineStore('p2p', () => {
    // State WebRTC & Signaling
    const peerConnection = ref(null);
    const dataChannel = ref(null);
    const signalingSocket = ref(null); // Hanya dipakai sementara untuk jabat tangan

    // State UI & Status
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

    const isConnected = computed(() => dataChannel.value?.readyState === 'open');
    const isDevEngine = computed(() => {
        return false; // [ADD] Fallback sementara
    });

    const joinAgentSession = async () => {};
    const sendAgentInput = async () => {};

    const rtcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    async function connect() {
        if (isConnected.value || isConnecting.value) return;

        isConnecting.value = true;
        isGracePeriod.value = true;
        connectionError.value = null;

        const gatewayUrl = getGatewayUrl();
        resolvedGatewayUrl.value = gatewayUrl;

        if (gatewayUrl.includes('localhost') || gatewayUrl.includes('127.0.0.1')) {
            console.log('[P2P] Mode Offline Lokal terdeteksi. Melewati WebRTC Signaling.');
            isConnecting.value = false;
            return;
        }

        let wssUrl = gatewayUrl.replace(/^http/, 'ws') + '/signaling';
        signalingSocket.value = new WebSocket(wssUrl);

        signalingSocket.value.onopen = () => {
            console.log('[P2P] Tersambung ke Signaling Server. Memulai Jabat Tangan WebRTC...');
            let targetEngineId = localStorage.getItem('flowork_selected_engine_id'); // [ADD] Baca langsung dari storage
            signalingSocket.value.send(JSON.stringify({ type: 'join_room', engine_id: targetEngineId }));
            setupWebRTC();
        };

        signalingSocket.value.onmessage = async (message) => {
            const data = JSON.parse(message.data);
            if (!peerConnection.value) return;

            try {
                if (data.type === 'offer') {
                    await peerConnection.value.setRemoteDescription(new RTCSessionDescription(data.offer));
                    const answer = await peerConnection.value.createAnswer();
                    await peerConnection.value.setLocalDescription(answer);
                    signalingSocket.value.send(JSON.stringify({ type: 'answer', answer: answer }));
                } else if (data.type === 'answer') {
                    await peerConnection.value.setRemoteDescription(new RTCSessionDescription(data.answer));
                } else if (data.type === 'candidate') {
                    await peerConnection.value.addIceCandidate(new RTCIceCandidate(data.candidate));
                }
            } catch (err) {
                console.error('[P2P] Kesalahan Signaling:', err);
            }
        };

        signalingSocket.value.onerror = (err) => {
            console.error('[P2P] Signaling Error:', err);
            isConnecting.value = false;
        };
    }

    function setupWebRTC() {
        peerConnection.value = new RTCPeerConnection(rtcConfig);
        peerConnection.value.onicecandidate = (event) => {
            if (event.candidate && signalingSocket.value.readyState === WebSocket.OPEN) {
                signalingSocket.value.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
            }
        };

        dataChannel.value = peerConnection.value.createDataChannel('flowork-engine-channel');
        dataChannel.value.onopen = () => {
            console.log('%c[P2P] 🟢 KONEKSI P2P DATA CHANNEL TERBUKA! Komunikasi sekarang murni Offline/Direct.', "color: #00E676; font-weight: bold;");
            isConnecting.value = false;
            if (signalingSocket.value) {
                signalingSocket.value.close();
                signalingSocket.value = null;
            }
        };

        dataChannel.value.onmessage = (event) => {
            const response = JSON.parse(event.data);
            console.log('[P2P] Menerima data dari Local Engine:', response);

            // [TAMBAHAN KODE] Memancarkan Event Global ke Window
            // Agar systemBridge.js dan UI bisa menangkap balasan P2P secara spesifik (seperti Socket.io .once)
            if (response.task_id) {
                window.dispatchEvent(new CustomEvent(`engine_task_result_${response.task_id}`, { detail: response }));
            } else if (response.type) {
                window.dispatchEvent(new CustomEvent(response.type, { detail: response }));
            }
        };

        dataChannel.value.onclose = () => {
            console.log('[P2P] 🔴 P2P Channel Tertutup');
            disconnect();
        };

        peerConnection.value.createOffer().then(offer => {
            peerConnection.value.setLocalDescription(offer);
            signalingSocket.value.send(JSON.stringify({ type: 'offer', offer: offer }));
        });
    }

    function disconnect() {
        if (dataChannel.value) {
            dataChannel.value.close();
            dataChannel.value = null;
        }
        if (peerConnection.value) {
            peerConnection.value.close();
            peerConnection.value = null;
        }
        if (signalingSocket.value) {
            signalingSocket.value.close();
            signalingSocket.value = null;
        }
        isConnecting.value = false;
        connectionError.value = null;
        resolvedGatewayUrl.value = null;
        currentEngineStatus.value = { isBusy: false, cpuPercent: null, memoryPercent: null };
        engineVitals.value = null;
        isGracePeriod.value = false;
    }

    async function sendMessage(payload) {
        if (!isConnected.value || !dataChannel.value) {
            useUiStore().showConnectEngineDialog();
            throw new Error("P2P Data Channel not connected");
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
            console.log(`%c[P2P Store] SENDING ${eventName}:`, "color: #FFA000; font-weight: bold;", versionedPayload);
            dataChannel.value.send(JSON.stringify(versionedPayload));
        } catch (error) {
            console.error(`[P2P Store] Error sending '${eventName}':`, error);
        }
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

        console.log(`%c[Nervous P2P] Dispatching to App ${appId}: ${eventName}`, "color: #e91e63", eventData);
        await sendMessage(payload);
    }

    function switchEngine(newEngineId) {
        console.log(`%c[P2P Store] PURGE MODE: Switching to ${newEngineId}`, "color: #FFD600; font-weight: bold;");
        disconnect();
        localStorage.setItem('flowork_selected_engine_id', newEngineId); // [ADD] Fallback save state
        setTimeout(() => { connect(); }, 200);
    }

    return {
        peerConnection, dataChannel, isConnected, isConnecting, connectionError, resolvedGatewayUrl,
        currentEngineStatus, engineVitals, isDevEngine, isGracePeriod,
        connect, disconnect, sendMessage, switchEngine,
        joinAgentSession, sendAgentInput,
        dispatchAppEvent
    };
});
//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/store/apps.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { defineStore } from 'pinia';
import { apiClient } from '@/api';

const getRegistryCacheKey = (device) => `flowork_registry_${device || 'desktop'}_v1`;

export const useAppStore = defineStore('apps', {
    state: () => ({
        installedApps: [],
        customCanvasApps: JSON.parse(localStorage.getItem('flowork_custom_apps') || '[]'),
        localEngineApps: [],
        isLoading: false,
        engineInstallProgress: {},
        activeApps: [],
        isSyncing: false,
        currentTab: null,
        recentApps: JSON.parse(localStorage.getItem('flowork_recent_apps') || '[]'),
        deviceType: 'desktop',
        registryVersion: 'unknown',
        favoriteIds: JSON.parse(localStorage.getItem('flowork_favorites') || '[]'),
        searchQuery: ''
    }),

    getters: {
        getAppById: (state) => (id) => state.installedApps.find(a => a.id === id) || state.customCanvasApps.find(a => a.id === id) || state.localEngineApps.find(a => a.id === id),
        getAppBySlug: (state) => (slug) => state.installedApps.find(a => a.slug === slug || a.id === slug) || state.customCanvasApps.find(a => a.slug === slug || a.id === slug) || state.localEngineApps.find(a => a.slug === slug || a.id === slug),

        // [FIXED] Saring mutlak: Jika tipe device Mobile, buang semua yang berstatus "android": "no"
        getFilteredApps: (state) => {
            if (state.deviceType === 'mobile') {
                return state.installedApps.filter(app => app.android !== 'no');
            }
            return state.installedApps.filter(app => app.desktop !== 'no');
        },

        getFavoriteAppsList: (state) => {
            if (state.deviceType === 'mobile') {
                return state.installedApps.filter(app => state.favoriteIds.includes(app.id) && app.android !== 'no');
            }
            return state.installedApps.filter(app => state.favoriteIds.includes(app.id) && app.desktop !== 'no');
        }
    },

    actions: {
        registerLocalApps(apps) {
            this.localEngineApps = [];
            if (apps && apps.length > 0) {
                const mappedApps = apps.map(app => ({
                    ...app,
                    id: app.id || app.name?.toLowerCase().replace(/\s+/g, '-') || 'local-app',
                    name: app.name || 'Untitled Local App',
                    is_local: true,
                    desktop: 'yes',
                    category: app.category || 'Local Script',
                    // [FIXED] 127.0.0.1 diganti localhost agar lolos mixed content HTTPS
                    path: `http://localhost:5000/local-apps/${app.id}`
                }));
                this.localEngineApps.push(...mappedApps);
                console.log(`[AppStore] ${mappedApps.length} Aplikasi Local PC berhasil disuntikkan ke Memori Global.`);
            }
        },

        clearLocalApps() {
            this.localEngineApps = [];
        },

        saveCustomApp(appData) {
            const index = this.customCanvasApps.findIndex(a => a.id === appData.id);
            if (index !== -1) {
                this.customCanvasApps.splice(index, 1, appData);
            } else {
                this.customCanvasApps.push(appData);
            }
            localStorage.setItem('flowork_custom_apps', JSON.stringify(this.customCanvasApps));
        },

        deleteCustomApp(appId) {
            this.customCanvasApps = this.customCanvasApps.filter(a => a.id !== appId);
            localStorage.setItem('flowork_custom_apps', JSON.stringify(this.customCanvasApps));
        },

        importCustomApps(appsArray) {
            if (!Array.isArray(appsArray)) return;
            appsArray.forEach(newApp => {
                const index = this.customCanvasApps.findIndex(a => a.id === newApp.id);
                if (index !== -1) {
                    this.customCanvasApps.splice(index, 1, newApp);
                } else {
                    this.customCanvasApps.push(newApp);
                }
            });
            localStorage.setItem('flowork_custom_apps', JSON.stringify(this.customCanvasApps));
        },

        setDeviceType(type) {
            if (this.deviceType !== type) {
                this.deviceType = type;
                this.installedApps = [];
            }
        },

        setCurrentTab(instanceId) { this.currentTab = instanceId; },
        setSearchQuery(query) { this.searchQuery = query; },
        toggleFavorite(appId) {
            if (!appId) return;

            if (this.favoriteIds.includes(appId)) {
                this.favoriteIds = this.favoriteIds.filter(id => id !== appId);
            } else {
                this.favoriteIds.push(appId);
            }

            localStorage.setItem('flowork_favorites', JSON.stringify(this.favoriteIds));
        },

        addToRecent(appId) {
            if (!appId) return;
            try {
                let recents = [...this.recentApps];
                recents = recents.filter(id => id !== appId);
                recents.unshift(appId);
                if (recents.length > 20) recents = recents.slice(0, 20);
                this.recentApps = recents;
                localStorage.setItem('flowork_recent_apps', JSON.stringify(recents));
            } catch (e) {
                console.error("Failed to save recent app", e);
            }
        },

        async fetchInstalledApps(force = false) {
            if (this.installedApps.length > 0 && !force) return;
            this.isLoading = true;
            let localApps = [];
            let cloudApps = [];

            const device = this.deviceType || 'desktop';
            const cacheKey = getRegistryCacheKey(device);
            const cachedRegistry = localStorage.getItem(cacheKey);

            if (cachedRegistry) {
                try {
                    const parsedCache = JSON.parse(cachedRegistry);
                    const appsData = Array.isArray(parsedCache) ? parsedCache : (parsedCache.apps || []);
                    const versionData = Array.isArray(parsedCache) ? 'legacy' : (parsedCache.meta?.version || 'v0');

                    this.registryVersion = versionData;
                    console.log(`[AppStore] Loaded from cache for ${device} (${this.registryVersion})`);

                    cloudApps = this._hydrateAppsData(appsData, versionData);
                    this._mergeAndSetApps(localApps, cloudApps);
                } catch (e) {
                    console.error("[AppStore] Cache corrupt, clearing.", e);
                    localStorage.removeItem(cacheKey);
                }
            }

            try {
                let registryReq = await fetch(`/store/registry.json?t=${Date.now()}`).catch(() => null);
                if (registryReq && registryReq.ok) {
                    const liveData = await registryReq.json();
                    const liveApps = Array.isArray(liveData) ? liveData : (liveData.apps || []);
                    const liveVersion = Array.isArray(liveData) ? 'legacy' : (liveData.meta?.version || 'v1');

                    console.log(`[AppStore] Syncing fresh registry data for ${device}...`);
                    localStorage.setItem(cacheKey, JSON.stringify(liveData));
                    this.registryVersion = liveVersion;

                    cloudApps = this._hydrateAppsData(liveApps, liveVersion);
                    this._mergeAndSetApps(localApps, cloudApps);
                }
            } catch (error) {
                console.warn("[AppStore] Network fetch failed, using offline data.", error);
            }

            this.isLoading = false;
        },

        _hydrateAppsData(rawApps, versionTag) {
            const device = this.deviceType || 'desktop';
            return rawApps.map(item => {
                const vQuery = versionTag ? `?v=${versionTag}` : '';
                const baseDir = `/store`;

                const slug = item.slug || item.id || item.short_name || (item.name ? item.name.toLowerCase().replace(/\s+/g, '-') : 'unknown-app');
                const appFolder = `${baseDir}/${slug}`;

                const desktopEntryPoint = item.action?.default_popup || item.entry_point || 'index.html';
                const mobileEntryPoint = item.entry_point_mobile || item.background?.service_worker || item.entry_point || 'logic.js';

                const finalTargetUrl = device === 'mobile' ? `${appFolder}/${mobileEntryPoint}` : `${appFolder}/${desktopEntryPoint}`;

                return {
                    ...item,
                    source: 'cloud',
                    id: item.id || slug,
                    slug: slug,
                    iconUrl: `${appFolder}/icon.svg${vQuery}`,
                    coverUrl: `${appFolder}/cover_mobile.webp${vQuery}`,

                    targetUrl: finalTargetUrl,
                    category: item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Productivity',
                    path: appFolder
                };
            });
        },

        _mergeAndSetApps(localApps, cloudApps) {
            const allApps = [...localApps, ...cloudApps];
            const uniqueApps = new Map();
            allApps.forEach(app => {
                if (!uniqueApps.has(app.id)) {
                    if (!app.iconUrl && app.icon) app.iconUrl = app.icon;
                    uniqueApps.set(app.id, app);
                }
            });
            this.installedApps = Array.from(uniqueApps.values());
        },

        async openApp(appId) {
            if (this.installedApps.length === 0) await this.fetchInstalledApps();
            this.addToRecent(appId);
            const app = this.getAppById(appId);
            if (!app) return;
            const existing = this.activeApps.find(a => a.id === appId);
            if (!existing) {
                const newInstanceId = `app-${Date.now()}`;
                this.activeApps.push({ ...app, instanceId: newInstanceId });
                this.currentTab = newInstanceId;
                this.syncRemoteState();
            } else {
                this.currentTab = existing.instanceId;
            }
        },

        async restoreRemoteState() {
            try {
                if (this.installedApps.length === 0) await this.fetchInstalledApps();
            } catch (error) {}
        },

        async syncRemoteState() {
             if (this.isSyncing) return;
             this.isSyncing = true;
             try {
             } catch(e) {} finally { this.isSyncing = false; }
        },

        closeApp(instanceId) {
            this.activeApps = this.activeApps.filter(a => a.instanceId !== instanceId);
            if (this.currentTab === instanceId) {
                this.currentTab = this.activeApps.length ? this.activeApps[this.activeApps.length - 1].instanceId : null;
            }
            this.syncRemoteState();
        }
    }
});
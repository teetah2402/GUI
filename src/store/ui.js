//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\store\ui.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';

export const useUiStore = defineStore('ui', () => {
  const isToolboxOpen = ref(true);
  const activeRightPanel = ref(null);
  const isPropertiesPanelPinned = ref(false);
  const savedPinState = localStorage.getItem('ui_footer_pinned');
  const isFooterPinned = ref(savedPinState === 'true');
  const isDataViewerVisible = ref(false);
  const dataViewerContent = ref({});
  const notifications = ref([]);
  const designerMode = ref('logic');
  const isConnectEngineDialogVisible = ref(false);
  const isStandaloneRunnerVisible = ref(false);
  const standaloneRunnerComponent = ref(null);
  const isCommandPaletteVisible = ref(false);

  // [NEW] Global State for Mobile Header & Dock (To fix the Gap issue)
  const isMobileHeaderOpen = ref(true);
  const isMobileDockOpen = ref(true);

  const varInputDialog = ref({
    visible: false,
    appName: '',
    requiredKeys: [],
    resolve: null
  });

  const savedTheme = localStorage.getItem('flowork_os_theme');
  const currentTheme = ref(savedTheme || 'dark');

  const currentLang = ref(localStorage.getItem('flowork_lang') || localStorage.getItem('user_lang') || 'en');

  const availableThemes = [
    { id: 'dark', name: 'Cyberpunk', icon: 'mdi-robot', color: '#00f5ff' },
    { id: 'light', name: 'Corporate', icon: 'mdi-white-balance-sunny', color: '#ffffff' },
  ];

  const availableLanguages = [
    { id: 'id', name: 'Indonesia (Asyik)', icon: '🇮🇩' },
    { id: 'en', name: 'English (Formal)', icon: '🇺🇸' },
  ];

  const confirmation = ref({
    visible: false,
    title: 'Confirm',
    text: 'Are you sure?',
    color: 'warning',
    icon: 'mdi-alert-outline',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    resolve: null,
  });

  const tokenDialog = ref({
    visible: false,
    title: 'Your Token',
    text: 'Please copy this token.',
    items: []
  });

  // [NEW] Methods to toggle mobile panels
  function toggleMobileHeader() { isMobileHeaderOpen.value = !isMobileHeaderOpen.value; }
  function toggleMobileDock() { isMobileDockOpen.value = !isMobileDockOpen.value; }

  function toggleToolbox() { isToolboxOpen.value = !isToolboxOpen.value; }

  function setActiveRightPanel(panelName) {
    if (activeRightPanel.value === panelName) {
      activeRightPanel.value = null;
    } else {
      activeRightPanel.value = panelName;
    }
  }

  function closeRightPanel() {
    if (isPropertiesPanelPinned.value && activeRightPanel.value === 'properties') {
      return;
    }
    activeRightPanel.value = null;
  }

  function togglePropertiesPanelPin() {
    isPropertiesPanelPinned.value = !isPropertiesPanelPinned.value;
    if (isPropertiesPanelPinned.value && activeRightPanel.value !== 'properties') {
      activeRightPanel.value = 'properties';
    }
  }

  async function setFooterPin(isPinned) {
      isFooterPinned.value = isPinned;
      localStorage.setItem('ui_footer_pinned', isPinned);
      try {
      } catch (e) {
          console.error("[UI Store] Failed to sync pin state to server:", e);
      }
  }

  function loadUiPreferences(settingsData) {
      if (settingsData && settingsData.ui_footer_pinned !== undefined) {
          const serverVal = settingsData.ui_footer_pinned;
          isFooterPinned.value = serverVal;
          localStorage.setItem('ui_footer_pinned', serverVal);
      }
  }

  function toggleTheme() {
    const themes = ['light', 'dark'];
    const currentIndex = themes.indexOf(currentTheme.value);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }

  function setTheme(themeId) {
    currentTheme.value = themeId;
    document.documentElement.setAttribute('data-theme', themeId);
    requestAnimationFrame(() => {
        localStorage.setItem('flowork_os_theme', themeId);
        broadcastToApps('THEME_CHANGE', themeId);
    });
  }

  function setLanguage(langId) {
    currentLang.value = langId;
    localStorage.setItem('flowork_lang', langId);
    localStorage.setItem('user_lang', langId);
    broadcastToApps('LANG_CHANGE', langId);
  }

  function initTheme() {
    const t = currentTheme.value;
    document.documentElement.setAttribute('data-theme', t);
  }

  function broadcastToApps(type, value) {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: type,
                payload: value
            }, '*');
        }
    });
  }

  function showDataViewer(data) {
    dataViewerContent.value = data;
    isDataViewerVisible.value = true;
  }

  function hideDataViewer() {
    isDataViewerVisible.value = false;
    dataViewerContent.value = {};
  }

  function showNotification({ text, color = 'info', timeout = 2000 }) {
    const id = uuidv4();
    notifications.value.unshift({ id, text, color, timeout, model: true });

    if (notifications.value.length > 5) {
        notifications.value.pop();
    }

    if (timeout > 0) {
        setTimeout(() => {
            removeNotification(id);
        }, timeout);
    }
  }

  function removeNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  }

  function setDesignerMode(mode) {
    designerMode.value = mode;
  }

  function showConnectEngineDialog() {
    isConnectEngineDialogVisible.value = true;
  }

  function hideConnectEngineDialog() {
    isConnectEngineDialogVisible.value = false;
  }

  function showStandaloneRunner(componentData) {
    standaloneRunnerComponent.value = componentData;
    isStandaloneRunnerVisible.value = true;
  }

  function hideStandaloneRunner() {
    isStandaloneRunnerVisible.value = false;
    setTimeout(() => {
        standaloneRunnerComponent.value = null;
    }, 300);
  }

  function showCommandPalette() {
    isCommandPaletteVisible.value = true;
  }
  function hideCommandPalette() {
    isCommandPaletteVisible.value = false;
  }

  function showConfirmation(options = {}) {
    return new Promise((resolve) => {
        confirmation.value = {
            visible: true,
            title: options.title || 'Confirm Action',
            text: options.text || 'Are you sure you want to proceed?',
            color: options.color || 'warning',
            icon: options.icon || 'mdi-alert-outline',
            confirmText: options.confirmText || 'Confirm',
            cancelText: options.cancelText || 'Cancel',
            resolve: resolve,
        };
    });
  }

  function answerConfirmation(response) {
    if (confirmation.value.resolve) {
      confirmation.value.resolve(response);
    }
    confirmation.value.visible = false;
  }

  function showTokenDialog(options = {}) {
    tokenDialog.value = {
        visible: true,
        title: options.title || 'Your Token',
        text: options.text || 'Please copy the following credentials:',
        items: options.items || []
    };
  }

  function hideTokenDialog() {
    tokenDialog.value.visible = false;
  }

  function promptGuestVariables(appName, keys) {
      return new Promise((resolve) => {
          varInputDialog.value = {
              visible: true,
              appName,
              requiredKeys: keys,
              resolve
          };
      });
  }

  function closeVariableDialog(success = false) {
      if (varInputDialog.value.resolve) varInputDialog.value.resolve(success);
      varInputDialog.value.visible = false;
  }

  return {
    isToolboxOpen,
    activeRightPanel,
    isPropertiesPanelPinned,
    isFooterPinned,
    isDataViewerVisible,
    dataViewerContent,
    notifications,
    designerMode,
    isConnectEngineDialogVisible,
    isStandaloneRunnerVisible,
    standaloneRunnerComponent,
    isCommandPaletteVisible,
    confirmation,
    tokenDialog,
    varInputDialog,
    currentTheme,
    currentLang,
    availableThemes,
    availableLanguages,
    isMobileHeaderOpen, // [NEW]
    isMobileDockOpen,   // [NEW]
    toggleMobileHeader, // [NEW]
    toggleMobileDock,   // [NEW]
    toggleTheme,
    setTheme,
    setLanguage,
    initTheme,
    showCommandPalette,
    hideCommandPalette,
    toggleToolbox,
    setActiveRightPanel,
    closeRightPanel,
    togglePropertiesPanelPin,
    setFooterPin,
    loadUiPreferences,
    showDataViewer,
    hideDataViewer,
    showNotification,
    removeNotification,
    setDesignerMode,
    showConnectEngineDialog,
    hideConnectEngineDialog,
    showStandaloneRunner,
    hideStandaloneRunner,
    showConfirmation,
    answerConfirmation,
    showTokenDialog,
    hideTokenDialog,
    promptGuestVariables,
    closeVariableDialog,
    broadcastToApps
  };
});
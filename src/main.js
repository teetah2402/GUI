//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\main.js total lines 102
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { createApp, defineAsyncComponent } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import './styles/main.css'
import { createVuetify } from 'vuetify'
import router from './router/index.js'
const Ads = defineAsyncComponent(() => import('@/components/Ads.vue'));

const floworkThemes = {
  themes: {
    flowork_default: {
      dark: true,
      colors: {
        background: '#1a1a2e',
        surface: '#2a2a4a',
        primary: '#64ffda',
        secondary: '#a59dff',
        error: '#ff5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FB8C00',
      }
    }
  }
}

const vuetify = createVuetify({
  components: {},
  directives: {},
  theme: floworkThemes
})

async function initializeApp() {
  const appElement = document.getElementById('app');
  if (appElement) {
    console.log('[Flowork] Booting System...');

    try {
        const app = createApp(App);
        const pinia = createPinia();
        app.use(pinia);
        // ZOMBIE CODE: const authStore = useAuthStore();
        app.component('Ads', Ads);

        try {
        } catch (err) {
            console.warn('[Warn] Locale load failed, using fallback.', err);
        }

        app.use(router);
        app.use(vuetify);

        try {
            // ZOMBIE CODE: await authStore.tryAutoLogin();
        } catch (err) {
            console.warn('[Warn] Auto-login check failed.', err);
        }
        app.mount('#app');
        console.log('[Flowork] GUI Mounted Successfully.');

    } catch (criticalError) {
        console.error('[CRITICAL] App Crash:', criticalError);
        const loader = document.getElementById('app-loading');
        if(loader) loader.style.display = 'none';
        appElement.innerHTML = `<div style="color:red; padding:20px; text-align:center;">SYSTEM ERROR: ${criticalError.message}<br>Check Console (F12)</div>`;
    }
  }
}

initializeApp();
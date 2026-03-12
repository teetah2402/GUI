//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\components\CookieConsentBanner.vue total lines 128 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <v-snackbar
    v-model="showBanner"
    :timeout="-1"
    location="bottom"
    color="transparent"
    class="cookie-banner-centered"
    content-class="cookie-content-wrapper"
    max-width="600"
    vertical
    style="z-index: 99999;"
  >
    <div class="glass-banner">
      <div class="banner-content">
        <p class="text-subtitle-2 mb-3 text-white text-center font-weight-medium" style="line-height: 1.5;">
          This website uses cookies to ensure you get the best experience.
        </p>

        <router-link to="/privacy-policy" class="privacy-link" aria-label="Read our Privacy Policy">
          Read Privacy Policy
        </router-link>
      </div>

      <div class="banner-actions">
        <button
          @click="acceptCookies"
          class="accept-btn"
        >
          ACCEPT
        </button>
      </div>
    </div>
  </v-snackbar>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const showBanner = ref(false);

onMounted(() => {
  const hasConsent = localStorage.getItem('flowork_cookies_accepted');

  if (!hasConsent) {
    setTimeout(() => {
      showBanner.value = true;
    }, 4000);
  }
});

function acceptCookies() {
  localStorage.setItem('flowork_cookies_accepted', 'true');
  showBanner.value = false;
}
</script>

<style scoped>
.cookie-banner-centered {
  margin-bottom: 20px;
}

/* [OPTIMASI CSS] Custom Glassmorphism Card yang Ringan */
.glass-banner {
  background: rgba(5, 5, 5, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  contain: content; /* Memberitahu browser ini elemen isolasi */
}

.banner-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.privacy-link {
  color: #00dc82; /* Vue Green */
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 700;
  border-bottom: 1px dashed rgba(0, 220, 130, 0.5);
  transition: opacity 0.2s;
}

.privacy-link:hover { opacity: 0.8; }

.banner-actions { width: 100%; }

/* Native Button untuk Performa (v-btn agak berat di render awal) */
.accept-btn {
  width: 100%;
  height: 48px;
  background-color: #FFD700; /* Gold */
  color: #000;
  font-weight: 800;
  font-size: 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: transform 0.1s;
}

.accept-btn:active { transform: scale(0.98); }

/* Overwrite Vuetify Snackbar defaults */
:deep(.v-snackbar__content) { padding: 0 !important; }
:deep(.v-snackbar__wrapper) {
  background: transparent !important;
  box-shadow: none !important;
  min-width: auto !important;
}
</style>

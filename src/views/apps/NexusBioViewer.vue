//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\apps\NexusBioViewer.vue total lines 200 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div id="nexus-root" class="nexus-viewer-root">

    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <div v-if="error" class="error-screen">
      <h2>USER NOT FOUND</h2>
      <p>Bio link tidak ditemukan atau terjadi kesalahan.</p>
      <router-link to="/" class="back-link">Kembali ke Home</router-link>
    </div>

    <div v-if="!loading && !error && userData" class="theme-wrapper">
      <div class="container">
        <img
          :src="getAvatar(userData.avatar)"
          :alt="userData.name"
          class="avatar"
        >

        <h1>{{ userData.name }}</h1>
        <p v-if="userData.bio">{{ userData.bio }}</p>

        <div class="links-container">
          <a
            v-for="(link, index) in userData.links"
            :key="index"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="link-card"
          >
            {{ link.title }}
          </a>
        </div>

        <div class="nexus-footer" style="margin-top: 40px; font-size: 10px; opacity: 0.6; text-transform: uppercase;">
          Powered by Flowork
        </div>
      </div>
    </div>

    <component :is="'style'" v-if="themeCSS">{{ themeCSS }}</component>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const loading = ref(true);
const error = ref(false);
const userData = ref(null);
const themeCSS = ref('');

const getAvatar = (url) => {
  return (url && url.length > 5) ? url : "/images/cover_default.webp";
};

const sanitizeThemeCSS = (css) => {
    if (!css) return '';

    let fixedCSS = css.replace(/(^|\s|\}|,)body(?=\s|\{|,)/gi, '$1#nexus-root');

    fixedCSS = fixedCSS.replace(/(^|\s|\}|,)html(?=\s|\{|,)/gi, '$1#nexus-root');

    fixedCSS = fixedCSS.replace(/position:\s*fixed/gi, 'position: absolute');

    fixedCSS = fixedCSS.replace(/100vh/gi, '100%');
    fixedCSS = fixedCSS.replace(/height:\s*100%/gi, 'min-height: 100%');

    return fixedCSS;
};

const loadTheme = (themeName, data) => {
  return new Promise((resolve) => {
    window.registerTheme = (themeObj) => {
      if (themeObj && typeof themeObj.css === 'function') {
        const rawCSS = themeObj.css(data);

        themeCSS.value = sanitizeThemeCSS(rawCSS);

        resolve(true);
      } else {
        console.warn('Theme CSS generator not found');
        resolve(false);
      }
    };

    const script = document.createElement('script');
    script.src = `/store/nexus-link/themes/${themeName}.js`;
    script.onload = () => {
      if(script.parentNode) script.parentNode.removeChild(script);
    };
    script.onerror = () => {
      console.error(`Gagal load tema: ${themeName}`);
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

onMounted(async () => {
  const handle = route.params.handle;
  if (!handle) {
    error.value = true;
    loading.value = false;
    return;
  }

  try {
    const res = await fetch(`/api/v1/nexus-bio/get?handle=${handle}&t=${Date.now()}`);
    if (!res.ok) throw new Error("API Error");

    const json = await res.json();
    if (!json.success) throw new Error("User Not Found");

    userData.value = json.data;
    const themeId = json.data.theme || 'glass';

    await loadTheme(themeId, json.data);

  } catch (e) {
    console.error(e);
    error.value = true;
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  delete window.registerTheme;
});
</script>

<style scoped>
/* [FIX] CONTAINER UTAMA - ISOLASI TOTAL */
#nexus-root {
  /* Pastikan container ini mengisi penuh parent-nya (Window Canvas atau Layar Browser) */
  width: 100%;
  height: 100%;
  min-height: 100%;

  /* Posisi relative agar anak-anaknya yang absolute terkurung di sini */
  position: relative;

  /* Aktifkan scroll di SINI, bukan di body */
  overflow-y: auto;
  overflow-x: hidden;

  /* Reset dasar */
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Pastikan semua elemen di dalam nexus-root menghormati box-sizing */
#nexus-root *,
#nexus-root *::before,
#nexus-root *::after {
  box-sizing: inherit;
}

/* LOADING & ERROR SCREEN */
/* Gunakan absolute + z-index tinggi agar menutupi konten tema saat loading */
.loading-overlay, .error-screen {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #000;
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  z-index: 9999;
  color: #fff;
}

.spinner {
  width: 40px; height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #00ff00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.back-link {
  margin-top: 20px;
  color: #00ff00;
  text-decoration: underline;
  cursor: pointer;
}
</style>

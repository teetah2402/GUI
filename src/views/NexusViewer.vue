//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\NexusViewer.vue total lines 115 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="nexus-viewer min-h-screen d-flex flex-column align-center pt-16 px-4">

    <div v-if="loading" class="text-center mt-12">
      <v-progress-circular indeterminate color="cyan" size="64"></v-progress-circular>
      <div class="mt-4 text-cyan mono-font">DECRYPTING NEXUS...</div>
    </div>

    <div v-else-if="error" class="text-center mt-12">
      <v-icon size="64" color="grey">mdi-ghost-off</v-icon>
      <h2 class="text-h5 text-white mt-4">User Not Found</h2>
      <v-btn to="/nexus/edit" variant="text" color="cyan" class="mt-2">Claim This Handle</v-btn>
    </div>

    <div v-else class="w-100 max-w-md animate-fade-in-up">

      <div class="text-center mb-8">
        <v-avatar size="100" class="elevation-10 border-cyan mb-4">
          <v-img :src="profile.avatarUrl || '/assets/icons/app_default.svg'" cover></v-img>
        </v-avatar>
        <h1 class="text-h4 font-weight-bold text-white">{{ profile.displayName }}</h1>
        <p class="text-grey-lighten-1 mt-2 text-body-1">{{ profile.bio }}</p>
      </div>

      <div class="d-flex flex-column gap-3">
        <a
          v-for="(link, i) in profile.links"
          :key="i"
          :href="link.url"
          target="_blank"
          class="nexus-link-card"
        >
          <span>{{ link.title }}</span>
          <v-icon icon="mdi-arrow-right" size="small" class="ml-2"></v-icon>
        </a>
      </div>

      <div class="text-center mt-12 opacity-50">
        <v-icon size="small" color="cyan">mdi-shield-check</v-icon>
        <span class="text-caption text-white ml-2">Secured by Flowork Nexus</span>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { unpackNexusData } from '@/utils/nexusCrypto';

const route = useRoute();
const loading = ref(true);
const error = ref(null);
const profile = ref(null);

onMounted(async () => {
  const handle = route.params.handle;

  try {
    const res = await fetch(`/api/v1/nexus/get/${handle}`);
    if (!res.ok) throw new Error("Not Found");
    const data = await res.json();

    const unpacked = unpackNexusData(data.encryptedData, handle);

    if (!unpacked) throw new Error("Gagal Dekripsi (Data Corrupt)");

    profile.value = unpacked;

  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.nexus-viewer {
  background: radial-gradient(circle at top, #1e293b 0%, #000000 100%);
  min-height: 100vh;
}
.max-w-md { max-width: 480px; margin: 0 auto; }
.border-cyan { border: 2px solid #00FFFF; }
.gap-3 { gap: 12px; }

.nexus-link-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  border-radius: 50px; /* Pill shape */
  color: white;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}
.nexus-link-card:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: #00FFFF;
  transform: scale(1.02);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}
.mono-font { font-family: 'JetBrains Mono', monospace; }
</style>

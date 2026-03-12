//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\apps\GhostReader.vue total lines 128 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="neural-reader-layout">
    <div class="reading-progress-bar" :style="{ width: scrollProgress + '%' }"></div>
    <div class="neural-bg-glow"></div>
    <div class="neural-grid-overlay"></div>

    <div v-if="isLoading" class="loading-overlay">
      <div class="scanner-line"></div>
      <div class="text-center relative z-10">
        <v-progress-circular indeterminate color="cyan-accent-3" size="80" width="2"></v-progress-circular>
        <h2 class="mt-6 text-h5 font-weight-black text-white tracking-[5px] orbitron-font animate-pulse">DECRYPTING</h2>
      </div>
    </div>

    <div v-else-if="error" class="error-overlay">
      <div class="glass-card-error text-center pa-10">
        <h1 class="text-h4 text-white font-weight-bold mb-2 orbitron-font">ACCESS DENIED</h1>
        <p class="text-grey-lighten-1 mb-6 font-mono">{{ error }}</p>
        <v-btn to="/quick-tools" color="red-accent-2" variant="outlined">ABORT MISSION</v-btn>
      </div>
    </div>

    <div v-else class="content-container animate-fade-up">
      <article class="neural-article-card">
        <header class="article-header">
          <div class="meta-tags mb-4">
            <span class="tag-pill">NEURAL INTEL</span>
            <span class="tag-date">{{ articleDate }}</span>
          </div>
          <h1 class="main-title gradient-text">{{ articleData.title || 'Encrypted Transmission' }}</h1>
        </header>

        <div v-if="articleData.image" class="featured-image-wrapper">
          <img :src="articleData.image" alt="Evidence" class="featured-image" />
          <div class="scan-overlay"></div>
        </div>

        <div class="article-body font-serif">
          <div v-if="articleData.isHtml" v-html="articleData.content" class="prose-content"></div>
          <div v-else class="whitespace-pre-wrap">{{ articleData.content }}</div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { decryptGhostData } from '@/utils/ghostCrypto';

const route = useRoute();
const isLoading = ref(true);
const error = ref('');
const scrollProgress = ref(0);
const articleData = ref({ title: '', content: '', image: null, timestamp: null, isHtml: false });

const updateScroll = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.offsetHeight - window.innerHeight;
  scrollProgress.value = (scrollTop / docHeight) * 100;
};

const articleDate = computed(() => {
  if (!articleData.value.timestamp) return 'Unknown Date';
  return new Date(articleData.value.timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
});

onMounted(async () => {
  window.addEventListener('scroll', updateScroll);
  const docId = route.params.p1 || route.params.id;
  const secretKey = window.location.hash.substring(1);

  if (!docId || !secretKey) {
    error.value = "Missing Decryption Keys.";
    isLoading.value = false;
    return;
  }

  try {
    const response = await fetch(`/api/v1/ghost/read/${docId}`);
    if (!response.ok) throw new Error("Data vanished.");
    const data = await response.json();
    const decryptedString = decryptGhostData(data.content, secretKey);
    if (!decryptedString) throw new Error("Decryption Failed.");

    try {
      const parsed = JSON.parse(decryptedString);
      articleData.value = {
        title: parsed.title || 'Secure Transmission',
        content: parsed.content || parsed.text || parsed,
        image: parsed.image,
        timestamp: parsed.created_at || parsed.timestamp,
        isHtml: !!parsed.title // Asumsi kalau ada title, format baru (HTML)
      };
    } catch (e) {
      articleData.value = { title: 'Decrypted Note', content: decryptedString, isHtml: false };
    }
  } catch (e) {
    error.value = e.message;
  } finally {
    setTimeout(() => isLoading.value = false, 800);
  }
});

onUnmounted(() => window.removeEventListener('scroll', updateScroll));
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&display=swap');
.neural-reader-layout { min-height: 100vh; background-color: #02040a; color: #e2e8f0; position: relative; font-family: 'Merriweather', serif; }
.neural-bg-glow { position: fixed; width: 100%; height: 100%; background: radial-gradient(circle at 50% 0%, rgba(0, 255, 255, 0.05) 0%, transparent 60%); z-index: 0; pointer-events: none; }
.content-container { position: relative; z-index: 10; max-width: 900px; margin: 0 auto; padding: 40px 20px; }
.neural-article-card { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
.main-title { font-family: 'Orbitron', sans-serif; font-size: 3rem; font-weight: 900; color: white; margin-bottom: 20px; }
.gradient-text { background: linear-gradient(135deg, #ffffff 0%, #a5f3fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.article-body { font-size: 1.15rem; line-height: 1.8; color: #cbd5e1; }
.prose-content :deep(h2) { font-family: 'Orbitron', sans-serif; color: #fff; font-size: 1.8rem; margin-top: 2.5rem; margin-bottom: 1rem; border-left: 4px solid cyan; padding-left: 1rem; }
.prose-content :deep(a.neural-btn) { display: inline-flex; align-items: center; gap: 8px; background: cyan; color: black !important; padding: 8px 20px; border-radius: 50px; font-weight: bold; text-decoration: none; margin: 10px 0; }
.loading-overlay, .error-overlay { position: fixed; inset: 0; background: #000; display: flex; justify-content: center; align-items: center; z-index: 100; flex-direction: column; }
@media (max-width: 768px) { .neural-article-card { padding: 20px; background: transparent; border: none; } .main-title { font-size: 2rem; } }
</style>

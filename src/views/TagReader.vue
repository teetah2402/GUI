<template>
  <div class="tag-wrapper" :style="themeStyles" :data-theme="uiStore.currentTheme">

    <div class="ambient-mesh">
      <div class="blob b1"></div>
      <div class="blob b2"></div>
    </div>
    <div class="noise-overlay"></div>

    <main class="tag-container">

      <nav class="top-nav-bar mb-6">
        <router-link to="/blog" class="btn-outline text-decoration-none">
          <i class="mdi mdi-arrow-left"></i> Back to Archive
        </router-link>
      </nav>

      <header class="tag-header mb-8 text-center">
        <div class="glitch-wrapper">
           <h1 class="display-title"><span class="text-mute text-sm block mb-2">TOPIC CLUSTER:</span> #{{ displayTag }}</h1>
        </div>
        <p class="tag-meta mt-2 text-mute">Found {{ filteredResults.length }} neural links matching this keyword across Blog & App Store.</p>
      </header>

      <div v-if="loading" class="text-center py-12">
        <div class="spinner-loader mx-auto mb-4"></div>
        <p class="text-mute">SCANNING NEURAL REGISTRY...</p>
      </div>

      <div v-else-if="filteredResults.length === 0" class="text-center py-12">
        <p class="font-mono" style="color: #ff5f56; font-size: 1.2rem;">Error 404: No correlation found for this tag.</p>
      </div>

      <div v-else class="masonry-wrapper">
        <div class="masonry-column" v-for="(col, colIndex) in masonryColumns" :key="colIndex">

          <router-link
            v-for="item in col"
            :key="item.uid"
            :to="item.url"
            class="result-card card-glass text-decoration-none disable-underline"
          >
            <div class="card-img-container">
               <div class="type-badge">{{ item.type }}</div>
               <img :src="item.image" :alt="item.title" class="card-img" loading="lazy" />
            </div>
            <div class="card-content">
              <h3 class="card-title line-clamp-2">{{ item.title }}</h3>
              <p class="card-desc text-mute mt-2">{{ item.desc }}</p>
              <div class="card-footer mt-4">
                <span class="view-btn text-accent">Access Terminal <i class="mdi mdi-arrow-right"></i></span>
              </div>
            </div>
          </router-link>

        </div>
      </div>
      <div class="super-footer-spacer"></div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUiStore } from '@/store/ui';

const route = useRoute();
const uiStore = useUiStore();

const tagSlug = ref('');
const displayTag = ref('');
const loading = ref(true);
const filteredResults = ref([]);

// [ADDED] Tracker Lebar Layar untuk JS Masonry Responsif
const windowWidth = ref(1200);
const updateWidth = () => {
  windowWidth.value = window.innerWidth;
};

// [ADDED] Hitung jumlah kolom berdasarkan lebar layar
const columnCount = computed(() => {
  if (windowWidth.value <= 600) return 1;
  if (windowWidth.value <= 900) return 2;
  if (windowWidth.value <= 1200) return 3;
  return 4; // Desktop = 4 Kolom
});

// [ADDED] Pecah array tunggal menjadi array kolom-kolom (True Masonry Logic)
const masonryColumns = computed(() => {
  const cols = Array.from({ length: columnCount.value }, () => []);
  // Bagi rata item dari kiri ke kanan (Round Robin Index)
  filteredResults.value.forEach((item, idx) => {
    cols[idx % columnCount.value].push(item);
  });
  return cols;
});

const themeStyles = computed(() => {
  const theme = uiStore.currentTheme;
  if (theme === 'light') {
    return { '--bg': '#f8fafc', '--text': '#0f172a', '--text-mute': '#475569', '--accent-1': '#e11d48', '--accent-2': '#06b6d4', '--glass': 'rgba(255, 255, 255, 0.85)', '--border': 'rgba(0, 0, 0, 0.1)', '--blob-1': '#0ea5e9', '--blob-2': '#eab308' };
  } else if (theme === 'hacker') {
     return { '--bg': '#000000', '--text': '#00ff00', '--text-mute': '#008f00', '--accent-1': '#00ff00', '--accent-2': '#00ff00', '--glass': 'rgba(0, 20, 0, 0.8)', '--border': 'rgba(0, 255, 0, 0.3)', '--blob-1': '#002200', '--blob-2': '#004400' };
  } else {
    return { '--bg': '#020204', '--text': '#ffffff', '--text-mute': '#94a3b8', '--accent-1': '#e11d48', '--accent-2': '#2dd4bf', '--glass': 'rgba(20, 20, 30, 0.85)', '--border': 'rgba(255, 255, 255, 0.15)', '--blob-1': '#22d3ee', '--blob-2': '#ffd700' };
  }
});

const normalizeString = (str) => {
  return str.trim().toLowerCase().replace(/[\s-]/g, '');
};

const fetchTagData = async () => {
  loading.value = true;
  let rawResults = [];
  tagSlug.value = route.params.tag || '';

  displayTag.value = tagSlug.value.replace(/-/g, ' ');
  document.title = `Tag: ${displayTag.value.toUpperCase()} | Flowork OS`;

  const targetCompare = normalizeString(tagSlug.value);

  try {
    const blogRes = await fetch('/content/blog/index.json', { cache: 'force-cache' });
    if (blogRes.ok) {
      const blogData = await blogRes.json();
      blogData.forEach(post => {
        if (post.keywords && Array.isArray(post.keywords)) {
          const match = post.keywords.some(k => normalizeString(k) === targetCompare);
          if (match) {
            rawResults.push({
              uid: `blog-${post.slug}`,
              type: 'Article',
              title: post.title,
              desc: post.description || '',
              url: `/blog/${post.slug}`,
              image: post.cover || '/images/cover.webp',
              date: post.date || ''
            });
          }
        }
      });
    }

    const flowRes = await fetch('/store/registry.json', { cache: 'force-cache' });
    if (flowRes.ok) {
      const flowRaw = await flowRes.json();
      const apps = Array.isArray(flowRaw) ? flowRaw : (flowRaw.apps || []);
      apps.forEach(app => {
        if (app.seo && app.seo.keywords && Array.isArray(app.seo.keywords)) {
          const match = app.seo.keywords.some(k => normalizeString(k) === targetCompare);
          if (match) {
            rawResults.push({
              uid: `flow-${app.slug || app.id}`,
              type: 'Module',
              title: app.seo.title || app.name,
              desc: app.seo.description || app.description || '',
              url: `/flow/${app.slug || app.id}`,
              image: app.seo.og_image ? `/store/${app.id || app.slug}/${app.seo.og_image}` : (app.icon || '/assets/icons/app_default.svg'),
              date: app.last_updated || ''
            });
          }
        }
      });
    }

    rawResults.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    let antreanArtikel = rawResults.filter(item => item.type === 'Article');
    let antreanModul = rawResults.filter(item => item.type === 'Module');
    let hasilPenyusunan = [];
    let posisiKartu = 1;

    while (antreanArtikel.length > 0 || antreanModul.length > 0) {
      if (posisiKartu % 3 === 0) {
        if (antreanModul.length > 0) {
          hasilPenyusunan.push(antreanModul.shift());
        } else if (antreanArtikel.length > 0) {
          hasilPenyusunan.push(antreanArtikel.shift());
        }
      } else {
        if (antreanArtikel.length > 0) {
          hasilPenyusunan.push(antreanArtikel.shift());
        } else if (antreanModul.length > 0) {
          hasilPenyusunan.push(antreanModul.shift());
        }
      }
      posisiKartu++;
    }

    filteredResults.value = hasilPenyusunan;

  } catch (e) {
    console.error("Tag mapping failed:", e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  uiStore.initTheme();
  updateWidth(); // Set initial width
  window.addEventListener('resize', updateWidth); // Listen for window resize
  fetchTagData();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
});

watch(() => route.params.tag, (newTag) => {
  if (newTag) {
    window.scrollTo(0,0);
    fetchTagData();
  }
});
</script>

<style scoped>
.tag-wrapper {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--bg);
  color: var(--text);
  font-family: 'Space Grotesk', sans-serif;
  position: relative;
  padding-top: 40px;
  scroll-behavior: smooth;
}

.noise-overlay { position: fixed; inset: 0; background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events: none; z-index: 0; mix-blend-mode: overlay; }
.ambient-mesh { position: fixed; inset: 0; z-index: 0; filter: blur(150px); opacity: 0.5; pointer-events: none; }
.blob { position: absolute; border-radius: 50%; animation: float 15s infinite ease-in-out; }
.b1 { width: 80vw; height: 80vw; background: var(--blob-1); top: -25%; left: -15%; opacity: 0.5; }
.b2 { width: 75vw; height: 75vw; background: var(--blob-2); bottom: -15%; right: -25%; opacity: 0.4; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

.tag-container { position: relative; z-index: 10; max-width: 1400px; margin: 0 auto; padding: 0 40px; }

a, .disable-underline { text-decoration: none !important; color: inherit; }
.disable-underline:hover { text-decoration: none !important; }

.top-nav-bar { display: flex; }
.btn-outline { background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: var(--text); padding: 10px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: 0.2s;}
.btn-outline:hover { background: rgba(255,255,255,0.08); border-color: var(--accent-1); color: var(--accent-1);}

.display-title { font-size: 3.5rem; line-height: 1.1; font-weight: 800; color: var(--text); margin:0; text-transform: uppercase;}
.text-mute { color: var(--text-mute); }
.text-accent { color: var(--accent-2); font-weight: bold; }
.text-center { text-align: center; }

/* =========================================================
   JS MASONRY CSS WRAPPER (TIDAK PAKAI COLUMN-COUNT LAGI)
========================================================= */
.masonry-wrapper {
  display: flex;
  flex-direction: row;
  gap: 30px;
  align-items: flex-start; /* Kunci agar kolom mepet ke atas dan ga melar setinggi baris */
  margin-top: 40px;
  width: 100%;
}

.masonry-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
  flex: 1; /* Membagi lebar rata 100% antar kolom */
  min-width: 0; /* Mencegah overflow aneh di Flexbox */
}

.card-glass {
  background: var(--glass);
  border: 1px solid var(--border);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100%;
}
.card-glass:hover { transform: translateY(-5px); border-color: var(--accent-2); box-shadow: 0 15px 30px rgba(0,0,0,0.3); }

/* ========================================================= */

.card-img-container {
  width: 100%;
  position: relative;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid var(--border);
}
.card-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.type-badge { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.8); border: 1px solid var(--accent-1); color: #fff; font-size: 0.7rem; font-family: monospace; font-weight: bold; padding: 4px 10px; border-radius: 20px; z-index: 2;}

.card-content { padding: 25px; display: flex; flex-direction: column; }
.card-title { font-size: 1.3rem; margin: 0; line-height: 1.3; color: var(--text); }
.card-desc { font-size: 0.9rem; line-height: 1.6; }
.card-footer { margin-top: auto; padding-top: 15px; display: flex; align-items: center; justify-content: space-between; }

.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.super-footer-spacer { height: 160px; }

@media (max-width: 600px) {
  .tag-container { padding: 0 20px; }
  .display-title { font-size: 2.5rem; }
}
</style>
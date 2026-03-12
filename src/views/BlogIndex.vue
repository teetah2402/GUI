<template>
  <div class="blog-wrapper" :style="themeStyles" :data-theme="uiStore.currentTheme">

    <div class="ambient-mesh">
      <div class="blob b1"></div>
      <div class="blob b2"></div>
      <div class="blob b3"></div>
    </div>
    <div class="noise-overlay"></div>

    <main class="news-portal-container">

      <header class="news-header">
        <div class="header-left">
          <div class="news-badge-main mb-3">ENGINEERING LOG</div>
          <h1 class="portal-title">Flowork <span class="accent-text">News.</span></h1>
        </div>
        <div class="header-right">
          <p class="portal-subtitle">Release notes, technical insights, and development updates from the Flowork neural network.</p>
        </div>
      </header>

      <div v-if="loading" class="text-center-status py-12">
        <div class="spinner-loader mx-auto mb-4"></div>
        <p class="font-mono font-bold tracking-widest text-muted">FETCHING ARCHIVES...</p>
      </div>

      <div v-else-if="error" class="text-center-status py-12">
        <p class="font-mono font-bold" style="color: #ff5f56; font-size: 1.2rem;">Error 404: Index matrix not found.</p>
      </div>

      <template v-else>

        <section class="top-news-grid">

          <router-link v-if="featuredPost" :to="`/blog/${featuredPost.slug}`" class="hero-article card-glass">
            <div class="hero-img-wrap">
              <img :src="featuredPost.cover || '/images/cover.webp'" :alt="featuredPost.title" class="news-img" loading="lazy" />
            </div>
            <div class="hero-gradient-overlay"></div>
            <div class="hero-content">
              <span class="news-tag">HEADLINE</span>
              <h2 class="hero-title">{{ featuredPost.title }}</h2>
              <p class="hero-desc">{{ featuredPost.description }}</p>
              <div class="news-meta mt-4">
                <span>{{ featuredPost.date }}</span> • <span>Flowork System</span>
              </div>
            </div>
          </router-link>

          <div class="side-articles" v-if="sidePosts.length > 0">
            <router-link
              v-for="post in sidePosts"
              :key="post.slug"
              :to="`/blog/${post.slug}`"
              class="side-card card-glass"
            >
              <div class="hero-img-wrap">
                <img :src="post.cover || '/images/cover.webp'" :alt="post.title" class="news-img" loading="lazy" />
              </div>
              <div class="hero-gradient-overlay"></div>
              <span class="news-tag side-tag">LATEST</span>
              <div class="side-content-full">
                <h3 class="side-title-full">{{ post.title }}</h3>
                <div class="news-meta side-meta mt-2" style="color: rgba(255,255,255,0.7);">
                  <span>{{ post.date }}</span>
                </div>
              </div>
            </router-link>
          </div>

        </section>

        <section v-if="gridPosts.length > 0" class="bottom-news-section">
          <div class="section-title-wrapper mb-6">
            <h2 class="section-title">More Archives</h2>
            <div class="title-line"></div>
          </div>

          <div class="bottom-news-grid">
            <router-link
              v-for="post in gridPosts"
              :key="post.slug"
              :to="`/blog/${post.slug}`"
              class="grid-news-card card-glass"
            >
              <div class="grid-img-wrap">
                 <img :src="post.cover || '/images/cover.webp'" :alt="post.title" class="news-img" loading="lazy" />
              </div>
              <div class="grid-content">
                <div class="news-meta mb-2"><span>{{ post.date }}</span></div>
                <h3 class="grid-title">{{ post.title }}</h3>
                <p class="grid-desc">{{ post.description }}</p>
              </div>
            </router-link>
          </div>
        </section>

      </template>

      <div class="super-footer-spacer"></div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUiStore } from '@/store/ui';

const uiStore = useUiStore();

const posts = ref([]);
const loading = ref(true);
const error = ref(false);

const featuredPost = computed(() => posts.value.length > 0 ? posts.value[0] : null);
const sidePosts = computed(() => posts.value.length > 1 ? posts.value.slice(1, 3) : []);
const gridPosts = computed(() => posts.value.length > 3 ? posts.value.slice(3) : []);

const fetchIndex = async () => {
  try {
    const response = await fetch('/content/blog/index.json');
    if (!response.ok) throw new Error('Index not found');
    const data = await response.json();

    // UBAH DISINI: a - b untuk urutan Terlama (Oldest) ke Terbaru (Newest)
    posts.value = data.sort((a, b) => new Date(a.date) - new Date(b.date));

  } catch (err) {
    console.error("Fetch Error:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const themeStyles = computed(() => {
  const theme = uiStore.currentTheme;
  if (theme === 'light') {
    return {
      '--bg': '#f8fafc', '--text': '#0f172a', '--text-mute': '#475569', '--accent-1': '#e11d48', '--accent-2': '#06b6d4', '--glass': 'rgba(255, 255, 255, 0.85)', '--border': 'rgba(0, 0, 0, 0.1)',
      '--blob-1': '#0ea5e9', '--blob-2': '#eab308', '--blob-3': '#e11d48'
    };
  } else if (theme === 'hacker') {
     return {
        '--bg': '#000000', '--text': '#00ff00', '--text-mute': '#008f00', '--accent-1': '#00ff00', '--accent-2': '#00ff00', '--glass': 'rgba(0, 20, 0, 0.8)', '--border': 'rgba(0, 255, 0, 0.3)',
        '--blob-1': '#002200', '--blob-2': '#004400', '--blob-3': '#003300'
     };
  } else {
    return {
      '--bg': '#020204', '--text': '#ffffff', '--text-mute': '#94a3b8', '--accent-1': '#e11d48', '--accent-2': '#2dd4bf', '--glass': 'rgba(20, 20, 30, 0.85)', '--border': 'rgba(255, 255, 255, 0.15)',
      '--blob-1': '#22d3ee', '--blob-2': '#ffd700', '--blob-3': '#e11d48'
    };
  }
});

onMounted(() => {
  if (uiStore.initTheme) uiStore.initTheme();
  fetchIndex();
  document.title = "News & Updates | Flowork OS";
});
</script>

<style scoped>
/* WRAPPER BEBAS SCROLL */
.blog-wrapper {
  height: 100vh; overflow-y: auto; overflow-x: hidden;
  background: var(--bg); color: var(--text);
  font-family: 'Space Grotesk', sans-serif;
  position: relative; transition: background 0.3s, color 0.3s;
  padding-top: 40px; scroll-behavior: smooth;
}

/* BACKGROUNDS */
.noise-overlay { position: fixed; inset: 0; background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events: none; z-index: 0; mix-blend-mode: overlay; }
.ambient-mesh { position: fixed; inset: 0; z-index: 0; filter: blur(150px); opacity: 0.5; pointer-events: none; }
.blob { position: absolute; border-radius: 50%; animation: float 15s infinite ease-in-out; }
.b1 { width: 60vw; height: 60vw; background: var(--blob-1); top: -10%; left: -10%; opacity: 0.5; }
.b2 { width: 50vw; height: 50vw; background: var(--blob-2); bottom: -10%; right: -10%; opacity: 0.4; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }

/* CONTAINER & HEADER */
.news-portal-container {
  position: relative; z-index: 10;
  max-width: 1440px; width: 100%; margin: 0 auto;
  padding: 0 40px;
}

/* GAP FOOTER SUPER LEGA */
.super-footer-spacer {
  height: 250px;
  width: 100%;
  pointer-events: none;
}

.news-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  border-bottom: 3px solid var(--text); padding-bottom: 20px;
  margin-bottom: 40px; margin-top: 20px;
}
.header-left { flex: 1; }
.header-right { max-width: 400px; text-align: right; }
.portal-title { font-size: 3.5rem; font-weight: 900; line-height: 1; letter-spacing: -1.5px; margin: 0; }
.accent-text { color: var(--accent-1); }
.portal-subtitle { font-size: 1.1rem; color: var(--text-mute); margin: 0; line-height: 1.5; font-weight: 500;}
.news-badge-main { display: inline-block; background: var(--text); color: var(--bg); font-weight: 800; font-size: 0.8rem; padding: 4px 10px; letter-spacing: 2px; }

/* UTILS */
.card-glass { background: var(--glass); border: 1px solid var(--border); backdrop-filter: blur(16px); }
a { text-decoration: none; color: inherit; display: block; }
.news-meta { font-family: monospace; font-size: 0.85rem; color: var(--text-mute); text-transform: uppercase; letter-spacing: 1px;}
.news-tag { background: var(--accent-1); color: #fff; padding: 4px 10px; font-size: 0.75rem; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; display: inline-block; margin-bottom: 12px; }
.text-center-status { text-align: center; }
.spinner-loader { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent-1); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* GLOBAL IMAGE FULL STRETCH FIX */
.news-img {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  object-fit: cover; display: block;
  transition: transform 0.8s ease;
}

/* TOP GRID (1 HERO, 2 SIDE) */
.top-news-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: stretch;
}

/* HERO POST & SHARED FULL COVER LOGIC (DESKTOP MODE) */
.hero-article, .side-card {
  position: relative; border-radius: 16px; overflow: hidden;
  display: flex; flex-direction: column; justify-content: flex-end;
  transition: transform 0.3s, border-color 0.3s;
}
.hero-article { min-height: 500px; }
.side-card { flex: 1; }

.hero-article:hover, .side-card:hover { border-color: var(--accent-1); transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
.hero-article:hover .news-img, .side-card:hover .news-img { transform: scale(1.05); }

.hero-img-wrap { position: absolute; inset: 0; z-index: 0; }
.hero-gradient-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
  z-index: 1; pointer-events: none;
}

/* TEXT CONTENT FOR FULL COVERS (DESKTOP) */
.hero-content { position: relative; z-index: 2; padding: 40px; color: #fff; width: 100%; }
.hero-title { font-size: 3rem; font-weight: 800; line-height: 1.1; margin-bottom: 15px; letter-spacing: -1px; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
.hero-desc { font-size: 1.2rem; line-height: 1.6; opacity: 0.9; max-width: 800px; text-shadow: 0 1px 5px rgba(0,0,0,0.8); }
.hero-content .news-meta { color: rgba(255,255,255,0.7); }

/* SIDE POSTS LAYOUT */
.side-articles { display: flex; flex-direction: column; gap: 30px; height: 100%; }
.side-tag { position: absolute; top: 20px; left: 20px; z-index: 2; margin: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
.side-content-full { position: relative; z-index: 2; padding: 30px; color: #fff; width: 100%; }
.side-title-full { font-size: 1.6rem; font-weight: 800; line-height: 1.2; margin-bottom: 5px; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
.side-meta { color: rgba(255,255,255,0.7); }

/* BOTTOM GRID SECTION */
.bottom-news-section {
  margin-top: 120px; /* <--- FIX: JARAK LEGA KE BAWAH DARI TOP NEWS */
}
.section-title-wrapper { display: flex; align-items: center; gap: 20px; }
.section-title { font-size: 1.8rem; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: -0.5px;}
.title-line { flex: 1; height: 2px; background: var(--border); }

.bottom-news-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
}
.grid-news-card {
  border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;
  transition: transform 0.3s, border-color 0.3s; height: 100%;
}
.grid-news-card:hover { transform: translateY(-5px); border-color: var(--accent-1); }
.grid-news-card:hover .news-img { transform: scale(1.05); }
.grid-img-wrap {
  aspect-ratio: 16 / 10;
  position: relative; overflow: hidden; border-bottom: 1px solid var(--border);
}
.grid-content { padding: 20px; display: flex; flex-direction: column; flex: 1; }
.grid-title { font-size: 1.2rem; font-weight: 700; line-height: 1.3; margin-bottom: 10px; }

/* FIX LINE-CLAMP WARNING VSCODE */
.grid-desc {
  font-size: 0.95rem; color: var(--text-mute); line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* =========================================================================
   RESPONSIVE BREAKPOINTS
========================================================================= */

@media (max-width: 1200px) {
  .news-portal-container { padding: 0 30px; }
  .top-news-grid { grid-template-columns: 1fr; }
  .hero-article { min-height: 400px; }
  .side-articles { flex-direction: row; }
  .side-card { min-height: 300px; }
  .bottom-news-grid { grid-template-columns: repeat(3, 1fr); }
  .super-footer-spacer { height: 250px; }
}

@media (max-width: 960px) {
  .news-header { flex-direction: column; align-items: flex-start; gap: 20px; }
  .header-right { text-align: left; }
  .side-articles { flex-direction: column; }
  .bottom-news-grid { grid-template-columns: repeat(2, 1fr); }
  .super-footer-spacer { height: 280px; }
  .bottom-news-section { margin-top: 80px; } /* Jarak responsif buat tablet/mobile */

  /* --- FIX MOBILE: JANGAN KASIH TULISAN DI ATAS COVER --- */
  .hero-article, .side-card {
    min-height: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  /* Kembalikan gambar ke proporsi aslinya, tidak absolute menutupi card */
  .hero-img-wrap {
    position: relative;
    inset: auto;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-bottom: 1px solid var(--border);
  }

  /* Matikan efek gelap karena tulisan sudah turun ke bawah */
  .hero-gradient-overlay {
    display: none;
  }

  /* Tarik tulisan ke bawah gambar dengan warna yang menyesuaikan tema */
  .hero-content, .side-content-full {
    position: relative;
    padding: 25px 20px;
    color: var(--text);
  }

  /* Hapus bayangan teks dan sesuaikan warna judul */
  .hero-title {
    font-size: 2rem;
    color: var(--text);
    text-shadow: none;
  }
  .side-title-full {
    font-size: 1.5rem;
    color: var(--text);
    text-shadow: none;
  }
  .hero-desc {
    color: var(--text-mute);
    text-shadow: none;
  }

  /* Override warna tanggal/meta biar tetep elegan */
  .hero-content .news-meta, .side-meta {
    color: var(--text-mute) !important;
  }
}

@media (max-width: 600px) {
  .news-portal-container { padding: 0 20px; }
  .bottom-news-grid { grid-template-columns: 1fr; }
  .super-footer-spacer { height: 300px; }
  .hero-title { font-size: 1.8rem; }
}
</style>
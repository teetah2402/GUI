//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\mobile\NewsMobile.vue total lines 390 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="news-wrapper" :style="themeStyles" :data-theme="uiStore.currentTheme">

    <div class="ambient-mesh">
      <div class="blob b1"></div>
      <div class="blob b2"></div>
    </div>
    <div class="grid-overlay"></div>

    <main class="news-content custom-scroll">
      <div class="center-container">

        <header class="page-header fade-in-down">
           <div class="live-badge">
              <span class="pulse"></span> LIVE FEED
           </div>
           <h1 class="page-title">Global <span class="highlight">Intelligence</span></h1>
           <p class="page-subtitle">Real-time transmissions from the Flowork Network.</p>
        </header>

        <div v-if="isLoading" class="loading-container">
           <div class="scanner-line"></div>
           <div class="spinner"></div>
           <span class="blink">ACQUIRING SIGNAL...</span>
        </div>

        <div v-else-if="error" class="error-container">
           <v-icon size="48" class="text-danger mb-3">mdi-signal-off</v-icon>
           <h3>Signal Lost</h3>
           <p>{{ error }}</p>
           <button class="retry-btn" @click="newsStore.fetchNews()">RECONNECT</button>
        </div>

        <div v-else class="news-grid">
           <article
              v-for="(item, index) in paginatedArticles"
              :key="index"
              class="news-card"
              :class="{ 'is-video': isYoutube(item.link) }"
              :style="{ animationDelay: `${index * 100}ms` }"
           >
              <div class="card-media">

                 <div v-if="isYoutube(item.link)" class="video-wrapper">
                    <div v-if="activeVideos[index]" class="iframe-container">
                       <iframe
                          :src="getEmbedUrl(item.link)"
                          title="YouTube video player"
                          frameborder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowfullscreen
                       ></iframe>
                    </div>
                    <div v-else class="thumbnail-overlay" @click="playVideo(index)">
                       <img :src="item.imageUrl || getYoutubeThumb(item.link)" class="thumb-img" alt="Video Thumbnail" loading="lazy" />
                       <div class="play-btn">
                          <v-icon size="32" color="white">mdi-play</v-icon>
                       </div>
                       <div class="video-badge">VIDEO</div>
                    </div>
                 </div>

                 <a v-else :href="item.link" target="_blank" class="img-link">
                    <img :src="item.imageUrl || '/images/cover_default.webp'" class="thumb-img" alt="News Cover" loading="lazy" />
                    <div class="overlay-gradient"></div>
                 </a>

                 <div class="card-meta-top">
                    <span class="source-tag">{{ item.source || 'SYSTEM' }}</span>
                 </div>
              </div>

              <div class="card-body">
                 <div class="date-row">
                    <v-icon size="12" class="mr-1 icon-sub">mdi-clock-outline</v-icon>
                    {{ formatDate(item.pubDate) }}
                 </div>

                 <h3 class="card-title">
                    <a :href="item.link" target="_blank">{{ item.title }}</a>
                 </h3>

                 <p class="card-desc">{{ truncateText(item.snippet || item.description, 120) }}</p>

                 <div class="card-footer">
                    <a :href="item.link" target="_blank" class="read-more-btn">
                       {{ isYoutube(item.link) ? 'Watch on YouTube' : 'Read Full Report' }}
                       <v-icon size="14" class="ml-1">mdi-arrow-right</v-icon>
                    </a>
                 </div>
              </div>
           </article>
        </div>

        <div v-if="totalPages > 1" class="pagination-wrapper mt-10">
           <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="5"
              rounded="circle"
              active-color="var(--c-brand)"
              color="grey"
              variant="text"
              @update:modelValue="newsStore.setPage"
           ></v-pagination>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useNewsStore } from '@/store/news';
import { useUiStore } from '@/store/ui';
import { storeToRefs } from 'pinia';

const newsStore = useNewsStore();
const uiStore = useUiStore();
const { isLoading, error, paginatedArticles, totalPages } = storeToRefs(newsStore);

const activeVideos = ref({});

const currentPage = computed({
  get: () => newsStore.currentPage,
  set: (value) => newsStore.setPage(value)
});

const themeStyles = computed(() => {
  const theme = uiStore.currentTheme;
  const base = {
    '--c-bg-page': '#050505',
    '--c-bg-card': 'rgba(20, 20, 25, 0.6)',
    '--c-border': 'rgba(255,255,255,0.1)',
    '--c-text-main': '#ffffff',
    '--c-text-muted': '#9ca3af',
    '--c-brand': '#00dc82',
    '--c-brand-rgb': '0, 220, 130',
    '--font-main': "'Inter', sans-serif"
  };

  if (theme === 'light') {
    return { ...base,
        '--c-bg-page': '#f8fafc',
        '--c-bg-card': 'rgba(255, 255, 255, 0.8)',
        '--c-border': 'rgba(0,0,0,0.08)',
        '--c-text-main': '#0f172a',
        '--c-text-muted': '#64748b',
        '--c-brand': '#2563eb',
        '--c-brand-rgb': '37, 99, 235'
    };
  } else if (theme === 'hacker') {
    return { ...base,
        '--c-bg-page': '#000000',
        '--c-bg-card': 'rgba(0, 20, 0, 0.8)',
        '--c-border': '#003300',
        '--c-text-main': '#00ff00',
        '--c-text-muted': '#008f00',
        '--c-brand': '#00ff00',
        '--c-brand-rgb': '0, 255, 0'
    };
  }
  return base;
});


const isYoutube = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
};

const getEmbedUrl = (url) => {
    const videoId = extractVideoId(url);
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
};

const getYoutubeThumb = (url) => {
    const videoId = extractVideoId(url);
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const playVideo = (index) => {
    activeVideos.value[index] = true;
};

const formatDate = (dateString) => {
    try {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return ''; }
};

const truncateText = (text, len) => {
    if (!text) return '';
    const clean = text.replace(/<[^>]*>?/gm, '');
    return clean.length > len ? clean.substring(0, len) + '...' : clean;
};

onMounted(() => {
    uiStore.initTheme();
    newsStore.fetchNews();
});
</script>

<style scoped>
/* --- LAYOUT --- */
.news-wrapper {
    position: absolute; inset: 0;
    background-color: var(--c-bg-page);
    color: var(--c-text-main);
    font-family: var(--font-main);
    overflow: hidden;
    transition: background-color 0.3s, color 0.3s;
}

.news-content {
    height: 100%;
    overflow-y: auto;
    position: relative;
    z-index: 1;
    padding-bottom: 40px;
}

/* [FIXED] PADDING DITAMBAH AGAR TIDAK NABRAK HEADER */
.center-container {
    width: 100%; max-width: 1200px; margin: 0 auto;
    padding: 120px 20px 40px 20px; /* Desktop: 120px (Tadinya 80px) */
}

/* --- AMBIENT BG --- */
.ambient-mesh { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.15; animation: float 10s infinite ease-in-out; }
.b1 { width: 50vw; height: 50vw; background: var(--c-brand); top: -20%; left: -10%; }
.b2 { width: 40vw; height: 40vw; background: purple; bottom: -10%; right: -10%; animation-delay: 2s; }
.grid-overlay {
    position: absolute; inset: 0;
    background-image: linear-gradient(var(--c-border) 1px, transparent 1px), linear-gradient(90deg, var(--c-border) 1px, transparent 1px);
    background-size: 40px 40px; opacity: 0.1; pointer-events: none;
}

/* --- HEADER --- */
.page-header { text-align: center; margin-bottom: 50px; }
.live-badge {
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid var(--c-brand); padding: 4px 12px; border-radius: 20px;
    font-size: 0.7rem; color: var(--c-brand); letter-spacing: 2px; font-weight: 700; margin-bottom: 15px;
}
.pulse { width: 6px; height: 6px; background: var(--c-brand); border-radius: 50%; box-shadow: 0 0 10px var(--c-brand); animation: pulse 1.5s infinite; }
.page-title { font-size: 3rem; font-weight: 800; line-height: 1; letter-spacing: -1px; margin-bottom: 10px; }
.highlight { color: var(--c-brand); }
.page-subtitle { color: var(--c-text-muted); font-size: 1.1rem; }

/* --- GRID --- */
.news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
}

/* --- CARD --- */
.news-card {
    background: var(--c-bg-card);
    border: 1px solid var(--c-border);
    border-radius: 24px;
    overflow: hidden;
    display: flex; flex-direction: column;
    backdrop-filter: blur(12px);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    animation: fadeUp 0.6s ease-out forwards;
    opacity: 0;
}
.news-card:hover { transform: translateY(-8px); border-color: var(--c-brand); box-shadow: 0 15px 30px rgba(0,0,0,0.2); }

/* MEDIA & THUMBNAIL FIX */
.card-media { position: relative; width: 100%; aspect-ratio: 16/9; background: #000; overflow: hidden; }

/* [FIX] Gunakan absolute position untuk gambar agar tidak mengganggu flex layout overlay */
.thumb-img {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
    z-index: 0; /* Di belakang tombol play */
}

.news-card:hover .thumb-img { transform: scale(1.05); }

.img-link, .video-wrapper, .iframe-container { display: block; width: 100%; height: 100%; position: relative; }
.iframe-container iframe { width: 100%; height: 100%; position: relative; z-index: 5; }

.overlay-gradient { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); opacity: 0.6; z-index: 1; pointer-events: none; }

/* PLAY BUTTON CENTER */
.thumbnail-overlay {
    position: absolute; inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 2;
}

.play-btn {
    position: relative; /* Pastikan relative agar di atas gambar absolute */
    z-index: 10;
    width: 60px; height: 60px;
    background: rgba(0,0,0,0.6);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.2);
    transition: 0.2s;
}
.thumbnail-overlay:hover .play-btn { transform: scale(1.1); background: var(--c-brand); border-color: var(--c-brand); }

.video-badge {
    position: absolute; top: 10px; right: 10px;
    background: #ff0000; color: white;
    font-size: 0.6rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;
    z-index: 5;
}

.source-tag {
    position: absolute; top: 10px; left: 10px;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.1); color: #fff;
    font-size: 0.7rem; font-weight: 700; padding: 4px 10px; border-radius: 20px;
    text-transform: uppercase; z-index: 5;
}

/* CONTENT */
.card-body { padding: 20px; display: flex; flex-direction: column; flex: 1; position: relative; z-index: 2; background: var(--c-bg-card); }
.date-row { font-size: 0.75rem; color: var(--c-text-muted); margin-bottom: 10px; display: flex; align-items: center; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
.icon-sub { opacity: 0.7; }

.card-title { font-size: 1.1rem; line-height: 1.4; margin-bottom: 10px; font-weight: 700; }
.card-title a { color: var(--c-text-main); text-decoration: none; transition: 0.2s; }
.card-title a:hover { color: var(--c-brand); }

.card-desc { font-size: 0.9rem; color: var(--c-text-muted); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }

.card-footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--c-border); }
.read-more-btn {
    color: var(--c-brand); font-size: 0.8rem; font-weight: 700; text-decoration: none;
    display: flex; align-items: center; text-transform: uppercase; letter-spacing: 0.5px;
}
.read-more-btn:hover { opacity: 0.8; }

/* STATES */
.loading-container { display: flex; flex-direction: column; align-items: center; padding: 100px 0; gap: 20px; }
.spinner { width: 40px; height: 40px; border: 2px solid var(--c-border); border-top-color: var(--c-brand); border-radius: 50%; animation: spin 1s linear infinite; }
.blink { font-family: monospace; color: var(--c-brand); animation: blink 1s infinite; font-size: 0.9rem; letter-spacing: 2px; }
.retry-btn { background: var(--c-brand); color: #000; padding: 10px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; border: none; margin-top: 10px; }

/* UTILS */
.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-thumb { background: var(--c-border); border-radius: 3px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.text-danger { color: #ff4444; }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.5); } 100% { opacity: 1; transform: scale(1); } }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes float { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(20px, -20px); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.fade-in-down { animation: fadeDown 0.8s ease-out; }
@keyframes fadeDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) {
    /* [FIXED] Mobile padding juga ditambah jadi 100px agar aman dari Header */
    .center-container { padding-top: 100px; }
    .page-title { font-size: 2rem; }
    .news-grid { grid-template-columns: 1fr; }
}
</style>

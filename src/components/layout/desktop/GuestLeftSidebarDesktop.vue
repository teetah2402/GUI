<template>
  <div class="guest-sidebar-wrapper">
    <transition name="fade">
      <div v-if="isOpen" class="sidebar-backdrop" @click="$emit('close')"></div>
    </transition>

    <div class="guest-sidebar-panel" :class="{ 'is-open': isOpen }" :style="themeStyles">

      <div class="sidebar-header">
        <div class="logo-area">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="sys-logo-svg" aria-hidden="true">
              <circle cx="256" cy="256" r="230" fill="none" stroke="#54d7f6" stroke-width="8" stroke-dasharray="200 150 50 150" opacity="0.5"/>
              <g transform="translate(102, 102) scale(0.6)">
                 <path d="M100 80 L 220 80 L 220 200 L 160 200 L 160 432 L 100 432 Z" fill="#54d7f6" stroke="none"/>
                 <path d="M260 220 L 360 220 L 360 320 L 260 320 Z" fill="#706bf3" opacity="0.9"/>
              </g>
           </svg>
           <span class="brand-text">Flowork<span class="highlight">OS</span></span>
        </div>

        <div class="search-box">
          <i class="mdi mdi-magnify search-icon" aria-hidden="true"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search tools..."
            class="search-input"
            aria-label="Search Applications"
          >
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn" aria-label="Clear Search">
            <i class="mdi mdi-close"></i>
          </button>
        </div>

        <div class="category-filter-area no-scrollbar" ref="categoryScrollRef" @wheel.prevent="handleCategoryScroll">
            <button
                class="cat-chip"
                :class="{ 'active': selectedCategory === null && !showFavoritesOnly }"
                @click="setFilter(null)"
            >
                All
            </button>
            <button
                class="cat-chip"
                :class="{ 'active': showFavoritesOnly }"
                @click="toggleFavoriteFilter"
                aria-label="Filter Favorites"
            >
                <i class="mdi mdi-heart" style="font-size: 10px; margin-right: 4px;"></i> Favs
            </button>

            <button
                class="cat-chip"
                style="border-color: #3DDC84; color: #3DDC84;"
                :class="{ 'active': selectedCategory === 'local' }"
                @click="setFilter('local')"
                v-if="socketStore.isConnected"
            >
                <i class="mdi mdi-harddisk" style="font-size: 10px; margin-right: 4px;"></i> PC Apps
            </button>

            <button
                v-for="cat in uniqueCategories"
                :key="cat"
                class="cat-chip"
                :class="{ 'active': selectedCategory === cat }"
                @click="setFilter(cat)"
            >
                {{ cat }}
            </button>
        </div>
      </div>

      <div class="app-grid-container custom-scroll">

        <div v-if="appStore.isLoading" class="loading-state">
           <div class="spinner"></div>
           <span>Loading Assets...</span>
        </div>

        <div v-else-if="finalFilteredApps.length === 0" class="empty-state">
           <i class="mdi mdi-package-variant-closed" aria-hidden="true"></i>
           <span>No apps found</span>
        </div>

        <div v-else class="apps-grid">
          <div
            v-for="app in finalFilteredApps"
            :key="app.id"
            class="app-card"
            :class="{ 'local-app-card': app.is_local }"
          >
            <div class="card-click-area" @click="handleAppClick(app)" :title="app.name">
                <div class="card-cover">
                   <img
                     v-if="!imageErrors[app.id]"
                     :src="resolveImage(app)"
                     class="cover-img"
                     loading="lazy"
                     decoding="async"
                     width="320"
                     height="180"
                     alt="App Cover"
                     @error="handleImageError(app.id)"
                   >
                   <div v-else class="fallback-cover" :class="{'local-fallback': app.is_local}">
                      <template v-if="app.is_local">
                        <img :src="resolveIcon(app)" class="fallback-icon" alt="" aria-hidden="true" @error="(e) => e.target.src='https://cdn-icons-png.flaticon.com/512/566/566737.png'">
                        <span class="fallback-title">{{ app.name }}</span>
                      </template>
                      <template v-else>
                        <img :src="resolveIcon(app)" class="fallback-icon" alt="" aria-hidden="true" @error="(e) => e.target.src='https://cdn-icons-png.flaticon.com/512/566/566737.png'">
                      </template>
                   </div>

                   <div v-if="app.is_local" class="local-badge-tag">LOCAL OS</div>

                   <div class="category-tag">
                      {{ app.category || 'APP' }}
                   </div>
                </div>
            </div>

            <div class="card-actions">
                <button
                    class="action-btn fav-btn"
                    :class="{ 'is-active': isFavorite(app.id) }"
                    @click.stop="toggleFavorite(app.id)"
                    title="Add to Favorites"
                    aria-label="Add to Favorites"
                >
                    <i class="mdi" :class="isFavorite(app.id) ? 'mdi-heart' : 'mdi-heart-outline'"></i>
                </button>

                <button
                    class="action-btn share-btn"
                    @click.stop="copyShareLink(app)"
                    title="Copy Share Link"
                    aria-label="Copy Share Link"
                >
                    <i class="mdi mdi-link-variant"></i>
                    <span v-if="copiedId === app.id" class="copy-tooltip">Copied!</span>
                </button>
            </div>

            <div class="card-info" @click="handleAppClick(app)">
               <span class="app-name">{{ app.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <button class="close-bar-mobile" @click="$emit('close')" aria-label="Close Sidebar">
        <div class="handle"></div>
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAppStore } from '@/store/apps';
import { useUiStore } from '@/store/ui';
import { useRouter, useRoute } from 'vue-router';
import { useSocketStore } from '@/store/socket';

defineProps({ isOpen: Boolean });
const emit = defineEmits(['close']);

const appStore = useAppStore();
const uiStore = useUiStore();
const socketStore = useSocketStore();
const router = useRouter();
const route = useRoute();

const searchQuery = ref('');
const selectedCategory = ref(null);
const showFavoritesOnly = ref(false);
const imageErrors = ref({});
const copiedId = ref(null);

const currentTheme = ref('dark');
let themeObserver = null;

// [TAMBAHAN KODE] Ref & Logika untuk Mouse Scroll ke Horizontal
const categoryScrollRef = ref(null);
const handleCategoryScroll = (e) => {
    if (categoryScrollRef.value) {
        // Konversi scroll vertikal dari mouse menjadi scroll horizontal
        categoryScrollRef.value.scrollLeft += e.deltaY > 0 ? 50 : -50;
    }
};

const syncThemeFromGlobal = () => {
  const globalTheme = document.documentElement.getAttribute('data-theme');
  currentTheme.value = globalTheme || localStorage.getItem('flowork_os_theme') || 'dark';
};

const themeStyles = computed(() => {
  const theme = currentTheme.value;
  const base = {
    '--s-bg': '#0f0f13',
    '--s-border': 'rgba(255, 255, 255, 0.08)',
    '--s-text': '#ffffff',
    '--s-accent': '#54d7f6',
    '--c-bg': '#1a1a20',
    '--c-border': 'rgba(255,255,255,0.05)',
    '--c-hover': '#252530',
    '--tag-bg': 'rgba(0,0,0,0.7)',
    '--tag-text': '#ffffff',
    '--chip-bg': 'rgba(255,255,255,0.05)',
    '--chip-active': '#54d7f6',
    '--chip-text-active': '#000000',
    '--act-bg': 'rgba(0,0,0,0.6)',
    '--act-hover': 'rgba(255,255,255,0.2)'
  };

  if (theme === 'light') {
    return {
      '--s-bg': '#ffffff',
      '--s-border': '#e2e8f0',
      '--s-text': '#0f172a',
      '--s-accent': '#0ea5e9',
      '--c-bg': '#f8fafc',
      '--c-border': '#e2e8f0',
      '--c-hover': '#f1f5f9',
      '--tag-bg': 'rgba(255,255,255,0.8)',
      '--tag-text': '#0f172a',
      '--chip-bg': '#f1f5f9',
      '--chip-active': '#0ea5e9',
      '--chip-text-active': '#ffffff',
      '--act-bg': 'rgba(255,255,255,0.8)',
      '--act-hover': 'rgba(0,0,0,0.05)'
    };
  }
  return base;
});

const apps = computed(() => {
    const combinedApps = [...appStore.installedApps, ...appStore.localEngineApps];
    return combinedApps.filter(app => app.desktop !== 'no');
});

const uniqueCategories = computed(() => {
    const cats = new Set();
    apps.value.forEach(app => {
        if (app.category && !app.is_local) cats.add(app.category);
    });
    return Array.from(cats).sort();
});

const finalFilteredApps = computed(() => {
    let result = apps.value;

    if (showFavoritesOnly.value) {
        result = result.filter(app => appStore.favoriteIds.includes(app.id));
    }
    else if (selectedCategory.value === 'local') {
        result = result.filter(app => app.is_local);
    }
    else if (selectedCategory.value) {
        result = result.filter(app => app.category === selectedCategory.value);
    }

    if (searchQuery.value) {
        const lowerQ = searchQuery.value.toLowerCase();
        result = result.filter(app =>
            app.name.toLowerCase().includes(lowerQ) ||
            (app.description && app.description.toLowerCase().includes(lowerQ))
        );
    }
    return result;
});

const setFilter = (cat) => { selectedCategory.value = cat; showFavoritesOnly.value = false; };
const toggleFavoriteFilter = () => { showFavoritesOnly.value = !showFavoritesOnly.value; selectedCategory.value = null; };
const isFavorite = (id) => appStore.favoriteIds.includes(id);
const toggleFavorite = (id) => { appStore.toggleFavorite(id); };

const copyShareLink = (app) => {
    const baseUrl = window.location.origin;
    const slugOrId = app.slug || app.id;
    const shareUrl = `${baseUrl}/flow/${slugOrId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        copiedId.value = app.id;
        setTimeout(() => { copiedId.value = null; }, 1500);
    }).catch(err => { console.error('Failed to copy: ', err); });
};

const handleImageError = (id) => { imageErrors.value[id] = true; };

// [MODIFIED] Resolusi Image Dinamis dengan Fallback ke Localhost
const resolveImage = (app) => {
  if (app.is_local) {
      let img = app.coverUrl || app.seo?.og_image || 'cover.webp';
      if (img.startsWith('http') || img.startsWith('data:')) return img;
      return `http://127.0.0.1:5000/local-apps/${app.id || app.slug}/${img}`;
  }

  if (app.coverUrl) return app.coverUrl;

  const lang = uiStore.currentLang || 'id';
  const localizedDefault = lang === 'en' ? 'cover_m_en.webp' : 'cover_m_id.webp';
  let img = app.seo?.og_image || app.cover;

  if (!img || img === 'cover.webp') {
      img = localizedDefault;
  }

  if (img.startsWith('http') || img.startsWith('data:') || img.startsWith('/')) return img;

  const p = app.path || `/desktop/${app.slug || app.id}`;
  return `${p.replace(/\/$/, '')}/${img}`;
};

// [MODIFIED] Resolusi Icon Dinamis membaca struktur manifest aplikasi
const resolveIcon = (app) => {
  if (app.is_local) {
      let iconPath = app.iconUrl || app.icon;
      if (!iconPath && app.icons) {
          iconPath = app.icons['128'] || app.icons['48'] || app.icons['16'];
      }
      if (!iconPath && app.action && app.action.default_icon) {
          iconPath = app.action.default_icon;
      }
      if (iconPath && !iconPath.startsWith('http')) {
          return `http://127.0.0.1:5000/local-apps/${app.id || app.slug}/${iconPath}`;
      }
      return `http://127.0.0.1:5000/local-apps/${app.id || app.slug}/icon.svg`;
  }

  if (app.iconUrl) return app.iconUrl;

  let ico = app.icon || app.icon_file || 'icon.svg';
  if (ico.startsWith('http') || ico.startsWith('/')) return ico;

  const p = app.path || `/desktop/${app.slug || app.id}`;
  return `${p.replace(/\/$/, '')}/${ico}`;
};

const handleAppClick = (app) => {
  requestAnimationFrame(() => {
    if (window.innerWidth < 768) emit('close');

    const appId = app.id || app.slug;
    if (appStore.addToRecent) appStore.addToRecent(appId);

    if (app.is_local) {
        sessionStorage.setItem(`flowork_local_app_${appId}`, JSON.stringify(app));
    }

    if (route.path === '/canvas') {
        window.dispatchEvent(new CustomEvent('flowork-launch-app', { detail: app }));
    } else {
        if (window.innerWidth < 768) {
            window.location.href = `/flow/${appId}`;
        } else {
            router.push({ path: '/canvas', query: { app: appId, t: Date.now() } });
        }
    }
  });
};

onMounted(async () => {
  if (appStore.installedApps.length === 0) await appStore.fetchInstalledApps();
  syncThemeFromGlobal();
  themeObserver = new MutationObserver((m) => {
    m.forEach((mu) => { if (mu.attributeName === 'data-theme') syncThemeFromGlobal(); });
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
});
onUnmounted(() => { if (themeObserver) themeObserver.disconnect(); });
</script>

<style scoped>
/* COPIED STYLES ... */
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: var(--s-border); border-radius: 4px; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.guest-sidebar-wrapper { position: fixed; inset: 0; pointer-events: none; z-index: 2000; }
.sidebar-backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); pointer-events: auto; }

.guest-sidebar-panel {
  width: 360px; height: 100%; position: absolute; top: 0; left: 0;
  transform: translateX(-100%); transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: auto; background: var(--s-bg); border-right: 1px solid var(--s-border);
  color: var(--s-text); display: flex; flex-direction: column; box-shadow: 10px 0 30px rgba(0,0,0,0.5);
  will-change: transform;
}
.guest-sidebar-panel.is-open { transform: translateX(0); }

.sidebar-header { padding: 20px 20px 10px 20px; border-bottom: 1px solid var(--s-border); background: var(--s-bg); z-index: 10; display: flex; flex-direction: column; gap: 15px; }
.logo-area { display: flex; align-items: center; gap: 12px; }
.sys-logo-svg { width: 32px; height: 32px; }
.brand-text { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 1.1rem; }
.highlight { color: var(--s-accent); }

.search-box { position: relative; display: flex; align-items: center; }
.search-input { width: 100%; background: var(--c-bg); border: 1px solid var(--c-border); padding: 10px 36px; border-radius: 8px; color: var(--s-text); font-size: 0.9rem; transition: 0.2s; }
.search-input:focus { outline: none; border-color: var(--s-accent); }
.search-icon { position: absolute; left: 10px; opacity: 0.5; }
.clear-btn { position: absolute; right: 10px; opacity: 0.5; cursor: pointer; background: none; border: none; color: inherit; display: flex; align-items: center; justify-content: center; }

.category-filter-area { display: flex; gap: 8px; overflow-x: auto; white-space: nowrap; margin-left: -20px; margin-right: -20px; padding-left: 20px; padding-right: 20px; padding-bottom: 5px; scroll-behavior: auto; }
.cat-chip { background: var(--chip-bg); border: 1px solid var(--c-border); color: var(--s-text); padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; font-weight: 500; flex-shrink: 0; display: flex; align-items: center; }
.cat-chip:hover { border-color: var(--s-accent); opacity: 0.9; }
.cat-chip.active { background: var(--chip-active); color: var(--chip-text-active); border-color: var(--chip-active); font-weight: 700; }

.app-grid-container { flex: 1; overflow-y: auto; padding: 15px; padding-bottom: 120px; }
.apps-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }

.app-card { background: var(--c-bg); border: 1px solid var(--c-border); border-radius: 10px; overflow: hidden; cursor: pointer; transition: all 0.2s ease; position: relative; display: flex; flex-direction: column; contain: content; }
.app-card:hover { transform: translateY(-2px); border-color: var(--s-accent); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }

/* Style Card Khusus Aplikasi Lokal PC */
.local-app-card { border-color: rgba(61, 220, 132, 0.3); }
.local-app-card:hover { border-color: #3DDC84; box-shadow: 0 4px 12px rgba(61,220,132,0.2); }
.local-badge-tag { position: absolute; top: 6px; left: 6px; background: #3DDC84; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 0 10px rgba(61,220,132,0.5); z-index: 2; }

.card-click-area { width: 100%; }
.card-cover {
  width: 100%;
  aspect-ratio: 9/16;
  background: #000;
  position: relative;
  overflow: hidden;
}
.cover-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.app-card:hover .cover-img { transform: scale(1.05); }
.fallback-cover { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1e1e24 0%, #2a2a35 100%); }
.fallback-icon { width: 32px; height: 32px; opacity: 0.8; }
.category-tag { position: absolute; top: 6px; right: 6px; background: var(--tag-bg); color: var(--tag-text); padding: 2px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.1); z-index: 2; }

.card-actions { position: absolute; bottom: 35px; right: 5px; display: flex; gap: 4px; z-index: 5; }
.action-btn { width: 28px; height: 28px; border-radius: 50%; background: var(--act-bg); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.1); color: var(--s-text); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; font-size: 14px; position: relative; }
.action-btn:hover { background: var(--s-accent); color: #000; }
.action-btn.fav-btn.is-active { color: #ff4444; }
.action-btn.fav-btn.is-active:hover { color: #fff; background: #ff4444; }
.copy-tooltip { position: absolute; bottom: 110%; left: 50%; transform: translateX(-50%); background: #000; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 10px; white-space: nowrap; pointer-events: none; animation: fadeup 0.2s ease-out; }
@keyframes fadeup { from { opacity: 0; transform: translate(-50%, 5px); } to { opacity: 1; transform: translate(-50%, 0); } }

.card-info { padding: 8px 10px; display: flex; flex-direction: column; justify-content: center; background: var(--c-bg); z-index: 6; position: relative; }
.app-name { font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; gap: 10px; opacity: 0.6; font-size: 0.9rem; }
.spinner { width: 20px; height: 20px; border: 2px solid var(--s-accent); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.close-bar-mobile {
    margin-top: auto; width: 100%; height: 30px;
    background: transparent; border: none; border-top: 1px solid var(--s-border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s;
}
.close-bar-mobile:hover { background: rgba(255,255,255,0.05); }
.handle { width: 40px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; }

@media (max-width: 768px) {
    .guest-sidebar-panel { width: 85%; max-width: 320px; }
    .apps-grid { grid-template-columns: 1fr; }
}

/* [MODIFIED] Styling untuk Fallback Khusus Aplikasi Lokal tanpa Cover Gambar */
.local-fallback { background: linear-gradient(135deg, rgba(61,220,132,0.15), rgba(0,0,0,0.6)) !important; flex-direction: column; text-align: center; padding: 10px; }
.local-fallback .fallback-icon { width: 48px; height: 48px; margin-bottom: 8px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5)); opacity: 1; }
.fallback-title { font-size: 0.9rem; font-weight: 800; font-family: 'Fredoka', 'Inter', sans-serif; line-height: 1.2; color: #fff; text-shadow: 0 2px 5px rgba(0,0,0,0.8); display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
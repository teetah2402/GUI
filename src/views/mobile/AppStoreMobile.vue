//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\mobile\AppStoreMobile.vue
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="store-wrapper" :style="themeStyles" :data-theme="uiStore.currentTheme">
    <div class="theme-bg"></div>

    <main class="store-content hide-scrollbar" ref="scrollContainer">
      <div class="center-container px-safe pb-nav">

        <div class="store-controls mb-4">
            <div class="search-box">
              <v-icon class="search-icon" size="22">mdi-magnify</v-icon>
              <input
                ref="searchInput"
                v-model="searchQuery"
                class="native-input"
                placeholder="Find apps, tools, services..."
                @input="handleSearchInput"
                @focus="showSuggestions = true"
                aria-label="Search Applications"
                name="search"
                autocomplete="off"
              />
              <button v-if="searchQuery" @click="clearSearch" class="clear-btn" aria-label="Clear Search Results">
                <v-icon size="18">mdi-close-circle</v-icon>
              </button>

              <div v-if="showSuggestions && searchQuery && suggestionResults.length > 0" class="suggestion-list shadow-lg">
                <div
                  v-for="suggestion in suggestionResults"
                  :key="suggestion.id"
                  class="suggestion-item"
                  @click="selectSuggestion(suggestion)"
                >
                  <div class="suggestion-icon-wrapper mr-3">
                    <img
                      :src="resolveIcon(suggestion)"
                      class="suggestion-app-icon"
                      @error="(e) => e.target.src='https://cdn-icons-png.flaticon.com/512/566/566737.png'"
                    />
                  </div>
                  <div class="d-flex flex-column">
                    <span class="suggestion-text">{{ suggestion.name }}</span>
                    <span class="suggestion-subtext">{{ suggestion.category || 'App' }}</span>
                  </div>
                  <v-icon size="14" class="ml-auto opacity-50">mdi-arrow-top-left</v-icon>
                </div>
              </div>
            </div>

            <div class="cat-scroll hide-scrollbar mt-8">
              <button
                class="cat-chip special"
                :class="{ active: currentFilter === 'favorites' }"
                @click="setCategory('favorites')"
                aria-label="Show Favorite Apps"
              >
                <v-icon size="16" class="mr-1" :class="{ 'heart-beat': currentFilter === 'favorites' }">mdi-heart</v-icon>
                Favorites
              </button>

              <button
                class="cat-chip"
                style="border-color: #3DDC84; color: #3DDC84;"
                :class="{ active: currentFilter === 'local' }"
                @click="setCategory('local')"
                v-if="socketStore.isConnected"
              >
                <v-icon size="16" class="mr-1">mdi-harddisk</v-icon>
                My PC Apps
              </button>

              <button
                v-for="cat in categories"
                :key="cat"
                class="cat-chip"
                :class="{ active: currentFilter === cat }"
                @click="setCategory(cat)"
                :aria-label="'Filter by category: ' + formatText(cat)"
              >
                {{ formatText(cat) }}
              </button>
            </div>
        </div>

        <div class="d-flex justify-space-between align-center py-4 my-2" style="min-height: 40px;">
          <h1 class="section-title">
            {{ getTitle() }}
          </h1>
          <span class="count-badge" v-if="!loading">{{ filteredApps.length }} apps</span>
        </div>

        <div v-if="loading" class="app-grid">
          <div v-for="n in 8" :key="n" class="app-card skeleton-card">
            <div class="card-media skeleton-pulse"></div>
            <div class="card-content">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="skeleton-icon skeleton-pulse"></div>
                <div class="skeleton-rating skeleton-pulse"></div>
              </div>
              <div class="skeleton-text-lg skeleton-pulse mb-2"></div>
              <div class="skeleton-text-sm skeleton-pulse mb-1"></div>
              <div class="skeleton-text-sm skeleton-pulse w-75"></div>
            </div>
          </div>
        </div>

        <div v-else-if="filteredApps.length === 0" class="state-container">
          <v-icon size="64" color="var(--c-text-muted)" style="opacity: 0.3;">mdi-store-search-outline</v-icon>
          <p class="text-body-1 text-muted mt-4 font-weight-medium">
            {{ currentFilter === 'favorites' ? 'No favorites yet.' : (currentFilter === 'local' ? 'Tidak ada aplikasi offline PC.' : 'No apps found matching your search.') }}
          </p>
          <button v-if="currentFilter !== 'all'" @click="setCategory('all')" class="reset-link mt-2" aria-label="Reset Filters">Browse All Apps</button>
        </div>

        <TransitionGroup
          v-else
          name="app-list"
          tag="div"
          class="app-grid"
          appear
        >
          <div
            v-for="(app, index) in filteredApps"
            :key="app.id"
            class="app-card"
            :class="{ 'popular-widget-card': app.isWidget, 'local-app-card': app.is_local }"
            @click="!app.isWidget ? openApp(app) : null"
            role="article"
            :aria-label="'Open ' + app.name"
          >
            <template v-if="app.isWidget">
                <div class="pop-card-header">
                   <v-icon color="#ff9800" size="20" class="mr-2 heart-beat">mdi-fire</v-icon> TRENDING APPS
                </div>
                <div class="pop-list-scroll hide-scrollbar">
                   <div v-for="popApp in app.items" :key="popApp.id" class="pop-list-item" @click.stop="openApp(popApp)">
                      <img :src="resolveIcon(popApp)" class="pop-mini-icon" @error="(e) => e.target.src='https://cdn-icons-png.flaticon.com/512/566/566737.png'" />
                      <div class="pop-mini-info">
                         <div class="pop-mini-name">{{ popApp.name }}</div>
                         <div class="pop-mini-cat">{{ popApp.category || 'App' }}</div>
                      </div>
                   </div>
                </div>
            </template>

            <template v-else>
              <div class="card-media">
                <img
                  v-if="!imgErrors[app.id]"
                  :key="'cover-' + app.id + '-' + activeLang"
                  :src="resolveImage(app)"
                  :loading="index < 4 ? 'eager' : 'lazy'"
                  :decoding="index < 4 ? 'sync' : 'async'"
                  :fetchpriority="index < 4 ? 'high' : 'low'"
                  :alt="app.name + ' App Cover Image'"
                  class="media-img"
                  @load="onImgLoad"
                  @error="() => handleImgError(app.id)"
                >
                <div v-else class="media-fallback" :class="{'local-fallback': app.is_local}">
                  <template v-if="app.is_local">
                    <img :src="resolveIcon(app)" class="fallback-icon" @error="(e) => e.target.src='https://cdn-icons-png.flaticon.com/512/566/566737.png'" />
                    <span class="fallback-title">{{ app.name }}</span>
                  </template>
                  <v-icon v-else size="32" color="var(--c-brand)" style="opacity:0.8">mdi-image-broken-variant</v-icon>
                </div>

                <div class="media-overlay"></div>

                <span v-if="app.is_local" class="tier-badge local-badge">LOCAL OS</span>
                <span v-else-if="app.tier && app.tier !== 'free'" class="tier-badge">{{ app.tier }}</span>

                <div class="action-overlay">
                  <button
                      class="icon-circle-btn mr-2"
                      :class="{ 'btn-loved': isFavorite(app.id) }"
                      @click.stop="toggleFavorite(app.id)"
                      :aria-label="isFavorite(app.id) ? 'Remove ' + app.name + ' from favorites' : 'Add ' + app.name + ' to favorites'"
                      title="Toggle Favorite"
                  >
                    <v-icon size="18" class="action-icon">
                      {{ isFavorite(app.id) ? 'mdi-heart' : 'mdi-heart-outline' }}
                    </v-icon>
                  </button>

                  <button class="icon-circle-btn share-btn" @click.stop="shareApp(app)" :aria-label="'Share ' + app.name" title="Share App">
                    <v-icon size="18" class="action-icon">mdi-share-variant</v-icon>
                  </button>
                </div>
              </div>

              <div class="card-content">
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="app-icon-small">
                    <img
                      :src="resolveIcon(app)"
                      loading="lazy"
                      width="28"
                      height="28"
                      :alt="app.name + ' Logo'"
                      @error="(e) => e.target.src='https://cdn-icons-png.flaticon.com/512/566/566737.png'"
                    />
                  </div>
                  <div class="rating-pill" v-if="app.rating" aria-label="Rating">
                    <v-icon size="12" color="#fbbf24" class="mr-1">mdi-star</v-icon>
                    <span>{{ app.rating }}</span>
                  </div>
                </div>
                <h3 class="app-name" :title="app.name">{{ app.name }}</h3>
                <p class="app-desc" :title="app.description">{{ app.description }}</p>
                <div class="mt-auto pt-3 d-flex align-center justify-space-between">
                  <span class="cat-tag">{{ app.category || 'General' }}</span>
                </div>
              </div>
            </template>
          </div>
        </TransitionGroup>

        <div style="height: 120px;"></div>
      </div>
    </main>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="1500" location="top" class="mt-safe">
      <div class="d-flex align-center">
        <v-icon size="20" class="mr-2">{{ snackbar.icon }}</v-icon>
        <span style="font-weight: 600; font-size: 0.95rem;">{{ snackbar.text }}</span>
      </div>
    </v-snackbar>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onActivated, reactive, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUiStore } from '@/store/ui';
import { useAppStore } from '@/store/apps';
import { useSocketStore } from '@/store/socket';

const router = useRouter();
const route = useRoute();
const uiStore = useUiStore();
const appStore = useAppStore();
const socketStore = useSocketStore();

const loading = ref(true);
const searchQuery = ref('');
const currentFilter = ref('all');
const scrollContainer = ref(null);
const imgErrors = reactive({});
const snackbar = reactive({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' });
let debounceTimer = null;

const showSuggestions = ref(false);

const activeLang = computed(() => {
  return uiStore.currentLang || uiStore.lang || uiStore.locale || document.documentElement.lang || 'id';
});

const themeStyles = computed(() => {
  const theme = uiStore.currentTheme;
  const base = {
    '--c-bg-page': '#0f1115', '--c-bg-card': '#1e2025', '--c-text-main': '#ffffff',
    '--c-text-muted': '#94a3b8', '--c-border': 'rgba(255,255,255,0.08)', '--c-brand': '#00dc82',
    '--c-input-bg': 'rgba(255,255,255,0.03)', '--c-shadow': 'rgba(0,0,0,0.4)', 'font-family': 'inherit'
  };

  if (theme === 'light') {
    return { ...base, '--c-bg-page': '#f8fafc', '--c-bg-card': '#ffffff', '--c-text-main': '#0f172a', '--c-text-muted': '#64748b', '--c-border': '#e2e8f0', '--c-brand': '#2563eb', '--c-input-bg': '#f1f5f9', '--c-shadow': 'rgba(0,0,0,0.05)' };
  } else if (theme === 'hacker') {
    return { ...base, '--c-bg-page': '#000000', '--c-bg-card': '#050505', '--c-text-main': '#00ff00', '--c-text-muted': '#008f00', '--c-border': '#003300', '--c-brand': '#00ff00', '--c-input-bg': '#001100', '--c-shadow': 'none', 'font-family': "'Courier New', monospace" };
  }
  return base;
});

const toggleFavorite = (id) => { appStore.toggleFavorite(id); };
const isFavorite = (id) => appStore.favoriteIds.includes(id);

const shareApp = async (app) => {
  const url = `${window.location.origin}/flow/${app.id}`;
  try {
    await navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard', 'success', 'mdi-content-copy');
  } catch (err) {
    showToast('Failed to copy', 'error', 'mdi-alert-circle');
  }
};

const showToast = (msg, color, icon) => {
  snackbar.text = msg; snackbar.icon = icon; snackbar.color = color === 'success' ? 'var(--c-brand)' : (color === 'error' ? '#ef4444' : '#334155'); snackbar.show = true;
};

const openApp = (app) => {
  requestAnimationFrame(() => {
    const appId = app.id || app.slug;
    if (appStore.addToRecent) appStore.addToRecent(appId);

    if (app.is_local) {
      sessionStorage.setItem(`flowork_local_app_${appId}`, JSON.stringify(app));
    }

    window.location.href = `/flow/${appId}`;
  });
};

const setCategory = (cat) => {
  currentFilter.value = cat;
  if (scrollContainer.value) scrollContainer.value.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleSearchInput = () => {
  showSuggestions.value = true;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { updateUrlQuery(); }, 300);
};

const selectSuggestion = (app) => {
  searchQuery.value = app.name;
  showSuggestions.value = false;
  openApp(app);
};

const clearSearch = () => {
  searchQuery.value = '';
  showSuggestions.value = false;
  updateUrlQuery();
};

const getTitle = () => {
  if(searchQuery.value) return 'Search Results';
  if(currentFilter.value === 'favorites') return 'Favorite Apps';
  if(currentFilter.value === 'local') return 'My PC Offline Apps';
  return currentFilter.value === 'all' ? 'Featured Apps' : formatText(currentFilter.value);
};

const fetchRegistry = async (force = false) => {
  if (appStore.installedApps.length > 0 && !force) {
      loading.value = false;
      finalizeLoad();
      return;
  }

  loading.value = true;
  try {
    await appStore.fetchInstalledApps(force);
  } catch (e) {
    console.error("Failed to fetch registry:", e);
    showToast("Failed to load apps", "error", "mdi-wifi-off");
  } finally {
    loading.value = false;
    finalizeLoad();
  }
};

const finalizeLoad = () => {
  if (route.query.q) searchQuery.value = route.query.q;
};

const updateUrlQuery = () => {
  const query = searchQuery.value ? { q: searchQuery.value } : {};
  router.replace({ query });
};

const formatText = (str) => (str === 'all' ? 'All' : str.charAt(0).toUpperCase() + str.slice(1));

// [FIXED] Logika cover image dipastikan menembak localhost beserta nama file aslinya
const resolveImage = (app) => {
  let img = app.coverUrl || app.seo?.og_image || 'cover_mobile.webp';

  if (app.is_local) {
      if (img.startsWith('http') || img.startsWith('data:')) return img;
      return `http://127.0.0.1:5000/local-apps/${app.id}/${img}`;
  }

  if (img.startsWith('http') || img.startsWith('data:')) return img;
  if (img.startsWith('/')) return img;

  const p = app.path || `/store/${app.id}`;
  return `${p.replace(/\/$/, '')}/${img}`;
};

watch(() => activeLang.value, () => {
  Object.keys(imgErrors).forEach(key => {
    delete imgErrors[key];
  });
});

// [MODIFIED] Ekstraksi Ikon Dinamis dari Manifest Lokal App
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

  let ico = app.icon || 'icon.svg';
  if (ico.startsWith('http') || ico.startsWith('data:') || ico.startsWith('/')) return ico;

  const p = app.path || `/store/${app.id}`;
  return `${p.replace(/\/$/, '')}/${ico}`;
};

const handleImgError = (id) => { imgErrors[id] = true; };
const onImgLoad = (e) => { e.target.classList.add('loaded'); };

const categories = computed(() => {
  const cats = new Set(['all']);
  const combinedApps = [...appStore.installedApps, ...appStore.localEngineApps];
  combinedApps.forEach(app => {
      if (app.android !== 'no' && app.category) cats.add(app.category);
  });
  return Array.from(cats);
});

const suggestionResults = computed(() => {
  if (!searchQuery.value) return [];
  const q = searchQuery.value.toLowerCase();
  const combinedApps = [...appStore.installedApps, ...appStore.localEngineApps];
  return combinedApps
    .filter(app => app.android !== 'no')
    .filter(app => app.name.toLowerCase().includes(q))
    .slice(0, 5);
});

const filteredApps = computed(() => {
  let apps = [...appStore.installedApps, ...appStore.localEngineApps];
  apps = apps.filter(app => app.android !== 'no');

  const popularApps = apps.filter(app => app.popular === 'yes');

  if (currentFilter.value === 'favorites') {
    apps = apps.filter(app => appStore.favoriteIds.includes(app.id));
  } else if (currentFilter.value === 'local') {
    apps = apps.filter(app => app.is_local);
  } else if (currentFilter.value !== 'all') {
    apps = apps.filter(a => a.category === currentFilter.value);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    apps = apps.filter(app => {
      return app.name.toLowerCase().includes(q) ||
             app.description?.toLowerCase().includes(q) ||
             app.seo?.keywords?.some(k => k.toLowerCase().includes(q));
    });
  }

  if (!searchQuery.value && currentFilter.value === 'all' && popularApps.length > 0) {
    const popularWidget = {
      id: 'widget-popular',
      isWidget: true,
      items: popularApps
    };
    if (apps.length > 0) {
      apps.splice(1, 0, popularWidget);
    } else {
      apps.push(popularWidget);
    }
  }

  return apps;
});

const handleClickOutside = (e) => {
  if (!e.target.closest('.search-box')) {
    showSuggestions.value = false;
  }
};

onMounted(() => {
  uiStore.initTheme();
  fetchRegistry();
  window.addEventListener('click', handleClickOutside);
  socketStore.connect();
});

onActivated(() => {
  if (appStore.installedApps.length === 0) {
    fetchRegistry(true);
  } else {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  window.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Copied styles from original AppStore.vue */
.store-wrapper { position: absolute; inset: 0; display: flex; flex-direction: column; background-color: var(--c-bg-page); color: var(--c-text-main); overflow: hidden; transition: background-color 0.3s ease, color 0.3s ease; z-index: 10; contain: strict; }
.theme-bg { position: absolute; top: 0; left: 0; right: 0; height: 500px; background: radial-gradient(circle at 50% -20%, var(--c-brand), transparent 70%); opacity: 0.12; pointer-events: none; z-index: 0; filter: blur(40px); }
.center-container { width: 100%; max-width: 1280px; margin: 0 auto; position: relative; padding-top: 70px; }
.px-safe { padding-left: max(20px, env(safe-area-inset-left)); padding-right: max(20px, env(safe-area-inset-right)); }
.store-content { flex: 1; overflow-y: auto; overflow-x: hidden; z-index: 1; -webkit-overflow-scrolling: touch; padding-bottom: 20px; contain: content; }
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.store-controls { width: 100%; position: relative; z-index: 50; }
.search-box { display: flex; align-items: center; background: var(--c-input-bg); border: 1px solid var(--c-border); border-radius: 16px; padding: 0 16px; height: 50px; transition: 0.3s; backdrop-filter: blur(10px); position: relative; z-index: 100; }
.search-box:focus-within { border-color: var(--c-brand); box-shadow: 0 4px 20px rgba(0,0,0,0.2); transform: translateY(-1px); background: var(--c-bg-card); }
.search-icon { color: var(--c-text-muted); opacity: 0.7; }
.native-input { flex: 1; border: none; outline: none; background: transparent !important; color: var(--c-text-main) !important; font-size: 1rem; margin: 0 10px; font-weight: 500; height: 100%; }
.native-input::placeholder { color: var(--c-text-muted); opacity: 0.6; }
.clear-btn { background: none; border: none; color: var(--c-text-muted); cursor: pointer; display: flex; opacity: 0.7; transition: 0.2s; }
.clear-btn:hover { opacity: 1; color: var(--c-text-main); }
.suggestion-list { position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: var(--c-bg-card); border: 1px solid var(--c-border); border-radius: 16px; z-index: 9999; overflow: hidden; padding: 8px 0; box-shadow: 0 15px 40px rgba(0,0,0,0.5); backdrop-filter: blur(20px); }
.suggestion-item { display: flex; align-items: center; padding: 10px 16px; cursor: pointer; transition: all 0.2s; }
.suggestion-item:hover { background: rgba(255,255,255,0.05); padding-left: 20px; }
.suggestion-icon-wrapper { width: 34px; height: 34px; border-radius: 8px; overflow: hidden; background: var(--c-bg-page); border: 1px solid var(--c-border); flex-shrink: 0; }
.suggestion-app-icon { width: 100%; height: 100%; object-fit: cover; }
.suggestion-text { color: var(--c-text-main); font-weight: 600; font-size: 0.95rem; line-height: 1.2; }
.suggestion-subtext { font-size: 0.7rem; color: var(--c-text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.cat-scroll { display: flex; gap: 12px; overflow-x: auto; padding: 4px 10px 10px 10px; -webkit-overflow-scrolling: touch; scroll-behavior: smooth; flex-wrap: nowrap; }
.cat-chip { padding: 8px 18px; border-radius: 99px; background: rgba(255,255,255,0.03); border: 1px solid var(--c-border); color: var(--c-text-muted); font-size: 0.85rem; font-weight: 600; white-space: nowrap; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; backdrop-filter: blur(4px); flex-shrink: 0; }
.cat-chip:hover { background: rgba(255,255,255,0.08); border-color: var(--c-text-muted); color: var(--c-text-main); transform: translateY(-1px); }
.cat-chip.active { background: var(--c-brand); color: #000; border-color: var(--c-brand); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.cat-chip.special { border-color: rgba(255, 34, 68, 0.3); background: rgba(255, 34, 68, 0.05); color: #ff2244; }
.cat-chip.special:hover { background: rgba(255, 34, 68, 0.1); }
.cat-chip.special.active { background: #ff2244; color: white; border-color: #ff2244; }
.heart-beat { animation: heartbeat 1.5s infinite; }
@keyframes heartbeat { 0% { transform: scale(1); } 15% { transform: scale(1.2); } 30% { transform: scale(1); } 45% { transform: scale(1.2); } 100% { transform: scale(1); } }
.section-title { font-size: 1.75rem; font-weight: 800; margin: 0; letter-spacing: -0.5px; background: linear-gradient(90deg, var(--c-text-main), var(--c-text-muted)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.count-badge { font-size: 0.75rem; background: var(--c-input-bg); padding: 4px 10px; border-radius: 99px; color: var(--c-text-muted); border: 1px solid var(--c-border); font-weight: 600; }
.app-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; position: relative; z-index: 10; }
.app-list-enter-active, .app-list-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.app-list-enter-from, .app-list-leave-to { opacity: 0; transform: translateY(10px); }
.app-list-leave-active { position: absolute; }
.app-card { background: var(--c-bg-card); border: 1px solid var(--c-border); border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; position: relative; cursor: pointer; box-shadow: 0 4px 6px var(--c-shadow); transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; backface-visibility: hidden; height: 100%; will-change: transform; }
.app-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.3); border-color: var(--c-brand); }
.app-card:active { transform: scale(0.98); }

/* [ADDED] Style Card Khusus Aplikasi Lokal PC */
.local-app-card { border-color: rgba(61, 220, 132, 0.4); background: linear-gradient(180deg, rgba(61,220,132,0.05), var(--c-bg-card)); }
.local-app-card:hover { border-color: #3DDC84; box-shadow: 0 10px 25px rgba(61,220,132,0.2); }
.local-badge { background: #3DDC84 !important; color: #000 !important; font-weight: 900 !important; box-shadow: 0 0 10px rgba(61,220,132,0.5); }

/* [ADDED] POPULAR WIDGET STYLES */
.popular-widget-card { background: linear-gradient(135deg, rgba(255,152,0,0.1), rgba(244,67,54,0.05)); border-color: rgba(255,152,0,0.3) !important; cursor: default !important; }
.popular-widget-card:hover { transform: translateY(0); box-shadow: 0 4px 6px var(--c-shadow); }
.pop-card-header { padding: 12px 16px; font-weight: 800; color: #ff9800; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; letter-spacing: 1px; font-size: 0.9rem; }
.pop-list-scroll { flex: 1; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 8px; }
.pop-list-item { display: flex; align-items: center; padding: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; cursor: pointer; transition: 0.2s; }
.pop-list-item:hover { background: rgba(255,152,0,0.1); border-color: rgba(255,152,0,0.3); transform: translateX(4px); }
.pop-mini-icon { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; }
.pop-mini-info { margin-left: 12px; flex: 1; overflow: hidden; }
.pop-mini-name { font-size: 0.85rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--c-text-main); }
.pop-mini-cat { font-size: 0.65rem; color: var(--c-text-muted); text-transform: uppercase; }

.card-media { width: 100%; aspect-ratio: 9/16; background: var(--c-input-bg); position: relative; overflow: hidden; }
.media-img { width: 100%; height: 100%; object-fit: contain; opacity: 0; transition: transform 0.4s, opacity 0.3s; will-change: transform, opacity; }
.app-card:hover .media-img { transform: scale(1.05); }
.media-img.loaded { opacity: 1; }
.media-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%); opacity: 0; transition: opacity 0.3s; pointer-events: none; }
.app-card:hover .media-overlay { opacity: 1; }
.tier-badge { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); color: #fff; font-size: 0.65rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); text-transform: uppercase; letter-spacing: 0.5px; }
.action-overlay { position: absolute; top: 10px; left: 10px; display: flex; opacity: 1; transform: none; }
.icon-circle-btn { width: 32px; height: 32px; background: #000000; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: transform 0.2s; z-index: 10; }
.icon-circle-btn .action-icon { color: #29b6f6 !important; }
.icon-circle-btn:hover { transform: scale(1.1); border-color: #ffffff; box-shadow: 0 0 8px rgba(41, 182, 246, 0.5); }
.icon-circle-btn.btn-loved { background: #000000; border-color: #FFD700; box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }
.icon-circle-btn.btn-loved .action-icon { color: #FFD700 !important; filter: drop-shadow(0 0 4px #FFD700); animation: pop-icon 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes pop-icon { 0% { transform: scale(0.8); } 100% { transform: scale(1); } }
.icon-circle-btn.share-btn:hover .action-icon { color: #ffffff !important; }
.card-content { padding: 16px; flex: 1; display: flex; flex-direction: column; }
.app-icon-small { width: 32px; height: 32px; border-radius: 8px; overflow: hidden; background: var(--c-bg-page); border: 1px solid var(--c-border); flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.app-icon-small img { width: 100%; height: 100%; object-fit: cover; }
.rating-pill { display: flex; align-items: center; gap: 3px; font-size: 0.75rem; font-weight: 700; background: var(--c-input-bg); padding: 3px 8px; border-radius: 8px; border: 1px solid var(--c-border); }
.app-name { font-size: 1rem; font-weight: 700; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.2; }
.app-desc { font-size: 0.8rem; color: var(--c-text-muted); display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1; line-height: 1.5; }
.cat-tag { font-size: 0.7rem; color: var(--c-brand); font-weight: 700; border: 1px solid var(--c-border); padding: 3px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; background: rgba(var(--c-brand), 0.05); }
.state-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; opacity: 0.8; }
.reset-link { color: var(--c-brand); font-size: 0.9rem; font-weight: 600; text-decoration: none; background: rgba(var(--c-brand), 0.1); border: 1px solid var(--c-brand); padding: 8px 20px; border-radius: 99px; cursor: pointer; transition: 0.2s; }
.reset-link:hover { background: var(--c-brand); color: #000; }
.mt-safe { margin-top: env(safe-area-inset-top); }
.skeleton-card { pointer-events: none; border-color: transparent; }
.skeleton-pulse { background: var(--c-input-bg); animation: pulse 1.5s infinite ease-in-out; }
@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }
.skeleton-icon { width: 32px; height: 32px; border-radius: 8px; }
.skeleton-rating { width: 40px; height: 18px; border-radius: 8px; }
.skeleton-text-lg { width: 70%; height: 18px; border-radius: 4px; }
.skeleton-text-sm { width: 100%; height: 12px; border-radius: 4px; }

/* [MODIFIED] Styling untuk Fallback Khusus Aplikasi Lokal tanpa Cover Gambar */
.media-fallback { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--c-input-bg); padding: 20px; text-align: center; }
.local-fallback { background: linear-gradient(135deg, rgba(61,220,132,0.15), rgba(0,0,0,0.6)); }
.fallback-icon { width: 56px; height: 56px; object-fit: contain; margin-bottom: 12px; border-radius: 12px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5)); }
.fallback-title { font-size: 1.1rem; font-weight: 800; font-family: 'Fredoka', 'Inter', sans-serif; line-height: 1.2; color: #fff; text-shadow: 0 2px 5px rgba(0,0,0,0.8); display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
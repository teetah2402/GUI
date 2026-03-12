//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/components/layout/mobile/GuestLeftSidebarMobile.vue
// STYLE     : The OS Launchpad (Bottom Sheet System)
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <Teleport to="body">
    <div class="mobile-launchpad-wrapper" :style="themeStyles">
      <transition name="fade">
        <div v-if="isOpen" class="bottom-sheet-overlay" @click="$emit('close')"></div>
      </transition>

      <div class="bottom-sheet" :class="{ 'is-open': isOpen }">
        <div class="sheet-handle" @click="$emit('close')"></div>

        <div class="sheet-header">
          <h3>OS Launchpad</h3>
          <button class="close-btn" @click="$emit('close')" aria-label="Close Launchpad">
            <i class="mdi mdi-close"></i>
          </button>
        </div>

        <div class="sheet-content hide-scrollbar">

          <div class="quick-actions-grid">
             <button class="qa-btn" @click.stop.prevent="triggerBuildManualOnly">
                 <div class="qa-icon color-build"><i class="mdi mdi-code-tags"></i></div>
                 <span>Submit Manual</span>
             </button>

             <button class="qa-btn" @click.stop.prevent="triggerAIBuildOnly">
                 <div class="qa-icon color-ai"><i class="mdi mdi-robot-excited-outline"></i></div>
                 <span>Generate AI</span>
             </button>

             <button class="qa-btn" @click.stop.prevent="triggerUpload">
                 <div class="qa-icon color-upload"><i class="mdi mdi-upload"></i></div>
                 <span>Upload</span>
             </button>

             <button class="qa-btn" @click.stop.prevent="triggerDownload">
                 <div class="qa-icon color-download"><i class="mdi mdi-download"></i></div>
                 <span>Download</span>
             </button>
          </div>

          <input type="file" ref="fileInput" @change="handleFileUpload" accept=".json,application/json" style="display: none" />

          <div class="divider-line"></div>

          <div class="search-box-m">
            <i class="mdi mdi-magnify search-icon" aria-hidden="true"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search apps..."
              class="search-input-m"
            >
            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn-m">
              <i class="mdi mdi-close"></i>
            </button>
          </div>

          <div class="category-filter-area no-scrollbar">
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
              >
                  <i class="mdi mdi-heart" style="font-size: 10px; margin-right: 4px;"></i> Favs
              </button>

              <button
                  class="cat-chip local-chip"
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

          <div v-if="appStore.isLoading" class="loading-state">
             <div class="spinner"></div>
             <span>Loading Apps...</span>
          </div>

          <div v-else-if="finalFilteredApps.length === 0" class="empty-state">
             <i class="mdi mdi-package-variant-closed icon-huge"></i>
             <span>No apps found</span>
          </div>

          <div v-else class="apps-grid-m">
            <div
              v-for="app in finalFilteredApps"
              :key="app.id"
              class="app-card-m"
              :class="{ 'local-app-card': app.is_local }"
            >
              <div class="card-click-area" @click="handleAppClick(app)">
                  <div class="card-cover">
                     <img
                       v-if="!imageErrors[app.id]"
                       :src="resolveImage(app)"
                       class="cover-img"
                       loading="lazy"
                       alt="App Cover"
                       @error="handleImageFallback(app.id, $event)"
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

                     <div v-if="app.is_local" class="local-badge-tag">LOCAL PC</div>
                     <div class="category-tag">{{ app.category || 'APP' }}</div>
                  </div>
              </div>

              <div class="card-actions-m">
                  <button
                      class="action-btn-m fav-btn"
                      :class="{ 'is-active': isFavorite(app.id) }"
                      @click.stop="toggleFavorite(app.id)"
                  >
                      <i class="mdi" :class="isFavorite(app.id) ? 'mdi-heart' : 'mdi-heart-outline'"></i>
                  </button>

                  <button
                      class="action-btn-m share-btn"
                      @click.stop="copyShareLink(app)"
                  >
                      <i class="mdi mdi-link-variant"></i>
                      <span v-if="copiedId === app.id" class="copy-tooltip">Copied!</span>
                  </button>
              </div>

              <div class="card-info-m" @click="handleAppClick(app)">
                 <span class="app-name">{{ app.name }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </Teleport>
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

const fileInput = ref(null);
const searchQuery = ref('');
const selectedCategory = ref(null);
const showFavoritesOnly = ref(false);
const imageErrors = ref({});
const copiedId = ref(null);

const currentTheme = ref('dark');
let themeObserver = null;

const syncThemeFromGlobal = () => {
  const globalTheme = document.documentElement.getAttribute('data-theme');
  currentTheme.value = globalTheme || localStorage.getItem('flowork_os_theme') || 'dark';
};

const themeStyles = computed(() => {
  const theme = currentTheme.value;
  const base = {
    '--bg': '#0f172a', '--text': '#ffffff', '--text-mute': '#94a3b8',
    '--border': 'rgba(255, 255, 255, 0.1)', '--accent-1': '#00ffcc',
    '--c-bg': 'rgba(30, 41, 59, 0.7)', '--tag-bg': 'rgba(0,0,0,0.7)', '--tag-text': '#ffffff',
    '--chip-bg': 'rgba(255,255,255,0.05)', '--chip-active': '#00ffcc', '--chip-text-active': '#000',
    '--act-bg': 'rgba(0,0,0,0.6)'
  };

  if (theme === 'light') {
    return {
      '--bg': '#ffffff', '--text': '#0f172a', '--text-mute': '#64748b',
      '--border': '#e2e8f0', '--accent-1': '#3b82f6',
      '--c-bg': '#f8fafc', '--tag-bg': 'rgba(255,255,255,0.8)', '--tag-text': '#0f172a',
      '--chip-bg': '#f1f5f9', '--chip-active': '#3b82f6', '--chip-text-active': '#ffffff',
      '--act-bg': 'rgba(255,255,255,0.8)'
    };
  }
  return base;
});

const triggerBuildManualOnly = () => {
    emit('close');
    setTimeout(() => { window.dispatchEvent(new CustomEvent('flowork-open-builder')); }, 100);
};

const triggerAIBuildOnly = () => {
    emit('close');
    setTimeout(() => { window.dispatchEvent(new CustomEvent('flowork-open-ai-builder')); }, 100);
};

const triggerUpload = () => {
    if (fileInput.value) {
        fileInput.value.click();
    }
};

const triggerDownload = () => {
    emit('close');
    setTimeout(() => { window.dispatchEvent(new CustomEvent('flowork-app-download')); }, 100);
};

const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const parsed = JSON.parse(event.target.result);
            window.dispatchEvent(new CustomEvent('flowork-app-upload', { detail: parsed }));
            uiStore.showNotification({ text: "Apps Imported Successfully!", color: "success" });
            emit('close');
        } catch (err) {
            uiStore.showNotification({ text: "Invalid JSON format", color: "error" });
        }
        e.target.value = null;
    };
    reader.readAsText(file);
};

const apps = computed(() => {
    const combinedApps = [...appStore.installedApps, ...appStore.localEngineApps];
    return combinedApps.filter(app => app.android !== 'no');
});

const uniqueCategories = computed(() => {
    const cats = new Set();
    apps.value.forEach(app => { if (app.category && !app.is_local) cats.add(app.category); });
    return Array.from(cats).sort();
});

const finalFilteredApps = computed(() => {
    let result = apps.value;
    if (showFavoritesOnly.value) result = result.filter(app => appStore.favoriteIds.includes(app.id));
    else if (selectedCategory.value === 'local') result = result.filter(app => app.is_local);
    else if (selectedCategory.value) result = result.filter(app => app.category === selectedCategory.value);

    if (searchQuery.value) {
        const lowerQ = searchQuery.value.toLowerCase();
        result = result.filter(app => app.name.toLowerCase().includes(lowerQ) || (app.description && app.description.toLowerCase().includes(lowerQ)));
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

// [MODIFIED] Penanganan error fallback image yang lebih aman agar tidak infinite loop
const handleImageFallback = (appId, event) => {
    const currentSrc = event.target.src;
    if (currentSrc.includes('cover_mobile.webp') && !currentSrc.includes('cover.webp')) {
        event.target.src = currentSrc.replace('cover_mobile.webp', 'cover.webp');
    } else {
        imageErrors.value[appId] = true;
    }
};

// [MODIFIED] Resolusi Image Dinamis dengan Fallback ke Localhost
const resolveImage = (app) => {
  if (app.is_local) {
      let img = app.coverUrl || app.seo?.og_image || 'cover_mobile.webp';
      if (img.startsWith('http') || img.startsWith('data:')) return img;
      return `http://127.0.0.1:5000/local-apps/${app.id || app.slug}/${img}`;
  }

  if (app.coverUrl) return app.coverUrl;
  let img = app.cover_mobile || 'cover_mobile.webp';
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
    emit('close');
    const appId = app.id || app.slug;
    if (appStore.addToRecent) appStore.addToRecent(appId);

    if (app.is_local) sessionStorage.setItem(`flowork_local_app_${appId}`, JSON.stringify(app));

    if (route.path.includes('/canvas')) {
        window.dispatchEvent(new CustomEvent('flowork-launch-app', { detail: app }));
    } else {
        router.push({ path: '/canvas', query: { app: appId, t: Date.now() } });
    }
  });
};

onMounted(async () => {
  appStore.setDeviceType('mobile');
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
.mobile-launchpad-wrapper {
    position: fixed; inset: 0; pointer-events: none; z-index: 999999 !important;
    font-family: 'Space Grotesk', sans-serif;
}
.bottom-sheet-overlay {
    position: absolute; inset: 0;
    /* USER RULE #1: Remove blur */
    /* backdrop-filter: blur(3px); */
    background: rgba(0, 0, 0, 0.85);
    pointer-events: auto; transition: opacity 0.3s;
}

.bottom-sheet {
    position: absolute; left: 0; width: 100%;
    background: var(--bg); color: var(--text); border-top: 1px solid var(--border);
    border-top-left-radius: 24px; border-top-right-radius: 24px;
    pointer-events: auto; display: flex; flex-direction: column;
    box-shadow: 0 -5px 20px rgba(0,0,0,0.4); max-height: 85vh; height: 85vh;

    bottom: 0;
    transform: translateY(100%);
    transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
    will-change: transform;
}
.bottom-sheet.is-open { transform: translateY(0); }

.sheet-handle {
    width: 50px; height: 5px; background: rgba(255,255,255,0.2);
    border-radius: 3px; margin: 15px auto 10px auto; flex-shrink: 0;
}

.sheet-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0 20px 15px 20px; flex-shrink: 0;
}
.sheet-header h3 { margin: 0; font-size: 1.3rem; font-weight: 800; letter-spacing: -0.5px; }
.close-btn {
    background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text);
    width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; cursor: pointer; transition: 0.2s;
}
.close-btn:active { background: rgba(255,255,255,0.1); transform: scale(0.9); }

.sheet-content {
    flex: 1; overflow-y: auto; padding: 0 20px 20px 20px; -webkit-overflow-scrolling: touch;
}
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.quick-actions-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;
}
.qa-btn {
    background: var(--c-bg); border: 1px solid var(--border); border-radius: 16px;
    padding: 12px 5px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s; cursor: pointer; color: var(--text);
}
.qa-btn:active { transform: scale(0.95); background: rgba(255,255,255,0.08); }
.qa-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 20px; }
.qa-btn span { font-size: 0.65rem; font-weight: 700; white-space: nowrap; text-align: center; }

.color-build { color: #3b82f6; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); }
.color-ai { color: #a855f7; background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); }
.color-upload { color: #10b981; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); }
.color-download { color: #f59e0b; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); }

.divider-line { width: 100%; height: 1px; background: var(--border); margin-bottom: 20px; opacity: 0.5; }

.search-box-m { position: relative; display: flex; align-items: center; margin-bottom: 15px; }
.search-input-m { width: 100%; background: var(--c-bg); border: 1px solid var(--border); padding: 12px 40px; border-radius: 12px; color: var(--text); font-size: 1rem; transition: 0.2s; }
.search-input-m:focus { outline: none; border-color: var(--accent-1); }
.search-icon { position: absolute; left: 14px; font-size: 1.2rem; color: var(--text-mute); }
.clear-btn-m { position: absolute; right: 10px; opacity: 0.5; background: none; border: none; color: inherit; font-size: 1.2rem; padding: 5px; }

.category-filter-area {
    display: flex; gap: 8px; overflow-x: auto; white-space: nowrap; margin-bottom: 20px; padding-bottom: 5px;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    pointer-events: auto;
}
.cat-chip { background: var(--chip-bg); border: 1px solid var(--border); color: var(--text); padding: 8px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; transition: all 0.2s; flex-shrink: 0; }
.cat-chip:active { transform: scale(0.95); }
.cat-chip.active { background: var(--chip-active); color: var(--chip-text-active); border-color: var(--chip-active); }
.local-chip { border-color: #3DDC84; color: #3DDC84; }

.apps-grid-m { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; padding-bottom: 30px; }

.app-card-m { background: var(--c-bg); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; position: relative; display: flex; flex-direction: column; transition: transform 0.2s; }
.app-card-m:active { transform: scale(0.97); border-color: var(--accent-1); }
.local-app-card { border-color: rgba(61, 220, 132, 0.4); }

.card-click-area { width: 100%; }
.card-cover { width: 100%; aspect-ratio: 16/10; background: #000; position: relative; overflow: hidden; }
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.fallback-cover { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1e1e24 0%, #2a2a35 100%); }
.fallback-icon { width: 40px; height: 40px; opacity: 0.8; }

.local-badge-tag { position: absolute; top: 8px; left: 8px; background: #3DDC84; color: #000; padding: 3px 8px; border-radius: 6px; font-size: 0.6rem; font-weight: 900; }

.category-tag {
    position: absolute; top: 8px; right: 8px; background: var(--tag-bg); color: var(--tag-text); padding: 3px 8px; border-radius: 6px; font-size: 0.6rem; font-weight: 700;
    /* USER RULE #1: Remove blur */
    /* backdrop-filter: blur(4px); */
}

.card-actions-m { position: absolute; bottom: 40px; right: 8px; display: flex; gap: 6px; z-index: 5; }

.action-btn-m {
    width: 32px; height: 32px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.2); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; position: relative;
    /* USER RULE #1: Remove blur */
    /* background: var(--act-bg); backdrop-filter: blur(5px); */
    background: rgba(0, 0, 0, 0.85);
}

.action-btn-m.fav-btn.is-active { color: #ff4444; }
.copy-tooltip { position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%); background: #000; color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; white-space: nowrap; }

.card-info-m { padding: 12px 10px; background: var(--c-bg); z-index: 6; position: relative; border-top: 1px solid rgba(255,255,255,0.05); }
.app-name { font-size: 0.9rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; text-align: center; }

.loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; gap: 15px; opacity: 0.6; }
.icon-huge { font-size: 3rem; }
.spinner { width: 30px; height: 30px; border: 3px solid var(--accent-1); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* [MODIFIED] Styling untuk Fallback Khusus Aplikasi Lokal tanpa Cover Gambar */
.local-fallback { background: linear-gradient(135deg, rgba(61,220,132,0.15), rgba(0,0,0,0.6)) !important; flex-direction: column !important; text-align: center; padding: 10px; }
.local-fallback .fallback-icon { width: 48px; height: 48px; margin-bottom: 8px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5)); opacity: 1; }
.fallback-title { font-size: 0.9rem; font-weight: 800; font-family: 'Fredoka', 'Inter', sans-serif; line-height: 1.2; color: #fff; text-shadow: 0 2px 5px rgba(0,0,0,0.8); display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
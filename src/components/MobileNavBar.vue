//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\components\MobileNavBar.vue total lines 197 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="mobile-dock-container" :class="{ 'dock-hidden': hidden }">

    <div class="dock-centering-wrapper">

      <div class="dock-main-deck">

        <button type="button" class="dock-item fixed-btn" @click.stop="scrollHistoryLeft">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>
        </button>

        <div class="history-track hide-scrollbar" ref="historyContainer">
            <slot name="history"></slot>
        </div>

        <button type="button" class="dock-item fixed-btn" @click.stop="scrollHistoryRight">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>
        </button>

        <div class="mini-divider"></div>

        <button type="button" class="dock-item fixed-btn" @click.stop="handleSidebar">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        <button type="button" class="dock-item home-trigger fixed-btn" @click.stop="handleHome">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <button
            type="button"
            class="dock-item fixed-btn"
            :class="{ 'disabled-item': !isAppActive }"
            @click.stop="handleInfo"
        >
            <transition name="fade-scale" mode="out-in">
                <svg v-if="viewMode === 'info'" key="app" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <svg v-else key="info" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </transition>
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps({
  hidden: { type: Boolean, default: false },
  isAppActive: { type: Boolean, default: false },
  viewMode: { type: String, default: 'app' }
});

const emit = defineEmits(['back', 'home', 'sidebar', 'options', 'info']);
const historyContainer = ref(null);

const vibrate = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(10); } catch(e){}
  }
};

const handleBack = () => { vibrate(); emit('back'); };
const handleHome = () => { vibrate(); emit('home'); };
const handleSidebar = () => { vibrate(); emit('sidebar'); };
const handleInfo = () => { if (props.isAppActive) { vibrate(); emit('info'); } };

const scrollHistoryLeft = () => {
  vibrate();
  if (historyContainer.value) historyContainer.value.scrollBy({ left: -60, behavior: 'smooth' });
};

const scrollHistoryRight = () => {
  vibrate();
  if (historyContainer.value) historyContainer.value.scrollBy({ left: 60, behavior: 'smooth' });
};
</script>

<style scoped>
/* CONTAINER DASAR (MOBILE & DESKTOP SAMA) */
/* Kita pastikan width 100% dan bottom 0 di semua layar */
.mobile-dock-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%; /* SELALU FULL WIDTH */
  height: 64px;
  z-index: 999999;
  pointer-events: auto !important;

  /* BASE DEFAULT (DARK MODE) */
  background-color: rgba(15, 15, 15, 0.94);
  background-image:
    radial-gradient(circle at 0% 100%, rgba(56, 189, 248, 0.15) 0%, transparent 60%),
    radial-gradient(circle at 100% 0%, rgba(255, 215, 0, 0.15) 0%, transparent 60%);

  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);

  border-top: 1px solid rgba(255, 215, 0, 0.2);
  box-shadow: 0 -4px 30px rgba(0,0,0,0.3);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.3s;
}

/* Animasi Hide */
.dock-hidden { transform: translateY(120%); }

/* LIGHT MODE */
:global(body[data-theme="light"]) .mobile-dock-container,
:global(.v-theme--light) .mobile-dock-container {
    background-color: rgba(255, 255, 255, 0.95) !important;
    border-top: 1px solid rgba(0,0,0,0.1) !important;
}

:global(body[data-theme="light"]) .dock-item,
:global(.v-theme--light) .dock-item {
    color: #222222 !important;
    filter: none !important;
}

:global(body[data-theme="light"]) .dock-separator,
:global(.v-theme--light) .dock-separator {
    background: rgba(0,0,0,0.2) !important;
}

/* WRAPPER TENGAH */
/* Ini kuncinya: Background full, tapi isinya kita batasi max-width dan taruh tengah */
.dock-centering-wrapper {
  width: 100%;
  height: 100%;
  margin: 0 auto; /* Posisi Tengah */
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 4px;

  /* PEMBATAS UNTUK DESKTOP */
  /* Agar icon tidak menyebar dari ujung kiri ke ujung kanan monitor */
  max-width: 600px;
}

/* MAIN DECK */
.dock-main-deck {
    flex: 1;
    display: flex; align-items: center; justify-content: space-between;
    height: 100%;
    overflow: hidden;
    padding-right: 0;
}

/* HISTORY TRACK */
.history-track {
    flex: 1; height: 100%; display: flex; align-items: center;
    overflow-x: auto; overflow-y: hidden; scroll-behavior: smooth;
    margin: 0 2px;
    min-width: 0;

    mask-image: linear-gradient(to right, transparent, black 8px, black calc(100% - 8px), transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 8px, black calc(100% - 8px), transparent);
}

.mini-divider {
    width: 1px; height: 20px; background: rgba(255,255,255,0.15); margin: 0 2px; flex-shrink: 0;
}
:global(.v-theme--light) .mini-divider { background: rgba(0,0,0,0.1); }

/* ICON STYLES */
.dock-item {
  flex: 0 0 auto;
  width: 42px;
  height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; padding: 0; margin: 0; outline: none;
  color: #FFD700;
  filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));
  transition: all 0.2s; cursor: pointer;
  -webkit-tap-highlight-color: transparent; user-select: none;
}

.dock-item:active { transform: scale(0.9); }
.dock-item.disabled-item { opacity: 0.3; pointer-events: none; filter: grayscale(100%); }

.fade-scale-enter-active, .fade-scale-leave-active { transition: all 0.2s ease; }
.fade-scale-enter-from, .fade-scale-leave-to { opacity: 0; transform: scale(0.5); }

.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>

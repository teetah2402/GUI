//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\components\Ads.vue total lines 100 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="central-ad-zone">
    <template v-if="ADSENSE_ACTIVE">
        <div v-if="loading" class="ad-placeholder">
            <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
            <span class="ml-3 text-caption font-weight-bold text-grey">SPONSOR LOADING...</span>
        </div>
        <ins class="adsbygoogle"
             style="display:block; width: 100%; height: 100%; min-height: 250px;"
             data-ad-client="ca-pub-5071671342085199"
             :data-ad-slot="slotId"
             :data-ad-format="format"
             data-full-width-responsive="true"
             @vue:mounted="pushAd">
        </ins>
    </template>

    <div v-else class="clean-ad-card" @click="goToUpgrade">
        <div class="ad-content">
            <div class="icon-circle mb-3">
                <v-icon icon="mdi-diamond-stone" color="blue" size="32"></v-icon>
            </div>
            <h3 class="ad-title mb-1">Unlock Pro</h3>
            <p class="ad-subtitle mb-4 text-grey">
                Remove limits & support development.
            </p>
            <div class="clean-btn">UPGRADE</div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const ADSENSE_ACTIVE = false;

const props = defineProps({
  slotId: { type: String, default: '1234567890' },
  format: { type: String, default: 'auto' }
});

const loading = ref(true);

const pushAd = () => {
  if (!ADSENSE_ACTIVE) return;
  try {
    if (window.adsbygoogle) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      setTimeout(() => { loading.value = false; }, 1500);
    }
  } catch (e) { console.error("AdSense Push Error:", e); }
};

const goToUpgrade = () => {
    window.location.href = '/register';
};
</script>

<style scoped>
.central-ad-zone {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  overflow: hidden; margin: 0; padding: 0;
}
.clean-ad-card {
    width: 100%; height: 100%; min-height: 250px;
    background: #F8FAFC;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    cursor: pointer;
    transition: all 0.2s;
}
.clean-ad-card:hover { background: #F1F5F9; }
.ad-content { text-align: center; padding: 20px; }
.icon-circle {
    width: 50px; height: 50px; border-radius: 50%;
    background: rgba(37, 99, 235, 0.1);
    display: flex; justify-content: center; align-items: center;
    margin: 0 auto;
}
.ad-title { font-size: 1.1rem; font-weight: 800; color: #0F172A; }
.ad-subtitle { font-size: 0.8rem; }
.clean-btn {
    font-size: 0.75rem; font-weight: 700;
    color: #2563EB; border: 1px solid #2563EB;
    padding: 6px 16px; border-radius: 99px;
    display: inline-block;
}
.ad-placeholder {
  position: absolute; display: flex; align-items: center; justify-content: center;
  width: 100%; height: 100%; background: #eee; z-index: 0;
}
</style>

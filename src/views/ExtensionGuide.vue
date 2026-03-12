//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : src/views/ExtensionGuide.vue
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Atomic Isolation: 1 File = 1 Fungsi.
//#######################################################################

<template>
  <div class="about-wrapper" :style="themeStyles" :data-theme="uiStore.currentTheme">

    <div class="theme-bg"></div>

    <div class="header-container">
      <PublicHeader activePage="extension" @toggle-lang="updateLang" />
    </div>

    <main class="about-content">
      <div class="content-container">

        <div class="hero-section text-center">
          <div class="logo-container">
             <img src="/logo-android.svg" alt="Flowork Bridge" class="core-logo" />
             <div class="logo-glow"></div>
          </div>

          <h1 class="main-title orbitron-font">
            FLOWORK <span class="text-gradient">BRIDGE</span>
          </h1>

          <p class="hero-subtitle">
            {{ t.hero_subtitle }}
          </p>
        </div>

        <div class="section-block">
          <div class="section-header text-center">
            <h2 class="section-title orbitron-font">{{ t.features_title }}</h2>
            <div class="divider-center"></div>
          </div>

          <div class="credits-grid">
            <div v-for="feat in features" :key="feat.id" class="credit-card">
              <div class="card-icon blue">
                <i class="mdi" :class="feat.icon"></i>
              </div>
              <div class="card-content">
                <h3 class="credit-title text-blue">{{ feat.tag }}</h3>
                <strong class="credit-main">{{ t[feat.titleKey] }}</strong>
                <p class="credit-desc">{{ t[feat.descKey] }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="section-block">
          <div class="section-header text-center">
            <h2 class="section-title orbitron-font text-gold-gradient">{{ t.guide_title }}</h2>
            <p class="section-desc">{{ t.guide_subtitle }}</p>
          </div>

          <div class="steps-container">
            <div v-for="(step, index) in steps" :key="index" class="architect-card step-card">
              <div class="card-glass-bg"></div>
              <div class="step-number">{{ index + 1 }}</div>
              <div class="member-info">
                <h3 class="member-name">{{ t[step.titleKey] }}</h3>
                <p class="member-quote" style="font-style: normal; margin-top: 10px;">{{ t[step.descKey] }}</p>
                <div v-if="step.isDownload" class="mt-6">
                   <a href="https://floworkos.com/extension/flowork.zip" target="_blank" class="download-link-btn">
                     <i class="mdi mdi-download mr-2"></i> {{ t.btn_download_zip }}
                   </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="page-footer mt-16 text-center">
            <span class="copyright-text">&copy; {{ new Date().getFullYear() }} Flowork OS. {{ t.footer_rights }}</span>
        </div>

      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUiStore } from '@/store/ui';
import PublicHeader from '@/components/layout/PublicHeader.vue';

const uiStore = useUiStore();
const lang = ref(localStorage.getItem('flowork_lang') || 'en');

const updateLang = (newLang) => {
    lang.value = newLang;
    localStorage.setItem('flowork_lang', newLang);
};

const content = {
    id: {
        hero_subtitle: 'Jembatan sistem saraf digital yang menghubungkan aplikasi web Flowork dengan kemampuan browser asli secara penuh.',
        features_title: 'KEMAMPUAN GOD MODE',
        feat_1_title: 'Akses Storage',
        feat_1_desc: 'Menyimpan data aplikasi langsung di browser tanpa batasan LocalStorage biasa.',
        feat_2_title: 'Injeksi Script',
        feat_2_desc: 'Kemampuan untuk memanipulasi halaman web lain (Auto-fill, SEO Audit, dll).',
        feat_3_title: 'Zero Latency',
        feat_3_desc: 'Komunikasi langsung antar tab dengan kecepatan jaringan saraf Flowork.',
        guide_title: 'INSTALASI MANUAL',
        guide_subtitle: 'Karena sedang dalam tahap approval Chrome Store, silakan ikuti langkah berikut:',
        step_1_title: 'Unduh File ZIP',
        step_1_desc: 'Klik tombol di bawah untuk mendapatkan source code ekstensi Flowork OS Bridge.',
        step_2_title: 'Ekstrak Folder',
        step_2_desc: 'Gunakan aplikasi extractor (WinRAR/7Zip) untuk mengeluarkan isi folder ke komputer lo.',
        step_3_title: 'Buka Menu Extensions',
        step_3_desc: 'Ketik chrome://extensions di address bar browser Chrome lo.',
        step_4_title: 'Aktifkan Developer Mode',
        step_4_desc: 'Nyalakan toggle "Developer Mode" yang ada di pojok kanan atas halaman.',
        step_5_title: 'Load Unpacked',
        step_5_desc: 'Klik tombol "Load Unpacked" dan pilih folder hasil ekstrak tadi. Selesai!',
        btn_download_zip: 'UNDUH EXTENSION ZIP',
        footer_rights: 'God Mode diaktifkan oleh Flowork.',
    },
    en: {
        hero_subtitle: 'A digital nervous system bridge connecting Flowork web apps with full native browser capabilities.',
        features_title: 'GOD MODE CAPABILITIES',
        feat_1_title: 'Native Storage',
        feat_1_desc: 'Store app data directly in the browser bypassing standard LocalStorage limits.',
        feat_2_title: 'Script Injection',
        feat_2_desc: 'Ability to manipulate other web pages (Auto-fill, SEO Audit, etc).',
        feat_3_title: 'Zero Latency',
        feat_3_desc: 'Direct communication between tabs at Flowork neural speeds.',
        guide_title: 'MANUAL INSTALLATION',
        guide_subtitle: 'While awaiting Chrome Store approval, please follow these steps:',
        step_1_title: 'Download ZIP File',
        step_1_desc: 'Click the button below to get the Flowork OS Bridge extension source code.',
        step_2_title: 'Extract Folder',
        step_2_desc: 'Use an extractor (WinRAR/7Zip) to unpack the folder to your computer.',
        step_3_title: 'Open Extensions Menu',
        step_3_desc: 'Type chrome://extensions in your Chrome address bar.',
        step_4_title: 'Enable Developer Mode',
        step_4_desc: 'Switch on the "Developer Mode" toggle in the top right corner.',
        step_5_title: 'Load Unpacked',
        step_5_desc: 'Click "Load Unpacked" and select the extracted folder. Done!',
        btn_download_zip: 'DOWNLOAD EXTENSION ZIP',
        footer_rights: 'God Mode enabled by Flowork.',
    }
};

const t = computed(() => content[lang.value]);

const features = [
    { id: 1, tag: 'NATIVE', icon: 'mdi-database', titleKey: 'feat_1_title', descKey: 'feat_1_desc' },
    { id: 2, tag: 'SYSTEM', icon: 'mdi-code-braces', titleKey: 'feat_2_title', descKey: 'feat_2_desc' },
    { id: 3, tag: 'SPEED', icon: 'mdi-flash', titleKey: 'feat_3_title', descKey: 'feat_3_desc' },
];

const steps = [
    { titleKey: 'step_1_title', descKey: 'step_1_desc', isDownload: true },
    { titleKey: 'step_2_title', descKey: 'step_2_desc' },
    { titleKey: 'step_3_title', descKey: 'step_3_desc' },
    { titleKey: 'step_4_title', descKey: 'step_4_desc' },
    { titleKey: 'step_5_title', descKey: 'step_5_desc' },
];

const themeStyles = computed(() => {
  const theme = uiStore.currentTheme;
  const base = {
    '--c-bg-page': '#0f1115',
    '--c-text-main': '#ffffff',
    '--c-text-muted': '#94a3b8',
    '--c-border': 'rgba(255,255,255,0.08)',
    '--c-brand': '#FF006E', // Pink Power untuk Bridge
    '--c-gold': '#FEE440',
    '--c-card-bg': 'rgba(25, 25, 30, 0.6)',
    '--c-shadow': '0 20px 40px -10px rgba(0,0,0,0.5)',
    'font-family': "'Inter', sans-serif"
  };

  if (theme === 'light') {
    return {
        ...base,
        '--c-bg-page': '#f8fafc',
        '--c-text-main': '#0f172a',
        '--c-text-muted': '#64748b',
        '--c-border': 'rgba(0,0,0,0.1)',
        '--c-brand': '#FF006E',
        '--c-card-bg': 'rgba(255,255,255,0.7)',
        '--c-shadow': '0 20px 40px -10px rgba(0,0,0,0.1)'
    };
  }
  return base;
});

onMounted(() => {
  uiStore.initTheme();
});
</script>

<style scoped>
/* Reuse styles from AboutUs with some additions */
.about-wrapper { position: absolute; inset: 0; display: flex; flex-direction: column; background-color: var(--c-bg-page); color: var(--c-text-main); font-family: var(--font-family); overflow: hidden; transition: background-color 0.4s ease, color 0.4s ease; z-index: 10; contain: strict; }
.theme-bg { position: absolute; top: 0; left: 0; right: 0; height: 80vh; background: radial-gradient(circle at 50% -20%, rgba(255, 0, 110, 0.15) 0%, transparent 60%); pointer-events: none; z-index: 0; filter: blur(100px); }
.header-container { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
.about-content { flex: 1; position: relative; z-index: 1; display: flex; justify-content: center; overflow-y: auto; padding-top: 110px; padding-bottom: 80px; scroll-behavior: smooth; }
.content-container { width: 100%; max-width: 1100px; padding: 0 24px; }
.hero-section { margin-bottom: 60px; padding-top: 40px; }
.logo-container { position: relative; width: 100px; height: 100px; margin: 0 auto 24px; }
.core-logo { width: 100%; height: 100%; position: relative; z-index: 2; animation: floatLogo 6s ease-in-out infinite; }
@keyframes floatLogo { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
.logo-glow { position: absolute; inset: -20px; background: radial-gradient(circle, var(--c-brand), transparent 70%); opacity: 0.3; filter: blur(20px); z-index: 1; }
.main-title { font-size: 3rem; font-weight: 900; letter-spacing: 4px; line-height: 1.1; margin-bottom: 16px; }
.text-gradient { background: linear-gradient(135deg, var(--c-brand), var(--c-gold)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hero-subtitle { font-size: 1.1rem; color: var(--c-text-muted); max-width: 600px; margin: 0 auto; line-height: 1.6; }

.section-block { margin-bottom: 80px; }
.section-title { font-size: 1.8rem; letter-spacing: 2px; color: var(--c-text-main); margin-bottom: 12px; }
.text-gold-gradient { background: linear-gradient(to right, var(--c-gold), #fff 80%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.divider-center { height: 3px; width: 60px; background: var(--c-brand); margin: 0 auto; border-radius: 3px; }

.credits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
.credit-card { background: var(--c-card-bg); border: 1px solid var(--c-border); border-radius: 20px; padding: 30px; display: flex; flex-direction: column; gap: 20px; backdrop-filter: blur(12px); transition: 0.3s; }
.credit-card:hover { transform: translateY(-5px); border-color: var(--c-brand); }
.card-icon.blue { background: rgba(255, 0, 110, 0.1); color: var(--c-brand); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.credit-main { font-size: 1.5rem; font-weight: 800; display: block; margin-bottom: 8px; color: var(--c-text-main); font-family: 'Orbitron', sans-serif; }
.credit-desc { font-size: 0.95rem; color: var(--c-text-muted); line-height: 1.5; }

.steps-container { display: flex; flex-direction: column; gap: 20px; }
.step-card { max-width: 100% !important; flex-direction: row !important; align-items: center !important; gap: 30px !important; text-align: left !important; padding: 25px 40px !important; }
.step-number { font-size: 2.5rem; font-weight: 900; color: var(--c-brand); opacity: 0.5; min-width: 50px; font-family: 'Orbitron', sans-serif; }
.download-link-btn { background: var(--c-brand); color: white; padding: 12px 25px; border-radius: 50px; font-weight: 900; text-decoration: none; display: inline-flex; align-items: center; transition: 0.2s; box-shadow: 0 10px 20px rgba(255, 0, 110, 0.3); }
.download-link-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
.copyright-text { color: var(--c-text-muted); font-size: 0.85rem; opacity: 0.6; }

.architect-card { position: relative; border-radius: 24px; transition: all 0.4s; overflow: hidden; border: 1px solid var(--c-border); display: flex; flex-direction: column; }
.card-glass-bg { position: absolute; inset: 0; background: var(--c-card-bg); backdrop-filter: blur(16px); z-index: 0; }
.member-info { position: relative; z-index: 1; }
</style>
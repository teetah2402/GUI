<template>
  <div class="privacy-wrapper" :style="themeStyles">

    <div class="theme-bg"></div>

    <div class="header-container">
      <PublicHeader activePage="privacy" @toggle-lang="updateLang" />
    </div>

    <main class="privacy-content">
      <div class="content-container">

        <div class="glass-doc">

          <div class="doc-header mb-8 text-center">
            <div class="logo-wrapper mb-4">
               <img
                 src="/logo-android.svg"
                 alt="Flowork Core"
                 width="60"
                 height="60"
                 class="core-logo"
               />
            </div>

            <h1 class="page-title">{{ t.title_privacy }} <span class="text-highlight">{{ t.title_policy }}</span></h1>
            <div class="divider-line"></div>
            <p class="page-subtitle">{{ t.last_updated }} {{ new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
          </div>

          <div class="doc-body">

            <p>
              {{ t.intro_text }}
            </p>

            <div class="section-block">
                <h2 class="section-title">{{ t.sec1_title }}</h2>
                <p>{{ t.sec1_desc }}</p>
                <ul class="sub-list">
                    <li><strong>{{ t.sec1_li1_strong }}</strong> {{ t.sec1_li1_text }}</li>
                    <li><strong>{{ t.sec1_li2_strong }}</strong> {{ t.sec1_li2_text }}</li>
                </ul>
            </div>

            <div class="section-block highlight-box">
                <h2 class="section-title text-warn">{{ t.sec2_title }}</h2>
                <p>{{ t.sec2_desc }}</p>
                <ul class="sub-list check-list">
                    <li>{{ t.sec2_li1 }}</li>
                    <li>{{ t.sec2_li2 }}</li>
                    <li>{{ t.sec2_li3 }}</li>
                    <li>{{ t.sec2_li4 }}</li>
                </ul>
            </div>

            <div class="section-block">
                <h2 class="section-title">{{ t.sec3_title }}</h2>
                <p>{{ t.sec3_desc }}</p>
                <ul class="sub-list">
                    <li>{{ t.sec3_li1 }}</li>
                    <li>{{ t.sec3_li2 }}</li>
                    <li>{{ t.sec3_li3 }}</li>
                </ul>
            </div>

            <div class="section-block">
                <h2 class="section-title">{{ t.sec4_title }}</h2>
                <p>{{ t.sec4_desc }}</p>
            </div>

            <div class="contact-box mt-8">
              <p class="mb-2">{{ t.contact_q }}</p>
              <div class="agent-card">
                <strong>{{ t.dpo_title }}</strong><br>
                <a href="mailto:lawyer@floworkos.com" class="link-highlight">lawyer@floworkos.com</a>
              </div>
            </div>

          </div>

        </div>

        <div class="page-footer mt-8 text-center">
            <span class="text-caption text-muted">&copy; {{ new Date().getFullYear() }} Flowork. {{ t.footer_rights }}</span>
        </div>

      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import PublicHeader from '@/components/layout/PublicHeader.vue';

// --- AWAL: PENAMBAHAN KAMUS LOKAL & WEB3 CONTEXT ---
const lang = ref('en');

const updateLang = (newLang) => {
    lang.value = newLang;
    localStorage.setItem('flowork_lang', newLang);
};

const content = {
    id: {
        title_privacy: 'KEBIJAKAN',
        title_policy: 'PRIVASI',
        last_updated: 'Terakhir Diperbarui:',
        intro_text: 'Selamat datang di Flowork ("kami" atau "milik kami"). Kami berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi ini menjelaskan pendekatan desentralisasi kami saat Anda menggunakan layanan kami melalui situs web (floworkos.com) dan perangkat lunak Engine kami.',
        sec1_title: '01. Informasi yang Kami Kumpulkan (Tidak Ada Data Pribadi)',
        sec1_desc: 'Karena Flowork beroperasi menggunakan teknologi Web3 dan Cryptocurrency, kami tidak mengumpulkan data pengguna tradisional. Informasi yang terlibat dalam sesi Anda hanya mencakup:',
        sec1_li1_strong: 'Alamat Wallet (Dompet):',
        sec1_li1_text: 'Hanya alamat wallet publik yang digunakan untuk autentikasi kriptografi dan pemrosesan transaksi.',
        sec1_li2_strong: 'Data Konfigurasi Engine:',
        sec1_li2_text: 'Token unik terenkripsi yang terkait secara lokal dengan node terdesentralisasi Anda untuk mengautentikasi Engine Flowork yang Anda host sendiri.',
        sec2_title: '02. Informasi yang TIDAK Kami Kumpulkan',
        sec2_desc: 'Arsitektur Web3 hybrid kami pada dasarnya dirancang untuk privasi absolut Anda. Kami secara eksplisit TIDAK mengumpulkan, melihat, atau menyimpan:',
        sec2_li1: 'Informasi Identitas Pribadi (PII) seperti nama, email, nomor telepon, atau kata sandi.',
        sec2_li2: 'Data operasional apa pun yang diproses oleh Engine Flowork Anda di server Anda sendiri.',
        sec2_li3: 'Konten, logika, atau struktur dari preset alur kerja pribadi Anda.',
        sec2_li4: 'File, basis data, atau sumber daya jaringan lokal yang berinteraksi dengan alur kerja Anda.',
        sec3_title: '03. Penggunaan Informasi Kriptografi',
        sec3_desc: 'Data kriptografi minimal (seperti alamat dompet publik) secara ketat hanya digunakan untuk:',
        sec3_li1: 'Memfasilitasi autentikasi Web3 dan interaksi smart contract yang aman.',
        sec3_li2: 'Memproses pembayaran terdesentralisasi (cryptocurrency) dan mengelola akses berbasis token.',
        sec3_li3: 'Mengautentikasi Engine Flowork Anda untuk memastikan distribusi pekerjaan yang aman.',
        sec4_title: '04. Keamanan Informasi Anda',
        sec4_desc: 'Dengan memanfaatkan teknologi blockchain dan protokol Web3, keamanan data Anda ditegakkan oleh konsensus kriptografi, bukan server terpusat. Namun, Anda bertanggung jawab penuh atas keamanan private key (kunci pribadi) dan seed phrase dompet kripto Anda.',
        contact_q: 'Ada pertanyaan mengenai Kebijakan Privasi ini?',
        dpo_title: 'Petugas Perlindungan Data',
        footer_rights: 'Hak cipta dilindungi undang-undang.'
    },
    en: {
        title_privacy: 'PRIVACY',
        title_policy: 'POLICY',
        last_updated: 'Last Updated:',
        intro_text: 'Welcome to Flowork ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains our decentralized approach when you use our services through our website (app.teetah.art) and our downloadable Engine software.',
        sec1_title: '01. Information We Collect (No Personal Data)',
        sec1_desc: 'Because Flowork operates utilizing Web3 and cryptocurrency technologies, we do not collect traditional personal user data. The information involved in your session includes:',
        sec1_li1_strong: 'Wallet Address:',
        sec1_li1_text: 'Only public wallet addresses used for cryptographic authentication and transaction processing.',
        sec1_li2_strong: 'Engine Configuration Data:',
        sec1_li2_text: 'A unique, encrypted token locally associated with your decentralized node to authenticate your self-hosted Flowork Engines.',
        sec2_title: '02. Information We DO NOT Collect',
        sec2_desc: 'Our hybrid Web3 architecture is fundamentally designed for your absolute privacy. We explicitly DO NOT collect, see, or store:',
        sec2_li1: 'Personal Identifiable Information (PII) such as names, emails, phone numbers, or passwords.',
        sec2_li2: 'Any operational data processed by your Flowork Engines on your own servers.',
        sec2_li3: 'The content, logic, or structure of your private workflow presets.',
        sec2_li4: 'Files, databases, or local network resources that your workflows interact with.',
        sec3_title: '03. Use of Cryptographic Information',
        sec3_desc: 'The minimal cryptographic data (like public wallet addresses) is strictly used to:',
        sec3_li1: 'Facilitate Web3 authentication and secure smart contract interactions.',
        sec3_li2: 'Process decentralized payments (cryptocurrency) and manage token-based access.',
        sec3_li3: 'Authenticate your Flowork Engines to ensure secure job distribution.',
        sec4_title: '04. Security of Your Information',
        sec4_desc: 'By leveraging blockchain technology and Web3 protocols, your data security is enforced by cryptographic consensus rather than centralized servers. However, you are solely responsible for the security of your private keys and wallet seed phrases.',
        contact_q: 'Questions regarding this Privacy Policy?',
        dpo_title: 'Data Protection Officer',
        footer_rights: 'All rights reserved.'
    }
};

const t = computed(() => content[lang.value]);
// --- AKHIR: PENAMBAHAN KAMUS LOKAL ---

const currentTheme = ref('dark');
let themeObserver = null;

const syncThemeFromGlobal = () => {
  const globalTheme = document.documentElement.getAttribute('data-theme');
  currentTheme.value = globalTheme || localStorage.getItem('flowork_os_theme') || 'dark';
};

const setupThemeObserver = () => {
  syncThemeFromGlobal();
  themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
        if (m.attributeName === 'data-theme') syncThemeFromGlobal();
    });
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
};

const themeStyles = computed(() => {
  const theme = currentTheme.value;
  const base = {
    '--c-bg-page': '#0f1115', '--c-bg-card': 'rgba(30, 30, 35, 0.6)', '--c-text-main': '#ffffff', '--c-text-muted': '#94a3b8', '--c-border': 'rgba(255,255,255,0.08)', '--c-brand': '#00C6FF', '--c-gold': '#FFD700', '--c-warn': '#ff9800', '--c-box-bg': 'rgba(255,255,255,0.03)', '--c-shadow': '0 20px 50px rgba(0,0,0,0.3)', 'font-family': "'Inter', sans-serif"
  };

  if (theme === 'light') {
    return { ...base, '--c-bg-page': '#f8fafc', '--c-bg-card': 'rgba(255, 255, 255, 0.9)', '--c-text-main': '#0f172a', '--c-text-muted': '#64748b', '--c-border': 'rgba(0,0,0,0.1)', '--c-brand': '#2563eb', '--c-box-bg': 'rgba(0,0,0,0.02)', '--c-shadow': '0 10px 40px rgba(0,0,0,0.05)' };
  }
  return base;
});

onMounted(() => {
    const savedLang = localStorage.getItem('flowork_lang');
    if (savedLang) {
        lang.value = savedLang;
    }
    setupThemeObserver();
});
onUnmounted(() => { if (themeObserver) themeObserver.disconnect(); });
</script>

<style scoped>
.privacy-wrapper { position: absolute; inset: 0; display: flex; flex-direction: column; background-color: var(--c-bg-page); color: var(--c-text-main); font-family: var(--font-family); overflow: hidden; transition: background-color 0.3s ease, color 0.3s ease; z-index: 10; contain: strict; }
.theme-bg { position: absolute; top: 0; left: 0; right: 0; height: 60vh; background: radial-gradient(circle at 10% 20%, rgba(0, 198, 255, 0.08) 0%, transparent 50%), radial-gradient(circle at 90% 30%, rgba(255, 215, 0, 0.05) 0%, transparent 50%); pointer-events: none; z-index: 0; filter: blur(60px); transition: background 0.3s ease; }
.header-container { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
.privacy-content { flex: 1; position: relative; z-index: 1; display: flex; justify-content: center; overflow-y: auto; overflow-x: hidden; padding-top: 90px; padding-bottom: 80px; }
.content-container { width: 100%; max-width: 800px; padding: 0 20px; margin-top: 20px; }
.glass-doc { background: var(--c-bg-card); border: 1px solid var(--c-border); border-radius: 24px; padding: 48px; box-shadow: var(--c-shadow); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: all 0.3s ease; }
.logo-wrapper { position: relative; width: 60px; height: 60px; margin: 0 auto; }
.core-logo { filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)); }
.page-title { font-family: 'Orbitron', sans-serif; font-size: 2rem; font-weight: 800; letter-spacing: 2px; color: var(--c-text-main); margin-bottom: 8px; }
.text-highlight { color: transparent; background: linear-gradient(135deg, var(--c-brand), var(--c-gold)); -webkit-background-clip: text; background-clip: text; }
.divider-line { height: 2px; width: 60px; margin: 0 auto 10px auto; background: linear-gradient(90deg, transparent, var(--c-brand), transparent); opacity: 0.6; }
.page-subtitle { font-size: 0.85rem; color: var(--c-text-muted); letter-spacing: 0.5px; font-weight: 500; }
.section-block { margin-bottom: 32px; text-align: left; }
.section-title { font-size: 1.2rem; font-weight: 700; color: var(--c-text-main); margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
.section-title::before { content: ''; display: block; width: 4px; height: 18px; background: var(--c-brand); border-radius: 2px; }
.highlight-box { background: var(--c-box-bg); border: 1px dashed var(--c-border); padding: 24px; border-radius: 12px; }
.text-warn { color: var(--c-warn); }
.highlight-box .section-title::before { background: var(--c-warn); }
p { font-size: 1rem; line-height: 1.6; color: var(--c-text-muted); margin-bottom: 10px; }
.sub-list { margin-top: 10px; padding-left: 20px; list-style-type: disc; color: var(--c-text-muted); }
.sub-list li { margin-bottom: 6px; line-height: 1.5; }
.contact-box { background: var(--c-box-bg); border: 1px dashed var(--c-border); padding: 24px; border-radius: 12px; text-align: center; }
.link-highlight { color: var(--c-brand); font-weight: 600; text-decoration: none; }
.text-caption { font-size: 0.8rem; }
</style>
<template>
  <div class="about-wrapper" :style="themeStyles" :data-theme="uiStore.currentTheme">

    <div class="theme-bg"></div>

    <div class="header-container">
      <PublicHeader activePage="about" @toggle-lang="updateLang" />
    </div>

    <main class="about-content">
      <div class="content-container">

        <div class="hero-section text-center">
          <div class="logo-container">
             <img
               src="/logo-android.svg"
               alt="Flowork Core"
               class="core-logo"
             />
             <div class="logo-glow"></div>
          </div>

          <h1 class="main-title orbitron-font">
            FLOWORK <span class="text-gradient">CORE</span>
          </h1>

          <p class="hero-subtitle">
            {{ t.hero_subtitle }}
          </p>
        </div>

        <div class="section-block">
          <div class="section-header text-center">
            <h2 class="section-title orbitron-font">{{ t.architects_title }}</h2>
            <div class="divider-center"></div>
          </div>

          <div class="architects-grid">
            <div v-for="member in team" :key="member.name" class="architect-card">
              <div class="card-glass-bg"></div>
              <div class="avatar-box">
                <img :src="member.avatar" @error="handleAvatarError" :alt="member.name" class="avatar-img" />
              </div>
              <div class="member-info">
                <h3 class="member-name">{{ member.name }}</h3>
                <span class="member-role">{{ t[member.roleKey] }}</span>
                <p class="member-quote">{{ t[member.quoteKey] }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="section-block special-thanks-section">
            <div class="section-header text-center mb-10">
                <h2 class="section-title orbitron-font text-gold-gradient">{{ t.recognition_title }}</h2>
                <p class="section-desc">{{ t.recognition_desc }}</p>
            </div>

            <div class="credits-grid">
                <div class="credit-card foundation-card">
                    <div class="card-icon gold">
                        <i class="mdi mdi-pillar"></i>
                    </div>
                    <div class="card-content">
                        <h3 class="credit-title text-gold">{{ t.credit_foundation }}</h3>
                        <strong class="credit-main">JavaFX</strong>
                        <p class="credit-desc">{{ t.thanks_javafx }}</p>
                    </div>
                </div>

                <div class="credit-card tech-card">
                    <div class="card-icon blue">
                        <i class="mdi mdi-brain"></i>
                    </div>
                    <div class="card-content">
                        <h3 class="credit-title text-blue">{{ t.credit_neural }}</h3>
                        <ul class="credit-list">
                            <li>
                                <span>Google Gemini</span>
                                <small>{{ t.credit_gemini_desc }}</small>
                            </li>
                            <li>
                                <span>Meta Llama</span>
                                <small>{{ t.credit_llama_desc }}</small>
                            </li>
                            <li>
                                <span>OpenAI Whisper</span>
                                <small>{{ t.credit_whisper_desc }}</small>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="credit-card tech-card">
                    <div class="card-icon cyan">
                        <i class="mdi mdi-console-network"></i>
                    </div>
                    <div class="card-content">
                        <h3 class="credit-title text-cyan">{{ t.credit_processing }}</h3>
                        <ul class="credit-list">
                            <li>
                                <span>FFmpeg</span>
                                <small>{{ t.credit_ffmpeg_desc }}</small>
                            </li>
                            <li>
                                <span>Vue Flow</span>
                                <small>{{ t.credit_vueflow_desc }}</small>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="page-footer mt-16 text-center">
            <span class="copyright-text">&copy; {{ new Date().getFullYear() }} Flowork. {{ t.footer_rights }}</span>
        </div>

      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// [ZOMBIE CODE] Import LocaleStore dan storeToRefs dikomentari karena kita memakai kamus lokal
// import { useLocaleStore } from '@/store/locale';
// import { storeToRefs } from 'pinia';

import { useUiStore } from '@/store/ui';
import PublicHeader from '@/components/layout/PublicHeader.vue';

// [ZOMBIE CODE] Inisialisasi locale store tidak terpakai lagi
// const localeStore = useLocaleStore();
// const { loc } = storeToRefs(localeStore);

const uiStore = useUiStore();

// --- AWAL: PENAMBAHAN KAMUS LOKAL ---
const lang = ref('en');

const updateLang = (newLang) => {
    lang.value = newLang;
    localStorage.setItem('flowork_lang', newLang); // menyimpan preferensi bahasa
};

const content = {
    id: {
        hero_subtitle: 'Ekosistem jaringan saraf terdesentralisasi yang dirancang secara cermat untuk merevolusi otomatisasi alur kerja.',
        architects_title: 'SANG ARSITEK',
        team_role_architect: 'Arsitek Sistem Utama',
        team_quote_awenk: '"Membangun sistem saraf digital untuk masa depan."',
        team_role_widget: 'Insinyur Antarmuka',
        team_quote_teguh: '"Memahat antarmuka intuitif yang selaras dengan pengalaman manusia."',
        recognition_title: 'PILAR KEHORMATAN',
        recognition_desc: 'Memberikan penghormatan kepada teknologi fundamental yang memberdayakan visi kami.',
        credit_foundation: 'Fondasi Utama',
        thanks_javafx: 'Memberikan cetak biru arsitektur yang tangguh dalam membentuk purwarupa awal kami.',
        credit_neural: 'Integrasi Kognitif',
        credit_gemini_desc: 'Penalaran Kognitif Tingkat Lanjut',
        credit_llama_desc: 'Model Bahasa Sumber Terbuka',
        credit_whisper_desc: 'Pengenalan Suara Presisi',
        credit_processing: 'Mesin Pemrosesan',
        credit_ffmpeg_desc: 'Mesin Multimedia Tingkat Lanjut',
        credit_vueflow_desc: 'Skrip Visual Dinamis',
        footer_rights: 'Hak cipta dilindungi undang-undang.'
    },
    en: {
        hero_subtitle: 'A decentralized neural-network ecosystem, meticulously engineered to revolutionize workflow automation.',
        architects_title: 'THE ARCHITECTS',
        team_role_architect: 'Principal System Architect',
        team_quote_awenk: '"Architecting the digital nervous system for tomorrow."',
        team_role_widget: 'Frontend Interface Engineer',
        team_quote_teguh: '"Sculpting intuitive interfaces that resonate with human experience."',
        recognition_title: 'HONORED PILLARS',
        recognition_desc: 'Paying homage to the foundational technologies that empower our vision.',
        credit_foundation: 'Foundational Core',
        thanks_javafx: 'Delivering the resilient architectural blueprint that forged our earliest prototypes.',
        credit_neural: 'Cognitive Integration',
        credit_gemini_desc: 'Advanced Cognitive Reasoning',
        credit_llama_desc: 'Open-Source Language Model',
        credit_whisper_desc: 'Precision Speech Recognition',
        credit_processing: 'Processing Engines',
        credit_ffmpeg_desc: 'Advanced Multimedia Engine',
        credit_vueflow_desc: 'Dynamic Visual Scripting',
        footer_rights: 'All rights reserved.'
    }
};

const t = computed(() => content[lang.value]);
// --- AKHIR: PENAMBAHAN KAMUS LOKAL ---

const team = ref([
  {
    name: 'Awenk Audico',
    // roleKey: 'about_team_role_architect',
    // quoteKey: 'about_team_quote_awenk',
    roleKey: 'team_role_architect',
    quoteKey: 'team_quote_awenk',
    avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=budi_siregar_39257&backgroundColor=b6e3f4,c0aede,d1d4f9'
  },
  {
    name: 'Teguh FX',
    // roleKey: 'about_team_role_widget',
    // quoteKey: 'about_team_quote_teguh',
    roleKey: 'team_role_widget',
    quoteKey: 'team_quote_teguh',
    avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=fajar_pangestu_243254&backgroundColor=b6e3f4,c0aede,d1d4f9'
  },
]);

const themeStyles = computed(() => {
  const theme = uiStore.currentTheme;
  const base = {
    '--c-bg-page': '#0f1115',
    '--c-text-main': '#ffffff',
    '--c-text-muted': '#94a3b8',
    '--c-border': 'rgba(255,255,255,0.08)',
    '--c-brand': '#00C6FF',
    '--c-gold': '#FFD700',
    '--c-card-bg': 'rgba(25, 25, 30, 0.6)',
    '--c-card-hover': 'rgba(30, 30, 40, 0.8)',
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
        '--c-brand': '#2563eb',
        '--c-card-bg': 'rgba(255,255,255,0.7)',
        '--c-card-hover': 'rgba(255,255,255,0.95)',
        '--c-shadow': '0 20px 40px -10px rgba(0,0,0,0.1)'
    };
  }
  return base;
});

const handleAvatarError = (e) => {
    e.target.src = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
};

onMounted(() => {
  // Mengambil preferensi bahasa dari lokal memori saat dimuat
  const savedLang = localStorage.getItem('flowork_lang');
  if (savedLang) {
      lang.value = savedLang;
  }
  uiStore.initTheme();
});
</script>

<style scoped>
.about-wrapper { position: absolute; inset: 0; display: flex; flex-direction: column; background-color: var(--c-bg-page); color: var(--c-text-main); font-family: var(--font-family); overflow: hidden; transition: background-color 0.4s ease, color 0.4s ease; z-index: 10; contain: strict; }
.theme-bg { position: absolute; top: 0; left: 0; right: 0; height: 80vh; background: radial-gradient(circle at 50% -20%, rgba(0, 198, 255, 0.15) 0%, transparent 60%), radial-gradient(circle at 90% 60%, rgba(255, 215, 0, 0.08) 0%, transparent 50%); pointer-events: none; z-index: 0; filter: blur(100px); transition: background 0.4s ease; }
.header-container { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
.about-content { flex: 1; position: relative; z-index: 1; display: flex; justify-content: center; overflow-y: auto; overflow-x: hidden; padding-top: 110px; padding-bottom: 80px; scroll-behavior: smooth; }
.content-container { width: 100%; max-width: 1100px; padding: 0 24px; }
.hero-section { margin-bottom: 80px; padding-top: 40px; position: relative; }
.logo-container { position: relative; width: 100px; height: 100px; margin: 0 auto 24px; }
.core-logo { width: 100%; height: 100%; position: relative; z-index: 2; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3)); animation: floatLogo 6s ease-in-out infinite; }
@keyframes floatLogo { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
.logo-glow { position: absolute; inset: -20px; background: radial-gradient(circle, var(--c-brand), transparent 70%); opacity: 0.3; filter: blur(20px); z-index: 1; animation: pulseGlow 4s infinite; }
@keyframes pulseGlow { 0%,100%{opacity:0.2; transform:scale(0.9)} 50%{opacity:0.4; transform:scale(1.1)} }
.main-title { font-size: 3rem; font-weight: 900; letter-spacing: 4px; line-height: 1.1; margin-bottom: 16px; }
.text-gradient { background: linear-gradient(135deg, var(--c-brand), var(--c-gold)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hero-subtitle { font-size: 1.1rem; color: var(--c-text-muted); max-width: 600px; margin: 0 auto; line-height: 1.6; }
.section-block { margin-bottom: 100px; position: relative; }
.section-header { margin-bottom: 40px; }
.section-title { font-size: 1.8rem; letter-spacing: 2px; color: var(--c-text-main); margin-bottom: 12px; }
.text-gold-gradient { background: linear-gradient(to right, var(--c-gold), #fff 80%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.section-desc { color: var(--c-text-muted); font-size: 1rem; }
.divider-center { height: 3px; width: 60px; background: var(--c-brand); margin: 0 auto; border-radius: 3px; }
.architects-grid { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; }
.architect-card { position: relative; width: 100%; max-width: 380px; border-radius: 24px; padding: 40px; text-align: center; transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); overflow: hidden; border: 1px solid var(--c-border); }
.card-glass-bg { position: absolute; inset: 0; background: var(--c-card-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); z-index: 0; transition: background 0.3s; }
.architect-card:hover { transform: translateY(-10px); border-color: var(--c-brand); box-shadow: var(--c-shadow); }
.architect-card:hover .card-glass-bg { background: var(--c-card-hover); }
.avatar-box { position: relative; z-index: 1; width: 140px; height: 140px; margin: 0 auto 24px; border-radius: 50%; padding: 4px; background: linear-gradient(135deg, var(--c-brand), var(--c-gold)); }
.avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 4px solid var(--c-bg-page); }
.member-info { position: relative; z-index: 1; }
.member-name { font-size: 1.5rem; font-weight: 800; margin-bottom: 4px; color: var(--c-text-main); }
.member-role { display: block; font-size: 0.85rem; font-weight: 700; color: var(--c-brand); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
.member-quote { font-family: 'Inter', sans-serif; font-style: italic; color: var(--c-text-muted); font-size: 1rem; line-height: 1.5; }
.credits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
.credit-card { background: var(--c-card-bg); border: 1px solid var(--c-border); border-radius: 20px; padding: 30px; display: flex; flex-direction: column; gap: 20px; transition: all 0.3s ease; backdrop-filter: blur(12px); }
.credit-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2); }
.foundation-card { grid-column: span 1; background: linear-gradient(160deg, rgba(255, 215, 0, 0.05), transparent); border-color: rgba(255, 215, 0, 0.2); }
.foundation-card:hover { border-color: var(--c-gold); box-shadow: 0 10px 30px -10px rgba(255, 215, 0, 0.1); }
.card-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.card-icon.gold { background: rgba(255, 215, 0, 0.1); color: var(--c-gold); }
.card-icon.blue { background: rgba(0, 198, 255, 0.1); color: var(--c-brand); }
.card-icon.cyan { background: rgba(0, 229, 255, 0.1); color: #00e5ff; }
.credit-title { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 700; opacity: 0.8; }
.text-gold { color: var(--c-gold); }
.text-blue { color: var(--c-brand); }
.text-cyan { color: #00e5ff; }
.credit-main { font-size: 1.8rem; font-weight: 800; display: block; margin-bottom: 8px; color: var(--c-text-main); font-family: 'Orbitron', sans-serif; }
.credit-desc { font-size: 0.95rem; color: var(--c-text-muted); line-height: 1.5; }
.credit-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.credit-list li { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--c-border); padding-bottom: 8px; }
.credit-list li:last-child { border-bottom: none; }
.credit-list span { font-weight: 600; color: var(--c-text-main); }
.credit-list small { color: var(--c-text-muted); font-size: 0.8rem; }
.copyright-text { color: var(--c-text-muted); font-size: 0.85rem; opacity: 0.6; }
</style>
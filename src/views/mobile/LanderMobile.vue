//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\mobile\LanderMobile.vue
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="lander-wrapper" :style="themeStyles">

    <PublicHeader @toggle-sidebar="isSidebarOpen = !isSidebarOpen" @toggle-lang="updateLang" />

    <div class="ambient-mesh">
      <div class="blob b1"></div>
      <div class="blob b2"></div>
      <div class="blob b3"></div>
      <div class="blob b4"></div>
    </div>
    <div class="noise-overlay"></div>

    <header class="hero-section">
      <div class="hero-text-content">
        <div class="static-wrapper">
            <div class="pill-badge">
               <span class="pulse-dot"></span> {{ t.badge }}
            </div>
        </div>

        <h1 class="display-title">
           <span class="block-text">{{ t.title[0] }}</span>
           <span class="noise-glitch" :data-text="t.title[1]">
              {{ t.title[1] }}
           </span>
        </h1>

        <p class="hero-subtitle">{{ t.desc }}</p>

        <div class="hero-cta">
          <div class="desktop-notice-m">
              <i class="mdi mdi-laptop"></i>
              <span>{{ t.desktopNotice }}</span>
          </div>

          <button class="btn-glow-primary" @click="router.push('/store')">
              {{ t.ctaStore }}
              <i class="mdi mdi-store-outline" style="margin-left: 8px;"></i>
          </button>

          <a href="/FloworkOS.apk" download class="btn-outline mobile-only-btn" style="text-decoration: none; display: flex; justify-content: center; align-items: center; gap: 8px;">
              <i class="mdi mdi-android" style="font-size: 1.2rem;"></i> {{ lang === 'id' ? 'Unduh APK' : 'Download APK' }}
          </a>
        </div>
      </div>

      <div class="mobile-hero-visual">
         <div class="mascot-hero-container mobile-size">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="hero-robot">
               <defs>
                  <linearGradient id="m_body" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="var(--r-body-1)"/><stop offset="100%" stop-color="var(--r-body-2)"/></linearGradient>
                  <linearGradient id="m_visor" x1="0%" y1="50%" x2="100%" y2="50%"><stop offset="0%" stop-color="var(--r-visor-1)"/><stop offset="50%" stop-color="#ffffff"/><stop offset="100%" stop-color="var(--r-visor-1)"/></linearGradient>
                  <linearGradient id="m_arm" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="var(--r-arm-1)"/><stop offset="100%" stop-color="var(--r-arm-2)"/></linearGradient>
                  <linearGradient id="m_core" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="var(--r-core-1)"/><stop offset="50%" stop-color="var(--r-core-2)"/><stop offset="100%" stop-color="var(--r-core-3)"/></linearGradient>
               </defs>

               <g transform="translate(256, 260)" class="robot-float-anim">
                  <ellipse cx="0" cy="160" rx="90" ry="20" fill="var(--blob-2)" opacity="0.2" class="shadow-pulse"/>
                  <g>
                      <path d="M -70 40 C -80 90, -50 130, 0 140 C 50 130, 80 90, 70 40 L 50 -20 L -50 -20 Z" fill="url(#m_body)"/>
                      <rect x="-35" y="-45" width="70" height="35" rx="8" fill="var(--r-neck)"/>
                      <path d="M -80 -40 L -90 -100 C -90 -140, -50 -160, 0 -160 C 50 -160, 90 -140, 90 -100 L 80 -40 Z" fill="url(#m_body)"/>
                      <path d="M -70 -100 C -70 -120, -35 -130, 0 -130 C 35 -130, 70 -120, 70 -100 C 70 -85, 35 -95, 0 -95 C -35 -95, -70 -85, -70 -100 Z" fill="url(#m_visor)"/>
                  </g>

                  <g transform="translate(0, 60) scale(0.18)">
                      <circle cx="0" cy="0" r="230" fill="none" stroke="var(--r-ring-1)" stroke-width="20" stroke-dasharray="200 150" opacity="0.9" class="spin-slow"/>
                      <circle cx="0" cy="0" r="180" fill="none" stroke="var(--r-ring-2)" stroke-width="25" stroke-dasharray="100 80" opacity="0.8" class="spin-reverse"/>
                      <g transform="translate(-256, -256)">
                           <path d="M100 80 L 220 80 L 220 200 L 160 200 L 160 432 L 100 432 Z" fill="url(#m_core)" stroke="var(--r-body-1)" stroke-width="4"/>
                           <path d="M260 80 L 412 80 L 412 180 L 260 180 Z" fill="var(--r-visor-1)" opacity="0.9"/>
                           <path d="M260 220 L 360 220 L 360 320 L 260 320 Z" fill="var(--r-arm-1)" opacity="0.9"/>
                      </g>
                  </g>

                  <g class="arms-container">
                      <path d="M -60 20 C -130 20, -180 -10, -200 -60" fill="none" stroke="url(#m_arm)" stroke-width="14" stroke-linecap="round"/>
                      <path d="M 60 20 C 130 20, 180 -10, 200 -60" fill="none" stroke="url(#m_arm)" stroke-width="14" stroke-linecap="round"/>
                  </g>
               </g>
            </svg>
         </div>
      </div>

      <div class="mobile-swipe-indicator">
         <div class="swipe-text">SWIPE TO EXPLORE</div>
         <div class="swipe-arrows">
            <span></span><span></span><span></span>
         </div>
      </div>
    </header>

    <div class="marquee-banner-mobile">
      <div class="marquee-content-mobile">
        <span>MOBILE FIRST</span><span class="dot">•</span>
        <span>APK READY</span><span class="dot">•</span>
        <span>PRIVATE TUNNEL</span><span class="dot">•</span>
        <span>ZERO LATENCY</span><span class="dot">•</span>
        <span>MOBILE FIRST</span><span class="dot">•</span>
        <span>APK READY</span><span class="dot">•</span>
        <span>PRIVATE TUNNEL</span><span class="dot">•</span>
        <span>ZERO LATENCY</span><span class="dot">•</span>
      </div>
    </div>

    <main class="sales-content-wrapper-m">
        <section class="aida-section-m">
            <div class="attention-content-m glass-panel-m glow-border-m">
                <div class="pill-tag-m alert-tag-m">{{ t.aidaAttention.tag }}</div>
                <h2 class="section-title-m text-gradient-m">{{ t.aidaAttention.title }}</h2>
                <p class="section-desc-m">{{ t.aidaAttention.desc }}</p>
            </div>
        </section>

        <section class="aida-section-m">
            <div class="section-header-m center-m">
                <div class="pill-tag-m">{{ t.aidaInterest.tag }}</div>
                <h2 class="section-title-m">{{ t.aidaInterest.title }}</h2>
                <p class="section-desc-m">{{ t.aidaInterest.desc }}</p>
            </div>
            <div class="pillars-grid-m">
                <div class="pillar-card-m glass-panel-m" v-for="(pillar, index) in t.aidaInterest.pillars" :key="index">
                    <div class="icon-wrapper-m">
                        <i :class="['mdi', pillar.icon]"></i>
                    </div>
                    <h3>{{ pillar.title }}</h3>
                    <p>{{ pillar.desc }}</p>
                </div>
            </div>
        </section>

        <section class="aida-section-m">
            <div class="section-header-m center-m">
                <h2 class="section-title-m">{{ t.aidaDesire.title }}</h2>
            </div>
            <div class="bento-grid-modern-m">
                <div class="bento-card-m gradient-1-m">
                    <i class="mdi mdi-shield-lock-outline icon-huge-m"></i>
                    <div class="card-text-m">
                        <h3>{{ t.aidaDesire.f1.title }}</h3>
                        <p>{{ t.aidaDesire.f1.desc }}</p>
                    </div>
                </div>
                <div class="bento-card-m glass-panel-m">
                    <i class="mdi mdi-infinity icon-medium-m text-accent-1-m"></i>
                    <div class="card-text-m">
                        <h3>{{ t.aidaDesire.f2.title }}</h3>
                        <p>{{ t.aidaDesire.f2.desc }}</p>
                    </div>
                </div>
                <div class="bento-card-m glass-panel-m">
                    <i class="mdi mdi-robot-excited-outline icon-medium-m text-accent-2-m"></i>
                    <div class="card-text-m">
                        <h3>{{ t.aidaDesire.f3.title }}</h3>
                        <p>{{ t.aidaDesire.f3.desc }}</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="aida-section-m">
            <div class="section-header-m center-m">
                <h2 class="section-title-m">{{ t.faqTitle }}</h2>
            </div>
            <div class="faq-container-m">
                <div class="faq-item-m glass-panel-m" v-for="(faq, i) in t.faqs" :key="i">
                    <h4 class="faq-q-m">
                        <i class="mdi mdi-help-circle-outline text-accent-1-m"></i>
                        {{ faq.q }}
                    </h4>
                    <p class="faq-a-m">{{ faq.a }}</p>
                </div>
            </div>
        </section>

        <section class="aida-section-m">
            <div class="action-card-m gradient-2-m glow-border-m">
                <h2 class="section-title-m">{{ t.aidaAction.title }}</h2>
                <p class="section-desc-m">{{ t.aidaAction.desc }}</p>
                <div class="action-buttons-m">
                    <button class="btn-glow-primary large-m" @click="router.push('/store')">
                        {{ t.ctaStore }}
                        <i class="mdi mdi-store-outline" style="margin-left: 8px;"></i>
                    </button>

                    <button class="btn-outline large-m" @click="router.push('/about-us')">
                        {{ t.ctaAbout }}
                        <i class="mdi mdi-information-outline" style="margin-left: 8px;"></i>
                    </button>
                </div>
            </div>
        </section>
    </main>
    <footer class="creative-footer">
        <div class="footer-line"></div>
        <p>&copy; {{ new Date().getFullYear() }} Flowork Corp. {{ t.footer }}</p>
    </footer>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/apps';
import PublicHeader from '@/components/layout/PublicHeader.vue';

const router = useRouter();
const appStore = useAppStore();
const lang = ref('en');
const isSidebarOpen = ref(false);

const updateLang = (newLang) => {
  lang.value = newLang;
};

// [NEW CODE] Added desktopNotice property
const content = {
  id: {
    badge: 'Platform Otomasi Kreatif',
    title: ['Sistem Kerja', 'Masa Depan.'],
    desc: 'Workspace digital tanpa instalasi. Akses ribuan modul AI dan desain. Aman, Cepat, dan Privat.',
    ctaMain: 'Buka App Store',

    desktopNotice: 'Untuk pengalaman penuh mengakses Canvas & Flow Designer, silakan buka melalui browser Desktop.',
    ctaCanvas: 'Buka Canvas',
    ctaStore: 'App Store',
    ctaFlow: 'Flow Designer',
    ctaAbout: 'Tentang Kami',

    aidaAttention: {
      tag: "PROBLEM",
      title: "Capek Ngerjain Riset Pasar Manual? Tagihan SaaS Bengkak?",
      desc: "Bayangkan berapa jam waktu yang terbuang cuma buat copy-paste data tren e-commerce, merekap analitik konten, atau pindah-pindah puluhan tab browser tiap hari. Ditambah lagi limitasi 'sistem kredit' cloud yang menguras dompet. Sudah saatnya berhenti bekerja dengan cara lama."
    },
    aidaInterest: {
      tag: "SOLUTION",
      title: "Hybrid Web OS: Ruang Kerja Pintar Tanpa Batas",
      desc: "Ekosistem Flowork bekerja layaknya tim profesional yang terbagi dalam 3 pilar utama:",
      pillars: [
        { icon: 'mdi-monitor-dashboard', title: '1. The Workspace', desc: 'Meja kerja digital tanpa batas (Infinite Canvas). Buka Virtual Apps dan rangkai alur kerja otomatis semudah menyusun puzzle.' },
        { icon: 'mdi-robot-outline', title: '2. Asisten Riset Pintar', desc: 'Ekstensi browser bertugas sebagai asisten lapangan. Mengumpulkan data publik untuk riset pasar atau analitik konten secara otomatis.' },
        { icon: 'mdi-memory', title: '3. Local Engine (Golang)', desc: 'Rahasia kekuatan Flowork. Data diproses langsung oleh PC Anda sendiri. Komputer Anda adalah server utamanya!' }
      ]
    },
    aidaDesire: {
      title: "Kenapa Profesional Memilih Flowork?",
      f1: { title: 'Privasi Maksimal (100% Aman)', desc: 'Riset tren bisnis atau strategi rahasia Anda tidak pernah bocor. Semua pemrosesan data langsung disimpan ke Local Disk Anda.' },
      f2: { title: 'Zero Cloud Limits', desc: 'Heavy lifting dilakukan oleh PC kamu. Bebas jalankan otomatisasi ribuan kali tanpa pusing memikirkan biaya langganan server cloud yang mahal.' },
      f3: { title: 'AI App Builder (God Mode)', desc: 'Punya kebutuhan spesifik tapi gak bisa coding? Deskripsikan saja apa yang kamu mau. AI bawaan kami akan menuliskan kodenya detik itu juga!' }
    },
    aidaAction: {
      title: "Kerja Lebih Cerdas, Bukan Lebih Keras.",
      desc: "Biarkan asisten ekstensi kami yang mengumpulkan datanya, dan biarkan PC kamu yang memproses logikanya. Mulai bangun alur kerja otomatis kamu sekarang!",
      btn1: "Buka Workspace - Gratis",
      btn2: "Download Local Engine"
    },
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { q: "Siapa yang paling membutuhkan Flowork OS?", a: "Flowork dirancang untuk para profesional digital yang menghargai waktu: Digital Marketer (riset pasar), Content Creator (analitik konten), dan Data Analyst yang butuh mengeksekusi script Python lokal dengan antarmuka web yang rapi." },
      { q: "Apa bedanya Flowork dengan tool automation berbasis Cloud?", a: "Sistem cloud automation membebankan biaya per-eksekusi dan menyimpan datamu di server mereka. Flowork menggunakan pendekatan Hybrid: Antarmukanya ringan diakses via web, namun otak pemrosesannya menggunakan Local Engine di komputer Anda. Hasilnya: Lebih cepat, tanpa limit, dan privat." },
      { q: "Apakah ekstensi Flowork aman untuk akun saya?", a: "Sangat aman. Ekstensi bekerja layaknya asisten yang meniru cara manusia membaca data publik di layar browser. Kami beroperasi secara etis dan mematuhi standar web, bukan sebagai bot spam yang agresif." },
      { q: "Apakah saya harus jago coding untuk pakai ini?", a: "Sama sekali tidak! Fitur Flow Designer kami menggunakan sistem Visual Node (tinggal drag-and-drop). Untuk kebutuhan kustom tingkat lanjut, fitur AI kami siap membuatkan aplikasinya untukmu." }
    ],

    featTitle: 'Fitur Unggulan',
    f1: { title: 'Ekosistem Tanpa Batas', desc: 'Satu akun untuk akses ke ribuan tools premium.' },
    f2: { title: 'Privasi Terjamin', desc: 'Arsitektur tunnel aman. Data Anda sepenuhnya milik Anda.' },
    f3: { title: 'High Performance', desc: 'Engine modern ultra-ringan dengan latensi nol.' },
    f4: { title: 'Jaringan Global', desc: 'Terhubung dengan kreator dan developer seluruh dunia.' },
    footer: 'Dibuat untuk Kreator.',
    seoTitle: 'Mengenal Flowork: Website Kompleks dengan Privasi Tingkat Tinggi',
    seoContent: [
      'Flowork adalah sebuah platform digital mutakhir dan website yang sangat kompleks...',
      'Salah satu keunggulan utama yang menjadikan Flowork berbeda dari platform workspace digital lainnya adalah kemampuan pengguna untuk menggunakan engine mereka sendiri...',
      'Untuk merealisasikan koneksi yang aman antara Flowork dan custom engine pengguna...',
      'Selain itu, kami sangat memahami bahwa mobilitas adalah kunci dalam produktivitas modern...',
      'Kehadiran mode terang (Light Mode) dan mode gelap (Dark Mode/Hacker Mode) di Flowork juga dirancang bukan sekadar untuk estetika visual...'
    ]
  },
  en: {
    badge: 'The Creative Automation Platform',
    title: ['Future of', 'Digital Work.'],
    desc: 'Zero-install digital workspace. Access thousands of AI & design modules. Secure, Fast, and Private.',
    ctaMain: 'Explore Store',

    desktopNotice: 'For the full experience accessing Canvas & Flow Designer, please visit via Desktop browser.',
    ctaCanvas: 'Open Canvas',
    ctaStore: 'App Store',
    ctaFlow: 'Flow Designer',
    ctaAbout: 'About Us',

    aidaAttention: {
      tag: "THE PROBLEM",
      title: "Tired of Manual Market Research? Ballooning SaaS Bills?",
      desc: "Imagine the hours wasted copy-pasting e-commerce trends, compiling content analytics, or switching between dozens of tabs daily. Coupled with expensive 'credit limits' from cloud services that drain your wallet. It's time to stop working the old way."
    },
    aidaInterest: {
      tag: "THE SOLUTION",
      title: "Hybrid Web OS: The Limitless Smart Workspace",
      desc: "The Flowork ecosystem operates like a professional team divided into 3 main pillars:",
      pillars: [
        { icon: 'mdi-monitor-dashboard', title: '1. The Workspace', desc: 'An infinite digital canvas. Open Virtual Apps and build automated workflows (Visual Flow) as easily as solving a puzzle.' },
        { icon: 'mdi-robot-outline', title: '2. Smart Research Assistant', desc: 'Our browser extension acts as your field assistant. It automatically gathers public data for market research or content analytics.' },
        { icon: 'mdi-memory', title: '3. Local Engine (Golang)', desc: 'The secret to Flowork\'s power. Data is processed directly by your own PC. Your computer is the main server!' }
      ]
    },
    aidaDesire: {
      title: "Why Professionals Choose Flowork?",
      f1: { title: 'Maximum Privacy (100% Secure)', desc: 'Your secret business research and strategies never leak. All data processing is saved directly to your Local Disk.' },
      f2: { title: 'Zero Cloud Limits', desc: 'Heavy lifting is done by your PC. Run automations thousands of times for free without worrying about expensive cloud server subscription costs.' },
      f3: { title: 'AI App Builder (God Mode)', desc: 'Have specific needs but can\'t code? Just describe what you want. Our built-in AI will write the code, and your tool is ready instantly!' }
    },
    aidaAction: {
      title: "Work Smarter, Not Harder.",
      desc: "Let our extension assistant gather the data, and let your PC process the logic. Start building your automated workflows now!",
      btn1: "Open Workspace - Free",
      btn2: "Download Local Engine"
    },
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { q: "Who needs Flowork OS the most?", a: "Designed for digital professionals who value time: Digital Marketers (market research), Content Creators (content analytics), and Data Analysts who need to execute local Python scripts via a clean web UI." },
      { q: "How is it different from Cloud automation tools?", a: "Cloud automation charges per task and stores your data on their servers. Flowork uses a Hybrid approach: Web UI for access, processing on your PC's Local Engine. Faster, limitless, and 100% private." },
      { q: "Is the Flowork extension safe for my accounts?", a: "Extremely safe. The extension works like an assistant mimicking human reading of public data on the browser. We comply with web standards and operate ethically, unlike aggressive bots." },
      { q: "Do I need to know how to code to use this?", a: "Not at all! Use our drag-and-drop Visual Node system. For custom advanced needs, our Gemini AI feature is ready to build the application for you." }
    ],

    featTitle: 'Core Features',
    f1: { title: 'Limitless Ecosystem', desc: 'One account to access thousands of premium tools.' },
    f2: { title: 'Guaranteed Privacy', desc: 'Secure tunnel architecture. Your data is truly yours.' },
    f3: { title: 'High Performance', desc: 'Ultra-lightweight modern engine with zero latency.' },
    f4: { title: 'Global Network', desc: 'Connect with creators and developers worldwide.' },
    footer: 'Built for Creators.',
    seoTitle: 'Discover Flowork: A Complex Website with Uncompromised Privacy',
    seoContent: [
      'Flowork is a cutting-edge digital platform and an inherently complex website specifically engineered to meet the robust productivity demands of modern creators...',
      'One of the paramount features that distinguishes Flowork from conventional cloud-based workspace platforms is the unprecedented ability for users to leverage their own custom computing engines...',
      'To securely facilitate this direct connection between the Flowork frontend interface and the user’s private computing engine...',
      'Furthermore, we acutely recognize that unhindered mobility is the cornerstone of modern professional productivity...',
      'The meticulously crafted implementation of Light Mode and Dark Mode (including our signature Hacker Mode) within Flowork is designed not merely for superficial visual aesthetics...'
    ]
  }
};

const t = computed(() => content[lang.value]);
const goToStore = () => router.push('/store');

const currentTheme = ref('dark');
let themeObserver = null;

const syncThemeFromGlobal = () => {
  const globalTheme = document.documentElement.getAttribute('data-theme');
  currentTheme.value = globalTheme || localStorage.getItem('flowork_os_theme') || 'dark';
};

const themeStyles = computed(() => {
  const theme = currentTheme.value;
  if (theme === 'light') {
    return {
      '--bg': '#f8fafc', '--text': '#0f172a', '--text-mute': '#475569', '--accent-1': '#6366f1', '--accent-2': '#06b6d4', '--glass': 'rgba(255, 255, 255, 0.7)', '--border': 'rgba(0, 0, 0, 0.1)',
      '--blob-1': '#0ea5e9', '--blob-2': '#eab308', '--blob-3': '#38bdf8', '--r-body-1': '#e0e7ff', '--r-body-2': '#1e40af', '--r-neck': '#020617', '--r-visor-1': '#3b82f6', '--r-arm-1': '#1e40af', '--r-arm-2': '#60a5fa', '--r-core-1': '#172554', '--r-core-2': '#3b82f6', '--r-core-3': '#eab308', '--r-ring-1': '#eab308', '--r-ring-2': '#3b82f6',
    };
  } else {
    return {
      '--bg': '#020204', '--text': '#ffffff', '--text-mute': '#cbd5e1', '--accent-1': '#8b5cf6', '--accent-2': '#2dd4bf', '--glass': 'rgba(20, 20, 30, 0.85)', '--border': 'rgba(255, 255, 255, 0.15)',
      '--blob-1': '#22d3ee', '--blob-2': '#ffd700', '--blob-3': '#0ea5e9', '--r-body-1': '#0b1120', '--r-body-2': '#1d4ed8', '--r-neck': '#0f172a', '--r-visor-1': '#22d3ee', '--r-arm-1': '#1e40af', '--r-arm-2': '#22d3ee', '--r-core-1': '#0f172a', '--r-core-2': '#3b82f6', '--r-core-3': '#ffd700', '--r-ring-1': '#ffd700', '--r-ring-2': '#3b82f6',
    };
  }
});

onMounted(async () => {
  const saved = localStorage.getItem('flowork_lang'); lang.value = saved || 'en';
  syncThemeFromGlobal();
  if (appStore.installedApps.length === 0) await appStore.fetchInstalledApps();
  themeObserver = new MutationObserver((m) => {
    m.forEach((mu) => { if (mu.attributeName === 'data-theme') syncThemeFromGlobal(); });
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
});

onUnmounted(() => { if (themeObserver) themeObserver.disconnect(); });
</script>

<style scoped>
.lander-wrapper {
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    background: var(--bg);
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    position: relative;
    transition: background 0.3s, color 0.3s;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 80px;
}

.noise-overlay { position: fixed; inset: 0; background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events: none; z-index: 0; mix-blend-mode: overlay; }

.ambient-mesh { position: fixed; inset: 0; z-index: 0; filter: blur(150px); opacity: 0.6; transform: translateZ(0); pointer-events: none; }

.blob { position: absolute; border-radius: 50%; animation: float 15s infinite ease-in-out; }
.b1 { width: 80vw; height: 80vw; background: var(--blob-1); top: -25%; left: -15%; animation-delay: 0s; opacity: 0.5; }
.b2 { width: 75vw; height: 75vw; background: var(--blob-2); bottom: -15%; right: -25%; animation-delay: -5s; opacity: 0.4; }
.b3 { width: 70vw; height: 70vw; background: var(--blob-3); top: 25%; left: 35%; animation-delay: -8s; opacity: 0.4; }
.b4 { width: 65vw; height: 65vw; background: var(--blob-2); top: 15%; left: -25%; animation-delay: -3s; opacity: 0.3; }

.hero-section { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 8%; overflow: hidden; padding-bottom: 60px;}
.hero-text-content { max-width: 100%; position: relative; z-index: 2; margin-top: -40px; }
.pill-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 6px 16px; border-radius: 100px; font-size: 0.8rem; margin-bottom: 24px; color: var(--accent-2); font-weight: 600; backdrop-filter: blur(10px); }
.pulse-dot { width: 8px; height: 8px; background: var(--accent-2); border-radius: 50%; box-shadow: 0 0 10px var(--accent-2); }
.display-title { font-size: 2.8rem; line-height: 1.1; font-weight: 800; margin-bottom: 20px; letter-spacing: -1px; text-shadow: 0 4px 20px rgba(0,0,0,0.8); }
.block-text { display: block; }
.noise-glitch { position: relative; display: inline-block; background: linear-gradient(135deg, var(--accent-1), var(--accent-2)); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-subtitle { font-size: 1rem; color: #e2e8f0; line-height: 1.6; margin-bottom: 20px; padding: 12px; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
.hero-cta { display: flex; flex-direction: column; gap: 12px; width: 100%; }

/* [NEW CODE] Styling for Desktop Notice */
.desktop-notice-m {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.3);
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 12px;
    color: var(--accent-2);
    font-size: 0.85rem;
    text-align: left;
    line-height: 1.4;
}
.desktop-notice-m i {
    font-size: 1.4rem;
    color: var(--accent-1);
    margin-top: -2px;
}

.btn-glow-primary { background: var(--text); color: var(--bg); padding: 18px 24px; border-radius: 14px; font-weight: 700; font-size: 1.05rem; border: none; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 0 20px rgba(255,255,255,0.2); width: 100%; transition: transform 0.2s; }
.btn-glow-primary:active { transform: scale(0.96); }
.arrow-icon { background: var(--bg); color: var(--text); width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.btn-outline { background: rgba(255,255,255,0.05); border: 1px solid var(--accent-2); color: var(--text); padding: 18px 24px; border-radius: 14px; font-weight: 600; font-size: 1.05rem; width: 100%; backdrop-filter: blur(8px); transition: transform 0.2s; }
.btn-outline:active { transform: scale(0.96); }

.mobile-hero-visual { position: absolute; top: 0; left: 0; width: 100%; height: 100vh; z-index: -1; overflow: hidden; pointer-events: none; opacity: 0.4; }
.mascot-hero-container.mobile-size { width: 350px; height: 350px; position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%); }
.hero-robot { width: 100%; height: 100%; overflow: visible; }
.robot-float-anim { animation: welcomeFloat 6s ease-in-out infinite; }
.shadow-pulse { animation: shadowScale 6s ease-in-out infinite; transform-origin: center; }
.spin-slow { transform-origin: center; animation: ringSpin 10s linear infinite; }
.spin-reverse { transform-origin: center; animation: ringSpin 8s linear infinite reverse; }

@keyframes float { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(20px, -20px); } }
@keyframes welcomeFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
@keyframes shadowScale { 0%, 100% { transform: scale(1); opacity: 0.2; } 50% { transform: scale(0.8); opacity: 0.1; } }
@keyframes ringSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.mobile-swipe-indicator { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 5px; opacity: 0.8; animation: pulseFade 2.5s infinite; }
.swipe-text { font-size: 0.7rem; font-weight: bold; letter-spacing: 2px; color: var(--text-mute); }
.swipe-arrows span { display: block; width: 8px; height: 8px; border-right: 2px solid var(--text-mute); border-bottom: 2px solid var(--text-mute); transform: rotate(45deg); margin: -2px; animation: cascadeDown 1.5s infinite; }
.swipe-arrows span:nth-child(2) { animation-delay: 0.2s; }
.swipe-arrows span:nth-child(3) { animation-delay: 0.4s; }
@keyframes cascadeDown { 0% { opacity: 0; transform: rotate(45deg) translate(-5px, -5px); } 50% { opacity: 1; } 100% { opacity: 0; transform: rotate(45deg) translate(5px, 5px); } }
@keyframes pulseFade { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

.marquee-banner-mobile { width: 100%; overflow: hidden; background: var(--text); color: var(--bg); padding: 12px 0; white-space: nowrap; position: relative; z-index: 2; box-shadow: 0 5px 20px rgba(0,0,0,0.3); margin-top: 20px; margin-bottom: 40px; transform: rotate(-2deg) scale(1.05); }
.marquee-content-mobile { display: inline-block; font-weight: 800; font-size: 1.1rem; letter-spacing: 2px; animation: scrollMobile 15s linear infinite; }
.marquee-content-mobile span { display: inline-block; padding: 0 15px; }
.marquee-content-mobile .dot { color: var(--accent-1); }
@keyframes scrollMobile { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

/* =======================================================
   REDESIGN: AIDA & E-E-A-T STYLES FOR MOBILE
   ======================================================= */
.sales-content-wrapper-m {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 50px;
    padding-bottom: 60px;
}

.aida-section-m {
    padding: 0 6%;
    width: 100%;
}

.section-header-m { margin-bottom: 30px; }
.section-header-m.center-m { text-align: left; }
.section-title-m { font-size: 2rem; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px; line-height: 1.2; }
.section-desc-m { font-size: 1rem; color: var(--text-mute); line-height: 1.6; }

.glass-panel-m {
    background: rgba(20, 20, 30, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}
.text-gradient-m { background: linear-gradient(135deg, var(--text), var(--accent-2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.text-accent-1-m { color: var(--accent-1); }
.text-accent-2-m { color: var(--accent-2); }
.glow-border-m { position: relative; }
.glow-border-m::before { content: ''; position: absolute; inset: -1px; background: linear-gradient(135deg, var(--accent-1), var(--accent-2)); z-index: -1; border-radius: inherit; opacity: 0.3; filter: blur(3px); }

/* --- 1. Attention --- */
.attention-content-m { padding: 30px 20px; text-align: left; }
.pill-tag-m { display: inline-block; padding: 5px 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 50px; font-size: 0.75rem; font-weight: bold; letter-spacing: 1px; margin-bottom: 16px; color: var(--accent-1); text-transform: uppercase; }
.alert-tag-m { color: #ff5f56; border-color: rgba(255, 95, 86, 0.3); background: rgba(255, 95, 86, 0.05); }

/* --- 2. Interest (Pillars) --- */
.pillars-grid-m { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
.pillar-card-m { padding: 25px 20px; text-align: left; }
.icon-wrapper-m { width: 50px; height: 50px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px; color: var(--accent-2); }
.pillar-card-m h3 { font-size: 1.15rem; margin-bottom: 10px; font-weight: 700; }
.pillar-card-m p { color: var(--text-mute); line-height: 1.5; font-size: 0.9rem; }

/* --- 3. Desire (Bento Grid) --- */
.bento-grid-modern-m { display: flex; flex-direction: column; gap: 16px; }
.bento-card-m { padding: 25px 20px; border-radius: 20px; display: flex; flex-direction: column; gap: 16px; }
.icon-huge-m { font-size: 48px; }
.icon-medium-m { font-size: 36px; }
.gradient-1-m { background: linear-gradient(135deg, #1e1b4b, #4338ca); color: white; border: none; }
.gradient-2-m { background: linear-gradient(135deg, var(--bg), rgba(20,20,30,0.5)); border: 1px solid var(--border); }
.card-text-m h3 { font-size: 1.2rem; margin-bottom: 8px; font-weight: 700; }
.card-text-m p { color: var(--text-mute); line-height: 1.5; font-size: 0.9rem; }
.gradient-1-m .card-text-m p { color: rgba(255,255,255,0.8); }

/* --- 4. FAQ --- */
.faq-container-m { display: flex; flex-direction: column; gap: 16px; }
.faq-item-m { padding: 20px; }
.faq-q-m { font-size: 1rem; font-weight: 700; margin-bottom: 10px; display: flex; align-items: flex-start; gap: 8px; line-height: 1.4; }
.faq-q-m i { margin-top: 2px; font-size: 1.1rem; }
.faq-a-m { color: var(--text-mute); line-height: 1.5; font-size: 0.9rem; padding-left: 26px; }

/* --- 5. Action (CTA) --- */
.action-card-m { padding: 40px 20px; text-align: center; border-radius: 24px; margin-top: 20px; }
.action-card-m .section-title-m { font-size: 1.8rem; text-align: center; }
.action-card-m .section-desc-m { text-align: center; margin-bottom: 24px; }
.action-buttons-m { display: flex; flex-direction: column; gap: 12px; }
.btn-glow-primary.large-m { padding: 16px 20px; font-size: 1rem; border-radius: 14px; }
.btn-outline.large-m { padding: 16px 20px; font-size: 1rem; border-radius: 14px; }

.creative-footer { text-align: center; padding: 40px 0 60px 0; color: var(--text-mute); font-size: 0.8rem; }
.footer-line { width: 60px; height: 3px; background: var(--accent-2); margin: 0 auto 20px; border-radius: 2px; }
</style>
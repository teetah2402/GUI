//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\desktop\LanderDesktop.vue
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="lander-wrapper" :style="themeStyles" :data-theme="uiStore.currentTheme">

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

        <div class="hero-main-cta">
          <a href="https://extension.floworkos.com" target="_blank" class="btn-glow-extension large" :title="t.ctaExtension">
              <i class="mdi mdi-google-chrome" style="margin-right: 8px; font-size: 1.4em;"></i>
              {{ t.ctaExtension }}
          </a>
          <a href="https://update.floworkos.com" target="_blank" class="btn-glow-engine large" :title="t.ctaEngine">
              <i class="mdi mdi-memory" style="margin-right: 8px; font-size: 1.4em;"></i>
              {{ t.ctaEngine }}
          </a>
        </div>
      </div>

      <div class="hero-visual-3d">
         <div class="mascot-companion">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="hero-robot">
              <defs>
                <linearGradient id="r_body" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="var(--r-body-1)"/><stop offset="100%" stop-color="var(--r-body-2)"/></linearGradient>
                <linearGradient id="r_visor" x1="0%" y1="50%" x2="100%" y2="50%"><stop offset="0%" stop-color="var(--r-visor-1)"/><stop offset="50%" stop-color="#ffffff"/><stop offset="100%" stop-color="var(--r-visor-1)"/></linearGradient>
                <linearGradient id="r_arm" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="var(--r-arm-1)"/><stop offset="100%" stop-color="var(--r-arm-2)"/></linearGradient>
                <linearGradient id="r_core" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="var(--r-core-1)"/><stop offset="50%" stop-color="var(--r-core-2)"/><stop offset="100%" stop-color="var(--r-core-3)"/></linearGradient>
                <filter id="soft_glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/><feMerge><feMergeNode in="blur" opacity="0.6"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <g transform="translate(256, 260)" class="robot-float-anim">
                <ellipse cx="0" cy="160" rx="90" ry="20" fill="var(--blob-2)" opacity="0.2" class="shadow-pulse"/>
                <g filter="url(#soft_glow)">
                    <path d="M -70 40 C -80 90, -50 130, 0 140 C 50 130, 80 90, 70 40 L 50 -20 L -50 -20 Z" fill="url(#r_body)"/>
                    <rect x="-35" y="-45" width="70" height="35" rx="8" fill="var(--r-neck)"/>
                    <path d="M -80 -40 L -90 -100 C -90 -140, -50 -160, 0 -160 C 50 -160, 90 -140, 90 -100 L 80 -40 Z" fill="url(#r_body)"/>
                    <path d="M -70 -100 C -70 -120, -35 -130, 0 -130 C 35 -130, 70 -120, 70 -100 C 70 -85, 35 -95, 0 -95 C -35 -95, -70 -85, -70 -100 Z" fill="url(#r_visor)"/>
                </g>
                <g transform="translate(0, 60) scale(0.18)">
                    <circle cx="0" cy="0" r="230" fill="none" stroke="var(--r-ring-1)" stroke-width="20" stroke-dasharray="200 150" opacity="0.9" class="spin-slow"/>
                    <circle cx="0" cy="0" r="180" fill="none" stroke="var(--r-ring-2)" stroke-width="25" stroke-dasharray="100 80" opacity="0.8" class="spin-reverse"/>
                    <g transform="translate(-256, -256)">
                         <path d="M100 80 L 220 80 L 220 200 L 160 200 L 160 432 L 100 432 Z" fill="url(#r_core)" stroke="var(--r-body-1)" stroke-width="4"/>
                         <path d="M260 80 L 412 80 L 412 180 L 260 180 Z" fill="var(--r-visor-1)" opacity="0.9"/>
                         <path d="M260 220 L 360 220 L 360 320 L 260 320 Z" fill="var(--r-arm-1)" opacity="0.9"/>
                    </g>
                </g>
                <g class="arms-container">
                    <path d="M -60 20 C -130 20, -180 -10, -200 -60" fill="none" stroke="url(#r_arm)" stroke-width="14" stroke-linecap="round" filter="url(#soft_glow)"/>
                    <circle cx="-200" cy="-60" r="12" fill="var(--r-visor-1)" filter="url(#soft_glow)"/>
                    <path d="M 60 20 C 130 20, 180 -10, 200 -60" fill="none" stroke="url(#r_arm)" stroke-width="14" stroke-linecap="round" filter="url(#soft_glow)"/>
                    <circle cx="200" cy="-60" r="12" fill="var(--r-visor-1)" filter="url(#soft_glow)"/>
                </g>
              </g>
            </svg>
         </div>

         <div class="glass-browser-mockup canvas-simulator">
            <div class="mockup-os-header">
               <div class="m-header-left"><span class="m-dot"></span><span class="m-os-text">FLOWORK OS</span></div>
               <div class="m-header-center">12:00 PM</div>
               <div class="m-header-right"><div class="m-close-all"></div></div>
            </div>

            <div class="mockup-os-viewport">
               <div v-if="uiStore.currentTheme !== 'light'" class="m-cyber-scene">
                  <div class="m-grid-floor"></div>
                  <div class="m-horizon-glow"></div>
               </div>
               <div v-else class="m-light-scene">
                  <div class="m-paint-blob m-blue"></div>
                  <div class="m-paint-blob m-gold"></div>
               </div>

               <div class="m-window-ghost"></div>

               <div class="m-window win-primary is-being-dragged">
                  <div class="m-win-titlebar">
                     <div class="m-win-dots"><span></span><span></span></div>
                     <div class="m-drag-handle-visual"></div>
                  </div>
                  <div class="m-win-body">
                     <div class="m-ai-wave"></div>
                     <div class="m-line short"></div><div class="m-line long"></div>
                  </div>

                  <div class="m-cursor-hand">
                     <i class="mdi mdi-cursor-default-click"></i>
                  </div>
               </div>

               <div class="m-window win-secondary">
                  <div class="m-win-titlebar"><div class="m-win-dots"><span></span><span></span></div></div>
                  <div class="m-win-body code-look">
                     <div class="m-code-line"></div><div class="m-code-line"></div>
                  </div>
               </div>

               <div class="m-center-dock">
                  <div class="m-dock-glass">
                     <span class="m-dock-arrow"></span><span class="m-dock-page">1</span><span class="m-dock-arrow"></span>
                  </div>
               </div>
            </div>

            <div class="floating-badge"><i class="mdi mdi-gesture-drag-helper"></i> ACTIVE DRAG</div>
         </div>
      </div>

      <div class="creative-scroll-indicator">
         <div class="mouse-outline">
            <div class="mouse-wheel"></div>
         </div>
         <div class="scroll-arrows">
            <span></span><span></span><span></span>
         </div>
      </div>
    </header>

    <div class="marquee-banner">
      <div class="marquee-content">
        <span>IDEATE</span><span class="dot">•</span>
        <span>DESIGN</span><span class="dot">•</span>
        <span>CODE</span><span class="dot">•</span>
        <span>DEPLOY</span><span class="dot">•</span>
        <span>AUTOMATE</span><span class="dot">•</span>
        <span>PRIVACY</span><span class="dot">•</span>
        <span>IDEATE</span><span class="dot">•</span>
        <span>DESIGN</span><span class="dot">•</span>
        <span>CODE</span><span class="dot">•</span>
        <span>DEPLOY</span><span class="dot">•</span>
        <span>AUTOMATE</span><span class="dot">•</span>
        <span>PRIVACY</span><span class="dot">•</span>
      </div>
    </div>

    <main class="sales-content-wrapper">
        <section class="aida-section aida-attention">
            <div class="attention-content glass-panel glow-border">
                <div class="pill-tag alert-tag">{{ t.aidaAttention.tag }}</div>
                <h2 class="section-title text-gradient">{{ t.aidaAttention.title }}</h2>
                <p class="section-desc">{{ t.aidaAttention.desc }}</p>
            </div>
        </section>

        <section class="aida-section aida-interest">
            <div class="section-header center">
                <div class="pill-tag">{{ t.aidaInterest.tag }}</div>
                <h2 class="section-title">{{ t.aidaInterest.title }}</h2>
                <p class="section-desc">{{ t.aidaInterest.desc }}</p>
            </div>
            <div class="pillars-grid">
                <div class="pillar-card glass-panel hover-lift" v-for="(pillar, index) in t.aidaInterest.pillars" :key="index">
                    <div class="icon-wrapper">
                        <i :class="['mdi', pillar.icon]"></i>
                    </div>
                    <h3>{{ pillar.title }}</h3>
                    <p>{{ pillar.desc }}</p>
                </div>
            </div>
        </section>

        <section class="aida-section aida-desire">
            <div class="section-header center">
                <h2 class="section-title">{{ t.aidaDesire.title }}</h2>
            </div>
            <div class="bento-grid-modern">
                <div class="bento-card-m gradient-1 span-2 hover-lift">
                    <i class="mdi mdi-shield-lock-outline icon-huge"></i>
                    <div class="card-text">
                        <h3>{{ t.aidaDesire.f1.title }}</h3>
                        <p>{{ t.aidaDesire.f1.desc }}</p>
                    </div>
                </div>
                <div class="bento-card-m glass-panel hover-lift">
                    <i class="mdi mdi-infinity icon-medium text-accent-1"></i>
                    <div class="card-text">
                        <h3>{{ t.aidaDesire.f2.title }}</h3>
                        <p>{{ t.aidaDesire.f2.desc }}</p>
                    </div>
                </div>
                <div class="bento-card-m glass-panel hover-lift span-full">
                    <i class="mdi mdi-robot-excited-outline icon-medium text-accent-2"></i>
                    <div class="card-text">
                        <h3>{{ t.aidaDesire.f3.title }}</h3>
                        <p>{{ t.aidaDesire.f3.desc }}</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="aida-section faq-section">
            <div class="section-header center">
                <h2 class="section-title">{{ t.faqTitle }}</h2>
            </div>
            <div class="faq-container">
                <div class="faq-item glass-panel" v-for="(faq, i) in t.faqs" :key="i">
                    <h4 class="faq-q">
                        <i class="mdi mdi-help-circle-outline text-accent-1"></i>
                        {{ faq.q }}
                    </h4>
                    <p class="faq-a">{{ faq.a }}</p>
                </div>
            </div>
        </section>

        <section class="aida-section aida-action">
            <div class="action-card gradient-2 glow-border">
                <h2 class="section-title">{{ t.aidaAction.title }}</h2>
                <p class="section-desc">{{ t.aidaAction.desc }}</p>

                <div class="action-main-cta">
                    <a href="https://extension.floworkos.com" target="_blank" class="btn-glow-extension large">
                        <i class="mdi mdi-google-chrome" style="margin-right: 8px; font-size: 1.4em;"></i> {{ t.ctaExtension }}
                    </a>
                    <a href="https://update.floworkos.com" target="_blank" class="btn-glow-engine large">
                        <i class="mdi mdi-memory" style="margin-right: 8px; font-size: 1.4em;"></i> {{ t.ctaEngine }}
                    </a>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/apps';
import { useUiStore } from '@/store/ui';

import PublicHeader from '@/components/layout/PublicHeader.vue';

// [OLD CODE] Dinonaktifkan karena komponen MobileDock sudah tidak dirender di template
// import MobileDock from '@/components/os/MobileDock.vue';

const router = useRouter();
const appStore = useAppStore();
const uiStore = useUiStore();
const lang = ref('en');
const isSidebarOpen = ref(false);

const updateLang = (newLang) => {
  lang.value = newLang;
};

// [TAMBAHAN KODE] Menambahkan keys ctaExtension & ctaEngine ke dalam kamus.
const content = {
  id: {
    badge: 'Platform Otomasi Kreatif',
    title: ['Sistem Kerja', 'Masa Depan.'],
    desc: 'Workspace digital tanpa instalasi. Akses ribuan modul AI dan desain. Aman, Cepat, dan Privat.',
    ctaMain: 'Buka App Store',
    ctaSec: 'Pelajari',

    // [TAMBAHAN KODE] Kamus CTA Terpisah
    ctaCanvas: 'Buka Canvas',
    ctaStore: 'App Store',
    ctaFlow: 'Flow Designer',
    ctaAbout: 'Tentang Kami',
    ctaExtension: 'Ekstensi Chrome', // [ADD]
    ctaEngine: 'Local Engine', // [ADD]

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
    footer: 'Dibuat untuk Kreator.'
  },
  en: {
    badge: 'The Creative Automation Platform',
    title: ['Future of', 'Digital Work.'],
    desc: 'Zero-install digital workspace. Access thousands of AI & design modules. Secure, Fast, and Private.',
    ctaMain: 'Explore Store',
    ctaSec: 'Learn More',

    // [TAMBAHAN KODE] Kamus CTA Terpisah
    ctaCanvas: 'Open Canvas',
    ctaStore: 'App Store',
    ctaFlow: 'Flow Designer',
    ctaAbout: 'About Us',
    ctaExtension: 'Chrome Extension', // [ADD]
    ctaEngine: 'Local Engine', // [ADD]

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
    footer: 'Built for Creators.'
  }
};

const t = computed(() => content[lang.value]);
const goToStore = () => router.push('/store');

const themeStyles = computed(() => {
  const theme = uiStore.currentTheme;
  if (theme === 'light') {
    return {
      '--bg': '#f8fafc', '--text': '#0f172a', '--text-mute': '#475569', '--accent-1': '#6366f1', '--accent-2': '#06b6d4', '--glass': 'rgba(255, 255, 255, 0.7)', '--border': 'rgba(0, 0, 0, 0.1)',
      '--blob-1': '#0ea5e9', '--blob-2': '#eab308', '--blob-3': '#38bdf8', '--r-body-1': '#e0e7ff', '--r-body-2': '#1e40af', '--r-neck': '#020617', '--r-visor-1': '#3b82f6', '--r-arm-1': '#1e40af', '--r-arm-2': '#60a5fa', '--r-core-1': '#172554', '--r-core-2': '#3b82f6', '--r-core-3': '#eab308', '--r-ring-1': '#eab308', '--r-ring-2': '#3b82f6',
    };
  } else if (theme === 'hacker') {
     return {
        '--bg': '#000000', '--text': '#00ff00', '--text-mute': '#008f00', '--accent-1': '#00ff00', '--accent-2': '#00ff00', '--glass': 'rgba(0, 20, 0, 0.8)', '--border': 'rgba(0, 255, 0, 0.3)',
        '--blob-1': '#002200', '--blob-2': '#004400', '--blob-3': '#003300', '--r-body-1': '#000000', '--r-body-2': '#003300', '--r-neck': '#00ff00', '--r-visor-1': '#00ff00', '--r-arm-1': '#003300', '--r-arm-2': '#00ff00', '--r-core-1': '#000000', '--r-core-2': '#00ff00', '--r-core-3': '#00ff00', '--r-ring-1': '#00ff00', '--r-ring-2': '#00ff00',
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
  uiStore.initTheme();
  if (appStore.installedApps.length === 0) await appStore.fetchInstalledApps();
});
</script>

<style scoped>
/* FIX: menambahkan height spesifik dan overflow-y: auto */
.lander-wrapper {
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    background: var(--bg); color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    position: relative;
    transition: background 0.3s, color 0.3s;
    padding-top: 80px;
    scroll-behavior: smooth;
}

.noise-overlay { position: fixed; inset: 0; background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events: none; z-index: 0; mix-blend-mode: overlay; }

/* FIX: pointer-events: none */
.ambient-mesh { position: fixed; inset: 0; z-index: 0; filter: blur(150px); opacity: 0.6; transform: translateZ(0); pointer-events: none; }

.blob { position: absolute; border-radius: 50%; animation: float 15s infinite ease-in-out; }
.b1 { width: 80vw; height: 80vw; background: var(--blob-1); top: -25%; left: -15%; opacity: 0.5; }
.b2 { width: 75vw; height: 75vw; background: var(--blob-2); bottom: -15%; right: -25%; opacity: 0.4; }

.hero-section { position: relative; z-index: 1; min-height: calc(100vh - 80px); display: flex; align-items: center; justify-content: space-between; padding: 0 5%; gap: 40px; }
.hero-text-content { max-width: 600px; position: relative; z-index: 2; }
.display-title { font-size: 4.5rem; line-height: 1; font-weight: 700; margin-bottom: 24px; letter-spacing: -2px; }
.noise-glitch { background: linear-gradient(135deg, var(--accent-1), var(--accent-2)); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-subtitle { font-size: 1.25rem; color: var(--text-mute); line-height: 1.6; margin-bottom: 40px; }
.hero-cta { display: flex; gap: 16px; }

/* [OLD CODE COMMENTED] CSS untuk secondary CTA lama
.hero-secondary-cta { display: flex; gap: 16px; margin-top: 24px; }
.action-secondary-cta { display: flex; justify-content: center; gap: 16px; margin-top: 24px; }
.btn-sm { padding: 10px 20px; font-size: 0.95rem; border-radius: 8px; display: inline-flex; align-items: center; text-decoration: none; }
.action-secondary-cta .btn-outline { text-decoration: none; display: inline-flex; align-items: center; }
.ext-link { border-color: rgba(59, 130, 246, 0.5); color: #3b82f6; }
.ext-link:hover { background: rgba(59, 130, 246, 0.1); border-color: #60a5fa; color: #60a5fa; }
.eng-link { border-color: rgba(249, 115, 22, 0.5); color: #f97316; }
.eng-link:hover { background: rgba(249, 115, 22, 0.1); border-color: #fb923c; color: #fb923c; }
*/

/* [ADD] CSS BARU UNTUK TOMBOL CERAH YANG MENGGANTIKAN TOMBOL LAMA */
.hero-main-cta { display: flex; gap: 20px; margin-top: 10px; }
.action-main-cta { display: flex; justify-content: center; gap: 20px; margin-top: 32px; }

.btn-glow-extension, .btn-glow-engine {
    padding: 18px 36px;
    font-size: 1.1rem;
    border-radius: 16px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    color: #ffffff !important;
    text-transform: uppercase;
    letter-spacing: 1px;
    border: none;
}

.btn-glow-extension {
    background: linear-gradient(135deg, #00c6ff, #0072ff);
    box-shadow: 0 10px 25px rgba(0, 114, 255, 0.4);
}
.btn-glow-extension:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 35px rgba(0, 114, 255, 0.7);
    background: linear-gradient(135deg, #00d4ff, #0080ff);
}

.btn-glow-engine {
    background: linear-gradient(135deg, #ff9900, #ff5500);
    box-shadow: 0 10px 25px rgba(255, 85, 0, 0.4);
}
.btn-glow-engine:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 35px rgba(255, 85, 0, 0.7);
    background: linear-gradient(135deg, #ffa31a, #ff6600);
}

.btn-glow-primary { background: var(--text); color: var(--bg); padding: 16px 32px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; box-shadow: 0 0 20px rgba(255,255,255,0.2); }
.btn-glow-primary:hover { transform: translateY(-2px); box-shadow: 0 0 30px var(--accent-1); }
.arrow-icon { background: var(--bg); color: var(--text); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.btn-outline { background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: var(--text); padding: 16px 32px; border-radius: 12px; font-weight: 600; cursor: pointer; backdrop-filter: blur(4px); transition: 0.2s; }

.hero-visual-3d { flex: 1; height: 600px; display: flex; align-items: center; justify-content: center; perspective: 1200px; position: relative; }
.mascot-companion { position: absolute; top: 50%; transform: translateY(-50%); left: -450px; width: 550px; height: 550px; z-index: 0; animation: floatMascot 6s ease-in-out infinite; pointer-events: none; }
@keyframes floatMascot { 0%, 100% { transform: translateY(-50%); } 50% { transform: translateY(calc(-50% - 20px)); } }

.glass-browser-mockup.canvas-simulator {
   width: 100%; max-width: 850px; height: 550px;
   background: var(--glass); backdrop-filter: blur(25px); border: 1px solid var(--border); border-radius: 24px;
   transform: rotateY(-15deg) rotateX(10deg); box-shadow: 30px 40px 80px rgba(0,0,0,0.6);
   display: flex; flex-direction: column; overflow: hidden; position: relative; z-index: 10;
   transition: transform 0.5s ease;
}
.glass-browser-mockup.canvas-simulator:hover {
   transform: rotateY(-5deg) rotateX(5deg) scale(1.02);
}

.mockup-os-header { height: 40px; background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 15px; }
.m-dot { width: 8px; height: 8px; background: var(--accent-2); border-radius: 50%; }
.m-os-text { font-size: 10px; font-weight: bold; color: var(--text); opacity: 0.8; font-family: monospace; }

.mockup-os-viewport { flex: 1; position: relative; overflow: hidden; background: #000; }

.m-cyber-scene { position: absolute; inset: 0; background: #020205; perspective: 1000px; }
.m-grid-floor {
   position: absolute; width: 200%; height: 200%; top: -50%; left: -50%;
   background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
   background-size: 30px 30px; transform: rotateX(60deg); animation: mGridMove 20s linear infinite;
}
@keyframes mGridMove { 0% { background-position: 0 0; } 100% { background-position: 0 30px; } }
.m-horizon-glow { position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, var(--accent-2) 0%, transparent 60%); opacity: 0.1; }

.m-light-scene { position: absolute; inset: 0; background: #f1f5f9; }
.m-paint-blob { position: absolute; border-radius: 50%; filter: blur(40px); opacity: 0.5; }
.m-blue { width: 300px; height: 300px; background: #38bdf8; top: -100px; left: -100px; }
.m-gold { width: 250px; height: 250px; background: #fcd34d; bottom: -80px; right: -80px; }

.m-window {
   position: absolute; width: 200px; height: 250px;
   background: var(--glass); backdrop-filter: blur(10px);
   border: 1px solid var(--border); border-radius: 16px;
   box-shadow: 0 10px 30px rgba(0,0,0,0.3); padding: 10px;
}
.m-win-dots span { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.2); display: inline-block; margin-right: 4px; }
.m-ai-wave { height: 40px; background: linear-gradient(90deg, var(--accent-1), var(--accent-2)); border-radius: 8px; opacity: 0.3; margin-top: 10px; }
.m-line { height: 4px; background: var(--text); opacity: 0.1; border-radius: 2px; margin-top: 8px; }
.m-line.short { width: 40%; } .m-line.long { width: 80%; }

.m-window-ghost {
   position: absolute; top: 120px; left: 80px; width: 200px; height: 250px;
   border: 2px dashed var(--accent-2); border-radius: 16px; opacity: 0.3; background: rgba(255,255,255,0.05);
}

.m-window.is-being-dragged {
   top: 80px; left: 240px; z-index: 50;
   transform: scale(1.05) rotate(2deg);
   box-shadow: 0 50px 100px -20px rgba(0,0,0,0.6);
   border-color: var(--accent-2);
   animation: mDragWiggle 3s infinite ease-in-out;
}
@keyframes mDragWiggle { 0%, 100% { transform: scale(1.05) rotate(2deg) translate(0,0); } 50% { transform: scale(1.05) rotate(2deg) translate(5px, -5px); } }

.m-cursor-hand {
   position: absolute; top: 5px; left: 50%; transform: translateX(-50%);
   color: #fff; font-size: 24px; text-shadow: 0 2px 10px rgba(0,0,0,0.5);
   pointer-events: none;
}

.win-secondary { top: 180px; left: 480px; opacity: 0.8; transform: scale(0.9); }
.code-look .m-code-line { height: 4px; background: #a6e22e; opacity: 0.3; border-radius: 2px; margin-top: 8px; width: 80%; }

.m-center-dock { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); }
.m-dock-glass { background: rgba(15, 15, 20, 0.8); border: 1px solid rgba(255,255,255,0.15); padding: 5px 12px; border-radius: 15px; display: flex; align-items: center; gap: 10px; }
.m-dock-arrow { width: 6px; height: 6px; border-left: 1px solid #fff; border-bottom: 1px solid #fff; transform: rotate(45deg); opacity: 0.5; }
.m-dock-page { font-size: 10px; font-weight: bold; color: #fff; }

.floating-badge { position: absolute; bottom: -20px; right: -20px; background: var(--text); color: var(--bg); padding: 10px 20px; border-radius: 12px; font-weight: 700; box-shadow: 0 10px 30px rgba(0,0,0,0.3); display: flex; gap: 8px; align-items: center; z-index: 15; }

.creative-scroll-indicator {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    opacity: 0.7;
    animation: fadePulse 3s infinite;
}
.mouse-outline {
    width: 26px; height: 42px;
    border: 2px solid var(--text-mute);
    border-radius: 15px;
    display: flex; justify-content: center; padding-top: 6px;
}
.mouse-wheel {
    width: 4px; height: 8px;
    background: var(--accent-1);
    border-radius: 2px;
    animation: scrollWheel 2s infinite ease-in-out;
}
.scroll-arrows span {
    display: block; width: 8px; height: 8px;
    border-right: 2px solid var(--text-mute);
    border-bottom: 2px solid var(--text-mute);
    transform: rotate(45deg);
    margin: -3px;
    animation: arrowCascade 2s infinite;
}
.scroll-arrows span:nth-child(2) { animation-delay: 0.2s; }
.scroll-arrows span:nth-child(3) { animation-delay: 0.4s; }

@keyframes scrollWheel { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(15px); opacity: 0; } }
@keyframes arrowCascade { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
@keyframes fadePulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

.marquee-banner {
    width: 100%;
    overflow: hidden;
    background: var(--text);
    color: var(--bg);
    padding: 15px 0;
    white-space: nowrap;
    position: relative;
    z-index: 2;
    transform: rotate(-1deg) scale(1.02);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    margin-top: 20px;
    margin-bottom: 40px;
}
.marquee-content {
    display: inline-block;
    font-weight: 800;
    font-size: 1.5rem;
    letter-spacing: 4px;
    animation: marqueeScroll 20s linear infinite;
}
.marquee-content span {
    display: inline-block;
    padding: 0 20px;
}
.marquee-content .dot {
    color: var(--accent-1);
}
@keyframes marqueeScroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}

/* =======================================================
   REDESIGN: AIDA & E-E-A-T STYLES
   ======================================================= */
.sales-content-wrapper {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 80px;
    padding-bottom: 100px;
}

.aida-section {
    padding: 0 5%;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.section-header { margin-bottom: 40px; }
.section-header.center { text-align: center; }
.section-title { font-size: 3rem; font-weight: 800; margin-bottom: 16px; letter-spacing: -1px; }
.section-desc { font-size: 1.15rem; color: var(--text-mute); line-height: 1.6; max-width: 700px; margin: 0 auto; }

.glass-panel {
    background: var(--glass);
    backdrop-filter: blur(16px);
    border: 1px solid var(--border);
    border-radius: 24px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}
.hover-lift { transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s; }
.hover-lift:hover { transform: translateY(-8px); border-color: var(--accent-1); box-shadow: 0 30px 60px rgba(0,0,0,0.15); }
.text-gradient { background: linear-gradient(135deg, var(--text), var(--accent-2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.text-accent-1 { color: var(--accent-1); }
.text-accent-2 { color: var(--accent-2); }
.glow-border { position: relative; }
.glow-border::before { content: ''; position: absolute; inset: -1px; background: linear-gradient(135deg, var(--accent-1), var(--accent-2)); z-index: -1; border-radius: inherit; opacity: 0.3; filter: blur(4px); }

/* --- 1. Attention --- */
.attention-content { padding: 60px; text-align: center; }
.pill-tag { display: inline-block; padding: 6px 16px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 50px; font-size: 0.85rem; font-weight: bold; letter-spacing: 1px; margin-bottom: 24px; color: var(--accent-1); text-transform: uppercase; }
.alert-tag { color: #ff5f56; border-color: rgba(255, 95, 86, 0.3); background: rgba(255, 95, 86, 0.05); }

/* --- 2. Interest (Pillars) --- */
.pillars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 40px; }
.pillar-card { padding: 40px 30px; text-align: left; }
.icon-wrapper { width: 60px; height: 60px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 24px; color: var(--accent-2); }
.pillar-card h3 { font-size: 1.3rem; margin-bottom: 12px; font-weight: 700; }
.pillar-card p { color: var(--text-mute); line-height: 1.6; font-size: 0.95rem; }

/* --- 3. Desire (Bento Grid Modern) --- */
.bento-grid-modern { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.bento-card-m { padding: 40px; border-radius: 24px; display: flex; flex-direction: column; justify-content: space-between; gap: 20px; }
.bento-card-m.span-2 { grid-row: span 2; }
.bento-card-m.span-full { grid-column: span 2; flex-direction: row; align-items: center; }
.icon-huge { font-size: 64px; }
.icon-medium { font-size: 42px; }
.gradient-1 { background: linear-gradient(135deg, #1e1b4b, #4338ca); color: white; border: none; }
.gradient-2 { background: linear-gradient(135deg, var(--bg), rgba(20,20,30,0.5)); border: 1px solid var(--border); }
.card-text h3 { font-size: 1.5rem; margin-bottom: 10px; font-weight: 700; }
.card-text p { color: var(--text-mute); line-height: 1.5; }
.gradient-1 .card-text p { color: rgba(255,255,255,0.8); }

/* --- 4. FAQ (E-E-A-T) --- */
.faq-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.faq-item { padding: 30px; }
.faq-q { font-size: 1.1rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 10px; line-height: 1.4; }
.faq-q i { margin-top: 2px; }
.faq-a { color: var(--text-mute); line-height: 1.6; font-size: 0.95rem; padding-left: 32px; }

/* --- 5. Action (CTA) --- */
.action-card { padding: 80px 40px; text-align: center; border-radius: 32px; margin-top: 40px; }
.action-buttons { display: flex; justify-content: center; gap: 16px; margin-top: 32px; }
.btn-glow-primary.large { padding: 20px 40px; font-size: 1.1rem; border-radius: 16px; }
.btn-outline.large { padding: 20px 40px; font-size: 1.1rem; border-radius: 16px; }

@media (max-width: 992px) {
    .pillars-grid { grid-template-columns: 1fr; }
    .bento-grid-modern { grid-template-columns: 1fr; }
    .bento-card-m.span-2, .bento-card-m.span-full { grid-column: span 1; grid-row: span 1; flex-direction: column; align-items: flex-start; }
    .faq-container { grid-template-columns: 1fr; }
    .section-title { font-size: 2.2rem; }
    .hero-main-cta, .action-main-cta { flex-direction: column; align-items: center; }
    .btn-glow-extension, .btn-glow-engine { width: 100%; max-width: 300px; justify-content: center; }
}

.creative-footer { text-align: center; padding: 60px 0; padding-bottom: 120px; color: var(--text-mute); font-size: 0.9rem; }

@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
</style>
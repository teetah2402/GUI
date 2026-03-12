<template>
  <div class="tos-wrapper" :style="themeStyles">

    <div class="theme-bg"></div>

    <div class="header-container">
      <PublicHeader activePage="tos" @toggle-lang="updateLang" />
    </div>

    <main class="tos-content">
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

            <h1 class="page-title">{{ t.title_terms }} <span class="text-highlight">{{ t.title_service }}</span></h1>
            <div class="divider-line"></div>
            <p class="page-subtitle">{{ t.last_updated }} {{ new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
          </div>

          <div class="doc-body">

            <div class="section-block">
                <h2 class="section-title">{{ t.sec1_title }}</h2>
                <p>{{ t.sec1_desc }}</p>
            </div>

            <div class="section-block">
                <h2 class="section-title">{{ t.sec2_title }}</h2>
                <p>{{ t.sec2_desc }}</p>
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

            <div class="section-block">
                <h2 class="section-title">{{ t.sec5_title }}</h2>
                <p>{{ t.sec5_desc }}</p>
            </div>

            <div class="section-block">
                <h2 class="section-title">{{ t.sec6_title }}</h2>
                <p>{{ t.sec6_desc }}</p>
            </div>

            <div class="contact-box mt-8">
              <p class="mb-2">{{ t.contact_q }}</p>
              <div class="agent-card">
                <strong>{{ t.legal_title }}</strong><br>
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

const lang = ref('en');

const updateLang = (newLang) => {
    lang.value = newLang;
    localStorage.setItem('flowork_lang', newLang);
};

const content = {
    id: {
        title_terms: 'SYARAT',
        title_service: 'LAYANAN',
        last_updated: 'Terakhir Diperbarui:',
        sec1_title: '01. Persetujuan Syarat Ketentuan',
        sec1_desc: 'Dengan mengakses atau memanfaatkan infrastruktur desentralisasi Flowork, Anda secara tegas menyetujui untuk terikat secara hukum oleh Syarat Ketentuan Layanan ini. Apabila Anda tidak menyetujui ketentuan ini, Anda dilarang keras untuk berinteraksi dengan antarmuka maupun kontrak pintar (smart contracts) kami.',
        sec2_title: '02. Akun & Keamanan Kriptografi',
        sec2_desc: 'Anda memegang kendali dan tanggung jawab mutlak atas pengamanan kunci privat (private keys) dan frasa pemulihan (seed phrases) dompet kriptografi Anda. Flowork tidak memiliki kapasitas teknis untuk memulihkan akses yang hilang. Segala bentuk aktivitas atau transaksi yang diautentikasi menggunakan dompet Anda sepenuhnya merupakan kewajiban hukum Anda, terlepas dari ada atau tidaknya otorisasi langsung dari pihak Anda.',
        sec3_title: '03. Kewajiban & Batasan Pengguna',
        sec3_desc: 'Anda diwajibkan untuk tidak menyalahgunakan infrastruktur Flowork. Tindakan yang dilarang secara tegas mencakup, namun tidak terbatas pada:',
        sec3_li1: 'Pemanfaatan layanan untuk aktivitas yang bertentangan dengan hukum yang berlaku, termasuk namun tidak terbatas pada pencucian uang (money laundering).',
        sec3_li2: 'Penyebaran perangkat lunak berbahaya (malware) atau upaya eksploitasi kerentanan pada sistem maupun kontrak pintar kami.',
        sec3_li3: 'Tindakan pengintaian (probing), pembanjiran data (spamming), atau segala bentuk intervensi yang dapat mendisrupsi integritas dan kinerja jaringan node desentralisasi kami.',
        sec4_title: '04. Jaminan Ketersediaan Layanan',
        sec4_desc: 'Sebagai ekosistem Web3 hibrida, keandalan layanan kami sangat bergantung pada jaringan blockchain yang mendasarinya. Kami tidak dapat memberikan jaminan mutlak atas ketersediaan antarmuka gateway tanpa interupsi. Segala aspek keamanan, pemeliharaan, serta operasional dari Engine Flowork yang Anda kelola sendiri (self-hosted) secara eksklusif merupakan tanggung jawab Anda pribadi.',
        sec5_title: '05. Penghentian & Pembatasan Akses',
        sec5_desc: 'Mengingat arsitektur kami yang sepenuhnya terdesentralisasi, kami tidak memiliki kemampuan teknis untuk "menghapus" entitas akun. Akan tetapi, kami memegang hak prerogatif penuh untuk memasukkan alamat dompet (wallet address) yang terbukti melakukan pelanggaran ke dalam daftar hitam (blacklist) pada tingkat antarmuka gateway kami, secara instan dan tanpa kewajiban untuk memberikan pemberitahuan sebelumnya.',
        sec6_title: '06. Adendum & Perubahan Ketentuan',
        sec6_desc: 'Kami memegang hak mutlak untuk merevisi atau memperbarui Syarat Ketentuan Layanan ini sewaktu-waktu. Pemberitahuan akan diberikan selambat-lambatnya 30 hari kalender sebelum perubahan substansial diberlakukan. Penggunaan layanan yang berkelanjutan pasca-revisi tersebut secara otomatis dan sah dianggap sebagai persetujuan Anda terhadap ketentuan yang baru.',
        contact_q: 'Memiliki pertanyaan atau kebutuhan klarifikasi terkait dokumen hukum ini?',
        legal_title: 'Departemen Hukum',
        footer_rights: 'Hak cipta dilindungi undang-undang.'
    },
    en: {
        title_terms: 'TERMS OF',
        title_service: 'SERVICE',
        last_updated: 'Last Updated:',
        sec1_title: '01. Agreement to Terms',
        sec1_desc: 'By accessing or utilizing the Flowork decentralized infrastructure, you expressly agree to be legally bound by these Terms of Service. Should you dissent from any provision herein, you are strictly prohibited from interacting with our interfaces or smart contracts.',
        sec2_title: '02. Account & Cryptographic Security',
        sec2_desc: 'You retain absolute control and liability for the safeguarding of your cryptographic private keys and seed phrases. Flowork possesses no technical capacity to restore lost access. Any transaction or activity authenticated via your wallet constitutes your sole legal responsibility, irrespective of direct authorization from you.',
        sec3_title: '03. User Obligations & Restrictions',
        sec3_desc: 'You are strictly obligated to refrain from misusing the Flowork infrastructure. Expressly prohibited activities include, but are not limited to:',
        sec3_li1: 'Utilizing the services for any illicit purposes, including but not limited to money laundering or regulatory circumvention.',
        sec3_li2: 'Deploying malicious software or attempting to exploit vulnerabilities within our systems or smart contracts.',
        sec3_li3: 'Probing, spamming, or executing any action that disrupts the integrity, security, or performance of our decentralized node network.',
        sec4_title: '04. Service Availability Warranties',
        sec4_desc: 'Operating as a hybrid Web3 ecosystem, our service uptime is inherently reliant upon underlying blockchain networks. We offer no absolute guarantees regarding uninterrupted gateway access. The security, maintenance, and operational integrity of your self-hosted Flowork Engines remain your exclusive responsibility.',
        sec5_title: '05. Termination & Access Restriction',
        sec5_desc: 'Due to the immutable nature of decentralized architecture, we cannot technically "delete" accounts. Nevertheless, we reserve the unilateral right to blacklist violating wallet addresses at our interface gateway level, effective immediately and without prior notice or legal liability.',
        sec6_title: '06. Amendments & Revisions',
        sec6_desc: 'We reserve the absolute prerogative to revise or amend these Terms at our sole discretion. A minimum notice period of 30 calendar days will be provided prior to the implementation of substantial changes. Continued utilization of our services following such revisions constitutes your explicit and binding acceptance of the amended terms.',
        contact_q: 'Require clarification or have inquiries regarding this legal document?',
        legal_title: 'Legal Department',
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
    '--c-bg-page': '#0f1115', '--c-bg-card': 'rgba(30, 30, 35, 0.6)', '--c-text-main': '#ffffff', '--c-text-muted': '#94a3b8', '--c-border': 'rgba(255,255,255,0.08)', '--c-brand': '#00C6FF', '--c-gold': '#FFD700', '--c-step-bg': 'rgba(255,255,255,0.05)', '--c-shadow': '0 20px 50px rgba(0,0,0,0.3)', 'font-family': "'Inter', sans-serif"
  };
  if (theme === 'light') {
    return { ...base, '--c-bg-page': '#f8fafc', '--c-bg-card': 'rgba(255, 255, 255, 0.9)', '--c-text-main': '#0f172a', '--c-text-muted': '#64748b', '--c-border': 'rgba(0,0,0,0.1)', '--c-brand': '#2563eb', '--c-step-bg': 'rgba(0,0,0,0.03)', '--c-shadow': '0 10px 40px rgba(0,0,0,0.05)' };
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
.tos-wrapper { position: absolute; inset: 0; display: flex; flex-direction: column; background-color: var(--c-bg-page); color: var(--c-text-main); font-family: var(--font-family); overflow: hidden; transition: background-color 0.3s ease, color 0.3s ease; z-index: 10; contain: strict; }
.theme-bg { position: absolute; top: 0; left: 0; right: 0; height: 60vh; background: radial-gradient(circle at 10% 20%, rgba(0, 198, 255, 0.08) 0%, transparent 50%), radial-gradient(circle at 90% 30%, rgba(255, 215, 0, 0.05) 0%, transparent 50%); pointer-events: none; z-index: 0; filter: blur(60px); transition: background 0.3s ease; }
.header-container { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
.tos-content { flex: 1; position: relative; z-index: 1; display: flex; justify-content: center; overflow-y: auto; overflow-x: hidden; padding-top: 90px; padding-bottom: 40px; }
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
p { font-size: 1rem; line-height: 1.6; color: var(--c-text-muted); margin-bottom: 0; }
.sub-list { margin-top: 10px; padding-left: 20px; list-style-type: disc; color: var(--c-text-muted); }
.sub-list li { margin-bottom: 6px; line-height: 1.5; }
.contact-box { background: rgba(var(--c-brand), 0.05); border: 1px dashed var(--c-border); padding: 24px; border-radius: 12px; text-align: center; }
.link-highlight { color: var(--c-brand); font-weight: 600; text-decoration: none; }
.text-caption { font-size: 0.8rem; }
</style>
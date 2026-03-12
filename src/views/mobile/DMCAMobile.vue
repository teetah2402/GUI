<template>
  <div class="dmca-wrapper" :style="themeStyles">

    <div class="theme-bg"></div>

    <div class="header-container">
      <PublicHeader activePage="dmca" @toggle-lang="updateLang" />
    </div>

    <main class="dmca-content">
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

            <h1 class="page-title">{{ t.title_dmca }} <span class="text-highlight">{{ t.title_policy }}</span></h1>
            <div class="divider-line"></div>
            <p class="page-subtitle">{{ t.subtitle }}</p>
          </div>

          <div class="doc-body">
            <p>
              {{ t.intro_p1 }}
              <a href="http://www.copyright.gov/legislation/dmca.pdf" target="_blank" rel="noopener noreferrer" class="link-text">http://www.copyright.gov/legislation/dmca.pdf</a>,
              {{ t.intro_p2 }}
            </p>

            <h2 class="section-title mt-8">{{ t.notice_title }}</h2>
            <p>
              {{ t.notice_desc }}
            </p>

            <div class="step-list mt-4">
              <div class="step-item">
                <span class="step-num">01</span>
                <p>{{ t.step_1 }}</p>
              </div>

              <div class="step-item">
                <span class="step-num">02</span>
                <p>{{ t.step_2 }}</p>
              </div>

              <div class="step-item">
                <span class="step-num">03</span>
                <p>{{ t.step_3 }}</p>
              </div>

              <div class="step-item">
                <span class="step-num">04</span>
                <p>{{ t.step_4_intro }}</p>
                <ul class="sub-list">
                    <li>"{{ t.step_4_quote1 }}"</li>
                    <li>"{{ t.step_4_quote2 }}"</li>
                </ul>
              </div>

              <div class="step-item">
                <span class="step-num">05</span>
                <p>{{ t.step_5 }}</p>
              </div>
            </div>

            <div class="contact-box mt-8">
              <p class="mb-2">{{ t.contact_desc }}</p>
              <div class="agent-card">
                <strong>{{ t.agent_title }}</strong><br>
                <span class="text-muted">{{ t.agent_dept }}</span><br>
                <a href="mailto:dmca@floworkos.com" class="link-highlight">dmca@floworkos.com</a>
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

// --- AWAL: PENAMBAHAN KAMUS LOKAL & LEGAL DRAFTING ---
const lang = ref('en');

const updateLang = (newLang) => {
    lang.value = newLang;
    localStorage.setItem('flowork_lang', newLang);
};

const content = {
    id: {
        title_dmca: 'KEBIJAKAN',
        title_policy: 'DMCA',
        subtitle: 'Kepatuhan Hukum Hak Cipta Milenium Digital (DMCA)',
        intro_p1: 'Flowork sangat menghormati hak kekayaan intelektual (HAKI) pihak lain dan mewajibkan seluruh penggunanya untuk melakukan hal yang sama. Sesuai dengan ketentuan Digital Millennium Copyright Act (DMCA) tahun 1998, yang naskah hukum lengkapnya dapat diakses pada situs resmi Kantor Hak Cipta Amerika Serikat di',
        intro_p2: 'Flowork akan merespons secara cepat (expeditious) atas klaim dugaan pelanggaran hak cipta yang dilakukan melalui pemanfaatan layanan dan/atau infrastruktur antarmuka Flowork, dengan syarat bahwa klaim tersebut diajukan secara sah kepada Agen Hak Cipta yang Ditunjuk (Designated Copyright Agent) kami.',
        notice_title: 'Pemberitahuan Dugaan Pelanggaran DMCA ("Pemberitahuan")',
        notice_desc: 'Apabila Anda adalah pemilik sah hak cipta, pihak yang diberikan wewenang hukum untuk bertindak atas nama pemilik, atau pihak yang memiliki hak eksklusif terkait hak cipta tersebut, silakan laporkan dugaan pelanggaran yang terjadi dalam ekosistem layanan kami dengan menyusun Pemberitahuan DMCA resmi yang mencakup elemen-elemen di bawah ini, lalu mengirimkannya kepada Agen Hak Cipta Flowork.',
        step_1: 'Identifikasi secara spesifik karya berhak cipta yang Anda klaim telah dilanggar. Apabila satu Pemberitahuan mencakup banyak karya di dalam satu situs web, Anda diizinkan memberikan daftar perwakilan (representative list) dari karya-karya tersebut.',
        step_2: 'Identifikasi materi, tautan (URL), atau hash kriptografi yang Anda klaim mengandung unsur pelanggaran (atau menjadi subjek aktivitas pelanggaran) yang aksesnya harus kami blokir. Sertakan lokasi definitif di mana materi tersebut dapat ditemukan di dalam ekosistem Flowork.',
        step_3: 'Sertakan informasi afiliasi entitas hukum Anda (jika berlaku), alamat surat-menyurat resmi, nomor telepon, serta alamat surel (email) yang valid untuk keperluan korespondensi.',
        step_4_intro: 'Anda wajib menyertakan kedua pernyataan afirmatif berikut di dalam tubuh Pemberitahuan:',
        step_4_quote1: 'Dengan ini saya menyatakan dengan itikad baik (good faith belief) bahwa penggunaan materi berhak cipta yang disengketakan tersebut tidak mendapatkan otorisasi dari pemilik hak cipta, agen resminya, maupun oleh hukum yang berlaku (misalnya, sebagai fair use atau penggunaan wajar).',
        step_4_quote2: 'Dengan ini saya menyatakan bahwa informasi yang tertuang di dalam Pemberitahuan ini adalah akurat, dan di bawah ancaman hukuman sumpah palsu (penalty of perjury), bahwa saya adalah pemilik sah, atau pihak yang diotorisasi secara hukum untuk bertindak atas nama pemilik, dari hak cipta atau hak eksklusif yang diduga telah dilanggar.',
        step_5: 'Bubuhkan nama lengkap sah Anda beserta tanda tangan elektronik (e-signature) maupun tanda tangan fisik.',
        contact_desc: 'Sampaikan Pemberitahuan yang telah dilengkapi secara komprehensif ini kepada Agen Hak Cipta yang Ditunjuk oleh Flowork:',
        agent_title: 'Agen Hak Cipta (Copyright Agent)',
        agent_dept: 'Departemen Hukum Flowork',
        footer_rights: 'Hak cipta dilindungi undang-undang.'
    },
    en: {
        title_dmca: 'DMCA',
        title_policy: 'POLICY',
        subtitle: 'Digital Millennium Copyright Act Compliance',
        intro_p1: 'Flowork strictly respects the intellectual property rights of others and unequivocally expects its users to adhere to the same standard. Pursuant to the Digital Millennium Copyright Act of 1998 (DMCA), the full legal text of which is accessible on the U.S. Copyright Office website at',
        intro_p2: 'Flowork will respond expeditiously to actionable claims of copyright infringement committed utilizing the Flowork infrastructure and/or interface, provided such claims are legally submitted to Flowork\'s Designated Copyright Agent as outlined below.',
        notice_title: 'DMCA Notice of Alleged Infringement ("Notice")',
        notice_desc: 'If you are a legitimate copyright owner, an entity authorized to act on behalf of one, or authorized to enforce any exclusive right under copyright law, please report alleged infringements occurring within our ecosystem by formulating a formal DMCA Notice comprising the following elements and delivering it to Flowork\'s Designated Agent.',
        step_1: 'Specifically identify the copyrighted work that you claim has been infringed. If multiple copyrighted works are encompassed by a single Notice, you may provide a representative list of such works.',
        step_2: 'Identify the specific material, link (URL), or cryptographic hash you claim is infringing (or the subject of infringing activity) and to which access is to be disabled. You must provide the exact location where such material resides within the Flowork ecosystem.',
        step_3: 'Provide your legal entity affiliation (if applicable), formal mailing address, telephone number, and a valid email address for official correspondence.',
        step_4_intro: 'You are legally required to include both of the following affirmative statements within the body of the Notice:',
        step_4_quote1: 'I hereby state that I have a good faith belief that the disputed use of the copyrighted material is not authorized by the copyright owner, its legally appointed agent, or the law (e.g., as a fair use).',
        step_4_quote2: 'I hereby state that the information in this Notice is completely accurate and, under penalty of perjury, that I am the authorized owner, or authorized to act legally on behalf of the owner, of the copyright or of an exclusive right under the copyright that is allegedly infringed.',
        step_5: 'Execute the document by providing your full legal name alongside your electronic or physical signature.',
        contact_desc: 'Deliver this fully executed Notice to Flowork\'s Designated Copyright Agent:',
        agent_title: 'Designated Copyright Agent',
        agent_dept: 'Flowork Legal Department',
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
.dmca-wrapper { position: absolute; inset: 0; display: flex; flex-direction: column; background-color: var(--c-bg-page); color: var(--c-text-main); font-family: var(--font-family); overflow: hidden; transition: background-color 0.3s ease, color 0.3s ease; z-index: 10; contain: strict; }
.theme-bg { position: absolute; top: 0; left: 0; right: 0; height: 60vh; background: radial-gradient(circle at 10% 20%, rgba(0, 198, 255, 0.08) 0%, transparent 50%), radial-gradient(circle at 90% 30%, rgba(255, 215, 0, 0.05) 0%, transparent 50%); pointer-events: none; z-index: 0; filter: blur(60px); transition: background 0.3s ease; }
.header-container { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
.dmca-content { flex: 1; position: relative; z-index: 1; display: flex; justify-content: center; overflow-y: auto; overflow-x: hidden; padding-top: 90px; padding-bottom: 40px; }
.content-container { width: 100%; max-width: 800px; padding: 0 20px; margin-top: 20px; }
.glass-doc { background: var(--c-bg-card); border: 1px solid var(--c-border); border-radius: 24px; padding: 48px; box-shadow: var(--c-shadow); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: all 0.3s ease; }
.logo-wrapper { position: relative; width: 60px; height: 60px; margin: 0 auto; }
.core-logo { filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)); }
.page-title { font-family: 'Orbitron', sans-serif; font-size: 2rem; font-weight: 800; letter-spacing: 2px; color: var(--c-text-main); margin-bottom: 8px; }
.text-highlight { color: transparent; background: linear-gradient(135deg, var(--c-brand), var(--c-gold)); -webkit-background-clip: text; background-clip: text; }
.divider-line { height: 2px; width: 60px; margin: 0 auto 10px auto; background: linear-gradient(90deg, transparent, var(--c-brand), transparent); opacity: 0.6; }
.page-subtitle { font-size: 0.9rem; color: var(--c-text-muted); letter-spacing: 1px; font-weight: 500; }
.doc-body { font-size: 1rem; line-height: 1.7; color: var(--c-text-muted); }
.section-title { font-size: 1.4rem; font-weight: 700; color: var(--c-text-main); margin-bottom: 16px; border-left: 4px solid var(--c-brand); padding-left: 12px; }
.link-text { color: var(--c-brand); text-decoration: none; word-break: break-all; }
.link-text:hover { text-decoration: underline; }
.step-list { display: flex; flex-direction: column; gap: 16px; }
.step-item { display: flex; gap: 16px; background: var(--c-step-bg); padding: 16px; border-radius: 12px; border: 1px solid var(--c-border); }
.step-num { font-family: 'Orbitron', monospace; font-size: 1.2rem; font-weight: bold; color: var(--c-brand); opacity: 0.8; flex-shrink: 0; }
.sub-list { margin-top: 8px; padding-left: 20px; list-style-type: disc; }
.sub-list li { margin-bottom: 6px; font-style: italic; }
.contact-box { background: rgba(var(--c-brand), 0.05); border: 1px dashed var(--c-border); padding: 24px; border-radius: 12px; text-align: center; }
.agent-card { margin-top: 10px; background: var(--c-bg-page); padding: 16px; border-radius: 8px; border: 1px solid var(--c-border); display: inline-block; min-width: 250px; }
.link-highlight { color: var(--c-brand); font-weight: 600; text-decoration: none; }
.text-caption { font-size: 0.8rem; }
</style>
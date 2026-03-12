//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\desktop\LoginDesktop.vue
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="login-split-wrapper desktop-layout" :style="themeStyles">
    <div class="ambient-mesh">
      <div class="blob b1"></div> <div class="blob b2"></div>
    </div>
    <div class="visual-side">
      <div class="mascot-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="login-robot">
          <defs>
            <linearGradient id="r_body" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="var(--r-body-1)"/><stop offset="100%" stop-color="var(--r-body-2)"/></linearGradient>
            <linearGradient id="r_visor" x1="0%" y1="50%" x2="100%" y2="50%"><stop offset="0%" stop-color="var(--r-visor-1)"/><stop offset="50%" stop-color="#ffffff"/><stop offset="100%" stop-color="var(--r-visor-1)"/></linearGradient>
            <linearGradient id="r_arm" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="var(--r-arm-1)"/><stop offset="100%" stop-color="var(--r-arm-2)"/></linearGradient>
            <linearGradient id="r_core" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="var(--r-core-1)"/><stop offset="50%" stop-color="var(--r-core-2)"/><stop offset="100%" stop-color="var(--r-core-3)"/></linearGradient>
            <filter id="soft_glow"><feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur" opacity="0.6"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <g transform="translate(256, 260)" class="robot-float-anim">
            <ellipse cx="0" cy="160" rx="90" ry="20" fill="var(--gold)" opacity="0.2" class="shadow-pulse"/>
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
                <path d="M -60 20 C -130 20, -180 -10, -200 -60" fill="none" stroke="url(#r_arm)" stroke-width="14" stroke-linecap="round"/>
                <path d="M 60 20 C 130 20, 180 -10, 200 -60" fill="none" stroke="url(#r_arm)" stroke-width="14" stroke-linecap="round"/>
            </g>
          </g>
        </svg>
      </div>
      <div class="visual-text">
        <h2>Flowork Intelligence</h2>
        <p>Secure workspace for the next generation of creators.</p>
      </div>
    </div>

    <div class="form-side">
      <div class="login-card glass-panel" style="text-align: center;">
        <div class="header-group">
          <div class="brand-badge">
            <span class="logo-icon">💠</span> Flowork
          </div>
          <h1>System Offline</h1>
          <p class="sub-text">Login system is currently disabled.</p>
        </div>

        <button @click="router.push('/')" class="btn-primary-glass">
            <span>Return to Home</span>
            <i class="mdi mdi-home"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
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
      '--bg': '#f8fafc', '--text': '#0f172a', '--text-mute': '#64748b', '--glass': '#ffffff',
      '--shadow': '0 20px 40px rgba(0,0,0,0.08)', '--border': 'rgba(0, 0, 0, 0.08)',
      '--primary': '#4f46e5', '--primary-glow': 'rgba(79, 70, 229, 0.3)', '--gold': '#eab308', '--input-bg': '#ffffff',
      '--r-body-1': '#e0e7ff', '--r-body-2': '#1e40af', '--r-neck': '#020617', '--r-visor-1': '#3b82f6', '--r-arm-1': '#1e40af', '--r-arm-2': '#60a5fa', '--r-core-1': '#172554', '--r-core-2': '#3b82f6', '--r-core-3': '#eab308', '--r-ring-1': '#eab308', '--r-ring-2': '#3b82f6'
    };
  } else {
    return {
      '--bg': '#020204', '--text': '#ffffff', '--text-mute': '#94a3b8', '--glass': 'rgba(20, 20, 35, 0.6)',
      '--shadow': '0 20px 50px rgba(0,0,0,0.1)', '--border': 'rgba(255, 255, 255, 0.1)',
      '--primary': '#22d3ee', '--primary-glow': 'rgba(34, 211, 238, 0.3)', '--gold': '#ffd700', '--input-bg': 'rgba(0,0,0,0.3)',
      '--r-body-1': '#0b1120', '--r-body-2': '#1d4ed8', '--r-neck': '#0f172a', '--r-visor-1': '#22d3ee', '--r-arm-1': '#1e40af', '--r-arm-2': '#22d3ee', '--r-core-1': '#0f172a', '--r-core-2': '#3b82f6', '--r-core-3': '#ffd700', '--r-ring-1': '#ffd700', '--r-ring-2': '#3b82f6'
    };
  }
});

onMounted(() => {
  syncThemeFromGlobal();
  themeObserver = new MutationObserver((m) => {
    m.forEach((mu) => { if (mu.attributeName === 'data-theme') syncThemeFromGlobal(); });
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
});

onUnmounted(() => { if (themeObserver) themeObserver.disconnect(); });
</script>

<style scoped>
.login-split-wrapper { position: fixed; inset: 0; width: 100vw; height: 100vh; background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; display: flex; overflow: hidden; transition: background 0.3s; }
.ambient-mesh { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; }
.b1 { width: 50vw; height: 50vw; background: var(--primary); top: -20%; left: -10%; animation: float 15s infinite ease-in-out; }
.b2 { width: 40vw; height: 40vw; background: var(--gold); bottom: -10%; right: -10%; animation: float 12s infinite ease-in-out reverse; }
.visual-side { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; z-index: 1; }
.mascot-container { width: 450px; height: 450px; animation: floatMascot 6s ease-in-out infinite; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.3)); }
.visual-text { text-align: center; margin-top: -40px; }
.visual-text h2 { font-family: 'Space Grotesk', sans-serif; font-size: 2.5rem; font-weight: 700; margin-bottom: 10px; }
.visual-text p { color: var(--text-mute); font-size: 1.1rem; }
.form-side { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; z-index: 2; padding: 40px; }
.login-card { width: 100%; max-width: 420px; padding: 48px; border-radius: 24px; border: 1px solid var(--border); background: var(--glass); box-shadow: var(--shadow); backdrop-filter: blur(20px); transition: transform 0.3s; display: flex; flex-direction: column; }
.header-group { margin-bottom: 24px; }
.brand-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 100px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); font-weight: 600; font-size: 0.9rem; margin-bottom: 15px; color: var(--text); }
.header-group h1 { font-family: 'Space Grotesk', sans-serif; font-size: 2rem; font-weight: 700; margin-bottom: 8px; }
.sub-text { color: var(--text-mute); font-size: 0.95rem; }
.btn-primary-glass { width: 100%; padding: 14px; border-radius: 12px; border: none; background: linear-gradient(135deg, var(--primary), var(--r-arm-1)); color: white; font-weight: 600; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.3s; box-shadow: 0 10px 20px var(--primary-glow); margin-top: 10px; }
@keyframes float { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(30px, -30px); } }
@keyframes floatMascot { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
.spin-slow { transform-origin: center; animation: ringSpin 10s linear infinite; }
.spin-reverse { transform-origin: center; animation: ringSpin 8s linear infinite reverse; }
@keyframes ringSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
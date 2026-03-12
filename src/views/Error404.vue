//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\Error404.vue total lines 345 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="creative-404-wrapper" :data-theme="uiStore.currentTheme">

    <div class="bg-dots"></div>

    <div class="ambient-glow glow-blue"></div>
    <div class="ambient-glow glow-gold"></div>

    <div class="content-center">

      <div class="logo-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="flowork-logo-404">
          <defs>
            <linearGradient id="robot_body_grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="var(--r-body-1)"/>
              <stop offset="100%" stop-color="var(--r-body-2)"/>
            </linearGradient>

            <linearGradient id="visor_grad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stop-color="var(--r-visor-1)"/>
              <stop offset="50%" stop-color="var(--r-visor-2)"/>
              <stop offset="100%" stop-color="var(--r-visor-1)"/>
            </linearGradient>

            <linearGradient id="flow_arm_grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="var(--r-arm-1)"/>
              <stop offset="100%" stop-color="var(--r-arm-2)"/>
            </linearGradient>

            <linearGradient id="core_grad_chest" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="var(--r-core-1)"/>
              <stop offset="50%" stop-color="var(--r-core-2)"/>
              <stop offset="100%" stop-color="var(--r-core-3)"/>
            </linearGradient>

            <filter id="robot_glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
               <feColorMatrix in="blur" mode="matrix" values="0.3 0 0 0 0  0 0.3 0 0 0  0 0 1 0 0  0 0 0 1 0" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="energy_bloom">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>

            <filter id="chest_glow">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge>
                    <feMergeNode in="blur" opacity="0.8"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>

            <g id="chest_ring_outer">
                <circle cx="0" cy="0" r="230"
                    fill="none" stroke="var(--r-ring-outer)" stroke-width="20" stroke-linecap="round"
                    stroke-dasharray="200 150 50 150" opacity="0.9">
               </circle>
               <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="3s" repeatCount="indefinite"/>
            </g>

            <g id="chest_ring_inner">
                <circle cx="0" cy="0" r="200"
                    fill="none" stroke="var(--r-ring-inner)" stroke-width="25" stroke-linecap="round"
                    stroke-dasharray="100 80 30 80 100 80" opacity="0.8">
               </circle>
               <animateTransform attributeName="transform" type="rotate" from="360 0 0" to="0 0 0" dur="2.5s" repeatCount="indefinite"/>
            </g>
          </defs>

          <g transform="translate(256, 260)">

            <g class="mocking-anim">

                <ellipse cx="0" cy="140" rx="80" ry="20" fill="var(--r-visor-1)" opacity="0.2" filter="url(#energy_bloom)"/>

                <g filter="url(#robot_glow)">
                    <path d="M -60 40 C -70 80, -40 120, 0 130 C 40 120, 70 80, 60 40 L 40 -20 L -40 -20 Z" fill="url(#robot_body_grad)"/>
                    <rect x="-30" y="-40" width="60" height="30" rx="5" fill="var(--r-neck)"/>
                    <path d="M -70 -40 L -80 -90 C -80 -130, -40 -150, 0 -150 C 40 -150, 80 -130, 80 -90 L 70 -40 Z" fill="url(#robot_body_grad)"/>
                    <path d="M -60 -90 C -60 -110, -30 -120, 0 -120 C 30 -120, 60 -110, 60 -90 C 60 -75, 30 -85, 0 -85 C -30 -85, -60 -75, -60 -90 Z"
                          fill="url(#visor_grad)" filter="url(#energy_bloom)"/>
                </g>

                <g transform="translate(0, 50) scale(0.15)" filter="url(#chest_glow)">
                    <use href="#chest_ring_outer"/>
                    <use href="#chest_ring_inner"/>
                    <g transform="translate(-256, -256)">
                         <path d="M100 80 L 220 80 L 220 200 L 160 200 L 160 432 L 100 432 Z" fill="url(#core_grad_chest)" stroke="var(--r-body-1)" stroke-width="4"/>
                         <path d="M260 80 L 412 80 L 412 180 L 260 180 Z" fill="var(--r-visor-1)" opacity="0.9"/>
                         <path d="M260 220 L 360 220 L 360 320 L 260 320 Z" fill="var(--r-arm-1)" opacity="0.9"/>
                         <path d="M220 130 L 260 130" stroke="var(--r-core-3)" stroke-width="8" stroke-linecap="round"/>
                         <path d="M220 270 L 260 270" stroke="var(--r-core-3)" stroke-width="8" stroke-linecap="round"/>
                    </g>
                </g>

                <g>
                    <path d="M -50 20 C -120 20, -160 -40, -180 -80" fill="none" stroke="url(#flow_arm_grad)" stroke-width="12" stroke-linecap="round" filter="url(#energy_bloom)"/>
                    <g transform="translate(-180, -80) rotate(-20)">
                        <rect x="-15" y="-15" width="30" height="30" fill="none" stroke="var(--r-visor-1)" stroke-width="3"/>
                        <rect x="-8" y="-8" width="16" height="16" fill="var(--r-visor-1)" opacity="0.6"/>
                    </g>
                </g>
                <g>
                    <path d="M 50 20 C 120 20, 160 60, 180 100" fill="none" stroke="url(#flow_arm_grad)" stroke-width="12" stroke-linecap="round" filter="url(#energy_bloom)"/>
                     <g transform="translate(180, 100)">
                        <circle cx="0" cy="0" r="18" fill="none" stroke="var(--r-arm-1)" stroke-width="3"/>
                        <circle cx="0" cy="0" r="10" fill="var(--r-arm-1)"/>
                    </g>
                </g>

            </g>

            <g transform="translate(80, -140)" class="badge-float">
                <rect x="0" y="0" width="120" height="50" rx="10" fill="var(--badge-bg)" stroke="var(--badge-border)" stroke-width="2" />
                <text x="60" y="35" font-family="Inter, sans-serif" font-weight="900" font-size="28" text-anchor="middle" fill="var(--badge-text)">404</text>
            </g>

          </g>
        </svg>
      </div>

      <h1 class="title">System Meltdown</h1>
      <p class="subtitle">
        Our agent F-L0W couldn't find the page you're looking for.<br>
        It might have been moved to another dimension.
      </p>

      <div class="action-row">
        <button @click="goBack" class="btn btn-secondary">
          <span class="icon">←</span> Go Back
        </button>
        <button @click="goHome" class="btn btn-primary">
          Dashboard
          <div class="btn-glow"></div>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '@/store/ui';

const router = useRouter();
const uiStore = useUiStore();

onMounted(() => {
  uiStore.initTheme();
});

const goHome = () => router.push('/');
const goBack = () => {
  if (window.history.length > 1) router.go(-1);
  else router.push('/');
};
</script>

<style scoped>
/* =========================================
   THEME VARIABLES (SYNCED WITH LOGIN/LANDER)
   ========================================= */
.creative-404-wrapper {
  /* --- DARK THEME DEFAULT (Blue & Gold) --- */
  --bg-color: #020204;
  --text-main: #ffffff;
  --text-sub: #94a3b8;
  --dot-color: rgba(255, 255, 255, 0.05);

  --badge-bg: #1e1e24;
  --badge-border: #ffd700; /* Gold Border */
  --badge-text: #ffffff;

  --btn-sec-bg: rgba(255,255,255,0.05);
  --btn-sec-hover: rgba(255,255,255,0.1);

  /* ROBOT COLORS (DARK - Synced) */
  --r-body-1: #0b1120; /* Deep Navy */
  --r-body-2: #1d4ed8; /* Royal Blue */
  --r-neck: #0f172a;
  --r-visor-1: #22d3ee; /* Cyan */
  --r-visor-2: #ffffff;
  --r-arm-1: #1e40af;
  --r-arm-2: #22d3ee;

  /* Core Colors (Blue & Gold) */
  --r-core-1: #0f172a;
  --r-core-2: #3b82f6;
  --r-core-3: #ffd700; /* Gold Core */
  --r-ring-outer: #ffd700; /* Gold Ring */
  --r-ring-inner: #3b82f6; /* Blue Ring */

  /* Layout */
  position: fixed; inset: 0; width: 100vw; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background-color: var(--bg-color); color: var(--text-main);
  font-family: 'Inter', sans-serif; overflow: hidden;
  z-index: 999999 !important;
  transition: background-color 0.4s ease, color 0.4s ease;
}

/* --- LIGHT THEME OVERRIDE --- */
.creative-404-wrapper[data-theme="light"] {
  --bg-color: #f8fafc;
  --text-main: #1e293b;
  --text-sub: #64748b;
  --dot-color: rgba(0, 0, 0, 0.05);

  --badge-bg: #ffffff;
  --badge-border: #eab308;
  --badge-text: #2d2f45;

  --btn-sec-bg: rgba(0,0,0,0.05);
  --btn-sec-hover: rgba(0,0,0,0.08);

  /* ROBOT COLORS (LIGHT - Synced) */
  --r-body-1: #e0e7ff;
  --r-body-2: #1e40af;
  --r-neck: #020617;
  --r-visor-1: #3b82f6; /* Blue Visor */
  --r-visor-2: #e0f2fe;
  --r-arm-1: #1e40af;
  --r-arm-2: #60a5fa;

  --r-core-1: #172554;
  --r-core-2: #3b82f6;
  --r-core-3: #eab308; /* Gold */
  --r-ring-outer: #eab308; /* Gold */
  --r-ring-inner: #3b82f6;
}

/* =========================================
   ANIMATIONS
   ========================================= */
.mocking-anim {
  animation: mockJump 1s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95);
  transform-origin: center center;
}

@keyframes mockJump {
  0% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(-3deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(-12px) rotate(3deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

.badge-float {
  animation: floatBadge 3s ease-in-out infinite;
}
@keyframes floatBadge {
  0%, 100% { transform: translate(80px, -140px); }
  50% { transform: translate(80px, -150px); }
}

/* =========================================
   BACKGROUND FX (Blue & Gold)
   ========================================= */
.bg-dots {
  position: absolute; inset: 0;
  background-image: radial-gradient(var(--dot-color) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
  pointer-events: none; z-index: 0;
}
.ambient-glow {
  position: absolute; width: 600px; height: 600px; border-radius: 50%;
  filter: blur(80px); opacity: 0.5; z-index: 0;
  animation: floatBG 10s ease-in-out infinite alternate;
}
/* Glow 1: Cyan/Blue */
.glow-blue { background: rgba(34, 211, 238, 0.15); top: -100px; left: -100px; }
/* Glow 2: Gold */
.glow-gold { background: rgba(255, 215, 0, 0.1); bottom: -100px; right: -100px; animation-delay: -5s; }

@keyframes floatBG {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(50px, 30px) scale(1.1); }
}

/* =========================================
   CONTENT & UI
   ========================================= */
.content-center {
  position: relative; z-index: 10; display: flex; flex-direction: column;
  align-items: center; text-align: center; max-width: 500px; padding: 0 20px;
}
.logo-wrapper {
  width: 280px; height: 280px; margin-bottom: 20px;
  filter: drop-shadow(0 20px 40px rgba(0,0,0,0.1));
}
.flowork-logo-404 { width: 100%; height: 100%; }

.title {
  font-size: 2.5rem; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--text-main) 0%, var(--text-sub) 100%);
  background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.subtitle {
  font-size: 1rem; color: var(--text-sub); line-height: 1.6; margin-bottom: 32px; max-width: 400px;
}

.action-row { display: flex; gap: 16px; }
.btn {
  padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 0.95rem;
  cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; gap: 8px;
  position: relative; overflow: hidden;
}
.btn-secondary { background: var(--btn-sec-bg); color: var(--text-main); border: 1px solid rgba(128,128,128,0.1); }
.btn-secondary:hover { background: var(--btn-sec-hover); transform: translateY(-2px); }
.btn-primary {
  background: linear-gradient(135deg, var(--r-body-2) 0%, var(--r-visor-1) 100%); color: #fff;
  box-shadow: 0 4px 15px rgba(34, 211, 238, 0.3);
}
.btn-primary:hover { box-shadow: 0 8px 25px rgba(34, 211, 238, 0.5); transform: translateY(-2px); }
.btn-glow {
  position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: skewX(-20deg); animation: shine 3s infinite;
}
@keyframes shine { 0% { left: -100%; } 20% { left: 200%; } 100% { left: 200%; } }

@media (max-width: 768px) {
  .logo-wrapper { width: 220px; height: 220px; }
  .title { font-size: 2rem; }
  .action-row { flex-direction: column; width: 100%; }
  .btn { justify-content: center; width: 100%; }
}
</style>

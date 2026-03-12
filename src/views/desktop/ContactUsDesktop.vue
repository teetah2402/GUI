//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\desktop\ContactUsDesktop.vue total lines 234 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="contact-wrapper" :style="themeStyles" :data-theme="uiStore.currentTheme">

    <div class="theme-bg"></div>

    <div class="header-container">
      <PublicHeader activePage="contact" />
    </div>

    <main class="contact-content">
      <div class="content-container">

        <div class="glass-card">

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

            <h1 class="page-title">CONTACT <span class="text-highlight">SUPPORT</span></h1>
            <div class="divider-line"></div>
            <p class="page-subtitle">We're here to help and answer any question you might have.</p>
          </div>

          <div v-if="formStatus === 'success'" class="success-box text-center">
            <div class="success-icon">
                <i class="mdi mdi-check-circle-outline"></i>
            </div>
            <h3 class="success-title">Message Sent!</h3>
            <p class="success-desc">Thank you for reaching out. Our team will get back to you shortly.</p>
            <button @click="formStatus = 'idle'" class="btn-reset">Send Another Message</button>
          </div>

          <form v-else @submit.prevent="handleSubmit" class="contact-form">

            <div class="form-group">
                <label>Full Name</label>
                <div class="input-wrapper">
                    <i class="mdi mdi-account-outline input-icon"></i>
                    <input
                        v-model="form.name"
                        type="text"
                        placeholder="John Doe"
                        class="custom-input"
                    />
                </div>
            </div>

            <div class="form-group">
                <label>Email Address</label>
                <div class="input-wrapper">
                    <i class="mdi mdi-email-outline input-icon"></i>
                    <input
                        v-model="form.email"
                        type="email"
                        placeholder="john@example.com"
                        class="custom-input"
                    />
                </div>
            </div>

            <div class="form-group">
                <label>Subject</label>
                <div class="input-wrapper">
                    <i class="mdi mdi-text-short input-icon"></i>
                    <input
                        v-model="form.subject"
                        type="text"
                        placeholder="How can we help?"
                        class="custom-input"
                    />
                </div>
            </div>

            <div class="form-group">
                <label>Message</label>
                <div class="input-wrapper textarea-wrapper">
                    <textarea
                        v-model="form.message"
                        rows="5"
                        placeholder="Tell us more about your inquiry..."
                        class="custom-input custom-textarea"
                    ></textarea>
                </div>
            </div>

            <div class="captcha-box">
                <div class="captcha-label">
                    <i class="mdi mdi-shield-check-outline mr-2"></i>
                    Security Check: <strong>{{ num1 }} + {{ num2 }} = ?</strong>
                </div>
                <input
                    v-model="form.captcha"
                    type="number"
                    class="captcha-input"
                    placeholder="?"
                />
            </div>

            <transition name="fade">
                <div v-if="formStatus === 'error'" class="error-alert">
                    <i class="mdi mdi-alert-circle mr-2"></i> {{ errorMessage }}
                </div>
            </transition>

            <button
                type="submit"
                class="btn-submit"
                :disabled="formStatus === 'sending'"
            >
                <span v-if="formStatus === 'sending'"><i class="mdi mdi-loading mdi-spin mr-2"></i> Sending...</span>
                <span v-else>SEND MESSAGE</span>
            </button>

          </form>

        </div>

        <div style="height: 60px;"></div>

      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUiStore } from '@/store/ui';
import PublicHeader from '@/components/layout/PublicHeader.vue';

const uiStore = useUiStore();
const form = ref({ name: '', email: '', subject: '', message: '', captcha: '' });
const formStatus = ref('idle');
const errorMessage = ref('');
const num1 = ref(0);
const num2 = ref(0);

const themeStyles = computed(() => {
  const theme = uiStore.currentTheme;
  const base = {
    '--c-bg-page': '#0f1115', '--c-bg-card': 'rgba(30, 30, 35, 0.6)', '--c-text-main': '#ffffff', '--c-text-muted': '#94a3b8', '--c-border': 'rgba(255,255,255,0.08)', '--c-brand': '#00C6FF', '--c-brand-rgb': '0, 198, 255', '--c-gold': '#FFD700', '--c-input-bg': 'rgba(0,0,0,0.2)', '--c-input-border': 'rgba(255,255,255,0.1)', '--c-shadow': '0 20px 50px rgba(0,0,0,0.3)', '--c-danger': '#ff5252', '--c-success': '#4caf50', 'font-family': "'Inter', sans-serif"
  };

  if (theme === 'light') {
    return { ...base, '--c-bg-page': '#f8fafc', '--c-bg-card': 'rgba(255, 255, 255, 0.9)', '--c-text-main': '#0f172a', '--c-text-muted': '#64748b', '--c-border': 'rgba(0,0,0,0.1)', '--c-brand': '#2563eb', '--c-brand-rgb': '37, 99, 235', '--c-input-bg': 'rgba(0,0,0,0.03)', '--c-input-border': 'rgba(0,0,0,0.1)', '--c-shadow': '0 10px 40px rgba(0,0,0,0.05)' };
  } else if (theme === 'hacker') {
    return { ...base, '--c-bg-page': '#000000', '--c-bg-card': '#050505', '--c-text-main': '#00ff00', '--c-text-muted': '#008f00', '--c-border': '#003300', '--c-brand': '#00ff00', '--c-brand-rgb': '0, 255, 0', '--c-gold': '#00ff00', '--c-input-bg': '#001100', '--c-input-border': '#004400', '--c-shadow': 'none', 'font-family': "'Courier New', monospace" };
  }
  return base;
});

function generateCaptcha() {
  num1.value = Math.floor(Math.random() * 10) + 1;
  num2.value = Math.floor(Math.random() * 10) + 1;
  form.value.captcha = '';
}

async function handleSubmit() {
  formStatus.value = 'sending';
  errorMessage.value = '';
  if (!form.value.name || !form.value.email || !form.value.subject || !form.value.message || !form.value.captcha) {
    errorMessage.value = 'Please fill out all fields.';
    formStatus.value = 'error';
    return;
  }
  if (parseInt(form.value.captcha, 10) !== (num1.value + num2.value)) {
    errorMessage.value = 'Incorrect security answer. Try again.';
    formStatus.value = 'error';
    generateCaptcha();
    return;
  }
  await new Promise(resolve => setTimeout(resolve, 1500));
  formStatus.value = 'success';
  form.value = { name: '', email: '', subject: '', message: '', captcha: '' };
  generateCaptcha();
}

onMounted(() => {
  uiStore.initTheme();
  generateCaptcha();
});
</script>

<style scoped>
.contact-wrapper { position: absolute; inset: 0; display: flex; flex-direction: column; background-color: var(--c-bg-page); color: var(--c-text-main); font-family: var(--font-family); overflow: hidden; transition: background-color 0.3s ease, color 0.3s ease; z-index: 10; contain: strict; }
.theme-bg { position: absolute; top: 0; left: 0; right: 0; height: 60vh; background: radial-gradient(circle at 80% 10%, rgba(0, 198, 255, 0.08) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.05) 0%, transparent 50%); pointer-events: none; z-index: 0; filter: blur(60px); transition: background 0.3s ease; }
.header-container { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
.contact-content { flex: 1; position: relative; z-index: 1; display: flex; justify-content: center; overflow-y: auto; overflow-x: hidden; padding-top: 85px; padding-bottom: 14dvh; }
.content-container { width: 100%; max-width: 600px; padding: 0 20px; margin-top: 20px; }
.glass-card { background: var(--c-bg-card); border: 1px solid var(--c-border); border-radius: 24px; padding: 24px 20px; box-shadow: var(--c-shadow); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: all 0.3s ease; }
.logo-wrapper { position: relative; width: 60px; height: 60px; margin: 0 auto; }
.core-logo { filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)); }
.page-title { font-family: 'Orbitron', sans-serif; font-size: 1.5rem; font-weight: 800; letter-spacing: 2px; color: var(--c-text-main); margin-bottom: 8px; }
.text-highlight { color: transparent; background: linear-gradient(135deg, var(--c-brand), var(--c-gold)); -webkit-background-clip: text; background-clip: text; }
.divider-line { height: 2px; width: 60px; margin: 0 auto 10px auto; background: linear-gradient(90deg, transparent, var(--c-brand), transparent); opacity: 0.6; }
.page-subtitle { font-size: 0.9rem; color: var(--c-text-muted); }
.contact-form { margin-top: 30px; }
.form-group { margin-bottom: 20px; text-align: left; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; color: var(--c-text-muted); margin-left: 4px; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--c-text-muted); font-size: 1.2rem; pointer-events: none; }
.textarea-wrapper .input-icon { top: 20px; transform: none; }
.custom-input { width: 100%; background: var(--c-input-bg); border: 1px solid var(--c-input-border); border-radius: 12px; padding: 12px 16px 12px 48px; color: var(--c-text-main); font-size: 0.95rem; outline: none; transition: all 0.2s; }
.custom-textarea { padding-left: 16px; resize: vertical; min-height: 100px; }
.custom-input:focus { border-color: var(--c-brand); box-shadow: 0 0 0 3px rgba(var(--c-brand-rgb), 0.1); }
.custom-input::placeholder { color: var(--c-text-muted); opacity: 0.5; }
.captcha-box { background: rgba(var(--c-brand), 0.05); border: 1px dashed var(--c-border); padding: 16px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.captcha-label { color: var(--c-text-main); font-size: 0.9rem; display: flex; align-items: center; }
.captcha-input { width: 80px; text-align: center; background: var(--c-bg-page); border: 1px solid var(--c-border); border-radius: 8px; padding: 8px; color: var(--c-text-main); font-weight: bold; }
.btn-submit { width: 100%; padding: 14px; border: none; border-radius: 12px; background: var(--c-brand); color: #fff; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.error-alert { background: rgba(255, 82, 82, 0.1); color: var(--c-danger); border: 1px solid var(--c-danger); padding: 12px; border-radius: 8px; font-size: 0.9rem; text-align: center; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; }
.success-box { padding: 40px 0; }
.success-icon { font-size: 4rem; color: var(--c-success); margin-bottom: 16px; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes popIn { 0%{transform:scale(0)} 100%{transform:scale(1)} }
.success-title { font-size: 1.5rem; color: var(--c-text-main); margin-bottom: 8px; }
.success-desc { color: var(--c-text-muted); margin-bottom: 24px; }
.btn-reset { background: transparent; border: 1px solid var(--c-border); color: var(--c-text-muted); padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.btn-reset:hover { color: var(--c-text-main); border-color: var(--text-main); }
</style>

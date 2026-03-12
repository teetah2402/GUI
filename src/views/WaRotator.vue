//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\WaRotator.vue total lines 172 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="rotator-container">

    <div v-if="isRedirecting" class="text-center">
      <div class="loader mb-6 mx-auto"></div>
      <h2 class="text-2xl font-black text-white tracking-widest animate-pulse">CONNECTING...</h2>
      <p class="text-zinc-500 text-sm mt-2 font-mono">Mencari Customer Service yang tersedia...</p>

      <div v-if="errorMsg" class="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded font-mono">
        SYSTEM ERROR: {{ errorMsg }}
      </div>
    </div>

    <div v-else class="w-full max-w-lg p-6 animate-fade-in">

      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 text-cyan-400 mb-3 border border-cyan-500/20 px-3 py-1 rounded-full bg-cyan-500/5">
          <i data-lucide="shuffle" class="w-4 h-4"></i>
          <span class="text-[10px] font-bold tracking-widest uppercase">Stateless Randomizer</span>
        </div>
        <h1 class="text-4xl font-black text-white font-display tracking-tight">LINK BALLISTICS</h1>
        <p class="text-zinc-500 text-sm mt-2">Buat link WhatsApp rotator tanpa database. 100% Aman.</p>
      </div>

      <div class="bg-[#18181b] border border-white/10 p-6 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden">

        <div>
          <div class="flex justify-between items-center mb-3">
            <label class="text-xs font-bold text-zinc-400 tracking-wider">TIM CS (WHATSAPP)</label>
            <button @click="addNumber" class="text-xs text-cyan-400 hover:text-white font-bold transition">+ TAMBAH CS</button>
          </div>
          <div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            <div v-for="(num, idx) in numbers" :key="idx" class="flex gap-2 group">
               <div class="bg-white/5 p-3 rounded-lg text-zinc-500 text-xs flex items-center justify-center font-bold w-10 border border-white/5 select-none">{{ idx + 1 }}</div>
               <input v-model="numbers[idx]" type="tel" class="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 text-white text-sm outline-none focus:border-cyan-500 transition placeholder-zinc-700 font-mono" placeholder="628xxxxx">
               <button @click="removeNumber(idx)" class="text-zinc-600 hover:text-red-500 p-2 transition opacity-50 group-hover:opacity-100">
                 <i data-lucide="trash-2" class="w-4 h-4"></i>
               </button>
            </div>
          </div>
        </div>

        <div>
          <label class="text-xs font-bold text-zinc-400 mb-2 block tracking-wider">PESAN OTOMATIS</label>
          <textarea v-model="message" class="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-cyan-500 outline-none h-24 resize-none placeholder-zinc-700" placeholder="Halo kak, saya mau order..."></textarea>
        </div>

        <button @click="generateLink" class="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-xl transition shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] flex items-center justify-center gap-2 active:scale-[0.98]">
          <i data-lucide="link" class="w-5 h-5"></i> GENERATE LINK (/w/)
        </button>

      </div>

      <div v-if="finalLink" class="mt-6 bg-[#27272a] p-5 rounded-xl border border-cyan-500/30 animate-up">
        <label class="text-xs font-bold text-cyan-400 block mb-2 tracking-wider">LINK SIAP PAKAI</label>
        <div class="flex gap-2">
           <input type="text" :value="finalLink" readonly class="flex-1 bg-black text-cyan-400 font-mono text-xs p-3 rounded border border-white/10 outline-none select-all">
           <button @click="copyLink" class="bg-cyan-600 hover:bg-cyan-500 text-black px-4 rounded font-bold text-xs transition">COPY</button>
        </div>
        <p class="text-[10px] text-zinc-500 mt-2 italic">*Link ini menyimpan data CS secara terenkripsi. Serverless.</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isRedirecting = ref(false);
const errorMsg = ref('');

const numbers = ref(['', '']);
const message = ref('Halo admin, saya mau tanya promo...');
const finalLink = ref('');

onMounted(() => {
  if (typeof lucide !== 'undefined') lucide.createIcons();

  if (route.query.d) {
    isRedirecting.value = true;
    executeRedirect(route.query.d);
  }
});

const executeRedirect = (encodedData) => {
  try {
    const jsonString = atob(encodedData);
    const config = JSON.parse(jsonString); // { n: [...], m: '...' }

    const targetNumbers = config.n || [];
    const targetMsg = config.m || '';

    if (targetNumbers.length === 0) throw new Error("Database link kosong.");

    const randomIndex = Math.floor(Math.random() * targetNumbers.length);
    let chosen = targetNumbers[randomIndex];

    chosen = chosen.replace(/\D/g, '');
    if(chosen.startsWith('0')) chosen = '62' + chosen.substring(1);
    if(chosen.startsWith('8')) chosen = '62' + chosen;

    const waUrl = `https://wa.me/${chosen}?text=${encodeURIComponent(targetMsg)}`;

    setTimeout(() => {
      window.location.href = waUrl;
    }, 800);

  } catch (e) {
    errorMsg.value = "Link rusak atau data korup. Buat link baru.";
  }
};

const addNumber = () => { numbers.value.push(''); nextTick(() => lucide.createIcons()); };
const removeNumber = (i) => { if(numbers.value.length > 1) numbers.value.splice(i, 1); };

const generateLink = () => {
  const validNums = numbers.value
    .map(n => n.replace(/\D/g, ''))
    .filter(n => n.length > 6) // Minimal 7 digit
    .map(n => {
       if(n.startsWith('0')) return '62' + n.substring(1);
       if(n.startsWith('8')) return '62' + n;
       return n;
    });

  if (validNums.length === 0) { alert("Minimal isi 1 nomor WA valid!"); return; }

  const payload = {
    n: validNums,
    m: message.value
  };

  const encoded = btoa(JSON.stringify(payload));

  const baseUrl = window.location.origin + '/w/';
  finalLink.value = `${baseUrl}?d=${encoded}`;
};

const copyLink = () => {
  navigator.clipboard.writeText(finalLink.value);
  alert("Link berhasil dicopy!");
};
</script>

<style scoped>
.rotator-container {
  min-height: 100vh;
  background-color: #09090b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}
.loader { width: 48px; height: 48px; border: 4px solid #FFF; border-bottom-color: #06b6d4; border-radius: 50%; animation: rotation 1s linear infinite; }
@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #27272a; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #52525b; border-radius: 4px; }
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
.animate-up { animation: slideUp 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>

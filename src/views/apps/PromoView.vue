//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\apps\PromoView.vue total lines 250 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="promo-wrapper">

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="expired" class="expired-state">
      <v-icon size="100" color="grey-darken-3" class="mb-4">mdi-timer-off</v-icon>
      <h1 class="expired-title">LINK HANGUS!</h1>
      <p class="text-grey">Promo ini sudah berakhir dan dihapus dari sistem.</p>

      <a href="https://floworkos.com/app/flash-hype" class="create-own-btn mt-6">
        ⚡ Bikin Link Diskon Sendiri
      </a>
    </div>

    <div v-else class="promo-card animate-enter">
      <div class="card-image">
        <img :src="product.image" class="product-img">
        <div class="discount-tag">HEMAT {{ discountPercent }}%</div>
        <div class="scanlines"></div>
      </div>

      <div class="card-content">
        <div class="timer-bar">
          <span class="label">SISA WAKTU:</span>
          <span class="time">{{ timeLeft }}</span>
        </div>

        <h1 class="product-title">{{ product.productName }}</h1>

        <div v-if="product.message" class="message-box">
          <v-icon start size="small" color="#FFD700" class="mr-2">mdi-information-outline</v-icon>
          <span class="italic">{{ product.message }}</span>
        </div>

        <div class="price-section">
          <div class="original-price">{{ formatRupiah(product.originalPrice) }}</div>
          <div class="promo-price">{{ formatRupiah(product.promoPrice) }}</div>
        </div>

        <div class="buttons-container">
            <template v-if="product.links && product.links.length > 0">
                <a v-for="(link, index) in product.links" :key="index" :href="link.url" target="_blank" :class="['buy-btn', getBtnColor(link.url)]">
                    <v-icon start>{{ getBtnIcon(link.url) }}</v-icon>
                    <span>{{ link.label || 'BELI SEKARANG' }}</span>
                </a>
            </template>
            <template v-else-if="product.ctaLink">
                <a :href="product.ctaLink" target="_blank" class="buy-btn bg-green-600">
                    <v-icon start>mdi-cart</v-icon>
                    <span>BELI SEKARANG</span>
                </a>
            </template>
        </div>

        <div class="secure-footer">
          <div class="security-badge mb-2">
            <v-icon size="12" color="grey" class="mr-1">mdi-shield-check</v-icon>
            <span>Official Secure Promo Page</span>
          </div>

          <a href="https://floworkos.com/app/flash-hype" target="_blank" class="footer-cta">
            ⚡ Mau Bikin Link Diskon Kayak Gini? Klik Disini!
          </a>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const loading = ref(true);
const expired = ref(false);
const product = ref({});
const timeLeft = ref("Calculating...");
let timerInterval = null;

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits:0 }).format(val);
const discountPercent = computed(() => product.value.originalPrice ? Math.round(((product.value.originalPrice - product.value.promoPrice) / product.value.originalPrice) * 100) : 0);

const getBtnIcon = (url) => {
    if(!url) return 'mdi-link';
    const u = url.toLowerCase();
    if(u.includes('wa.me') || u.includes('whatsapp')) return 'mdi-whatsapp';
    if(u.includes('shopee')) return 'mdi-shopping';
    if(u.includes('instagram')) return 'mdi-instagram';
    if(u.includes('facebook')) return 'mdi-facebook';
    if(u.includes('youtube')) return 'mdi-youtube';
    if(u.includes('tiktok')) return 'mdi-video';
    return 'mdi-arrow-right-bold-circle';
};

const getBtnColor = (url) => {
    if(!url) return 'default-btn';
    const u = url.toLowerCase();
    if(u.includes('shopee')) return 'shopee-btn';
    if(u.includes('tokopedia')) return 'tokped-btn';
    if(u.includes('instagram')) return 'ig-btn';
    if(u.includes('tiktok')) return 'tiktok-btn';
    if(u.includes('wa.me') || u.includes('whatsapp')) return 'wa-btn';
    return 'default-btn';
};

const startTimer = (endTimeData) => {
  const end = new Date(Number(endTimeData) || endTimeData).getTime();

  const tick = () => {
    const now = Date.now();
    const distance = end - now;

    if (distance < 0) {
      clearInterval(timerInterval);
      timeLeft.value = "00:00:00 (HABIS)";
      return;
    }

    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);
    const pad = (n) => n.toString().padStart(2, '0');
    timeLeft.value = `${pad(h)}j ${pad(m)}m ${pad(s)}d`;
  };

  tick();
  timerInterval = setInterval(tick, 1000);
};

onMounted(async () => {
  const id = route.params.p1 || route.params.id;
  if (!id) { expired.value = true; loading.value = false; return; }

  try {
    const res = await fetch(`/api/v1/flash-hype/get/${id}`);
    if(res.status === 404) {
      expired.value = true;
    } else {
      const json = await res.json();
      product.value = json.data;
      startTimer(json.data.endTime);
    }
  } catch(e) {
    expired.value = true;
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => clearInterval(timerInterval));
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Rajdhani:wght@500;700&display=swap');

.promo-wrapper {
  /* [FIX] Gunakan 100% dan relative agar fit di Window Canvas & Fullscreen */
  width: 100%;
  height: 100%;
  min-height: 100%;
  position: relative;
  overflow-y: auto;

  background-color: #171925;
  display: flex; justify-content: center; align-items: center;
  padding: 20px; font-family: 'Rajdhani', sans-serif;
  background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 30px 30px;
}

/* [FIX] Ubah loading jadi absolute, bukan fixed */
.loading-state {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    display: flex; justify-content: center; align-items: center;
    background: #171925;
    z-index: 10;
}

.loading-state .spinner { width: 50px; height: 50px; border: 4px solid #3a3962; border-top-color: #54d7f6; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.expired-state { text-align: center; color: #666; animation: fadeIn 0.5s; display: flex; flex-direction: column; align-items: center; }
.expired-title { font-family: 'Oswald'; font-size: 2.5rem; color: #ff003c; margin-bottom: 10px; letter-spacing: 2px; }

/* Styles untuk Tombol di Halaman Expired */
.create-own-btn {
    display: inline-block;
    margin-top: 20px;
    padding: 12px 24px;
    background: #0a0a0a;
    border: 1px solid #54d7f6;
    color: #54d7f6;
    text-decoration: none;
    font-weight: bold;
    border-radius: 8px;
    transition: 0.3s;
    text-transform: uppercase;
    font-size: 0.9rem;
}
.create-own-btn:hover { background: #54d7f6; color: #000; box-shadow: 0 0 20px rgba(84, 215, 246, 0.4); }

.promo-card { width: 100%; max-width: 420px; background: #0a0a0a; border: 1px solid #3a3962; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); position: relative; }
.card-image { height: 350px; position: relative; background: #111; }
.product-img { width: 100%; height: 100%; object-fit: cover; }
.discount-tag { position: absolute; bottom: 20px; right: 20px; background: #ff003c; color: white; padding: 6px 16px; font-weight: 800; font-family: 'Oswald'; font-size: 1.1rem; transform: skewX(-10deg); box-shadow: 0 5px 15px rgba(255,0,60,0.4); border: 1px solid rgba(255,255,255,0.2); }
.scanlines { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1)); background-size: 100% 4px; pointer-events: none; }
.card-content { padding: 25px; position: relative; }
.timer-bar { background: rgba(255, 0, 60, 0.1); border: 1px solid rgba(255, 0, 60, 0.3); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 0 15px rgba(255, 0, 60, 0.1) inset; }
.timer-bar .label { font-size: 0.75rem; letter-spacing: 2px; color: #ff5c7c; font-weight: 800; }
.timer-bar .time { font-family: 'Oswald'; font-size: 1.5rem; color: #fff; line-height: 1; letter-spacing: 1px; text-shadow: 0 0 10px rgba(255,0,60,0.5); }
.product-title { font-family: 'Oswald'; color: white; font-size: 2rem; line-height: 1.1; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
.message-box { font-size: 0.95rem; color: #e0f0ff; background: rgba(84, 215, 246, 0.1); padding: 12px; border-left: 3px solid #54d7f6; margin-bottom: 20px; border-radius: 0 8px 8px 0; }
.price-section { display: flex; align-items: baseline; gap: 10px; margin-bottom: 25px; border-bottom: 1px solid #333; padding-bottom: 16px; }
.original-price { text-decoration: line-through; color: #666; font-size: 1rem; }
.promo-price { font-family: 'Oswald'; font-size: 2.5rem; color: #ffd700; font-weight: 700; }
.buttons-container { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.buy-btn { display: flex; justify-content: center; align-items: center; gap: 10px; width: 100%; padding: 16px; color: white; font-family: 'Oswald'; font-size: 1.1rem; text-decoration: none; border-radius: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; transition: 0.2s; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
.buy-btn:hover { transform: translateY(-2px); filter: brightness(1.2); }
.wa-btn { background: #25D366; } .shopee-btn { background: #ee4d2d; } .tokped-btn { background: #03ac0e; } .ig-btn { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); } .tiktok-btn { background: #000; border: 1px solid #333; } .default-btn { background: #54d7f6; color: #000; }

/* Styles untuk Footer Baru */
.secure-footer { margin-top: 15px; text-align: center; border-top: 1px solid #222; padding-top: 15px; }
.security-badge { font-size: 0.7rem; color: #555; display: flex; justify-content: center; align-items: center; gap: 4px; }
.footer-cta {
    display: block;
    color: #54d7f6;
    font-size: 0.75rem;
    text-decoration: none;
    margin-top: 5px;
    opacity: 0.8;
    transition: 0.2s;
    font-weight: 600;
}
.footer-cta:hover { opacity: 1; text-decoration: underline; color: #fff; letter-spacing: 0.5px; }

.animate-enter { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
</style>

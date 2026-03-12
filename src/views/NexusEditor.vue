//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\NexusEditor.vue total lines 121 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <div class="h-100 bg-slate-900 text-white pa-6">
    <v-container class="max-w-md mx-auto">
      <h1 class="text-h4 orbitron-font text-cyan-accent-3 mb-6">NEXUS IDENTITY</h1>

      <v-text-field
        v-model="form.handle"
        label="Username Unik (Handle)"
        prefix="floworkos.com/u/"
        variant="outlined"
        color="cyan"
        class="mb-4 mono-font"
        :rules="[v => !!v || 'Wajib diisi', v => /^[a-z0-9_]+$/.test(v) || 'Hanya huruf kecil & angka']"
      ></v-text-field>

      <v-text-field v-model="form.displayName" label="Nama Tampilan" variant="outlined" density="compact"></v-text-field>
      <v-textarea v-model="form.bio" label="Bio Singkat" rows="2" variant="outlined" density="compact"></v-textarea>
      <v-text-field v-model="form.avatarUrl" label="URL Foto Profil" prepend-inner-icon="mdi-image" variant="outlined" density="compact"></v-text-field>

      <div class="d-flex align-center justify-space-between mt-4 mb-2">
        <h3 class="text-h6">Links</h3>
        <v-btn size="small" color="cyan" variant="tonal" @click="addLink">
          <v-icon start>mdi-plus</v-icon> Add Link
        </v-btn>
      </div>

      <div v-for="(link, index) in form.links" :key="index" class="bg-slate-800 pa-3 rounded mb-2 border-cyan-thin">
        <v-row dense>
          <v-col cols="12">
            <v-text-field v-model="link.title" placeholder="Judul (ex: Instagram)" density="compact" hide-details variant="plain"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="link.url" placeholder="https://..." density="compact" hide-details variant="plain" class="text-caption"></v-text-field>
          </v-col>
          <v-col cols="12" class="text-right">
             <v-btn size="x-small" color="red" variant="text" @click="removeLink(index)">Hapus</v-btn>
          </v-col>
        </v-row>
      </div>

      <v-btn
        block
        size="large"
        color="cyan-accent-3"
        class="mt-8 font-weight-bold text-black"
        :loading="isSaving"
        @click="publishBio"
      >
        <v-icon start>mdi-rocket-launch</v-icon>
        PUBLISH NEXUS
      </v-btn>

    </v-container>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { packNexusData } from '@/utils/nexusCrypto'; // Import otak kompresi kita
import { useRouter } from 'vue-router';

const router = useRouter();
const isSaving = ref(false);

const form = reactive({
  handle: '',
  displayName: '',
  bio: '',
  avatarUrl: '',
  theme: 'cyber-dark', // Nanti bisa dikembangin
  links: [
    { title: 'My Portfolio', url: 'https://floworkos.com' }
  ]
});

const addLink = () => form.links.push({ title: '', url: '' });
const removeLink = (idx) => form.links.splice(idx, 1);

const publishBio = async () => {
  if (!form.handle) return alert("Isi username dulu bro!");
  isSaving.value = true;

  try {
    const encryptedData = packNexusData(form, form.handle);

    const res = await fetch('/api/v1/nexus/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle: form.handle,
        encryptedData: encryptedData
      })
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal save");

    alert("Nexus Published! URL: floworkos.com/u/" + form.handle);
    router.push(`/u/${form.handle}`); // Langsung liat hasilnya

  } catch (e) {
    alert("Error: " + e.message);
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.bg-slate-900 { background-color: #0f172a; }
.bg-slate-800 { background-color: #1e293b; }
.border-cyan-thin { border: 1px solid rgba(0, 255, 255, 0.2); }
.orbitron-font { font-family: 'Orbitron', sans-serif; }
.mono-font { font-family: 'JetBrains Mono', monospace; }
</style>

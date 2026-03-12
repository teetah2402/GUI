//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\views\LegalBase.vue total lines 42 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

<template>
  <LanderHeader />
  <v-main>
    <div class="legal-page">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="8">
            <v-card class="legal-card">
              <v-card-title class="headline text-center orbitron-font">{{ title }}</v-card-title>
              <v-card-text>
                <slot></slot>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </v-main>
  <LanderFooter />
</template>

<script setup>
import LanderHeader from '@/components/LanderHeader.vue';
import LanderFooter from '@/components/LanderFooter.vue';

defineProps({
  title: String,
});
</script>

<style scoped>
.legal-page {
  /* (PERBAIKAN KUNCI) Typo 'pad' diperbaiki menjadi 'padding' */
  padding: 120px 0;
}
</style>

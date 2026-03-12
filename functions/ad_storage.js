//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\ad_storage.js total lines 19 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export const AD_CODE_SQUARE = `
<div class="flowork-ad-container" style="display:flex; justify-content:center; margin: 20px 0;">
    <ins class="adsbygoogle"
         style="display:block; width: 100%; max-width: 300px;"
         data-ad-client="ca-pub-5071671342085199"
         data-ad-slot="YOUR_AD_SLOT_ID_HERE"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>
         (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
</div>
`;

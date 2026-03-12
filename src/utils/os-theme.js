//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\utils\os-theme.js total lines 89 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export const osStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Orbitron:wght@500;700&display=swap');

  :host {
    display: block; width: 100%; height: 100%;
    font-family: 'Inter', sans-serif;
    color: var(--text-main, #fff);
    --brand: #06b6d4;
    --surface: rgba(30, 30, 30, 0.7);
    --border: rgba(255, 255, 255, 0.15);
  }

  /* RESET */
  * { box-sizing: border-box; outline: none; user-select: none; }
  body, html, .app-root { margin: 0; padding: 0; width: 100%; height: 100%; background: transparent; }

  /* --- KOMPONEN STANDAR (UI) --- */

  /* 1. CONTAINER / CARD */
  .os-card {
    background: var(--surface);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    display: flex; flex-direction: column; gap: 10px;
  }

  /* 2. AREA UPLOAD */
  .os-dropzone {
    border: 2px dashed rgba(255,255,255,0.3);
    border-radius: 24px;
    background: rgba(255,255,255,0.02);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    transition: all 0.2s; cursor: pointer;
    text-align: center;
  }
  .os-dropzone:hover {
    border-color: var(--brand);
    background: rgba(6, 182, 212, 0.1);
  }

  /* 3. INPUT SLIDER */
  input[type=range] {
    -webkit-appearance: none; width: 100%; background: transparent; cursor: pointer;
  }
  input[type=range]::-webkit-slider-runnable-track {
    width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; height: 18px; width: 18px; border-radius: 50%;
    background: var(--brand); margin-top: -6px; border: 2px solid #fff;
  }

  /* 4. TOMBOL ICON */
  .os-btn-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: rgba(255,255,255,0.05); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #ccc; transition: 0.2s;
  }
  .os-btn-icon:hover {
    background: var(--brand); color: #000; border-color: var(--brand);
  }

  /* 5. TYPOGRAPHY */
  .text-brand { color: var(--brand); }
  .text-muted { color: #888; font-size: 0.85rem; }
  .font-title { font-family: 'Orbitron', sans-serif; font-weight: 700; letter-spacing: 1px; }
  .text-sm { font-size: 0.8rem; }
  .font-mono { font-family: monospace; }

  /* UTILS SEDERHANA */
  .hidden { display: none !important; }
  .w-full { width: 100%; }
  .h-full { height: 100%; }
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .gap-2 { gap: 8px; }
`;

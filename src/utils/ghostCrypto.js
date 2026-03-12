//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\utils\ghostCrypto.js total lines 53 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import CryptoJS from 'crypto-js';
import LZString from 'lz-string';

export const generateGhostKey = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
};

export const encryptGhostData = (text, secretKey) => {
  try {
    if (!text) return null;

    const compressed = LZString.compressToUTF16(text);

    const encrypted = CryptoJS.AES.encrypt(compressed, secretKey).toString();

    return encrypted;
  } catch (e) {
    console.error("Encryption Failed:", e);
    throw new Error("Gagal mengunci data.");
  }
};

export const decryptGhostData = (encryptedText, secretKey) => {
  try {
    if (!encryptedText || !secretKey) return null;

    const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
    const decryptedCompressed = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedCompressed) throw new Error("Kunci Salah atau Data Rusak");

    const originalText = LZString.decompressFromUTF16(decryptedCompressed);

    return originalText;
  } catch (e) {
    console.error("Decryption Failed:", e);
    return null; // Return null biar UI tau kalau gagal
  }
};

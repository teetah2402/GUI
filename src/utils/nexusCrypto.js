//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\utils\nexusCrypto.js total lines 48 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import CryptoJS from 'crypto-js';
import LZString from 'lz-string';

const APP_SALT = "FLOWORK_NEXUS_2026_SECURE_SALT_X99";

export const deriveKey = (handle) => {
  return CryptoJS.SHA256(handle.toLowerCase() + APP_SALT).toString();
};

export const packNexusData = (jsonData, handle) => {
  try {
    const jsonString = JSON.stringify(jsonData);

    const compressed = LZString.compressToUTF16(jsonString);

    const key = deriveKey(handle);
    const encrypted = CryptoJS.AES.encrypt(compressed, key).toString();

    return encrypted;
  } catch (e) {
    console.error("Packing Error:", e);
    return null;
  }
};

export const unpackNexusData = (encryptedData, handle) => {
  try {
    const key = deriveKey(handle);

    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedCompressed = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedCompressed) return null;

    const originalJson = LZString.decompressFromUTF16(decryptedCompressed);

    return JSON.parse(originalJson);
  } catch (e) {
    console.error("Unpacking Error:", e);
    return null;
  }
};

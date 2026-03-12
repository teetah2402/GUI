//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\src\utils\nativeBridge.js total lines 131 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Geolocation } from '@capacitor/geolocation';

const isNative = Capacitor.isNativePlatform();

/**
 * NATIVE BRIDGE FLOWORK
 * Jembatan pintar antara Vue.js (Cloud) dan Hardware HP (Android APK)
 */
export const NativeBridge = {
  isApp: isNative,

  /**
   * 1. KAMERA (FOTO)
   * Menggunakan Capacitor Camera Plugin untuk stabilitas memory Android.
   */
  async takePhoto() {
    if (isNative) {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Prompt // Popup pilihan: Kamera atau Galeri
        });
        return image.webPath;
      } catch (error) {
        console.error("Kamera dibatalkan:", error);
        return null;
      }
    } else {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files[0];
          resolve(file ? URL.createObjectURL(file) : null);
        };
        input.click();
      });
    }
  },

  /**
   * 2. SCREEN RECORDER
   * Menggunakan arsitektur "Gembok Terbuka" (MainActivity.java).
   * Langsung memanggil navigator.mediaDevices.getDisplayMedia.
   */
  async startScreenRecord() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      return stream;
    } catch (error) {
      console.error("Screen Record Error:", error);
      alert("Izin Rekam Layar dibutuhkan. Harap izinkan popup sistem Android.");
      return null;
    }
  },

  /**
   * 3. MICROPHONE / AUDIO (PENTING BUAT AVATAR)
   * Pastikan user mengklik tombol dulu agar AudioContext tidak di-suspend oleh Android.
   */
  async startAudioStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch (error) {
      console.error("Mic Error:", error);
      alert("Gagal akses mikrofon. Cek izin di info aplikasi.");
      return null;
    }
  },

  /**
   * 4. GETAR (HAPTICS)
   * Memberikan efek getar fisik di HP user (Feedback UX Premium)
   */
  vibrate(style = 'medium') {
    if (isNative) {
      const styles = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy
      };
      Haptics.impact({ style: styles[style] || ImpactStyle.Medium });
    } else {
      if (navigator.vibrate) navigator.vibrate(10);
    }
  },

  /**
   * 5. LOKASI (GPS)
   * Mengambil koordinat presisi tinggi untuk Geo-Tactical.
   */
  async getLocation() {
    try {
      if (isNative) {
        const permission = await Geolocation.checkPermissions();
        if (permission.location !== 'granted') {
          await Geolocation.requestPermissions();
        }
        return await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      } else {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      }
    } catch (error) {
      console.error("GPS Error:", error);
      return null;
    }
  }
};

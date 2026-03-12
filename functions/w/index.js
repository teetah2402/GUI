//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\w\index.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * LINK BALLISTICS - FRIENDLY REDIRECTOR (WORKER)
 * File: functions/w/index.js
 * Logic: Server tentukan target -> Browser mainkan animasi "Mencari CS" yang ramah -> Redirect.
 */

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const data = url.searchParams.get('d');

  if (!data) {
    return Response.redirect("https://floworkos.com/", 302);
  }

  try {
    const jsonString = atob(data);
    const config = JSON.parse(jsonString);

    const numbers = config.n || [];
    const message = config.m || '';

    if (numbers.length === 0) throw new Error("No numbers");

    const randomIndex = Math.floor(Math.random() * numbers.length);
    let target = numbers[randomIndex];
    target = target.replace(/\D/g, ''); // Sanitize

    const finalUrl = `https://wa.me/${target}?text=${encodeURIComponent(message)}`;

    const targetAgentName = "CS " + (randomIndex + 1);

    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="robots" content="noindex, nofollow">
    <title>Mencari CS Terbaik...</title>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Quicksand:wght@700&display=swap" rel="stylesheet">
    <style>
        /* GAYA UMUM - RAINBOW & SUPER GUMMY */
        body {
            background: linear-gradient(135deg, #FF006E, #FEE440, #00BBF9, #3DDC84);
            background-size: 300% 300%;
            animation: rainbow-bg 8s ease infinite;
            color: #ffffff;
            font-family: 'Quicksand', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100dvh;
            margin: 0;
            padding: 20px;
            overflow: hidden;
        }
        @keyframes rainbow-bg {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* GUMMY BOARD CONTAINER */
        .gummy-board {
            background: rgba(255, 255, 255, 0.2);
            border: 4px solid rgba(255, 255, 255, 0.6);
            border-radius: 3rem;
            padding: 40px 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15), inset 0 8px 0 rgba(255,255,255,0.4);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            max-width: 420px;
            text-align: center;
        }

        /* CONTAINER ANIMASI - MOBILE FIRST */
        .connection-stage {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 30px;
            position: relative;
            padding: 10px 0;
        }

        /* IKON-IKON SVG - BUBBLE STYLE */
        .icon-box {
            width: 55px;
            height: 55px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.9);
            border: 4px solid rgba(255, 255, 255, 0.8);
            box-shadow: inset 0 4px 0 rgba(255, 255, 255, 1), 0 10px 15px rgba(0, 0, 0, 0.15);
            position: relative;
            z-index: 2;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @media (min-width: 768px) {
            .icon-box { width: 65px; height: 65px; }
        }

        .user-icon { border-color: #00BBF9; color: #00BBF9; }
        .cs-icon { color: #CBD5E1; }

        /* Status pada ikon CS (Centang/Silang) */
        .status-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: 900;
            opacity: 0;
            transform: scale(0);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.5);
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1.5);
        }
        .busy { transform: translateY(5px) scale(0.95); opacity: 0.6; }
        .busy .status-badge { background: #FF006E; opacity: 1; transform: scale(1); border: 2px solid white; }

        .success { transform: scale(1.1); background: #3DDC84; border-color: #fff; color: white; box-shadow: 0 15px 25px rgba(61, 220, 132, 0.4), inset 0 4px 0 rgba(255,255,255,0.6); }
        .success .status-badge { background: #FEE440; color: #1E1B4B; opacity: 1; transform: scale(1); border: 2px solid white; }

        /* GELEMBUNG PESAN TERBANG - GUMMY GLOSS */
        .message-bubble {
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            background: #00BBF9;
            color: white;
            padding: 8px 14px;
            border-radius: 20px;
            border: 2px solid rgba(255,255,255,0.5);
            font-size: 13px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 6px;
            z-index: 5;
            box-shadow: 0 8px 15px rgba(0, 187, 249, 0.4), inset 0 3px 0 rgba(255,255,255,0.5);
            transition: left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s;
        }

        /* TEKS STATUS DI BAWAH */
        #status-text {
            font-family: 'Fredoka', sans-serif;
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 5px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: color 0.3s;
        }
        #sub-status {
            font-size: 15px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 700;
            background: rgba(0,0,0,0.1);
            padding: 5px 15px;
            border-radius: 20px;
        }

        /* Utility Hide */
        .hidden { display: none !important; }
        @media (min-width: 768px) {
            .md\\:flex { display: flex !important; }
        }
    </style>
</head>
<body>

    <div class="gummy-board">
        <div style="font-size: 40px; margin-bottom: 10px; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.2));">🚀</div>

        <div class="connection-stage">
            <div class="icon-box user-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>

            <div class="message-bubble" id="msgBubble">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Ping!
            </div>

            <div style="display: flex; gap: 10px;">
                <div class="icon-box cs-icon" id="cs1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
                    <div class="status-badge">✕</div>
                </div>
                <div class="icon-box cs-icon hidden md:flex" id="cs2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
                    <div class="status-badge">✕</div>
                </div>
                <div class="icon-box cs-icon" id="csTarget">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
                    <div class="status-badge">✓</div>
                </div>
            </div>
        </div>

        <div id="status-text">Mencari Admin...</div>
        <div id="sub-status">Mohon tunggu sebentar</div>
    </div>

    <script>
        // LOGIC BAWAAN TIDAK ADA YANG DIUBAH SAMA SEKALI!
        const redirectUrl = "${finalUrl}";
        const agentName = "${targetAgentName}";

        const bubble = document.getElementById('msgBubble');
        const cs1 = document.getElementById('cs1');
        const cs2 = document.getElementById('cs2');
        const csTarget = document.getElementById('csTarget');
        const statusTxt = document.getElementById('status-text');
        const subStatus = document.getElementById('sub-status');

        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        async function runAnimationDrama() {
            await wait(500);

            bubble.style.left = "55%";
            await wait(600); // Tunggu bubble sampai
            cs1.classList.add('busy');
            statusTxt.innerText = "CS 1 Sedang Sibuk...";
            await wait(800); // Tahan sebentar

            if(window.innerWidth > 768) { // Cek lebar layar
                bubble.style.left = "70%";
                await wait(600);
                cs2.classList.add('busy');
                statusTxt.innerText = "CS 2 Sedang Melayani Customer Lain...";
                await wait(800);
            }

            bubble.style.left = "85%";
            await wait(600);
            csTarget.classList.add('success');
            bubble.style.backgroundColor = "#22c55e";
            bubble.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Terkirim!';

            statusTxt.innerText = agentName + " Siap Melayani!";
            statusTxt.style.color = "#FEE440"; // Ganti warna biar nyambung sama Rainbow
            subStatus.innerText = "Membuka WhatsApp...";

            await wait(1500); // Tahan 1.5 detik biar user baca pesan sukses
            window.location.replace(redirectUrl);
        }

        runAnimationDrama();

    </script>
</body>
</html>
    `;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });

  } catch (err) {
    return new Response("Link tidak valid.", { status: 400 });
  }
}
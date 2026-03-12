//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\share\[[catchall]].js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * EDGE SEO INJECTOR (WITH USER DESCRIPTION & REGISTRY LOOKUP)
 * Mencegat request /share/..., membaca state, dan menyuntikkan Meta Tags serta HTML Skeleton.
 */

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  const stateParam = url.searchParams.get('state');
  const slug = url.pathname.split('/').pop() || 'Untitled Workspace';
  const cleanTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const baseUrl = `${url.protocol}//${url.host}`;
  const defaultImage = `${baseUrl}/images/cover_default.webp`; // Static Image

  let title = `${cleanTitle} - Flowork Canvas`;
  let description = "Access this custom workspace on Flowork OS. No installation required.";
  let themeColor = "#000000";
  let combinedKeywords = ["flowork", "canvas", "workspace", "automation"];
  let htmlAppsList = ""; // Untuk HTML Skeleton

  // [NEW] Variabel untuk menampung raw HTML & JS dari aplikasi-aplikasi di dalam Canvas
  let fetchedHtml = "";
  let fetchedScript = "";

  // [NEW] Logika Baru: Ambil Registry, Gabungkan Keyword & Deskripsi
  if (stateParam) {
    try {
      // 1. Fetch Registry untuk mendapatkan data SEO asli masing-masing aplikasi
      let registryApps = [];
      try {
        const registryUrl = `${baseUrl}/store/registry.json`;
        const regRes = await context.env.ASSETS.fetch(new Request(registryUrl));
        if (regRes.ok) {
          const regData = await regRes.json();
          registryApps = regData.apps || [];
        }
      } catch(e) { console.error("Registry fetch failed in share edge", e); }

      // 2. Decode State
      const jsonString = atob(stateParam);
      const state = JSON.parse(jsonString);

      if (state.t === 'light') themeColor = "#f8fafc";

      // Jika user input custom description
      if (state.d && state.d.trim().length > 0) {
        description = state.d.trim();
      }

      // Jika user input custom keywords (misal dipisah koma)
      if (state.k && state.k.trim().length > 0) {
        const customKw = state.k.split(',').map(k => k.trim()).filter(k => k);
        combinedKeywords.push(...customKw);
      }

      const appIdsToFetch = [];

      // 3. Ekstrak data Aplikasi dari Registry
      if (state.w && Array.isArray(state.w) && state.w.length > 0) {
        const appNames = [];

        state.w.forEach(wApp => {
          const appId = wApp.id || wApp.slug;
          const regApp = registryApps.find(a => a.id === appId || a.slug === appId);

          // Pastikan kita menggunakan ID asli dari registry jika ada (buat fetch file .html)
          const finalAppId = regApp ? regApp.id : appId;

          // Kumpulkan ID unik yang akan diambil file .html nya nanti
          if (finalAppId && !appIdsToFetch.includes(finalAppId)) {
            appIdsToFetch.push(finalAppId);
          }

          if (regApp) {
            appNames.push(regApp.name);
            // Tambahkan keyword dari registry ke kombinasi keyword halaman share
            if (regApp.seo && regApp.seo.keywords) {
              combinedKeywords.push(...regApp.seo.keywords);
            }
            // Buat HTML List untuk Skeleton
            htmlAppsList += `
              <div class="app-item">
                <h3>${regApp.name}</h3>
                <p>${regApp.description}</p>
              </div>
            `;
          } else {
             appNames.push(wApp.name || appId);
             htmlAppsList += `<div><h3>${wApp.name || appId}</h3></div>`;
          }
        });

        // Jika tidak ada custom description, gunakan list aplikasi
        if (!state.d || state.d.trim().length === 0) {
           description = `Workspace containing: ${appNames.slice(0, 5).join(', ')}. Run instantly on Flowork OS Web.`;
        }
      }

      // Hapus duplikat keyword
      combinedKeywords = [...new Set(combinedKeywords)];

      // [NEW] 4. Fetch HTML part dari aplikasi yang ada di dalam Canvas (Paralel)
      try {
        const userAgent = request.headers.get('User-Agent') || '';
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

        const fetchTargets = [];

        // Membatasi fetch maks 10 app agar aman dari limit 50 subrequests Worker (10 apps * 4 file = 40 requests)
        const limitedAppIds = appIdsToFetch.slice(0, 10);

        limitedAppIds.forEach(appId => {
          fetchTargets.push(
            context.env.ASSETS.fetch(new Request(`${baseUrl}/store/${appId}/index.html`)).then(r => r.ok ? r.text() : '').then(text => ({appId, type: 'index.html', text})),
            context.env.ASSETS.fetch(new Request(`${baseUrl}/store/${appId}/partials/app.html`)).then(r => r.ok ? r.text() : '').then(text => ({appId, type: 'partials/app.html', text})),
            context.env.ASSETS.fetch(new Request(`${baseUrl}/store/${appId}/partials/lander.html`)).then(r => r.ok ? r.text() : '').then(text => ({appId, type: 'partials/lander.html', text}))
          );

          if (isMobile) {
            fetchTargets.push(
              context.env.ASSETS.fetch(new Request(`${baseUrl}/store/${appId}/logic.js`)).then(r => r.ok ? r.text() : '').then(text => ({appId, type: 'logic.js', text}))
            );
          }
        });

        const results = await Promise.all(fetchTargets);

        results.forEach(res => {
          if (res.text) {
            if (res.type === 'logic.js') {
              fetchedScript += `\n/* SEO SCRIPT: ${res.appId} - ${res.type} */\n${res.text}\n`;
            } else {
              fetchedHtml += `\n\n${res.text}`;
            }
          }
        });

        if (fetchedScript) {
           fetchedScript = `\n\n<script>\n${fetchedScript}\n</script>\n`;
        }
      } catch (e) {
        console.error("SEO Partials Fetch Error:", e);
      }

    } catch (e) {
      console.error("State parse error", e);
    }
  }

  // [MODIFIED] HTML Skeleton untuk disuntikkan beserta data fetchedHtml
  const seoArticleHtml = `
    <div id="seo-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;">
      <article>
        <header>
          <h1>${title}</h1>
          <img src="${defaultImage}" alt="${title} Cover Image" />
        </header>
        <section>
          <h2>Workspace Description</h2>
          <p>${description}</p>
        </section>
        <section>
          <h2>Included Applications & Tools</h2>
          ${htmlAppsList || '<p>Multiple productivity tools included.</p>'}
        </section>
        <section>
          <h3>Related Keywords</h3>
          <ul>
            ${combinedKeywords.map(k => `<li>${k}</li>`).join('\n            ')}
          </ul>
        </section>
        <section class="seo-app-partials">
          ${fetchedHtml}
        </section>
      </article>
    </div>
    ${fetchedScript}
  `;

  const response = await context.env.ASSETS.fetch(new URL("/", request.url));

  return new HTMLRewriter()
    .on("title", {
      element(e) { e.setInnerContent(title); },
    })
    .on('meta[name="description"]', {
      element(e) { e.setAttribute("content", description); },
    })
    .on('meta[name="keywords"]', { // [ADDED] Meta Keyword Tag
      element(e) { e.setAttribute("content", combinedKeywords.join(', ')); },
    })
    .on('meta[property="og:title"]', {
      element(e) { e.setAttribute("content", title); },
    })
    .on('meta[property="og:description"]', {
      element(e) { e.setAttribute("content", description); },
    })
    .on('meta[property="og:image"]', {
      element(e) { e.setAttribute("content", defaultImage); },
    })
    .on('meta[name="twitter:title"]', {
      element(e) { e.setAttribute("content", title); },
    })
    .on('meta[name="twitter:description"]', {
      element(e) { e.setAttribute("content", description); },
    })
    .on('meta[name="twitter:image"]', {
      element(e) { e.setAttribute("content", defaultImage); },
    })
    .on('meta[name="theme-color"]', {
      element(e) { e.setAttribute("content", themeColor); },
    })
    // [NEW] Menyuntikkan HTML mentah ke dalam <div id="app">
    .on('div#app', {
      element(e) {
        e.prepend(seoArticleHtml, { html: true });
      }
    })
    .transform(response);
}
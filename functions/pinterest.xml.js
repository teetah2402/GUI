export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const domain = `${url.protocol}//${url.hostname}`;

    try {
        const response = await fetch(`${domain}/store/registry.json`);
        const registry = await response.json();

        let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>FloworkOS Visual Gallery</title>
    <link>${domain}</link>
    <description>Koleksi Visual Tools dan Otomatisasi FloworkOS</description>`;

        if (registry.apps) {
            for (const app of registry.apps) {
                // Kita ambil data ID sebagai prioritas visual
                const data = app.podcast?.id || app.podcast?.en;
                if (data) {
                    const appUrl = `${domain}/flow/${app.id}`;
                    // Pinterest wajib gambar besar, kita pakai og_image atau cover
                    const coverFileName = app.seo?.og_image || "cover_m_id.webp";
                    const coverUrl = `${domain}${app.path}/${coverFileName}`;

                    rss += `
    <item>
      <title>${app.name} - Automation Tool</title>
      <link>${appUrl}</link>
      <guid>${appUrl}#pin</guid>
      <description><![CDATA[${app.description}]]></description>
      <content:encoded><![CDATA[<p>${app.description}</p><img src="${coverUrl}" />]]></content:encoded>
      <media:content url="${coverUrl}" medium="image" />
      <pubDate>${app.last_updated ? new Date(app.last_updated).toUTCString() : new Date().toUTCString()}</pubDate>
    </item>`;
                }
            }
        }

        rss += `</channel></rss>`;
        return new Response(rss, { headers: { "Content-Type": "text/xml;charset=UTF-8" } });
    } catch (e) { return new Response(e.message, { status: 500 }); }
}
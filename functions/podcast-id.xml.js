export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const domain = `${url.protocol}//${url.hostname}`;
    const lang = "id";

    try {
        const response = await fetch(`${domain}/store/registry.json`);
        const registry = await response.json();

        let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>FloworkOS Tutorial (Indonesia)</title>
    <link>${domain}</link>
    <language>id-ID</language>
    <itunes:author>FloworkOS Team</itunes:author>
    <description>Tutorial resmi penggunaan aplikasi dan otomatisasi workflow di FloworkOS.</description>
    <itunes:image href="${domain}/images/podcast-master-id.jpg" />
    <itunes:owner>
      <itunes:name>FloworkOS Team</itunes:name>
      <itunes:email>awenkforex@gmail.com</itunes:email>
    </itunes:owner>
    <itunes:category text="Technology" />
    <itunes:explicit>false</itunes:explicit>`;

    if (registry.apps) {
        for (const app of registry.apps) {
            const data = app.podcast?.[lang];

            // [MODIFIED] Filter tambahan: Hanya render jika app.audio bernilai "yes"
            // (Memastikan jika lupa menambahkan "audio": "yes" di registry, item tidak akan di-generate)
            if (data && app.audio === "yes") {
                // UPDATE: Link diarahkan ke rute /flow/ sesuai permintaan
                const appUrl = `${domain}/flow/${app.id}`;

                // [ZOMBIE] const coverUrl = `${domain}${app.path}/${data.image || "cover_id.webp"}`;
                // [ADD] Patenkan menggunakan cover.webp
                const coverUrl = `${domain}${app.path}/${data.image || "cover.webp"}`;

                const seoDesc = `${data.description} <br><br> 🔥 <strong>Gunakan alatnya sekarang: <a href="${appUrl}">Jalankan ${app.name} di FloworkOS.com</a></strong>`;

                rss += `
    <item>
      <title>${data.title}</title>
      <itunes:author>FloworkOS Team</itunes:author>
      <description><![CDATA[${seoDesc}]]></description>
      <content:encoded><![CDATA[${seoDesc}]]></content:encoded>
      <enclosure url="${data.audio_url}" length="5000000" type="audio/mpeg" />
      <guid isPermaLink="true">${appUrl}#id</guid>
      <pubDate>${app.last_updated ? new Date(app.last_updated).toUTCString() : new Date().toUTCString()}</pubDate>
      <itunes:image href="${coverUrl}" />
    </item>`;
            }
        }
    }
    rss += `</channel></rss>`;
    return new Response(rss, { headers: { "Content-Type": "text/xml;charset=UTF-8" } });
    } catch (e) { return new Response(e.message, { status: 500 }); }
}
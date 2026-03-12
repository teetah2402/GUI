//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\promo\[id].js total lines 81 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * FLASH HYPE - SEO INJECTOR (HTMLRewriter)
 * Agar link preview di WhatsApp/Sosmed tampil Ganteng & Sesuai Data!
 * * NOTE: Pastikan 'product.image' di database adalah URL (https://...),
 * jangan Base64. WhatsApp TIDAK BISA baca meta image format Base64.
 */

export async function onRequest(context) {
    const id = context.params.id;
    const request = context.request;

    let product = null;
    try {
        const rawData = await context.env.GHOST_VAULT.get(id);
        if (rawData) {
            product = JSON.parse(rawData);
        }
    } catch (e) {
        console.error("KV Error:", e);
    }

    const response = await context.next();

    if (!product) {
        return response;
    }

    const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    const title = `🔥 FLASH SALE: ${product.productName || 'Produk Spesial'}`;
    const priceDisplay = product.promoPrice ? formatRupiah(product.promoPrice) : 'Harga Spesial';
    const originalDisplay = product.originalPrice ? formatRupiah(product.originalPrice) : '';
    const description = `${priceDisplay}! ${originalDisplay ? '(Harga Asli: ' + originalDisplay + ')' : ''}. ${product.message || 'Buruan sikat sebelum hangus!'}`;

    let image = product.image || 'https://floworkos.com/images/flashsale.webp';
    if (image.startsWith('data:image')) {
        image = 'https://floworkos.com/images/flashsale.webp';
    }

    return new HTMLRewriter()
        .on('title', {
            element(element) {
                element.setInnerContent(title);
            }
        })
        .on('meta[name="description"]', {
            element(element) {
                element.setAttribute('content', description);
            }
        })
        .on('meta[property="og:title"]', { element(el) { el.remove(); } }) // Hapus duplikat lama
        .on('meta[property="og:description"]', { element(el) { el.remove(); } })
        .on('meta[property="og:image"]', { element(el) { el.remove(); } })
        .on('head', {
            element(element) {
                element.append(`
                    <meta property="og:type" content="website">
                    <meta property="og:site_name" content="Flowork Flash Hype">
                    <meta property="og:title" content="${title}">
                    <meta property="og:description" content="${description}">
                    <meta property="og:image" content="${image}">
                    <meta property="og:url" content="${request.url}">

                    <meta name="twitter:card" content="summary_large_image">
                    <meta name="twitter:title" content="${title}">
                    <meta name="twitter:description" content="${description}">
                    <meta name="twitter:image" content="${image}">

                    <meta property="og:image:width" content="1200">
                    <meta property="og:image:height" content="630">
                `, { html: true });
            }
        })
        .transform(response);
}

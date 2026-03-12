//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : functions/api/v1/telegram/webhook.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#######################################################################

export async function onRequestPost(context) {
    try {
        const request = context.request;
        const payload = await request.json();

        // ENGINE ENDPOINT: Tempat masuknya Webhook dari server Telegram
        console.log("[Telegram Webhook] Data masuk:", JSON.stringify(payload));

        // TODO NANTI: Di sini lo bisa meneruskan data payload ini ke sistem Socket.io
        // atau KV Storage agar Canvas Flowork OS lo mendeteksinya secara live.

        // Wajib merespon dengan status 200 agar Telegram tahu pesan sukses terkirim
        return new Response(JSON.stringify({
            status: "success",
            message: "Webhook diterima oleh Engine Flowork OS",
            data: payload
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : functions/api/v1/flow/library.js
//#######################################################################

export async function onRequestGet(context) {
    try {
        const { env } = context;
        if (!env.FLOW_SHARE_KV) {
             return new Response(JSON.stringify({ error: "FLOW_SHARE_KV namespace is not bound" }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        const dataStr = await env.FLOW_SHARE_KV.get('FLOW_LIBRARY_INDEX');

        return new Response(dataStr || "[]", {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=60"
            }
        });

    } catch (error) {
         return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const payload = await request.json();

        if (!env.FLOW_SHARE_KV) {
            return new Response(JSON.stringify({ error: "FLOW_SHARE_KV namespace is not bound" }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        if (!payload.title || !payload.shortId || !payload.desc) {
            return new Response(JSON.stringify({ error: "All fields (Title, Short ID, and Description) are required." }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        // Verify Short ID validitas
        const checkWorkflowExists = await env.FLOW_SHARE_KV.get(payload.shortId);
        if (!checkWorkflowExists) {
            return new Response(JSON.stringify({ error: "Invalid Short ID. The workflow does not exist or has expired." }), { status: 404, headers: { "Content-Type": "application/json" } });
        }

        const existingDataStr = await env.FLOW_SHARE_KV.get('FLOW_LIBRARY_INDEX');
        let libraryList = existingDataStr ? JSON.parse(existingDataStr) : [];

        const newTemplate = {
            id: 'lib_' + Date.now().toString(),
            title: payload.title,
            desc: payload.desc,
            shortId: payload.shortId,
            createdAt: new Date().toISOString()
        };

        // Oldest stays on top (first in, first shown)
        libraryList.push(newTemplate);

        await env.FLOW_SHARE_KV.put('FLOW_LIBRARY_INDEX', JSON.stringify(libraryList));

        return new Response(JSON.stringify({
            status: "success",
            template: newTemplate,
            message: "Template added to library successfully"
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}
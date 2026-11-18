import path from "path";

const cfg = () => ({
    url: process.env.ML_SERVICE_URL || "http://127.0.0.1:8001",
    token: process.env.ML_INTERNAL_TOKEN,
    timeoutMs: Number(process.env.ML_TIMEOUT_MS || 120000),
    apiUploadsRoot: path.resolve(process.env.UPLOADS_ROOT || "uploads"),

    mlUploadsRoot: process.env.ML_UPLOADS_ROOT || null,
});

export function toMlPath(absPath) {
    const { apiUploadsRoot, mlUploadsRoot } = cfg();
    if (!mlUploadsRoot) return absPath;
    const rel = path.relative(apiUploadsRoot, path.resolve(absPath));
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
        throw new Error("File is outside the uploads directory");
    }
    return path.posix.join(mlUploadsRoot, ...rel.split(path.sep));
}

async function mlFetch(route, options = {}) {
    const { url, token, timeoutMs } = cfg();
    if (!token) throw new Error("ML_INTERNAL_TOKEN is not set");

    const response = await fetch(`${url}${route}`, {
        ...options,
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
            "Content-Type": "application/json",
            "X-Internal-Token": token,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`ML service error (${response.status}): ${error}`);
    }
    return response.json();
}

export function ingestDocument(tenantId, documentId, filePath) {
    return mlFetch("/rag/ingest", {
        method: "POST",
        body: JSON.stringify({
            tenant_id: String(tenantId),
            document_id: String(documentId),
            file_path: toMlPath(filePath),
        }),
    });
}

export function queryRAG(tenantId, query, tenantSettings, conversationHistory = []) {
    return mlFetch("/rag/query", {
        method: "POST",
        body: JSON.stringify({
            tenant_id: String(tenantId),
            query,
            tenant_settings: tenantSettings,
            conversation_history: conversationHistory,
            top_k: 5,
            score_threshold: 0.4,
        }),
    });
}

export function deleteDocumentVectors(tenantId, documentId) {
    return mlFetch("/rag/document", {
        method: "DELETE",
        body: JSON.stringify({ tenant_id: String(tenantId), document_id: String(documentId) }),
    });
}

export function deleteTenantVectors(tenantId) {
    return mlFetch("/rag/tenant", {
        method: "DELETE",
        body: JSON.stringify({ tenant_id: String(tenantId) }),
    });
}
/**
 * RAG Service — Node.js HTTP client for the Python ML service.
 *
 * This module is the ONLY place in the API that communicates
 * with the ML service. All calls are fire-and-forgettable
 * (non-blocking) from the API perspective.
 *
 * Authentication: X-Internal-Token header (shared secret).
 * The ML service rejects any request without the correct token.
 *
 * Supported LLM providers on the ML side: Ollama, OpenAI.
 * Switch provider via LLM_PROVIDER env in ml/.env — zero API changes.
 */

const ML_URL = process.env.ML_SERVICE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8001";
const ML_TOKEN = process.env.ML_INTERNAL_TOKEN;
const ML_TIMEOUT_MS = 60_000; // 60 seconds

/**
 * Internal fetch wrapper for the ML service.
 * Always includes the internal auth token.
 * @param {string} path
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
async function mlFetch(path, options = {}) {
    if (!ML_TOKEN) {
        throw new Error("ML_INTERNAL_TOKEN is not set in api/.env");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

    try {
        const response = await fetch(`${ML_URL}${path}`, {
            ...options,
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                "X-Internal-Token": ML_TOKEN,
                ...(options.headers || {}),
            },
        });

        if (!response.ok) {
            const body = await response.text().catch(() => "(no body)");
            throw new Error(`ML service [${response.status}]: ${body}`);
        }

        return await response.json();
    } finally {
        clearTimeout(timer);
    }
}


// ---------------------------------------------------------------------------
// ingestDocument — trigger RAG ingestion after a document is uploaded
// ---------------------------------------------------------------------------

/**
 * Ingest a knowledge document into the tenant's vector store.
 *
 * Call this AFTER:
 *   1. The file is saved to the filesystem.
 *   2. The MongoDB TenantDocument record (kind="knowledge") is created.
 *
 * This call runs the full ingestion pipeline:
 *   extract text → chunk → embed → store in Qdrant.
 *
 * @param {string} tenantId   - MongoDB ObjectId of the tenant
 * @param {string} documentId - MongoDB ObjectId of the TenantDocument
 * @param {string} filePath   - Absolute path to the uploaded file (ML service must be able to read it)
 * @returns {Promise<{ total_chunks: number, total_tokens: number, source_file: string }>}
 */
export async function ingestDocument(tenantId, documentId, filePath) {
    return mlFetch("/rag/ingest", {
        method: "POST",
        body: JSON.stringify({
            tenant_id: tenantId,
            document_id: documentId,
            file_path: filePath,
        }),
    });
}


// ---------------------------------------------------------------------------
// queryRAG — generate an AI response for a customer support message
// ---------------------------------------------------------------------------

/**
 * Generate a RAG-powered AI response for a customer support query.
 *
 * The ML service:
 *   1. Embeds the query.
 *   2. Searches Qdrant for relevant chunks (filtered by tenant_id).
 *   3. Builds a system prompt from tenantSettings.
 *   4. Generates a response with the active LLM (Qwen3:8b, GPT-4o, etc.).
 *
 * @param {string}   tenantId          - MongoDB ObjectId of the tenant
 * @param {string}   query             - The customer's message
 * @param {Object}   tenantSettings    - Full TenantDocument (kind="settings") from MongoDB
 * @param {string}   tenantName        - Display name of the tenant organization
 * @param {Array}    conversationHistory - [{role: "user"|"assistant", content: string}]
 * @returns {Promise<{ answer: string, has_context: boolean, model: string, provider: string }>}
 */
export async function queryRAG(tenantId, query, tenantSettings, tenantName = "", conversationHistory = []) {
    return mlFetch("/rag/query", {
        method: "POST",
        body: JSON.stringify({
            tenant_id: tenantId,
            query,
            tenant_settings: {
                ...tenantSettings,
                tenantName: tenantName || "this organization",
            },
            conversation_history: conversationHistory,
            top_k: 5,
            score_threshold: 0.4,
        }),
    });
}


// ---------------------------------------------------------------------------
// deleteDocumentVectors — cleanup when a knowledge document is deleted
// ---------------------------------------------------------------------------

/**
 * Delete all Qdrant vectors for a specific document.
 *
 * Call this AFTER the TenantDocument is deleted from MongoDB.
 * Failure is non-fatal (orphaned vectors won't be returned by search).
 *
 * @param {string} tenantId   - MongoDB ObjectId of the tenant
 * @param {string} documentId - MongoDB ObjectId of the deleted document
 */
export async function deleteDocumentVectors(tenantId, documentId) {
    return mlFetch("/rag/document", {
        method: "DELETE",
        body: JSON.stringify({
            tenant_id: tenantId,
            document_id: documentId,
        }),
    });
}


// ---------------------------------------------------------------------------
// deleteTenantVectors — cleanup when an organization is deleted
// ---------------------------------------------------------------------------

/**
 * Delete ALL Qdrant vectors for a tenant.
 *
 * Call this when an organization is permanently deleted.
 * Prevents orphaned vector data persisting in Qdrant.
 *
 * @param {string} tenantId - MongoDB ObjectId of the tenant
 */
export async function deleteTenantVectors(tenantId) {
    return mlFetch("/rag/tenant", {
        method: "DELETE",
        body: JSON.stringify({ tenant_id: tenantId }),
    });
}


// ---------------------------------------------------------------------------
// checkRAGHealth — verify ML service is running (for startup / diagnostics)
// ---------------------------------------------------------------------------

/**
 * Check if the RAG ML service, LLM provider, and Qdrant are all healthy.
 *
 * @returns {Promise<{ status: string, provider: string, model: string }>}
 */
export async function checkRAGHealth() {
    return mlFetch("/rag/health", { method: "GET" });
}

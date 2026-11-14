export interface TenantSettings {
    _id?: string;
    tenantId: string;
    kind: "settings";

    profile: {
        description: string;
        category: string;
        website: string;
        contactEmail: string;
        contactPhone: string;
    };

    ai: {
        enabled: boolean;
        autoRespond: boolean;
        tone: "professional" | "friendly" | "concise";
        instructions: string;
        requireReviewForUncertain: boolean;
    };

    support: {
        timezone: string;
        businessHours: string;
        supportEmail: string;
    };

    policies: {
        termsAndConditions: string;
        refundPolicy: string;
        cancellationPolicy: string;
        returnPolicy: string;
        warrantyPolicy: string;
        additionalRules: string;
    };
}

export interface TenantDocument {
    _id: string;
    tenantId: string;
    kind: "knowledge";
    document: {
        originalName: string;
        storageKey: string;
        fileUrl: string;
        mimeType: string;
        size: number;
        processingStatus: "pending" | "processing" | "completed" | "failed";
        errorMessage: string;
    };
    createdAt: string;
    updatedAt: string;
}
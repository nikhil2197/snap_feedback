const API_BASE_URL = "/api";

export interface CriterionFeedback {
    score: number;
    what_went_well: string;
    what_could_be_improved: string;
}

export interface SubmissionResponse {
    id: string;
    playground_image_urls: string[];
    toy_image_urls: string[];
    activity_description?: string;
    playground_feedback?: Record<string, CriterionFeedback>;
    toy_feedback?: Record<string, CriterionFeedback>;
    created_at: string; // as ISO string
    updated_at: string; // as ISO string
}

export interface ImprovementSuggestionsResponse {
    id: string;
    submission_id: string;
    playground_suggestions?: Record<string, string[]>;
    toy_suggestions?: Record<string, string[]>;
    created_at: string; // as ISO string
    updated_at: string; // as ISO string
}

export async function submitDesign(
    playgroundImageBase64: string,
    toyImageBase64: string,
    activityDescription: string
): Promise<SubmissionResponse> {
    const response = await fetch(`${API_BASE_URL}/submit-design`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            playground_image_data_base64: playgroundImageBase64,
            toy_image_data_base64: toyImageBase64,
            activity_description: activityDescription,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to submit design");
    }

    return response.json();
}

export async function submitDesignMulti(
    playgroundImagesBase64: string[],
    toyImagesBase64: string[],
    activityDescription: string
): Promise<SubmissionResponse> {
    const response = await fetch(`${API_BASE_URL}/submit-design-multi`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            playground_images_data_base64: playgroundImagesBase64,
            toy_images_data_base64: toyImagesBase64,
            activity_description: activityDescription,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to submit design");
    }

    return response.json();
}

export async function getFeedback(
    submissionId: number
): Promise<SubmissionResponse> {
    const response = await fetch(`${API_BASE_URL}/feedback/${submissionId}`);
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch feedback");
    }
    
    return response.json();
}

export async function getImprovementSuggestions(
    submissionId: string
): Promise<ImprovementSuggestionsResponse> {
    const response = await fetch(`${API_BASE_URL}/improvement-suggestions/${submissionId}`);
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch improvement suggestions");
    }
    
    return response.json();
}

export async function regenerateImprovementSuggestions(
    submissionId: string
): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/improvement-suggestions/${submissionId}/regenerate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to regenerate improvement suggestions");
    }
    
    return response.json();
} 
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface CriterionFeedback {
    score: number;
    what_went_well: string;
    what_could_be_improved: string;
}

export interface SubmissionResponse {
    id: string;
    playground_image_url: string;
    toy_image_url: string;
    activity_description?: string;
    playground_feedback?: Record<string, CriterionFeedback>;
    toy_feedback?: Record<string, CriterionFeedback>;
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
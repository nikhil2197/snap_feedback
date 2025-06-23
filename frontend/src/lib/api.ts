export async function submitDesign(
    playgroundImageBase64: string,
    toyImageBase64: string,
    activityDescription: string
): Promise<{ submission_id: number }> {
    console.log("Submitting to API:", {
        playgroundImageBase64,
        toyImageBase64,
        activityDescription,
    });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simulate a response
    const response = { submission_id: Math.floor(Math.random() * 1000) };
    console.log("API response:", response);
    return response;
}

export async function getFeedback(
    submissionId: number
): Promise<{ playground_feedback: string, toy_feedback: string }> {
    console.log("Fetching feedback for submission ID:", submissionId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simulate a response
    const response = {
        playground_feedback: "This is a great playground design! The layout is very intuitive and the use of natural materials is a big plus. One suggestion would be to add more shaded areas.",
        toy_feedback: "The toy is very creative and engaging. It encourages imaginative play. However, the small parts could be a choking hazard for younger children."
    };
    console.log("API response:", response);
    return response;
} 
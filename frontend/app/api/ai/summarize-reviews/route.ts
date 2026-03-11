import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { binId, reviews } = await request.json();

    if (!reviews || reviews.length === 0) {
      return NextResponse.json(
        { error: "No reviews provided" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // Prepare the review data for the prompt
    const reviewsText = reviews
      .map(
        (review: any, index: number) =>
          `Review ${index + 1}:
- User: ${review.name_of_user}
- Rating: ${review.stars}/5 stars
- Comment: ${review.text || "No comment provided"}
- Date: ${new Date(review.createdAt).toLocaleDateString()}`
      )
      .join("\n\n");

    // Calculate average rating
    const avgRating = (
      reviews.reduce((sum: number, r: any) => sum + r.stars, 0) / reviews.length
    ).toFixed(1);

    // Create a comprehensive prompt
    const prompt = `You are an expert analyst tasked with creating a comprehensive, insightful summary of user reviews for a garbage bin (ID: ${binId}).

Here are all the reviews for this bin:

${reviewsText}

Average Rating: ${avgRating}/5 stars
Total Reviews: ${reviews.length}

Please provide a well-structured, professional AI summary that includes:

1. **Overall Assessment**: A brief overview of the general sentiment and satisfaction level
2. **Key Strengths**: What users appreciate most about this bin (if applicable)
3. **Areas of Concern**: Common complaints or issues mentioned (if applicable)
4. **Notable Patterns**: Any recurring themes in the feedback
5. **Recommendation**: A brief actionable insight or recommendation based on the reviews

Keep the summary concise (1-2 paragraphs, max 60 words), professional yet conversational, and focused on actionable insights. Use emojis sparingly for visual appeal. Format the summary as clear, readable paragraphs without markdown headers.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return NextResponse.json(
      {
        error: "Failed to generate AI summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

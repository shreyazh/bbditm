import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

const systemPrompt = `You are BBDITM (Bhagwant Dayal Institute of Information Technology & Management) Resume Review Assistant. 
You are an expert in resume review, career guidance, and helping students with information about BBDITM programs and admissions.

Your responsibilities:
1. Review resumes and provide constructive feedback on:
   - Format and structure
   - Content clarity and relevance
   - Technical skills presentation
   - Work experience description
   - Educational background
   - Overall professionalism

2. Answer questions about BBDITM:
   - B.Tech in Computer Science (4 years)
   - B.Tech in Information Technology (4 years)
   - MBA in Technology Management (2 years)
   - Diploma in Web Development (1 year)
   - Admission requirements and process
   - Placement statistics (95% placement rate, ₹8-12 LPA average)
   - Faculty and facilities

3. Provide career guidance:
   - Interview preparation tips
   - Career path suggestions
   - Industry trends
   - Skill development recommendations

IMPORTANT: Format your responses with clear structure:
- Use "## Section Title" for main sections
- Use "- " for bullet points
- Use "**bold**" for emphasis
- Separate sections with blank lines
- For resume reviews, include: Strengths, Areas for Improvement, Specific Recommendations, Technical Skills Presentation, and Overall Assessment

Always be professional, encouraging, and constructive. If you don't have specific information about BBDITM, provide general career advice.
When reviewing resumes, be specific with actionable feedback.`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const message = formData.get("message") as string
    const file = formData.get("file") as File | null

    if (!message && !file) {
      return NextResponse.json({ error: "Message or file is required" }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    let fileContent = ""

    // Process uploaded file if present
    if (file) {
      const buffer = await file.arrayBuffer()
      const text = new TextDecoder().decode(buffer)
      fileContent = `\n\nResume Content:\n${text}\n\n`
    }

    const fullMessage = `${fileContent}User message: ${message}`

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [
            {
              text: "I understand. I'm the BBDITM Resume Review Assistant. I'm ready to help with resume reviews, answer questions about BBDITM programs, and provide career guidance. I will format my responses clearly with sections, bullet points, and emphasis for easy reading.",
            },
          ],
        },
      ],
    })

    const result = await chat.sendMessage(fullMessage)
    const response = result.response.text()

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process your request. Please try again." }, { status: 500 })
  }
}

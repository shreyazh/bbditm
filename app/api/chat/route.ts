import { GoogleGenerativeAI, FileDataPart } from "@google/generative-ai"
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || "")

const systemPrompt = `You are Resume Review Assistant. 
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

    // Prepare message parts
    const parts: Array<{ text: string } | FileDataPart> = []

    // Handle file upload - use Gemini's File API for proper PDF processing
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      
      // Determine MIME type
      let mimeType = file.type
      if (!mimeType) {
        // Fallback MIME type detection based on file extension
        const fileName = file.name.toLowerCase()
        if (fileName.endsWith(".pdf")) {
          mimeType = "application/pdf"
        } else if (fileName.endsWith(".doc")) {
          mimeType = "application/msword"
        } else if (fileName.endsWith(".docx")) {
          mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        } else if (fileName.endsWith(".txt")) {
          mimeType = "text/plain"
        } else {
          mimeType = "application/octet-stream"
        }
      }

      // Upload file to Gemini File API
      // This allows Gemini to properly extract text from PDFs, DOCX, etc.
      const uploadResponse = await fileManager.uploadFile(buffer, {
        mimeType: mimeType,
        displayName: file.name,
      })

      // Wait for file processing to complete (if needed)
      // For PDFs and documents, Gemini needs to process them before they can be used
      let fileMetadata = uploadResponse.file
      const maxWaitTime = 30000 // 30 seconds max wait
      const pollInterval = 1000 // Check every second
      const startTime = Date.now()

      while (
        fileMetadata.state === FileState.PROCESSING ||
        fileMetadata.state === FileState.STATE_UNSPECIFIED
      ) {
        if (Date.now() - startTime > maxWaitTime) {
          throw new Error("File processing timeout. Please try again.")
        }

        // Wait before checking again
        await new Promise((resolve) => setTimeout(resolve, pollInterval))

        // Check file status
        fileMetadata = await fileManager.getFile(fileMetadata.name)
      }

      if (fileMetadata.state === FileState.FAILED) {
        throw new Error(
          fileMetadata.error?.message || "File processing failed. Please check the file format."
        )
      }

      // Create file data part using the uploaded file URI
      // Gemini will automatically extract and process the text content
      const fileDataPart: FileDataPart = {
        fileData: {
          mimeType: mimeType,
          fileUri: fileMetadata.uri,
        },
      }
      parts.push(fileDataPart)
    }

    // Add text message
    if (message) {
      parts.push({ text: message })
    } else if (file) {
      // If only file is provided, add a default message
      parts.push({ text: "Please review my resume and provide feedback." })
    }

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

    const result = await chat.sendMessage(parts)
    const response = result.response.text()

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process your request. Please try again." }, { status: 500 })
  }
}

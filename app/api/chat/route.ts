import { GoogleGenerativeAI, FileDataPart } from "@google/generative-ai"
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || "")

const systemPrompt = `You are a state-of-the-art Applicant Tracking System (ATS) simulator combined with the critical eye of a senior technical recruiter.

Your task is to perform a strict, critical analysis of the attached resume file against the provided job description. You must score the resume based on semantic relevance, skills, and experience—not just keyword-stuffing.

The user has attached one (1) PDF file for the resume.
The user has also provided the job description as plain text, enclosed in <job_description> tags.

**Input Data:**

<job_description>
[Your backend will insert the job_description text here]
</job_description>

**Analysis and Response:**

Perform the analysis by comparing the attached file with the job description.

You MUST return ONLY a JSON object. Do not include any other text, conversational preamble, or markdown formatting (like json). The response must be parsable JSON.

{
  "ats_score": {
    "score": <Integer (0-100)>,
    "explanation": "<String: A single, concise sentence explaining the *reason* for this score. Example: 'Score is low due to a significant mismatch in core technical skills and required years of experience.'>"
  },
  "feedback": {
    "positive": "<String: A single paragraph of critical, direct feedback on the resume's strengths as they relate *only* to the job description. Be specific.>",
    "critical": "<String: A single paragraph of critical, direct feedback on the resume's *weaknesses*. Focus on what is missing, what is unclear, or what is not relevant to the job.>"
  },
  "actionable_items": {
    "missing_keywords": [
      "<String: List of the 5-7 *most impactful* keywords, technologies, or skills from the job description that are completely missing from the resume.>"
    ],
    "tailoring_suggestions": [
      "<String: A list of 3-4 highly specific, actionable suggestions. Example: 'Re-word the 'Project X' description to explicitly state your use of 'Kubernetes', which is a core job requirement.'>",
      "<String: Example: 'Quantify your achievements in the 'Software Engineer' role; 'Increased performance' is vague, 'Increased API response time by 30%' is better.'>"
    ]
  },
  "formatting_issues": [
    "<String: A list of any *potential* formatting issues you observed in the PDF that would confuse a basic, real-world ATS. Example: 'Resume uses a two-column layout which can be parsed incorrectly.'>"
  ]
}`

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

    // Try to parse JSON response from LLM
    try {
      // Remove markdown code blocks if present
      let jsonString = response.trim()
      if (jsonString.startsWith("```json")) {
        jsonString = jsonString.replace(/^```json\s*/, "").replace(/\s*```$/, "")
      } else if (jsonString.startsWith("```")) {
        jsonString = jsonString.replace(/^```\s*/, "").replace(/\s*```$/, "")
      }

      const analysisResult = JSON.parse(jsonString)

      // Check if this is a resume analysis response with ATS score
      if (analysisResult.ats_score && typeof analysisResult.ats_score.score === "number") {
        const atsScore = analysisResult.ats_score.score
        const threshold = 40

        if (atsScore < threshold) {
          // Score is below threshold - return all feedback
          const feedbackMessage = `## ATS Score: ${atsScore}/100

**Score Explanation:**
${analysisResult.ats_score.explanation}

## Feedback

**Strengths:**
${analysisResult.feedback?.positive || "No specific strengths identified."}

**Areas for Improvement:**
${analysisResult.feedback?.critical || "No specific weaknesses identified."}

## Actionable Items

**Missing Keywords:**
${analysisResult.actionable_items?.missing_keywords?.length > 0 
  ? analysisResult.actionable_items.missing_keywords.map((kw: string) => `- ${kw}`).join("\n")
  : "No missing keywords identified."}

**Tailoring Suggestions:**
${analysisResult.actionable_items?.tailoring_suggestions?.length > 0
  ? analysisResult.actionable_items.tailoring_suggestions.map((suggestion: string) => `- ${suggestion}`).join("\n")
  : "No specific suggestions available."}

${analysisResult.formatting_issues?.length > 0 
  ? `## Formatting Issues\n${analysisResult.formatting_issues.map((issue: string) => `- ${issue}`).join("\n")}`
  : ""}`

          return NextResponse.json({ response: feedbackMessage })
        } else {
          // Score is at or above threshold - return success message
          const successMessage = `## Congratulations! Your Resume Passed the ATS Review

Your resume scored **${atsScore}/100** on our ATS analysis, which meets our threshold for moving forward.

**Score Explanation:**
${analysisResult.ats_score.explanation}

Your resume demonstrates strong alignment with the job requirements. You can proceed with the next steps in the application process.

If you'd like to further improve your resume, consider reviewing the optional feedback below, but it's not required to continue.

---

**Optional Feedback (for improvement):**

**Strengths:**
${analysisResult.feedback?.positive || "No specific feedback available."}`

          return NextResponse.json({ response: successMessage })
        }
      }
    } catch (parseError) {
      // If parsing fails, it might be a regular chat message, not resume analysis
      // Just return the response as-is
      console.log("Response is not JSON, treating as regular chat message:", parseError)
    }

    // If not a resume analysis response or parsing failed, return as-is
    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process your request. Please try again." }, { status: 500 })
  }
}

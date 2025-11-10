import { GoogleGenerativeAI, FileDataPart } from "@google/generative-ai"
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server"
import { type NextRequest, NextResponse } from "next/server"
import mammoth from "mammoth"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || "")

/**
 * Robustly extracts JSON from a response string that may contain:
 * - Markdown code blocks (```json or ```)
 * - Preamble text before JSON
 * - Trailing text after JSON
 * - Pure JSON
 */
function extractJSON(response: string): string | null {
  if (!response || typeof response !== "string") {
    return null
  }

  let jsonString = response.trim()

  // First, try to extract from markdown code blocks
  const jsonBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (jsonBlockMatch) {
    jsonString = jsonBlockMatch[1].trim()
    try {
      JSON.parse(jsonString)
      return jsonString
    } catch {
      // Continue to other methods if markdown extraction fails
    }
  }

  // Try to find JSON object by finding first { and matching closing }
  let braceCount = 0
  let startIndex = -1
  let endIndex = -1

  for (let i = 0; i < jsonString.length; i++) {
    if (jsonString[i] === "{") {
      if (startIndex === -1) {
        startIndex = i
      }
      braceCount++
    } else if (jsonString[i] === "}") {
      braceCount--
      if (braceCount === 0 && startIndex !== -1) {
        endIndex = i
        break
      }
    }
  }

  if (startIndex !== -1 && endIndex !== -1) {
    const extracted = jsonString.substring(startIndex, endIndex + 1)
    try {
      JSON.parse(extracted)
      return extracted
    } catch {
      // Continue to try parsing the whole string
    }
  }

  // Last resort: try parsing the whole string (might be pure JSON)
  try {
    JSON.parse(jsonString)
    return jsonString
  } catch {
    return null
  }
}

const systemPrompt = `You are a state-of-the-art Applicant Tracking System (ATS) simulator combined with the critical eye of a senior technical recruiter.

Your task is to perform a strict, critical analysis of the attached resume file against the provided job description. You must score the resume based on semantic relevance, skills, and experience—not just keyword-stuffing.


**Input Data:**

The user has attached one (1) PDF file for the resume.

The user will also provide the job description as plain text.

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

const skillsExtractionPrompt = `You are a skill extraction and assessment system.

Your task is to extract ALL technical and professional skills from the attached resume file. For each skill identified, you must generate a high-level, open-ended question that would help assess the candidate's proficiency and experience with that skill.

**Instructions:**
1. Extract every skill mentioned in the resume, including:
   - Programming languages
   - Frameworks and libraries
   - Tools and technologies
   - Software platforms
   - Methodologies
   - Soft skills (if relevant)
   - Domain-specific knowledge

2. For each skill, generate ONE high-level question that:
   - Is open-ended and allows for detailed response
   - Focuses on practical experience and application
   - Is relevant to how the skill would be used in a professional setting
   - Examples:
     - For "Python": "Can you describe a complex project where you used Python? What challenges did you face and how did you overcome them?"
     - For "React": "Tell me about your experience building user interfaces with React. What was the most challenging component you've created?"
     - For "AWS": "Describe your experience with AWS cloud services. What specific services have you used and for what purposes?"

3. You MUST return ONLY a JSON object. Do not include any other text, conversational preamble, or markdown formatting (like \`\`\`json). The response must be parsable JSON.

**Required JSON Structure:**
{
  "skills": {
    "<skill_name_1>": {
      "question": "<high-level question for this skill>",
      "answer": ""
    },
    "<skill_name_2>": {
      "question": "<high-level question for this skill>",
      "answer": ""
    }
  }
}

**Important:**
- Use the exact skill name as it appears in the resume or a standardized version (e.g., "JavaScript" not "JS")
- Each skill should be a unique key in the skills object
- The answer field must always be an empty string ""
- Extract ALL skills mentioned in the resume, not just the most prominent ones
- Generate thoughtful, assessment-focused questions for each skill`

const skillsAnalysisPrompt = `You are an expert resume reviewer and career counselor with deep expertise in technical recruitment and resume optimization.

Your task is to analyze the candidate's resume along with their detailed answers to skill assessment questions. You must provide comprehensive feedback on:

1. **Answer Grading**: Grade each answer based on depth, clarity, relevance, demonstration of expertise, and response time
2. **Resume Improvement Suggestions**: Suggest specific improvements to the resume based on the candidate's actual experience (revealed in answers)
3. **Skill Development Recommendations**: Identify skills that need work based on weak answers
4. **Skills Section Optimization**: Recommend adding or removing specific skills from the resume based on the analysis

**Input Data:**
- Resume file (attached)
- Skills with questions, answers, and response times (provided in JSON format)

**Analysis Requirements:**

1. **Answer Grading (for each skill):**
   - Grade each answer on a scale of 1-10
   - Provide specific feedback on what was good and what was lacking
   - Identify if the answer demonstrates strong expertise or reveals gaps
   - **Response Time Analysis**: Consider the response time (timeTaken in milliseconds) when evaluating answers:
     * Very quick responses (< 10 seconds) may indicate either strong familiarity or lack of depth/thoughtfulness
     * Moderate responses (10-60 seconds) typically show thoughtful consideration and reflection
     * Longer responses (> 60 seconds) may indicate either deep thought, uncertainty, or difficulty recalling information
     * Use response time as ONE factor in your assessment, but prioritize answer quality and depth
     * Consider response time in context: a quick but detailed answer shows strong expertise, while a long but vague answer may indicate uncertainty
     * Note any patterns: consistently quick responses might indicate confidence, while consistently slow responses might indicate knowledge gaps

2. **Resume Improvement Suggestions:**
   - Compare the resume content with the candidate's answers
   - Identify discrepancies (e.g., resume says "expert" but answer shows limited experience)
   - Suggest specific sections to improve with concrete examples
   - Recommend quantifiable achievements to add
   - Suggest better wording or formatting

3. **Skill Development Recommendations:**
   - Identify skills where answers were weak or incomplete
   - Suggest specific areas to work on for each skill
   - Recommend learning resources or projects
   - Prioritize which skills are most critical to improve

4. **Skills Section Optimization:**
   - Recommend skills to ADD (based on answers showing expertise not mentioned in resume)
   - Recommend skills to REMOVE (based on weak answers or irrelevance)
   - Suggest reordering or categorizing skills
   - Identify missing skills that should be added based on the candidate's experience

**Response Format:**

You MUST return ONLY a JSON object. Do not include any other text, conversational preamble, or markdown formatting (like \`\`\`json). The response must be parsable JSON.

{
  "answer_grades": {
    "<skill_name>": {
      "grade": <Integer 1-10>,
      "feedback": "<String: Detailed feedback on the answer, highlighting strengths and weaknesses. Include observations about response time if relevant (e.g., 'Quick response suggests strong familiarity' or 'Longer response time may indicate uncertainty').>",
      "strengths": ["<String: List of strengths in the answer>"],
      "weaknesses": ["<String: List of weaknesses or areas for improvement>"],
      "response_time_analysis": "<String: Brief analysis of the response time in context. Note if the time taken is appropriate for the complexity of the question and answer quality.>"
    }
  },
  "resume_improvements": {
    "sections_to_improve": [
      {
        "section": "<String: Section name (e.g., 'Experience', 'Skills', 'Projects')>",
        "suggestion": "<String: Specific improvement suggestion>",
        "priority": "<String: 'high', 'medium', or 'low'>",
        "example": "<String: Example of how to improve it>"
      }
    ],
    "achievements_to_add": [
      "<String: Specific quantifiable achievement suggestion>"
    ],
    "wording_suggestions": [
      {
        "current": "<String: Current wording from resume>",
        "improved": "<String: Improved wording>",
        "reason": "<String: Why this is better>"
      }
    ]
  },
  "skill_development": {
    "skills_to_work_on": [
      {
        "skill": "<String: Skill name>",
        "priority": "<String: 'high', 'medium', or 'low'>",
        "areas_to_improve": ["<String: Specific areas to work on>"],
        "recommendations": "<String: Specific recommendations for improvement>",
        "learning_resources": ["<String: Suggested learning resources or projects>"]
      }
    ]
  },
  "skills_section_optimization": {
    "skills_to_add": [
      {
        "skill": "<String: Skill name to add>",
        "reason": "<String: Why this skill should be added>",
        "category": "<String: Category (e.g., 'Programming Languages', 'Frameworks', 'Tools')>"
      }
    ],
    "skills_to_remove": [
      {
        "skill": "<String: Skill name to remove>",
        "reason": "<String: Why this skill should be removed>"
      }
    ],
    "skills_to_reorder": [
      {
        "skill": "<String: Skill name>",
        "new_position": "<String: Suggested new position or category>",
        "reason": "<String: Why this reordering is recommended>"
      }
    ]
  },
  "overall_summary": "<String: A comprehensive summary of the analysis with key takeaways and actionable next steps>"
}`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const message = formData.get("message") as string
    const file = formData.get("file") as File | null
    const skillAnswer = formData.get("skillAnswer") as string | null // Single answer: {skillName: "Python", answer: "..."}
    const skillsAnswers = formData.get("skillsAnswers") as string | null // Batch answers: {skill1: "answer1", skill2: "answer2"}
    const existingSkills = formData.get("skills") as string | null
    const fileUri = formData.get("fileUri") as string | null // Resume file URI for analysis
    const fileMimeType = formData.get("fileMimeType") as string | null // Resume file MIME type for analysis
    const action = formData.get("action") as string | null // "submit_skill_answer", "get_next_question", or "analyze_skills"

    // Handle skill answer submission (iterative Q&A)
    if (action === "submit_skill_answer" && existingSkills) {
      try {
        const skills = JSON.parse(existingSkills)

        if (skills && typeof skills === "object") {
          // Handle single answer
          if (skillAnswer) {
            const answerData = JSON.parse(skillAnswer)
            const { skillName, answer, timeTaken } = answerData

            if (skills[skillName]) {
              skills[skillName].answer = answer
              if (timeTaken !== undefined) {
                skills[skillName].timeTaken = timeTaken
              }
              const timeStr = timeTaken !== undefined ? ` (Time: ${(timeTaken / 1000).toFixed(2)}s)` : ""
              console.log(`\n[${skillName}] Answer stored: ${answer.substring(0, 50)}...${timeStr}`)
            }
          }
          // Handle batch answers
          else if (skillsAnswers) {
            const answers = JSON.parse(skillsAnswers)
            Object.keys(answers).forEach((skillName) => {
              if (skills[skillName] && answers[skillName]) {
                skills[skillName].answer = answers[skillName]
                console.log(`[${skillName}] Answer stored: ${answers[skillName].substring(0, 50)}...`)
              }
            })
          }

          // Check if all questions are answered
          const allAnswered = Object.values(skills).every(
            (skill: any) => skill.answer && skill.answer.trim() !== ""
          )

          // Get unanswered questions
          const unansweredSkills = Object.entries(skills)
            .filter(([_, skill]: [string, any]) => !skill.answer || skill.answer.trim() === "")
            .map(([name, skill]: [string, any]) => ({ name, question: skill.question }))

          // Log current progress
          const answeredCount = Object.values(skills).filter(
            (skill: any) => skill.answer && skill.answer.trim() !== ""
          ).length
          const totalCount = Object.keys(skills).length
          console.log(`\nProgress: ${answeredCount}/${totalCount} questions answered`)

          // Log the final skills object when all answers are received
          if (allAnswered) {
            console.log("\n" + "=".repeat(60))
            console.log("=== FINAL SKILLS OBJECT WITH ALL ANSWERS ===")
            console.log("=".repeat(60))
            console.log(JSON.stringify({ skills }, null, 2))
            console.log("=".repeat(60) + "\n")

            return NextResponse.json({
              response: "## Thank You! 🎉\n\nAll skill questions have been answered. Your responses have been saved and will be used for further analysis.",
              skills: skills,
              allAnswered: true,
              unansweredCount: 0,
              nextQuestion: null,
            })
          } else {
            // Log current state for debugging
            console.log(`Remaining questions: ${unansweredSkills.length}`)
            console.log("Current skills state:")
            Object.entries(skills).forEach(([name, skill]: [string, any]) => {
              const status = skill.answer && skill.answer.trim() !== "" ? "✓" : "✗"
              const timeInfo = skill.timeTaken !== undefined ? ` (Time: ${(skill.timeTaken / 1000).toFixed(2)}s)` : ""
              console.log(`  ${status} ${name}: ${skill.answer ? "Answered" : "Pending"}${timeInfo}`)
            })

            // Automatically return the next question
            const nextQuestion = unansweredSkills[0]
            const nextAnsweredCount = answeredCount + 1

            return NextResponse.json({
              response: `Thank you for your answer!\n\n**Question ${nextAnsweredCount} of ${totalCount}:**\n\n**${nextQuestion.name}**\n${nextQuestion.question}\n\nPlease provide your answer:`,
              skills: skills,
              allAnswered: false,
              unansweredCount: unansweredSkills.length,
              nextQuestion: nextQuestion,
              progress: { answered: answeredCount, total: totalCount },
            })
          }
        }
      } catch (parseError) {
        console.error("Error parsing skills/answers:", parseError)
        return NextResponse.json({ error: "Invalid skills or answer format" }, { status: 400 })
      }
    }

    // Handle getting the next unanswered question
    if (action === "get_next_question" && existingSkills) {
      try {
        const skills = JSON.parse(existingSkills)
        const unansweredSkills = Object.entries(skills)
          .filter(([_, skill]: [string, any]) => !skill.answer || skill.answer.trim() === "")
          .map(([name, skill]: [string, any]) => ({ name, question: skill.question }))

        if (unansweredSkills.length === 0) {
          return NextResponse.json({
            response: "All questions have been answered!",
            skills: skills,
            allAnswered: true,
            nextQuestion: null,
          })
        }

        const nextQuestion = unansweredSkills[0]
        const answeredCount = Object.values(skills).filter(
          (skill: any) => skill.answer && skill.answer.trim() !== ""
        ).length
        const totalCount = Object.keys(skills).length

        return NextResponse.json({
          response: `**Question ${answeredCount + 1} of ${totalCount}:**\n\n**${nextQuestion.name}**\n${nextQuestion.question}\n\nPlease provide your answer:`,
          skills: skills,
          nextQuestion: nextQuestion,
          allAnswered: false,
          progress: { answered: answeredCount, total: totalCount },
        })
      } catch (parseError) {
        console.error("Error parsing skills:", parseError)
        return NextResponse.json({ error: "Invalid skills format" }, { status: 400 })
      }
    }

    // Handle skills analysis request
    if (action === "analyze_skills" && existingSkills && fileUri) {
      try {
        const skills = JSON.parse(existingSkills)

        // Verify all questions are answered
        const allAnswered = Object.values(skills).every(
          (skill: any) => skill.answer && skill.answer.trim() !== ""
        )

        if (!allAnswered) {
          return NextResponse.json(
            { error: "All skill questions must be answered before analysis" },
            { status: 400 }
          )
        }

        console.log("\n=== Starting Skills Analysis ===")
        console.log(`File URI: ${fileUri}`)
        console.log(`Skills to analyze: ${Object.keys(skills).length}`)
        // Create analysis model - using Gemini 2.5 Pro for comprehensive analysis
        const analysisModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })
        const analysisChat = analysisModel.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: skillsAnalysisPrompt }],
            },
            {
              role: "model",
              parts: [
                {
                  text: "I understand. I will analyze the resume and skill answers to provide comprehensive feedback on answer grades, resume improvements, skill development recommendations, and skills section optimization. I will return only valid JSON.",
                },
              ],
            },
          ],
        })

        // Prepare the skills data for analysis
        const skillsDataForAnalysis = JSON.stringify(skills, null, 2)
        const analysisPrompt = `Please analyze the following resume and skill assessment answers.

**Skills with Questions, Answers, and Response Times:**
${skillsDataForAnalysis}

**Important Notes:**
- Each skill object includes a "timeTaken" field (in milliseconds) indicating how long the candidate took to answer
- Response time is measured from when the question was displayed to when the answer was submitted
- Consider response time as one factor in your assessment, but prioritize answer quality and depth

**Instructions:**
1. Review the attached resume file
2. Analyze each answer provided for the skill questions
3. Grade each answer (1-10 scale) considering both content quality and response time patterns
4. Compare resume content with answers to identify discrepancies
5. Provide specific, actionable recommendations
6. Include response time analysis in your feedback when it provides meaningful insights

Return your analysis in the exact JSON format specified in the system prompt.`

        // Create file data part using the file URI
        const fileDataPart: FileDataPart = {
          fileData: {
            mimeType: fileMimeType || "text/plain", // Use provided MIME type or default to text/plain
            fileUri: fileUri,
          },
        }

        // Send analysis request
        const analysisParts: Array<{ text: string } | FileDataPart> = [
          fileDataPart,
          { text: analysisPrompt },
        ]

        const analysisResult = await analysisChat.sendMessage(analysisParts)
        const analysisResponse = analysisResult.response.text()

        // Parse analysis JSON response using robust extraction
        const analysisJsonString = extractJSON(analysisResponse)
        if (!analysisJsonString) {
          throw new Error("Failed to extract JSON from analysis response")
        }

        const analysisData = JSON.parse(analysisJsonString)
        console.log("\n=== Analysis Complete ===")
        console.log(JSON.stringify(analysisData, null, 2))

        // Format the analysis response for user display
        let formattedResponse = `## 📊 Skills Analysis Complete\n\n`

        // Answer Grades Section
        if (analysisData.answer_grades) {
          formattedResponse += `### Answer Grades\n\n`
          Object.entries(analysisData.answer_grades).forEach(([skillName, gradeData]: [string, any]) => {
            // Get timeTaken from skills data if available
            const skillData = skills[skillName]
            const timeTaken = skillData?.timeTaken
            const timeStr = timeTaken !== undefined ? ` (Response time: ${(timeTaken / 1000).toFixed(2)}s)` : ""
            
            formattedResponse += `**${skillName}** - Grade: ${gradeData.grade}/10${timeStr}\n\n`
            formattedResponse += `*Feedback:* ${gradeData.feedback}\n\n`
            if (gradeData.response_time_analysis) {
              formattedResponse += `*Response Time Analysis:* ${gradeData.response_time_analysis}\n\n`
            }
            if (gradeData.strengths && gradeData.strengths.length > 0) {
              formattedResponse += `*Strengths:*\n${gradeData.strengths.map((s: string) => `- ${s}`).join("\n")}\n\n`
            }
            if (gradeData.weaknesses && gradeData.weaknesses.length > 0) {
              formattedResponse += `*Areas for Improvement:*\n${gradeData.weaknesses.map((w: string) => `- ${w}`).join("\n")}\n\n`
            }
            formattedResponse += `---\n\n`
          })
        }

        // Resume Improvements Section
        if (analysisData.resume_improvements) {
          formattedResponse += `### 📝 Resume Improvement Suggestions\n\n`

          if (analysisData.resume_improvements.sections_to_improve?.length > 0) {
            formattedResponse += `**Sections to Improve:**\n\n`
            analysisData.resume_improvements.sections_to_improve.forEach((item: any) => {
              formattedResponse += `**${item.section}** (Priority: ${item.priority})\n`
              formattedResponse += `${item.suggestion}\n`
              if (item.example) {
                formattedResponse += `*Example:* ${item.example}\n`
              }
              formattedResponse += `\n`
            })
          }

          if (analysisData.resume_improvements.achievements_to_add?.length > 0) {
            formattedResponse += `**Achievements to Add:**\n`
            analysisData.resume_improvements.achievements_to_add.forEach((achievement: string) => {
              formattedResponse += `- ${achievement}\n`
            })
            formattedResponse += `\n`
          }

          if (analysisData.resume_improvements.wording_suggestions?.length > 0) {
            formattedResponse += `**Wording Suggestions:**\n\n`
            analysisData.resume_improvements.wording_suggestions.forEach((suggestion: any) => {
              formattedResponse += `*Current:* ${suggestion.current}\n`
              formattedResponse += `*Improved:* ${suggestion.improved}\n`
              formattedResponse += `*Reason:* ${suggestion.reason}\n\n`
            })
          }
        }

        // Skill Development Section
        if (analysisData.skill_development?.skills_to_work_on?.length > 0) {
          formattedResponse += `### 🎯 Skill Development Recommendations\n\n`
          analysisData.skill_development.skills_to_work_on.forEach((item: any) => {
            formattedResponse += `**${item.skill}** (Priority: ${item.priority})\n\n`
            formattedResponse += `*Areas to Improve:*\n${item.areas_to_improve.map((a: string) => `- ${a}`).join("\n")}\n\n`
            formattedResponse += `*Recommendations:* ${item.recommendations}\n\n`
            if (item.learning_resources && item.learning_resources.length > 0) {
              formattedResponse += `*Learning Resources:*\n${item.learning_resources.map((r: string) => `- ${r}`).join("\n")}\n\n`
            }
            formattedResponse += `---\n\n`
          })
        }

        // Skills Section Optimization
        if (analysisData.skills_section_optimization) {
          formattedResponse += `### 🔧 Skills Section Optimization\n\n`

          if (analysisData.skills_section_optimization.skills_to_add?.length > 0) {
            formattedResponse += `**Skills to Add:**\n\n`
            analysisData.skills_section_optimization.skills_to_add.forEach((item: any) => {
              formattedResponse += `- **${item.skill}** (${item.category})\n`
              formattedResponse += `  *Reason:* ${item.reason}\n\n`
            })
          }

          if (analysisData.skills_section_optimization.skills_to_remove?.length > 0) {
            formattedResponse += `**Skills to Remove:**\n\n`
            analysisData.skills_section_optimization.skills_to_remove.forEach((item: any) => {
              formattedResponse += `- **${item.skill}**\n`
              formattedResponse += `  *Reason:* ${item.reason}\n\n`
            })
          }

          if (analysisData.skills_section_optimization.skills_to_reorder?.length > 0) {
            formattedResponse += `**Skills to Reorder:**\n\n`
            analysisData.skills_section_optimization.skills_to_reorder.forEach((item: any) => {
              formattedResponse += `- **${item.skill}** → ${item.new_position}\n`
              formattedResponse += `  *Reason:* ${item.reason}\n\n`
            })
          }
        }

        // Overall Summary
        if (analysisData.overall_summary) {
          formattedResponse += `### 📋 Overall Summary\n\n${analysisData.overall_summary}\n`
        }

        return NextResponse.json({
          response: formattedResponse,
          analysis: analysisData,
          skills: skills,
        })
      } catch (analysisError) {
        console.error("Error analyzing skills:", analysisError)
        return NextResponse.json(
          { error: "Failed to analyze skills. Please try again." },
          { status: 500 }
        )
      }
    }

    if (!message && !file) {
      return NextResponse.json({ error: "Message or file is required" }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Prepare message parts
    const parts: Array<{ text: string } | FileDataPart> = []
    let fileDataPart: FileDataPart | null = null
    let fileMetadata: any = null

    // Handle file upload
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileName = file.name.toLowerCase()
      
      // Handle .docx files: Convert to text using mammoth since Gemini doesn't support .docx directly
      if (fileName.endsWith(".docx")) {
        try {
          // Convert .docx to text using mammoth
          const result = await mammoth.extractRawText({ buffer: buffer })
          const docxText = result.value
          
          // Create a text buffer from the converted content
          const textBuffer = Buffer.from(docxText, "utf-8")
          
          // Upload as text/plain instead of .docx
          const uploadResponse = await fileManager.uploadFile(textBuffer, {
            mimeType: "text/plain",
            displayName: file.name.replace(/\.docx$/i, ".txt"),
          })

          // Wait for file processing to complete
          fileMetadata = uploadResponse.file
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

            await new Promise((resolve) => setTimeout(resolve, pollInterval))
            fileMetadata = await fileManager.getFile(fileMetadata.name)
          }

          if (fileMetadata.state === FileState.FAILED) {
            throw new Error(
              fileMetadata.error?.message || "File processing failed. Please check the file format."
            )
          }

          // Create file data part using the uploaded text file URI
          fileDataPart = {
            fileData: {
              mimeType: "text/plain",
              fileUri: fileMetadata.uri,
            },
          }
          parts.push(fileDataPart)
        } catch (docxError: any) {
          console.error("Error converting .docx file:", docxError)
          throw new Error(
            `Failed to process .docx file: ${docxError.message || "Invalid file format"}`
          )
        }
      } else {
        // Handle other file types (PDF, DOC, TXT) - use Gemini's File API
        let mimeType = file.type
        
        // Determine MIME type based on file extension
        if (!mimeType || mimeType === "" || mimeType === "application/octet-stream") {
          if (fileName.endsWith(".pdf")) {
            mimeType = "application/pdf"
          } else if (fileName.endsWith(".doc")) {
            mimeType = "application/msword"
          } else if (fileName.endsWith(".txt")) {
            mimeType = "text/plain"
          } else {
            mimeType = "application/octet-stream"
          }
        } else {
          // Validate MIME type matches extension
          if (fileName.endsWith(".pdf") && !mimeType.includes("pdf")) {
            mimeType = "application/pdf"
          } else if (fileName.endsWith(".doc") && !mimeType.includes("msword") && !mimeType.includes("word")) {
            mimeType = "application/msword"
          } else if (fileName.endsWith(".txt") && !mimeType.includes("text")) {
            mimeType = "text/plain"
          }
        }

        // Upload file to Gemini File API
        const uploadResponse = await fileManager.uploadFile(buffer, {
          mimeType: mimeType,
          displayName: file.name,
        })

        // Wait for file processing to complete
        fileMetadata = uploadResponse.file
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

          await new Promise((resolve) => setTimeout(resolve, pollInterval))
          fileMetadata = await fileManager.getFile(fileMetadata.name)
        }

        if (fileMetadata.state === FileState.FAILED) {
          throw new Error(
            fileMetadata.error?.message || "File processing failed. Please check the file format."
          )
        }

        // Create file data part using the uploaded file URI
        fileDataPart = {
          fileData: {
            mimeType: mimeType,
            fileUri: fileMetadata.uri,
          },
        }
        parts.push(fileDataPart)
      }
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

    // Try to parse JSON response from LLM using robust extraction
    try {
      const jsonString = extractJSON(response)
      if (!jsonString) {
        throw new Error("No JSON found in response")
      }

      const analysisResult = JSON.parse(jsonString)

      // Check if this is a resume analysis response with ATS score
      if (analysisResult.ats_score && typeof analysisResult.ats_score.score === "number") {
        const atsScore = analysisResult.ats_score.score
        const threshold = 50

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
          // Score is at or above threshold - extract skills from resume
          let skillsData = null

          if (fileDataPart && fileMetadata) {
            try {
              // Create a new chat session for skills extraction
              const skillsModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
              const skillsChat = skillsModel.startChat({
                history: [
                  {
                    role: "user",
                    parts: [{ text: skillsExtractionPrompt }],
                  },
                  {
                    role: "model",
                    parts: [
                      {
                        text: "I understand. I will extract all skills from the resume and generate high-level assessment questions for each skill. I will return only valid JSON.",
                      },
                    ],
                  },
                ],
              })

              // Use the already uploaded file to extract skills
              const skillsParts: Array<{ text: string } | FileDataPart> = [fileDataPart]
              const skillsResult = await skillsChat.sendMessage(skillsParts)
              const skillsResponse = skillsResult.response.text()

              // Parse skills JSON response using robust extraction
              const skillsJsonString = extractJSON(skillsResponse)
              if (!skillsJsonString) {
                throw new Error("Failed to extract JSON from skills response")
              }

              skillsData = JSON.parse(skillsJsonString)
              console.log("Skills data extracted:", JSON.stringify(skillsData, null, 2))

              // Validate skills structure
              if (!skillsData.skills || typeof skillsData.skills !== "object") {
                console.error("Invalid skills structure returned from API")
                skillsData = null
              } else {
                // Log extracted skills with questions (answers are empty)
                const skills = skillsData.skills
                const skillNames = Object.keys(skills)
                console.log(`\n=== Extracted ${skillNames.length} skills with questions ===`)
                skillNames.forEach((skillName) => {
                  console.log(`\n[${skillName}]`)
                  console.log(`Question: ${skills[skillName].question}`)
                  console.log(`Answer: ${skills[skillName].answer || "(empty - waiting for user input)"}`)
                })
                console.log("\n=== Skills ready for user Q&A ===\n")
              }
            } catch (skillsError) {
              console.error("Error extracting skills:", skillsError)
              // Continue without skills data if extraction fails
              skillsData = null
            }
          }

          // Score is at or above threshold - return success message
          let successMessage = `## Congratulations! Your Resume Passed the ATS Review

Your resume scored **${atsScore}/100** on our ATS analysis, which meets our threshold for moving forward.

**Score Explanation:**
${analysisResult.ats_score.explanation}

Your resume demonstrates strong alignment with the job requirements. You can proceed with the next steps in the application process.

If you'd like to further improve your resume, consider reviewing the optional feedback below, but it's not required to continue.

---

**Optional Feedback (for improvement):**

**Strengths:**
${analysisResult.feedback?.positive || "No specific feedback available."}`

          // Add skills questions section if skills were extracted
          if (skillsData?.skills) {
            const skillCount = Object.keys(skillsData.skills).length
            successMessage += `\n\n---

## Skill Assessment

We've identified **${skillCount} skill(s)** in your resume. I'll now ask you a few questions about each skill to better understand your experience.

Let's get started with the first question!`
          }

          // Return response with skills data and file URI if available
          return NextResponse.json({
            response: successMessage,
            skills: skillsData?.skills || null,
            hasSkills: !!skillsData?.skills,
            skillsCount: skillsData?.skills ? Object.keys(skillsData.skills).length : 0,
            fileUri: fileMetadata?.uri || null, // Include file URI for later analysis
            fileMimeType: fileDataPart?.fileData?.mimeType || "text/plain", // Include MIME type for later analysis
          })
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

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with 50mb limit to handle pdf uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Lazy initialization of Gemini
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in the environment secrets. Please configure it in your Secrets settings.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Resume Analyzer backend is helper and running." });
  });

  // Analyze resume endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { resumeBase64, mimeType, jobDescription, targetRole } = req.body;

      if (!resumeBase64) {
        res.status(400).json({ error: "Missing resume file content." });
        return;
      }

      const ai = getGeminiClient();

      const pdfPart = {
        inlineData: {
          mimeType: mimeType || "application/pdf",
          data: resumeBase64,
        },
      };

      const targetContext = jobDescription 
        ? `Target Job Description:\n${jobDescription}` 
        : (targetRole ? `Target Role Preset: ${targetRole}` : "General industry expectations for a tech/professional role.");

      const prompt = `You are an expert Executive Resume Reviewer, ATS (Applicant Tracking System) Specialist, and Career Coach.
Analyze the attached resume and evaluate it against the target role/context:
${targetContext}

Provide an accurate, thorough extraction of skills, strengths, matched credentials, and actionable recommendations.
If a job description is provided, compute a meaningful matching score and extract the exact missing skills required by the context but omitted or weak in the resume.

Be constructive, evidence-based, and highly professional.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          candidateName: { type: Type.STRING, description: "Extracted name of the candidate, default to 'Unknown Candidate' if not found." },
          candidateTitle: { type: Type.STRING, description: "Extracted professional title or headline (e.g. 'Senior Front-End Engineer'), default to 'Professional' if not found." },
          contactInfo: {
            type: Type.OBJECT,
            properties: {
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              location: { type: Type.STRING },
              linkedin: { type: Type.STRING },
              github: { type: Type.STRING },
              website: { type: Type.STRING },
            },
          },
          summary: { type: Type.STRING, description: "A brief 2-3 sentence overview card or elevator pitch summarizing the candidate's professional identity and core value proposition." },
          skills: {
            type: Type.OBJECT,
            properties: {
              technical: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of technical skills, programming languages, technologies, frameworks, or tools explicitly mentioned or strongly demonstrated."
              },
              soft: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of soft skills, methodologies, communication traits or leadership capabilities demonstrated."
              }
            },
            required: ["technical", "soft"]
          },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                company: { type: Type.STRING },
                duration: { type: Type.STRING },
                highlights: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
              },
              required: ["role", "company"]
            },
            description: "Extracted professional experiences with key achievement highlights."
          },
          strengths: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                area: { type: Type.STRING, description: "The strength area headline (e.g., 'Cloud Infrastructure Scalability')" },
                explanation: { type: Type.STRING, description: "Detailed reasons why this is a strength based on their resume highlights." },
                example: { type: Type.STRING, description: "A specific proof, metric, project or certification cited from the resume (e.g., 'Led AWS migration saving 20% cost')" }
              },
              required: ["area", "explanation"]
            },
            description: "A list of developer/professional strengths found in the resume."
          },
          missingSkills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING, description: "Name of missing technical tool, skill, or credential (e.g., 'Kubernetes', 'CI/CD Pipelines')" },
                importance: { type: Type.STRING, description: "Value must be one of: 'Critical', 'Highly Preferred', 'Optional'" },
                context: { type: Type.STRING, description: "Short explanation of why this skill matters for the target job." }
              },
              required: ["skill", "importance", "context"]
            },
            description: "Hard or technical skills mentioned in the job description that are missing or weak in the resume."
          },
          matchScore: { type: Type.INTEGER, description: "Match score out of 100 representing how well the resume matches the target job/role. If no job description is provided, base this on alignment with standard industry expectations for their title (0-100)." },
          gapsAndRecommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                section: { type: Type.STRING, description: "The section this recommendation applies to (e.g., 'Experience Formatting', 'Technical Profile', 'Missing Certifications')" },
                observation: { type: Type.STRING, description: "What key gap or area of improvement was observed." },
                actionableFeedback: { type: Type.STRING, description: "The direct, actionable tip or rewriting advice to fix this." }
              },
              required: ["section", "observation", "actionableFeedback"]
            },
            description: "Step-by-step constructive and actionable advice to optimize the resume."
          },
        },
        required: [
          "candidateName", 
          "candidateTitle", 
          "contactInfo", 
          "summary", 
          "skills", 
          "experience", 
          "strengths", 
          "missingSkills", 
          "matchScore", 
          "gapsAndRecommendations"
        ]
      };

      const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.5-pro"];
      let lastError: any = null;
      let textResponse = "";
      let analysisSucceeded = false;

      for (const modelName of modelsToTry) {
        try {
          console.log(`[Resume Analyzer] Attempting scan using model: ${modelName}`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [pdfPart, { text: prompt }],
            config: {
              responseMimeType: "application/json",
              responseSchema: responseSchema,
              systemInstruction: "You are an ATS compliance evaluator and professional recruiter. Read the supplied resume PDF and extract data cleanly into the requested JSON schema format.",
            }
          });

          if (response.text) {
            textResponse = response.text;
            analysisSucceeded = true;
            console.log(`[Resume Analyzer] Successfully completed analysis using model: ${modelName}`);
            break;
          }
        } catch (error: any) {
          console.warn(`[Resume Analyzer] Model ${modelName} failed or is currently overloaded:`, error?.message || error);
          lastError = error;
          // Wait 1 second before testing fallback model
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!analysisSucceeded) {
        throw new Error(`Resume analysis models are currently experiencing high demand. Please try again in a moment. details: ${lastError?.message || "API Unavailable"}`);
      }

      const analysisResult = JSON.parse(textResponse.trim());
      res.json(analysisResult);

    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: error?.message || "Internal Server Error during resume analysis." });
    }
  });

  // Serve Vite assets in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLessonPlan = async (
  topic: string,
  grade: string,
  subject: string,
  language: 'ar' | 'en'
): Promise<LessonPlan | null> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Create a detailed lesson plan for a ${grade} class on the subject of ${subject}.
    The specific topic is: "${topic}".
    The output must be in ${language === 'ar' ? 'Arabic' : 'English'}.
    Include 3 learning objectives, a list of materials, a step-by-step outline with timing, and a short 3-question quiz at the end.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            gradeLevel: { type: Type.STRING },
            subject: { type: Type.STRING },
            objectives: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            materials: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            outline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  duration: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as LessonPlan;
    }
    return null;
  } catch (error) {
    console.error("Error generating lesson plan:", error);
    return null;
  }
};
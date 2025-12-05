import { GoogleGenAI, Type } from "@google/genai";
import { ClipMetadata, LogReport, ScriptEntry } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSmartLog = async (
  clips: ClipMetadata[],
  cardLabel: string,
  scriptData: string | ScriptEntry[],
  imageData?: string // base64 string
): Promise<LogReport> => {
  
  const clipsJson = JSON.stringify(clips);
  
  // Determine input type
  let notesContent = "";
  if (typeof scriptData === 'string') {
    notesContent = `Script Notes (Text): ${scriptData}`;
  } else {
    notesContent = `Script Structured Data (Form): ${JSON.stringify(scriptData)}`;
  }

  const basePrompt = `
    You are a professional Digital Imaging Technician (DIT). 
    Analyze the following metadata from Card ${cardLabel} and the provided Script/Scene data.
    
    Tasks:
    1. Identify the Camera Model, Resolution, Log Format, and Audio Tracks from the clips.
    2. Check for missing clips based on the naming convention (e.g., C001, C002, C004 -> C003 is missing).
    3. Determine the first and last clip names.
    4. Match the script notes/data to the content.
    5. If an image was provided, extract any visible scene/take/timecode text and use it to cross-reference with the clips.
    
    Script Data:
    ${notesContent}

    Clip Metadata:
    ${clipsJson}
  `;

  const parts: any[] = [{ text: basePrompt }];

  // Add image part if exists
  if (imageData) {
    // Remove data URL prefix if present for proper base64
    const base64Clean = imageData.split(',')[1] || imageData;
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Clean
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using flash for efficiency with text/image
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            cameraModel: { type: Type.STRING },
            totalClips: { type: Type.INTEGER },
            firstClip: { type: Type.STRING },
            lastClip: { type: Type.STRING },
            missingClips: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            totalSize: { type: Type.STRING },
            formats: { type: Type.STRING, description: "Summary of resolution, fps, log, audio" },
            notes: { type: Type.STRING },
            scriptMatch: { type: Type.STRING, description: "Analysis of script vs metadata" }
          },
          required: ["cameraModel", "totalClips", "firstClip", "lastClip", "formats"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as LogReport;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Error generating log:", error);
    // Fallback if AI fails
    return {
      date: new Date().toLocaleDateString(),
      cameraModel: clips[0]?.cameraModel || "Unknown",
      totalClips: clips.length,
      firstClip: clips[0]?.name || "N/A",
      lastClip: clips[clips.length - 1]?.name || "N/A",
      missingClips: [],
      totalSize: "Unknown",
      formats: "Check manually",
      notes: "AI Generation Failed: " + (error as Error).message
    };
  }
};
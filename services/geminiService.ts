import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAiWishes = async (): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 40-50 short, aesthetic New Year keywords or phrases (2025-2026) in Chinese. 
      
      Requirements:
      - Format: JSON Array of strings.
      - Length: Very short. 2 to 6 characters max. (e.g. "自由", "暴富", "被爱", "勇敢做自己").
      - Content: Focus on self-growth, wealth, beauty, freedom, courage, happiness.
      - Tone: Cool, modern, confident, independent.
      - Target Audience: Friends/General (No "Bestie" specific terms).
      - Examples: "拒绝内耗", "光芒万丈", "存款翻倍", "清醒独立", "自由漫游", "心动", "热烈".
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const json = JSON.parse(response.text || "[]");
    if (Array.isArray(json) && json.length > 0) {
      return json;
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Failed to generate wishes:", error);
    // Fallback list
    return [
      "自由", "美丽", "做想做的事", "前程似锦", 
      "乐观面对生活", "自信", "心想事成", "接受自己",
      "幸运", "被爱", "健康", "明媚", "坚强",
      "不为破事焦虑", "冰雪聪明", "勇敢做决定", "拥有想要的一切",
      "想哭就哭", "想笑就笑", "不内耗", "不被定义",
      "勇敢做自己", "不被拘束", "敢于尝试", "相信自己",
      "有野心", "好好睡觉", "好好吃饭", "幸福", "暴富",
      "清醒", "浪漫", "平安", "喜乐", "万事胜意"
    ];
  }
};
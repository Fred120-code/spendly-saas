import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * "Port" vers le fournisseur IA externe. C'est le SEUL fichier du projet
 * qui importe le SDK Google Generative AI : si on change de fournisseur
 * (OpenAI, Anthropic, etc.) un jour, c'est le seul fichier à réécrire.
 */
export interface IAiClient {
  generateText(prompt: string): Promise<string>;
}

class GeminiClient implements IAiClient {
  private model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]> | null = null;

  private getModel() {
    if (!this.model) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY est manquante");
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    }
    return this.model;
  }

  async generateText(prompt: string): Promise<string> {
    const result = await this.getModel().generateContent(prompt);
    const text = result.response.text();
    if (!text) {
      throw new Error("Réponse vide du modèle IA");
    }
    return text;
  }
}

export const aiClient: IAiClient = new GeminiClient();

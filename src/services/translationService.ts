// Translation service using Gemini API
const MODEL = 'gemini-1.5-flash'; // or 'gemini-1.5-pro'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent`;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface TranslationRequest {
  text: string;
  fromLanguage: string;
  toLanguage: string;
}

export interface TranslationResponse {
  translatedText: string;
  confidence: number;
}

export class TranslationService {
  private static instance: TranslationService;

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  private getLanguageName(languageCode: string): string {
    const languageNames: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French', 
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese'
    };
    
    return languageNames[languageCode] || 'English';
  }

  async translateText({ text, fromLanguage, toLanguage }: TranslationRequest): Promise<TranslationResponse> {
    try {
      const fromLangName = this.getLanguageName(fromLanguage);
      const toLangName = this.getLanguageName(toLanguage);
      
      const prompt = `Translate the following text from ${fromLangName} to ${toLangName}. 
      Only return the translated text, nothing else. Do not include any explanations or additional text.
      
      Text to translate: "${text}"`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;

      return {
        translatedText,
        confidence: 0.95 // Gemini doesn't provide confidence scores, so we use a default high value
      };
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback to original text if translation fails
      return {
        translatedText: text,
        confidence: 0
      };
    }
  }

  async batchTranslate(requests: TranslationRequest[]): Promise<TranslationResponse[]> {
    // Process translations in parallel for better performance
    const promises = requests.map(request => this.translateText(request));
    return Promise.all(promises);
  }
}

export const translationService = TranslationService.getInstance();
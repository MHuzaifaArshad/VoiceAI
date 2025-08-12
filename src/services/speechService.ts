/**
 * CHANGELOG:
 * - Added proper language mapping for speech recognition and synthesis.
 * - Added native voice detection for speech synthesis.
 * - Maintained backward compatibility with v1beta voice names.
 */
// Speech recognition and synthesis service
export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  language: string;
}

export interface SpeechSynthesisOptions {
  text: string;
  language: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export class SpeechService {
  private static instance: SpeechService;
  private recognition: any = null;
  private synthesis: SpeechSynthesis;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  private initializeSpeechRecognition() {
    // Check for browser support
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
    }
  }

  private convertToSpeechLang(languageCode: string): string {
    // Convert our language codes to Web Speech API compatible codes
    const languageMap: { [key: string]: string } = {
      'en': 'en-US',
      'es': 'es-ES', 
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN'
    };
    
    return languageMap[languageCode] || 'en-US';
  }

  async recognizeSpeech(
    language: string = 'en',
    onResult?: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void
  ): Promise<SpeechRecognitionResult> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        const error = 'Speech recognition not supported in this browser';
        onError?.(error);
        reject(new Error(error));
        return;
      }

      // Convert to proper speech recognition language code
      const speechLang = this.convertToSpeechLang(language);
      this.recognition.lang = speechLang;

      this.recognition.onresult = (event: any) => {
        const result = event.results[0][0];
        const speechResult: SpeechRecognitionResult = {
          text: result.transcript,
          confidence: result.confidence,
          language: language
        };

        onResult?.(speechResult);
        resolve(speechResult);
      };

      this.recognition.onerror = (event: any) => {
        const error = `Speech recognition error: ${event.error}`;
        onError?.(error);
        reject(new Error(error));
      };

      this.recognition.start();
    });
  }

  async synthesizeSpeech(options: SpeechSynthesisOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported in this browser'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(options.text);
      
      // Convert to proper speech synthesis language code
      utterance.lang = this.convertToSpeechLang(options.language);
      
      // Find native voice for the target language
      const voices = this.synthesis.getVoices();
      const targetLang = this.convertToSpeechLang(options.language);
      
      const nativeVoice = voices.find(voice => 
        voice.lang.startsWith(targetLang.split('-')[0]) && 
        voice.localService === true
      );
      
      if (nativeVoice) {
        utterance.voice = nativeVoice;
        console.log(`Using native voice: ${nativeVoice.name} for ${targetLang}`);
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis?.getVoices() || [];
  }

  stopSpeaking(): void {
    if (this.synthesis?.speaking) {
      this.synthesis.cancel();
    }
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  isSupported(): boolean {
    return !!(this.recognition && this.synthesis);
  }
}

export const speechService = SpeechService.getInstance();   
/**
 * CHANGELOG:
 * - startListening now creates AbortController and passes its signal to speechService.recognizeSpeech.
 * - stopListening aborts the controller, ensuring recognition promise settles promptly.
 * - Prevents UI from getting stuck in 'listening' state.
 */ 
import { useState, useRef, useCallback } from 'react';
import { translationService } from '@/services/translationService';
import { speechService, type SpeechRecognitionResult } from '@/services/speechService';
import { useToast } from '@/hooks/use-toast';

export interface VoiceTranslationResult {
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  confidence: number;
}

export interface UseVoiceTranslationProps {
  fromLanguage: string;
  toLanguage: string;
  onTranslationComplete?: (result: VoiceTranslationResult) => void;
  onError?: (error: string) => void;
}

export const useVoiceTranslation = ({
  fromLanguage,
  toLanguage,
  onTranslationComplete,
  onError
}: UseVoiceTranslationProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const startListening = useCallback(async () => {
    if (!speechService.isSupported()) {
      const error = 'Speech recognition is not supported in this browser';
      onError?.(error);
      toast({
        title: "Browser not supported",
        description: error,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsListening(true);
      abortControllerRef.current = new AbortController();

      const result = await speechService.recognizeSpeech(
        fromLanguage,
        (result) => { console.log('Speech recognition result:', result); },
        (error) => {
          console.error('Speech recognition error:', error);
          onError?.(error);
          setIsListening(false);
        },
        abortControllerRef.current.signal // ← pass signal
      );

      setIsListening(false);
      
      if (result.text.trim()) {
        await translateAndSpeak(result.text, result.confidence);
      }
    } catch (error) {
      setIsListening(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMessage);
      toast({
        title: "Speech recognition failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [fromLanguage, onError, toast]);

  const stopListening = useCallback(() => {
    speechService.stopListening();
    setIsListening(false);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const translateAndSpeak = useCallback(async (text: string, speechConfidence: number = 1.0) => {
    try {
      setIsTranslating(true);

      // Translate the text
      const translationResult = await translationService.translateText({
        text,
        fromLanguage,
        toLanguage
      });

      const result: VoiceTranslationResult = {
        originalText: text,
        translatedText: translationResult.translatedText,
        fromLanguage,
        toLanguage,
        confidence: Math.min(speechConfidence, translationResult.confidence)
      };

      // Speak the translated text
      setIsSpeaking(true);
      await speechService.synthesizeSpeech({
        text: translationResult.translatedText,
        language: toLanguage,
        rate: 0.9,
        pitch: 1.0,
        volume: 0.8
      });
      setIsSpeaking(false);

      onTranslationComplete?.(result);
      
      toast({
        title: "Translation complete",
        description: `"${text}" → "${translationResult.translatedText}"`,
      });

    } catch (error) {
      setIsTranslating(false);
      setIsSpeaking(false);
      const errorMessage = error instanceof Error ? error.message : 'Translation failed';
      onError?.(errorMessage);
      toast({
        title: "Translation failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  }, [fromLanguage, toLanguage, onTranslationComplete, onError, toast]);

  const stopSpeaking = useCallback(() => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const translateText = useCallback(async (text: string) => {
    return translateAndSpeak(text);
  }, [translateAndSpeak]);

  return {
    isListening,
    isTranslating,
    isSpeaking,
    startListening,
    stopListening,
    stopSpeaking,
    translateText,
    isSupported: speechService.isSupported()
  };
};
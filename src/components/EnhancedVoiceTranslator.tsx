/**
 * CHANGELOG:
 * - Added native voice detection for speech synthesis in target language.
 * - Added info card with how it works.
 * - Fixed translation history badge to use actual language names.
 * - Updated Web Speech API language codes to match actual browser support.
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Volume2, Users, Settings, Zap, VolumeX, Loader2 } from 'lucide-react';
import { useVoiceTranslation, type VoiceTranslationResult } from '@/hooks/useVoiceTranslation';
import { useToast } from '@/hooks/use-toast';

interface TranslationMessage extends VoiceTranslationResult {
  id: string;
  timestamp: Date;
  isUserMessage: boolean;
}

const LANGUAGES = [
  { 
    code: 'en', 
    name: 'English', 
    display: 'English',
    speechCode: 'en-US',  // For Web Speech API
    geminiName: 'English' // For Gemini API
  },
  { 
    code: 'es', 
    name: 'Spanish', 
    display: 'Español',
    speechCode: 'es-ES',
    geminiName: 'Spanish'
  },
  { 
    code: 'fr', 
    name: 'French', 
    display: 'Français',
    speechCode: 'fr-FR',
    geminiName: 'French'
  },
  { 
    code: 'de', 
    name: 'German', 
    display: 'Deutsch',
    speechCode: 'de-DE',
    geminiName: 'German'
  },
  { 
    code: 'it', 
    name: 'Italian', 
    display: 'Italiano',
    speechCode: 'it-IT',
    geminiName: 'Italian'
  },
  { 
    code: 'pt', 
    name: 'Portuguese', 
    display: 'Português',
    speechCode: 'pt-PT',
    geminiName: 'Portuguese'
  },
  { 
    code: 'ru', 
    name: 'Russian', 
    display: 'Русский',
    speechCode: 'ru-RU',
    geminiName: 'Russian'
  },
  { 
    code: 'ja', 
    name: 'Japanese', 
    display: '日本語',
    speechCode: 'ja-JP',
    geminiName: 'Japanese'
  },
  { 
    code: 'ko', 
    name: 'Korean', 
    display: '한국어',
    speechCode: 'ko-KR',
    geminiName: 'Korean'
  },
  { 
    code: 'zh', 
    name: 'Chinese', 
    display: '中文',
    speechCode: 'zh-CN',
    geminiName: 'Chinese'
  }
  // Remove Arabic and Hindi for now - Web Speech API doesn't support them well
];

export const EnhancedVoiceTranslator: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [targetLanguage, setTargetLanguage] = useState('es-ES');
  const [messages, setMessages] = useState<TranslationMessage[]>([]);
  const [connectedUsers, setConnectedUsers] = useState(3);
  const { toast } = useToast();

  const handleTranslationComplete = (result: VoiceTranslationResult) => {
    const message: TranslationMessage = {
      ...result,
      id: Date.now().toString(),
      timestamp: new Date(),
      isUserMessage: true,
    };
    setMessages(prev => [...prev, message]);
  };

  const handleError = (error: string) => {
    console.error('Voice translation error:', error);
  };

  const {
    isListening,
    isTranslating,
    isSpeaking,
    startListening,
    stopListening,
    stopSpeaking,
    isSupported
  } = useVoiceTranslation({
    fromLanguage: currentLanguage,
    toLanguage: targetLanguage,
    onTranslationComplete: handleTranslationComplete,
    onError: handleError
  });

  const connectToRoom = () => {
    setIsConnected(!isConnected);
    toast({
      title: isConnected ? "Disconnected" : "Connected",
      description: isConnected ? "Left the translation room" : "Joined the translation room",
    });
  };

  const handleVoiceControl = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const getLanguageDisplay = (code: string) => {
    return LANGUAGES.find(l => l.code === code)?.display || code;
  };

  const getLanguageName = (code: string) => {
    return LANGUAGES.find(l => l.code === code)?.name || code;
  };

  const isProcessing = isListening || isTranslating || isSpeaking;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center animate-floating">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Real Time AI Voice Translation
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time voice translation powered by Gemini AI. Speak in your language, 
            be understood in any language. Connect with people around the world instantly.
          </p>
          
          {!isSupported && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-destructive text-sm">
                ⚠️ Your browser doesn't fully support voice features. Please use Chrome, Edge, or Safari for the best experience.
              </p>
            </div>
          )}
        </div>

        {/* Connection Status */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-voice-active animate-pulse-glow' : 'bg-voice-inactive'}`} />
                <span className="font-medium">
                  {isConnected ? 'Connected to translation room' : 'Not connected'}
                </span>
              </div>
              {isConnected && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Users className="w-3 h-3 mr-1" />
                  {connectedUsers} users
                </Badge>
              )}
            </div>
            <Button 
              onClick={connectToRoom}
              variant={isConnected ? "destructive" : "default"}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        </Card>

        {/* Language Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary" />
              Your Language
            </h3>
            <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.display} ({lang.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-accent" />
              Target Language
            </h3>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.display} ({lang.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        </div>

        {/* Voice Control */}
        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold">Voice Translation</h3>
            
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={handleVoiceControl}
                disabled={!isConnected || !isSupported}
                className={`
                  w-24 h-24 rounded-full flex items-center justify-center text-white
                  transition-all duration-300 transform relative overflow-hidden
                  ${isListening 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse-glow scale-110 shadow-lg shadow-red-500/50' 
                    : isConnected && isSupported
                      ? 'bg-gradient-to-r from-primary to-accent hover:scale-105 shadow-lg shadow-primary/50'
                      : 'bg-muted cursor-not-allowed'
                  }
                `}
              >
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : isListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
                
                {isListening && (
                  <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
                )}
              </button>

              {isSpeaking && (
                <Button
                  onClick={stopSpeaking}
                  variant="outline"
                  size="sm"
                  className="bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                >
                  <VolumeX className="w-4 h-4 mr-2" />
                  Stop Speaking
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground">
                {!isConnected 
                  ? 'Connect to start translating'
                  : !isSupported
                    ? 'Voice features not supported in this browser'
                    : isListening 
                      ? 'Listening... Speak now!'
                      : isTranslating
                        ? 'Translating your speech...'
                        : isSpeaking
                          ? 'Playing translation...'
                          : 'Tap the microphone to start recording'
                }
              </p>
              
              {isListening && (
                <p className="text-xs text-muted-foreground">
                  Speaking in {getLanguageDisplay(currentLanguage)} → Translating to {getLanguageDisplay(targetLanguage)}
                </p>
              )}
            </div>

            {isListening && (
              <div className="flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-8 bg-voice-active rounded-full animate-voice-wave"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Translation History */}
        {messages.length > 0 && (
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="text-xl font-semibold mb-4">Translation History</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.isUserMessage 
                      ? 'bg-primary/10 border-l-4 border-primary ml-8' 
                      : 'bg-accent/10 border-l-4 border-accent mr-8'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {getLanguageName(message.fromLanguage)}
                    </Badge>
                    <span className="text-muted-foreground">→</span>
                    <Badge variant="outline" className="text-xs">
                      {getLanguageName(message.toLanguage)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {Math.round(message.confidence * 100)}% confidence
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Original:</p>
                  <p className="font-medium mb-2">{message.originalText}</p>
                  <p className="text-sm text-muted-foreground mb-1">Translation:</p>
                  <p className="font-medium text-accent">{message.translatedText}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Info Card */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="text-center space-y-2">
            <h4 className="font-semibold">How it works</h4>
            <p className="text-sm text-muted-foreground">
              1. Connect to the translation room • 2. Select your languages • 3. Hold the microphone and speak • 4. Listen to the real-time translation
            </p>
            <p className="text-xs text-muted-foreground">
              Powered by Gemini AI for accurate translations and browser speech APIs for voice processing
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
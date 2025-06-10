import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageCircle, X, Send, Mic, Bot, User, Minimize2, Maximize2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import VoiceRecorder from "./VoiceRecorder";
import type { LegalResponse, ChatRequest } from "@shared/schema";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  response?: LegalResponse;
  timestamp: Date;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  initialQuestion?: string;
  onQuestionSet?: () => void;
}

const suggestedQuestions = [
  "Can police arrest without a warrant?",
  "What are dowry laws in Pakistan?",
  "How can I file a cybercrime complaint?",
  "What does the Constitution say about women's rights?"
];

export default function ChatWidget({ isOpen, onToggle, initialQuestion, onQuestionSet }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (request: ChatRequest) => {
      const response = await apiRequest("POST", "/api/chat", request);
      return response.json() as Promise<LegalResponse>;
    },
    onSuccess: (response, variables) => {
      const botMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: "Legal Analysis Complete",
        response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get legal response. Please try again.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (initialQuestion && onQuestionSet) {
      setInputValue(initialQuestion);
      onQuestionSet();
    }
  }, [initialQuestion, onQuestionSet]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const question = inputValue.trim();
    if (!question) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    chatMutation.mutate({
      question,
      language: "en"
    });
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => sendMessage(), 100);
  };

  const handleVoiceResult = (transcript: string) => {
    setInputValue(transcript);
  };

  const formatLegalResponse = (response: LegalResponse) => (
    <div className="space-y-4 text-sm">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold minimal-dark mb-2 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          DEFINITION
        </h4>
        <p className="text-gray-700">{response.definition}</p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold minimal-dark mb-2 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          YOUR QUESTION EXPLAINED
        </h4>
        <p className="text-gray-700">{response.explanation}</p>
      </div>

      {response.constitutionalArticles.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold minimal-dark mb-3 flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            CONSTITUTIONAL ARTICLES
          </h4>
          <div className="space-y-3">
            {response.constitutionalArticles.map((article, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="font-medium text-gray-900 mb-1">Article {article.article}: "{article.title}"</div>
                <div className="text-sm text-gray-600">{article.summary}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {response.supremeCourtCases.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold minimal-dark mb-3 flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            SUPREME COURT CASES
          </h4>
          <div className="space-y-3">
            {response.supremeCourtCases.map((case_, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="font-medium text-gray-900 mb-1">"{case_.title}"</div>
                <div className="text-sm text-gray-600">{case_.summary}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {response.recommendedLawyers.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold minimal-dark mb-3 flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            RECOMMENDED LAWYERS
          </h4>
          <div className="space-y-2">
            {response.recommendedLawyers.map((lawyer, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{lawyer.name}</div>
                    <div className="text-sm text-gray-600">{lawyer.area} • {lawyer.region}</div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">Contact</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {response.followUpQuestions.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold minimal-dark mb-3 flex items-center">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            FOLLOW-UP QUESTIONS
          </h4>
          <div className="space-y-2">
            {response.followUpQuestions.map((question, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => handleSuggestedQuestion(question)}
                className="w-full text-left justify-start text-sm bg-white hover:bg-gray-100 border border-gray-200 h-auto p-3"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {response.usedFallback && (
        <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            <span>Response generated using offline legal data (live data temporarily unavailable)</span>
          </div>
        </div>
      )}
    </div>
  );

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => onToggle(true)}
          className="bg-minimal-dark text-white p-4 rounded-full hover:bg-gray-800 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  const chatHeight = isMinimized ? 'h-16' : 'h-[80vh] max-h-[600px]';
  const chatWidth = 'w-[90vw] max-w-2xl';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className={`${chatWidth} ${chatHeight} shadow-2xl border border-gray-300 transition-all duration-300 flex flex-col`}>
        {/* Chat Header */}
        <CardHeader className="bg-minimal-dark text-white p-4 rounded-t-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">LegalConnect AI</div>
                <div className="text-xs text-gray-300 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Pakistani Legal Assistant
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => onToggle(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 && (
                <div className="mb-4">
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-minimal-dark rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="text-white h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-900 mb-3">
                            Hi! I'm your Pakistani Legal AI Assistant. Ask me anything about Pakistani law, Constitution, or legal procedures.
                          </div>
                          <div className="text-xs text-gray-500 mb-4">You can type or use voice input in Urdu or English</div>
                          <div className="grid grid-cols-1 gap-2">
                            {suggestedQuestions.map((question, index) => (
                              <Button
                                key={index}
                                onClick={() => handleSuggestedQuestion(question)}
                                variant="ghost"
                                size="sm"
                                className="text-left justify-start text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 h-auto p-3"
                              >
                                {question}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`mb-4 ${message.type === 'user' ? 'flex justify-end' : ''}`}>
                  {message.type === 'user' ? (
                    <div className="bg-minimal-dark text-white p-4 rounded-xl max-w-xs">
                      <div className="text-sm">{message.content}</div>
                    </div>
                  ) : (
                    <Card className="bg-white shadow-sm border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-minimal-dark rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="text-white h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            {message.response ? formatLegalResponse(message.response) : message.content}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}

              {chatMutation.isPending && (
                <div className="mb-4">
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-minimal-dark rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="text-white h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-600 flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                            Analyzing your legal question...
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t bg-white rounded-b-lg flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask your legal question in Urdu or English..."
                    className="pr-12 focus:ring-minimal-dark focus:border-minimal-dark"
                    disabled={chatMutation.isPending}
                  />
                  <VoiceRecorder
                    onResult={handleVoiceResult}
                    onRecordingChange={setIsVoiceRecording}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || chatMutation.isPending}
                  className="bg-minimal-dark text-white hover:bg-gray-800"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                🔒 Your conversations are private and secure
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
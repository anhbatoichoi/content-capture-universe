
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ChatMessage, ChatSession } from '../types/chat';
import { apiService } from '../services/apiService';

interface ChatContextType {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  createNewSession: () => void;
  switchSession: (sessionId: string) => void;
  sendMessage: (message: string) => Promise<void>;
  currentMessages: ChatMessage[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Load sessions from chrome storage on initial load
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const result = await chrome.storage.local.get('chatSessions');
        const storedSessions = result.chatSessions || [];
        
        setSessions(storedSessions);
        
        // Set current session to the most recent one if it exists
        if (storedSessions.length > 0) {
          setCurrentSessionId(storedSessions[0].id);
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error);
      }
    };
    
    loadSessions();
  }, []);
  
  // Save sessions to chrome storage when they change
  useEffect(() => {
    if (sessions.length > 0) {
      chrome.storage.local.set({ chatSessions: sessions });
    }
  }, [sessions]);
  
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: `Chat ${sessions.length + 1}`,
      lastUpdated: Date.now(),
      messages: []
    };
    
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
  };
  
  const switchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };
  
  const updateSession = (sessionId: string, updateFn: (session: ChatSession) => ChatSession) => {
    setSessions(prevSessions => 
      prevSessions.map(session => 
        session.id === sessionId ? updateFn(session) : session
      )
    );
  };
  
  const sendMessage = async (content: string) => {
    if (!currentSessionId && sessions.length === 0) {
      createNewSession();
    }
    
    const sessionId = currentSessionId || sessions[0]?.id;
    
    if (!sessionId) return;
    
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    
    // Add user message to session
    updateSession(sessionId, (session) => ({
      ...session,
      lastUpdated: Date.now(),
      messages: [...session.messages, userMessage],
    }));
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Send message to API
      const response = await apiService.sendChatMessage({ 
        message: content,
        conversationId: sessionId
      });
      
      // Add AI response to session
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
      };
      
      updateSession(sessionId, (session) => ({
        ...session,
        lastUpdated: Date.now(),
        messages: [...session.messages, aiMessage],
      }));
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: Date.now(),
      };
      
      updateSession(sessionId, (session) => ({
        ...session,
        lastUpdated: Date.now(),
        messages: [...session.messages, errorMessage],
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get messages for current session
  const currentMessages = currentSessionId 
    ? sessions.find(s => s.id === currentSessionId)?.messages || [] 
    : sessions[0]?.messages || [];
  
  return (
    <ChatContext.Provider
      value={{
        sessions,
        currentSessionId,
        isLoading,
        createNewSession,
        switchSession,
        sendMessage,
        currentMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

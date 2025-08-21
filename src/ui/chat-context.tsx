import { createContext, useContext, useState, ReactNode } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  unreadCount: number;
  markAsRead: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

const initialMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: `# Welcome! 🏃‍♀️

I'm your AI FaceBloat assistant. I can help with **Fitness**, **Nutrition**, and other **FaceBloat** questions.

How can I assist you today?`
  }
];

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    // Increment unread count for assistant messages
    if (message.role === 'assistant') {
      setUnreadCount(prev => prev + 1);
    }
  };

  const clearMessages = () => {
    setMessages(initialMessages);
    setUnreadCount(0);
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const value: ChatContextType = {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    addMessage,
    clearMessages,
    unreadCount,
    markAsRead,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

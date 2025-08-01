'use client';

import { useState, useRef, useEffect } from 'react';
import { logout } from '../logout/actions';
import { FaUserCircle, FaRobot } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { createClient } from '@/utils/supabase/client';

const demoUser = {
  name: 'You',
};
const botUser = {
  name: 'Bot',
};

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

type Message = {
  id: number;
  user: typeof demoUser | typeof botUser;
  text: string;
  time: string;
};

// Typing indicator component
const TypingIndicator = () => (
  <div className="flex items-end gap-3 justify-start animate-fade-in">
    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 shadow animate-pulse">
      <FaRobot className="h-6 w-6 text-white" />
    </span>
    <div className="relative px-5 py-3 rounded-2xl max-w-[70%] shadow-md bg-white/80 text-gray-800 border border-purple-100 rounded-bl-none">
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="text-sm text-gray-500 ml-2"></span>
      </div>
    </div>
  </div>
);

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        console.log('Loading messages...');
        const supabase = createClient();
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Session data:', { session, sessionError });
        
        if (!session?.user) {
          console.log('No user session found');
          return;
        }

        console.log('Fetching messages for user:', session.user.id);
        // Fetch messages from Supabase
        const { data: messages, error, status } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true });

        console.log('Messages fetch status:', status);
        if (error) {
          console.error('Error fetching messages:', error);
          throw error;
        }

        if (messages && messages.length > 0) {
          console.log(`Found ${messages.length} messages`);
          // Transform messages to the format expected by the component
          const formattedMessages = messages.map((msg: {
            id: number;
            is_bot: boolean;
            text: string;
            created_at: string;
          }) => ({
            id: msg.id,
            user: msg.is_bot ? botUser : demoUser,
            text: msg.text,
            time: formatTime(new Date(msg.created_at)),
          }));
          console.log('Formatted messages:', formattedMessages);
          setMessages(formattedMessages);
        } else {
          console.log('No messages found in the database');
          // No messages yet, show welcome message with delay for animation
          setTimeout(() => {
            setMessages([
              {
                id: 1,
                user: botUser,
                text: "👋 Hi! I'm your AI assistant (Claude). How can I help you today?",
                time: formatTime(new Date()),
              },
            ]);
          }, 500);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        // Fallback to welcome message if there's an error
        setTimeout(() => {
          setMessages([
            {
              id: 1,
              user: botUser,
              text: "👋 Hi! I'm your AI assistant (Claude). How can I help you today?",
              time: formatTime(new Date()),
            },
          ]);
        }, 500);
      }
    };

    loadMessages();

    // Set up real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload: { new: { id: number; is_bot: boolean; text: string; created_at: string } }) => {
          const newMessage = payload.new;
          if (newMessage) {
            setMessages((prev) => [
              ...prev,
              {
                id: newMessage.id,
                user: newMessage.is_bot ? botUser : demoUser,
                text: newMessage.text,
                time: formatTime(new Date(newMessage.created_at)),
              },
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');

    // Add user message to chat with animation
    const newMsg = {
      id: Date.now(),
      user: demoUser,
      text: userMessage,
      time: formatTime(new Date()),
    };
    
    setMessages((msgs) => [...msgs, newMsg]);
    
    // Show typing indicator
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();

      // Hide typing indicator and add Claude's reply with delay for smooth transition
      setTimeout(() => {
        setIsTyping(false);
        setMessages((msgs) => [
          ...msgs,
          {
            id: Date.now() + 1,
            user: botUser,
            text: data.reply,
            time: formatTime(new Date()),
          },
        ]);
      }, 1000); // 1 second delay to show typing animation
      
    } catch {
      setTimeout(() => {
        setIsTyping(false);
        setMessages((msgs) => [
          ...msgs,
          {
            id: Date.now() + 1,
            user: botUser,
            text: "❌ Error: Could not get a reply from Claude.",
            time: formatTime(new Date()),
          },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#c9e7fa] via-[#f7e8ff] to-[#fbeee6] relative max-w-full overflow-x-hidden">
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slide-in-left {
          animation: slideInFromLeft 0.5s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slideInFromRight 0.5s ease-out;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        
        .message-enter {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 bg-white/40 backdrop-blur-md shadow-lg rounded-b-2xl border-b border-white/30 animate-fade-in">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 shadow-lg animate-scale-in">
            <FaRobot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-blue-500 tracking-tight animate-slide-in-left">
            ClaudeSpark
          </span>
        </div>
        <button
          onClick={async (e) => {
            e.preventDefault();
            const result = await Swal.fire({
              title: 'Sign Out',
              text: 'Are you sure you want to sign out?',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#4f46e5',
              cancelButtonColor: '#6b7280',
              confirmButtonText: 'Yes, sign out',
              cancelButtonText: 'Cancel',
              background: '#ffffff',
              backdrop: `
                rgba(0,0,123,0.4)
                left top
                no-repeat
              `
            });
            
            if (result.isConfirmed) {
              await logout();
            }
          }}
          className="px-4 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:scale-105 transition-all duration-200 hover:shadow-xl animate-slide-in-right"
          type="button"
        >
          Sign Out
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-8">
        <div className="w-full max-w-2xl flex-1 flex flex-col rounded-3xl bg-white/40 backdrop-blur-lg shadow-2xl mt-2 mb-2 sm:mt-4 sm:mb-4 mx-2 sm:mx-4 border border-white/30 animate-scale-in">
          <div className="flex-1 flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 md:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex items-end gap-3 message-enter ${
                  msg.user.name === demoUser.name 
                    ? 'justify-end animate-slide-in-right' 
                    : 'justify-start animate-slide-in-left'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {msg.user.name !== demoUser.name && (
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 shadow transition-transform duration-200 hover:scale-110">
                    <FaRobot className="h-6 w-6 text-white" />
                  </span>
                )}
                <div
                  className={`relative px-4 py-2 sm:px-5 sm:py-3 rounded-2xl max-w-[85%] sm:max-w-[75%] md:max-w-[70%] shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                    msg.user.name === demoUser.name
                      ? 'bg-gradient-to-br from-blue-400 to-purple-400 text-white rounded-br-none'
                      : 'bg-white/80 text-gray-800 border border-purple-100 rounded-bl-none'
                  }`}
                >
                  <div className="text-sm sm:text-base font-medium break-words">{msg.text}</div>
                  <div
                    className={`text-xs mt-2 ${
                      msg.user.name === demoUser.name ? 'text-blue-100' : 'text-gray-400'
                    } text-right transition-opacity duration-200`}
                  >
                    {msg.time}
                  </div>
                </div>
                {msg.user.name === demoUser.name && (
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 shadow transition-transform duration-200 hover:scale-110">
                    <FaUserCircle className="h-6 w-6 text-white" />
                  </span>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && <TypingIndicator />}
            
            <div ref={chatEndRef}></div>
          </div>
        </div>
      </main>

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-0 z-10 w-full max-w-2xl mx-auto flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-white/60 backdrop-blur-xl rounded-t-2xl shadow-2xl border-t border-white/30 animate-fade-in"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <input
          type="text"
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-full border-none bg-white/70 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 text-base sm:text-lg placeholder:text-gray-400 transition-all duration-200 focus:shadow-lg focus:bg-white/90"
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={isTyping}
          className="px-4 sm:px-5 py-2 sm:py-3 rounded-full font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm sm:text-base shadow-lg hover:scale-105 transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
        >
          {isTyping ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sending</span>
            </div>
          ) : (
            'Send'
          )}
        </button>
      </form>

      {/* Decorative circles with animation */}
      <div className="pointer-events-none fixed -z-10 top-[-50px] sm:top-[-100px] left-[-50px] sm:left-[-100px] w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] rounded-full bg-purple-200 opacity-40 blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="pointer-events-none fixed -z-10 bottom-[-60px] sm:bottom-[-120px] right-[-60px] sm:right-[-120px] w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] rounded-full bg-blue-200 opacity-40 blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
    </div>
  );
}
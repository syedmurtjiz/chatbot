'use client';

import { useState, useRef, useEffect } from 'react';
import { logout } from '../logout/actions';
import { FaUserCircle, FaRobot } from 'react-icons/fa';
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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
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
          const formattedMessages = messages.map((msg: any) => ({
            id: msg.id,
            user: msg.is_bot ? botUser : demoUser,
            text: msg.text,
            time: formatTime(new Date(msg.created_at)),
          }));
          console.log('Formatted messages:', formattedMessages);
          setMessages(formattedMessages);
        } else {
          console.log('No messages found in the database');
          // No messages yet, show welcome message
          setMessages([
            {
              id: 1,
              user: botUser,
              text: "👋 Hi! I'm your AI assistant (Claude). How can I help you today?",
              time: formatTime(new Date()),
            },
          ]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        // Fallback to welcome message if there's an error
        setMessages([
          {
            id: 1,
            user: botUser,
            text: "👋 Hi! I'm your AI assistant (Claude). How can I help you today?",
            time: formatTime(new Date()),
          },
        ]);
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
        (payload) => {
          const newMessage = payload.new as any;
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
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const newMsg = {
      id: Date.now(), // Use timestamp as ID to avoid conflicts
      user: demoUser,
      text: input,
      time: formatTime(new Date()),
    };
    
    // Optimistically update UI
    setMessages((msgs) => [...msgs, newMsg]);
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      // Add Claude's reply
      setMessages((msgs) => [
        ...msgs,
        {
          id: msgs.length + 1,
          user: botUser,
          text: data.reply,
          time: formatTime(new Date()),
        },
      ]);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        {
          id: msgs.length + 1,
          user: botUser,
          text: "❌ Error: Could not get a reply from Claude.",
          time: formatTime(new Date()),
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#c9e7fa] via-[#f7e8ff] to-[#fbeee6] relative">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 bg-white/40 backdrop-blur-md shadow-lg rounded-b-2xl border-b border-white/30">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 shadow-lg">
            <FaRobot className="h-7 w-7 text-white" />
          </span>
          <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-blue-500 tracking-tight">
          ClaudeSpark
          </span>
        </div>
        <form action={logout}>
          <button
            className="px-5 py-2 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:scale-105 transition"
            type="submit"
          >
            Sign Out
          </button>
        </form>
      </header>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-8">
        <div className="w-full max-w-2xl flex-1 flex flex-col rounded-3xl bg-white/40 backdrop-blur-lg shadow-2xl mt-4 mb-4 border border-white/30">
          <div className="flex-1 flex flex-col gap-4 p-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-3 ${
                  msg.user.name === demoUser.name ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.user.name !== demoUser.name && (
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 shadow">
                    <FaRobot className="h-6 w-6 text-white" />
                  </span>
                )}
                <div
                  className={`relative px-5 py-3 rounded-2xl max-w-[70%] shadow-md ${
                    msg.user.name === demoUser.name
                      ? 'bg-gradient-to-br from-blue-400 to-purple-400 text-white rounded-br-none'
                      : 'bg-white/80 text-gray-800 border border-purple-100 rounded-bl-none'
                  }`}
                >
                  <div className="text-base font-medium">{msg.text}</div>
                  <div
                    className={`text-xs mt-2 ${
                      msg.user.name === demoUser.name ? 'text-blue-100' : 'text-gray-400'
                    } text-right`}
                  >
                    {msg.time}
                  </div>
                </div>
                {msg.user.name === demoUser.name && (
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 shadow">
                    <FaUserCircle className="h-6 w-6 text-white" />
                  </span>
                )}
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>
        </div>
      </main>

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-0 z-10 w-full max-w-2xl mx-auto flex items-center gap-3 px-6 py-4 bg-white/60 backdrop-blur-xl rounded-t-2xl shadow-2xl border-t border-white/30"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <input
          type="text"
          className="flex-1 px-5 py-3 rounded-full border-none bg-white/70 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 text-lg placeholder:text-gray-400"
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-full font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:scale-105 transition"
        >
          Send
        </button>
      </form>

      {/* Decorative circles */}
      <div className="pointer-events-none fixed -z-10 top-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full bg-purple-200 opacity-40 blur-3xl"></div>
      <div className="pointer-events-none fixed -z-10 bottom-[-120px] right-[-120px] w-[350px] h-[350px] rounded-full bg-blue-200 opacity-40 blur-3xl"></div>
    </div>
  );
}

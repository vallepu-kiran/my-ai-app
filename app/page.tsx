'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CoreMessage } from 'ai';
import { continueConversation } from './actions';
import { readStreamableValue } from 'ai/rsc';
import MessageList from '@/components/MessageList';
import MessageInputForm from '@/components/MessageInputForm';
import Sidebar from '@/components/Sidebar';

interface Chat {
  id: number;
  title: string;
  messages: CoreMessage[];
}

export default function Chat() {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isFetchingChats, setIsFetchingChats] = useState(false);
  const userId = 4;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSpeechRecognitionSupported =
        'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

      if (!isSpeechRecognitionSupported) {
        alert('Speech Recognition is not supported in this browser.');
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.onstart = () => setIsListening(true);
      recognitionInstance.onend = () => setIsListening(false);
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      setRecognition(recognitionInstance);

      return () => {
        recognitionInstance.stop();
      };
    }
  }, []);

  useEffect(() => {
    const fetchChatData = async () => {
      setIsFetchingChats(true);
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}/chats`);
        const data: Chat[] = await response.json();
        setChats(data);

        if (data.length > 0) {
          const lastChat = data.find(chat => chat.id === chatId) || data[0];
          setChatId(lastChat.id);
          setMessages(lastChat.messages);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
      setIsFetchingChats(false);
    };

    fetchChatData();
  }, [userId, chatId]);

  const startListening = useCallback(() => {
    if (recognition) {
      recognition.start();
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!chatId) {
      try {
        const chatResponse = await fetch(`http://localhost:3000/users/${userId}/chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: input || 'New Chat',
          }),
        });
        if (!chatResponse.ok) {
          throw new Error('Failed to create new chat');
        }
        const chatData = await chatResponse.json();
        setChatId(chatData.id);
        setChats(prevChats => {
          const chatsArray = Array.isArray(prevChats) ? prevChats : [];
          return [
            ...chatsArray,
            { id: chatData.id, title: input || 'New Chat', messages: [] }
          ];
        });
      } catch (error) {
        console.error('Error creating chat:', error);
        setIsLoading(false);
        return;
      }
    }

    const newMessages: CoreMessage[] = [
      ...messages,
      { content: input, role: 'user' },
    ];

    setMessages(newMessages);
    setInput('');

    try {
      const result = await continueConversation(newMessages);
      let assistantResponse = '';

      for await (const content of readStreamableValue(result.message)) {
        assistantResponse += content;
        setMessages([
          ...newMessages,
          { role: 'assistant', content: content as string },
        ]);
      }

      await fetch(`http://localhost:3000/users/${userId}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          answer: assistantResponse.trim(),
        }),
      });
    } catch (error) {
      console.error('Error during conversation:', error);
    }

    setIsLoading(false);
  };
  

  const handleSelectChat = useCallback(async (selectedChatId: number) => {
    setChatId(selectedChatId);
    setMessages([]);

    try {
      const response = await fetch(`http://localhost:3000/users/${userId}/chats/${selectedChatId}/messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages for the selected chat');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [userId]);

  const handleNewChat = async () => {
    try {
      const chatResponse = await fetch(`http://localhost:3000/users/${userId}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: input || 'New Chat' }),
      });
      if (!chatResponse.ok) {
        throw new Error('Failed to create new chat');
      }
      const chatData = await chatResponse.json();

      setChats(prevChats => {
        const chatsArray = Array.isArray(prevChats) ? prevChats : [];
        return [
          ...chatsArray,
          { id: chatData.id, title: input || 'New Chat', messages: [] }
        ];
      });

      setChatId(chatData.id);
      setMessages([]);
      setInput('');
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        chats={chats}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />
      <div className="flex-1 flex flex-col bg-gray-700 shadow-lg">
        <header className="bg-gray-700 text-white p-4 flex items-center justify-between shadow-md">
          <h1 className="text-xl font-bold">Ollama 3.1</h1>
        </header>
        <div className="flex-1 overflow-auto p-4">
          {isFetchingChats ? (
            <p>Loading chats...</p>
          ) : (
            <MessageList
              messages={messages}
              userName="Your Name"
              userProfileImage="https://via.placeholder.com/150"
            />
          )}
        </div>
        <MessageInputForm
          input={input}
          setInput={setInput}
          isListening={isListening}
          startListening={startListening}
          stopListening={stopListening}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

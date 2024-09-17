'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CoreMessage } from 'ai';
import { continueConversation } from './actions';
import { readStreamableValue } from 'ai/rsc';
import MessageList from '@/components/MessageList';
import MessageInputForm from '@/components/MessageInputForm';
import Sidebar from '@/components/Sidebar';

export default function Chat() {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [chats, setChats] = useState<{ id: number; title: string }[]>([]);
  const [isFetchingChats, setIsFetchingChats] = useState(false); // New state for loading chats
  const userId = 3;

  // Initialize Speech Recognition
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
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      setRecognition(recognitionInstance);

      return () => {
        recognitionInstance.stop();
      };
    }
  }, []);

  // Fetch existing chats and messages for the user
  useEffect(() => {
    const fetchChatData = async () => {
      setIsFetchingChats(true);
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}/chats`);
        const data = await response.json();
        setChats(data);

        if (data.length > 0) {
          const lastChat = data[0]; // Get the most recent chat
          setChatId(lastChat.id);
          setMessages(lastChat.messages);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
      setIsFetchingChats(false);
    };

    fetchChatData();
  }, [userId]);

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

    // Check if chat exists, if not create a new chat
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
        const chatData = await chatResponse.json();
        setChatId(chatData.id);
        setChats([...chats, { id: chatData.id, title: input || 'New Chat' }]);
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

      // Save both the question and answer to the backend
      await fetch(`http://localhost:3000/users/${userId}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          answer: assistantResponse,
        }),
      });
    } catch (error) {
      console.error('Error during conversation:', error);
    }

    setIsLoading(false);
  };

  const handleSelectChat = useCallback((selectedChatId: number) => {
    const selectedChat = chats.find(chat => chat.id === selectedChatId);
    if (selectedChat) {
      setChatId(selectedChatId);
      setMessages(selectedChat.messages);
    }
  }, [chats]);

  const handleNewChat = async () => {
    const newChatId = Date.now(); // Temporary unique ID
    const newChatTitle = 'New Chat';
    setChats([...chats, { id: newChatId, title: newChatTitle }]);
    setChatId(newChatId); // Optimistic update

    try {
      const chatResponse = await fetch(`http://localhost:3000/users/${userId}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newChatTitle }),
      });
      const chatData = await chatResponse.json();
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === newChatId ? { ...chat, id: chatData.id } : chat
        )
      );
      setChatId(chatData.id); // Update with actual chat ID
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
      <div className="flex-1 flex flex-col bg-white shadow-lg">
        <header className="bg-green-600 text-white p-4 flex items-center justify-between shadow-md">
          <h1 className="text-xl font-bold">Welcome!</h1>
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

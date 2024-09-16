'use client';

import React, { useState, useEffect } from 'react';
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
  const userId = 1; // Assuming userId is known

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSpeechRecognitionSupported =
        'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

      if (isSpeechRecognitionSupported) {
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
    }
  }, []);

  useEffect(() => {
    // Fetch existing chats and messages for the user if needed
    fetch(`http://localhost:3000/users/${userId}/chats`)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const lastChat = data[0]; // Get the most recent chat
          setChatId(lastChat.id);
          setMessages(lastChat.messages);
        }
      });
  }, []);

  const startListening = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

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
            title: 'New Chat', // Optional: You can modify title
          }),
        });
        const chatData = await chatResponse.json();
        setChatId(chatData.id);
      } catch (error) {
        console.error('Error creating chat:', error);
        setIsLoading(false);
        return;
      }
    }

    // Now that we have the chatId, save the message
    const newMessages: CoreMessage[] = [
      ...messages,
      { content: input, role: 'user' },
    ];

    setMessages(newMessages);
    setInput('');

    try {
      const result = await continueConversation(newMessages);
      for await (const content of readStreamableValue(result.message)) {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: content as string,
          },
        ]);
      }

      // Save message to the backend
      await fetch(`http://localhost:3000/users/${userId}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          answer: '', // Answer will be updated later
        }),
      });

    } catch (error) {
      console.error('Error during conversation:', error);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar messages={messages} />
      <div className="flex-1 flex flex-col bg-white shadow-lg">
        <header className="bg-green-600 text-white p-4 flex items-center justify-between shadow-md">
          <h1 className="text-xl font-bold">Welcome!</h1>
        </header>
        <div className="flex-1 overflow-auto p-4">
          <MessageList messages={messages} />
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

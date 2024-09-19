import React, { useRef, useEffect, useState } from 'react';

interface MessageListProps {
  messages: CoreMessage[];
  userName: string;
  userProfileImage: string;
  chatId: string;
}

interface CoreMessage {
  role?: 'user' | 'assistant';
  content?: string;
  question?: string;
  answer?: string;
  chatId?: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, userName, userProfileImage, chatId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [visibleMessages, setVisibleMessages] = useState<CoreMessage[]>([]);
  const [initialRender, setInitialRender] = useState(true);

  useEffect(() => {
    // Show all messages at once
    setVisibleMessages(messages);
  }, [messages]);

  useEffect(() => {
    // On initial render, scroll directly to the bottom without animation
    if (initialRender) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      setInitialRender(false);  // Disable this for subsequent renders
    } else {
      // Directly show new messages without smooth scroll
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [visibleMessages]);

  const defaultAiImage = "https://preview.redd.it/f8fchc9lepx51.jpg?auto=webp&s=17d0cbdb13ac08582b84c41167697859712cfa5b";
  const welcomeIcon = 'https://n8n.io/_nuxt/image/928f9a.svg';

  const getFirstName = (fullName: string) => fullName.split(' ')[0];
  const firstName = getFirstName(userName);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-700 border-t border-gray-300 rounded-t-lg shadow-md">
      {visibleMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <img className='w-20 h-20 mb-2' src={welcomeIcon} alt="Welcome Icon" />
          <p>How can I help you today?</p>
        </div>
      ) : (
        <>
          {visibleMessages.map((message, index) => {
            const question = message.question || '';
            const answer = message.answer || '';
            const content = message.content || '';

            const isQuestionAnswer = 'question' in message && 'answer' in message;
            const isLiveChat = 'role' in message && 'content' in message;

            return (
              <div key={index} className="mb-4">
                {isQuestionAnswer && (
                  <>
                    <div className="flex items-start mb-2">
                      <img
                        src={userProfileImage}
                        alt="User"
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div className="bg-gray-600 text-white p-3 rounded-lg">
                        <strong>{firstName}:</strong> {question}
                      </div>
                    </div>

                    <div className="flex items-start mb-2">
                      <img
                        src={defaultAiImage}
                        alt="AI"
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div className="bg-gray-700 text-white p-3 rounded-lg">
                        <strong>AI:</strong> {answer}
                      </div>
                    </div>
                  </>
                )}

                {isLiveChat && (
                  <div
                    className={`flex items-start p-3 mb-2 rounded-lg ${message.role === 'user'
                        ? 'bg-gray-500 text-white self-end'
                        : 'bg-gray-700 text-white'
                      }`}
                  >
                    <img
                      src={message.role === 'user' ? userProfileImage : defaultAiImage}
                      alt={message.role === 'user' ? 'User' : 'AI'}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div>
                      <strong>{message.role === 'user' ? firstName : 'AI'}:</strong> {content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;     
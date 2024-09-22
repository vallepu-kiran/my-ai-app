import React, { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

interface MessageListProps {
  messages: CoreMessage[];
  userName: string;
  userProfileImage: string;
  fetchMoreData: () => void;
  hasMore: boolean;
}

interface CoreMessage {
  id: string;
  role?: 'user' | 'assistant';
  content?: string;
  question?: string;
  answer?: string;
  questionCreatedAt?: string;
  answerCreatedAt?: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  userName,
  userProfileImage,
  fetchMoreData,
  hasMore
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const [displayedMessages, setDisplayedMessages] = useState<CoreMessage[]>([]);

  useEffect(() => {
    setDisplayedMessages(messages.slice(-5));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMoreMessages = () => {
    if (hasMore) {
      fetchMoreData();
      const nextMessages = messages.slice(-5);
      setDisplayedMessages(prev => [...prev, ...nextMessages]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const defaultAiImage = "https://preview.redd.it/f8fchc9lepx51.jpg?auto=webp&s=17d0cbdb13ac08582b84c41167697859712cfa5b";
  const welcomeIcon = 'https://n8n.io/_nuxt/image/928f9a.svg';
  const firstName = userName.split(' ')[0];

  return (
    <div className="flex-1 p-4 bg-gray-700 border-t border-gray-300 rounded-t-lg shadow-md" style={{ height: '1000px' }}>
      <div
        id="scrollableDiv"
        ref={scrollableDivRef}
        style={{
          height: '100%',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column-reverse',
          scrollbarWidth: 'none', /* For Firefox */
        }}
        className="no-scrollbar"
      >
        <InfiniteScroll
          dataLength={displayedMessages.length}
          next={loadMoreMessages}
          hasMore={hasMore}
          loader={<h4 className="text-white">Loading...</h4>}
          scrollableTarget="scrollableDiv"
          inverse={true}
        >
          {displayedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <img className='w-20 h-20 mb-2' src={welcomeIcon} alt="Welcome Icon" />
              <p>How can I help you today?</p>
            </div>
          ) : (
            displayedMessages.map((message) => {
              const isQuestionAnswer = 'question' in message && 'answer' in message;
              const isLiveChat = 'role' in message && 'content' in message;

              return (
                <div key={message.id} className="mb-4">
                  {isQuestionAnswer && (
                    <>
                      <div className="flex items-start mb-2 justify-end">
                        <div className="flex flex-col items-end">
                          <img src={userProfileImage} alt="User" className="w-8 h-8 rounded-full mr-2" />
                          <div className="bg-gray-600 text-white p-3 rounded-lg">
                            <strong>{firstName}:</strong> {message.question}
                            <div className="text-gray-400 text-sm flex justify-end">
                              {formatDate(message.questionCreatedAt || '')}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start mb-2">
                        <img src={defaultAiImage} alt="AI" className="w-8 h-8 rounded-full mr-2" />
                        <div className="bg-gray-700 text-white p-3 rounded-lg">
                          <strong>AI:</strong> {message.answer}
                          <div className="text-gray-400 text-sm flex justify-end">
                            {formatDate(message.answerCreatedAt || '')}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {isLiveChat && (
                    <div className={`flex items-start mb-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start p-3 rounded-lg ${message.role === 'user' ? 'bg-gray-500 text-white' : 'bg-gray-700 text-white'}`}>
                        <img src={message.role === 'user' ? userProfileImage : defaultAiImage} alt={message.role === 'user' ? 'User' : 'AI'} className="w-8 h-8 rounded-full mr-2" />
                        <div>
                          <strong>{message.role === 'user' ? firstName : 'AI'}:</strong> {message.content}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default MessageList;

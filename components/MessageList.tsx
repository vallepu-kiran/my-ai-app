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
  questionCreatedAt?: string;
  answerCreatedAt?: string;
  chatId?: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, userName, userProfileImage, chatId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [visibleMessages, setVisibleMessages] = useState<CoreMessage[]>([]);
  const [initialRender, setInitialRender] = useState(true);

  useEffect(() => {
    setVisibleMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (initialRender) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      setInitialRender(false);
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [visibleMessages]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
                    {/* User Question on the right */}
                    <div className="flex items-start mb-2 justify-end">
                      <div className="flex flex-col items-end">
                        <img
                          src={userProfileImage}
                          alt="User"
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <div className="bg-gray-600 text-white p-3 rounded-lg">
                          <strong>{firstName}:</strong> {question}
                          <div className="text-gray-400 text-sm flex justify-end">
                            {formatDate(message.questionCreatedAt || '')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Response on the left */}
                    <div className="flex items-start mb-2">
                      <img
                        src={defaultAiImage}
                        alt="AI"
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div className="bg-gray-700 text-white p-3 rounded-lg">
                        <strong>AI:</strong> {answer}
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
                      <img
                        src={message.role === 'user' ? userProfileImage : defaultAiImage}
                        alt={message.role === 'user' ? 'User' : 'AI'}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div>
                        <strong>{message.role === 'user' ? firstName : 'AI'}:</strong> {content}
                      </div>
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


// // import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
// // import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

// // interface MessageListProps {
// //   chatId: string;
// //   userName: string;
// //   userProfileImage: string;
// // }

// // interface CoreMessage {
// //   id: number | null;
// //   localId?: string;
// //   role: 'user' | 'assistant';
// //   content: string;
// //   createdAt: string;
// //   delivered: boolean;
// // }

// // interface MessageListContext {
// //   loadingNewer: boolean;
// //   channel: ChatChannel;
// // }

// // class ChatChannel {
// //   name: string;
// //   messages: CoreMessage[];
// //   loaded: boolean;
// //   currentUser: string;
// //   onNewMessages: ((messages: CoreMessage[]) => void) | null;

// //   constructor(name: string, userName: string) {
// //     this.name = name;
// //     this.messages = [];
// //     this.loaded = false;
// //     this.currentUser = userName;
// //     this.onNewMessages = null;
// //   }

// //   async getMessages({ limit, before }: { limit: number; before?: number }): Promise<CoreMessage[] | null> {
// //     // Simulating API call
// //     await new Promise(resolve => setTimeout(resolve, 1000));
// //     const newMessages: CoreMessage[] = [];
// //     for (let i = 0; i < limit; i++) {
// //       newMessages.push({
// //         id: before ? before - i - 1 : this.messages.length + i + 1,
// //         role: Math.random() > 0.5 ? 'user' : 'assistant',
// //         content: `Message ${before ? before - i : this.messages.length + i + 1}`,
// //         createdAt: new Date().toISOString(),
// //         delivered: true
// //       });
// //     }
// //     this.loaded = true;
// //     return newMessages;
// //   }

// //   sendOwnMessage(): CoreMessage {
// //     const tempMessage: CoreMessage = {
// //       id: null,
// //       localId: `local-${Date.now()}`,
// //       role: 'user',
// //       content: 'New message',
// //       createdAt: new Date().toISOString(),
// //       delivered: false
// //     };
// //     setTimeout(() => {
// //       const deliveredMessage = { ...tempMessage, id: Date.now(), delivered: true };
// //       this.onNewMessages?.([deliveredMessage]);
// //     }, 1000);
// //     return tempMessage;
// //   }

// //   createNewMessageFromAnotherUser(): void {
// //     const newMessage: CoreMessage = {
// //       id: Date.now(),
// //       role: 'assistant',
// //       content: 'New message from assistant',
// //       createdAt: new Date().toISOString(),
// //       delivered: true
// //     };
// //     this.onNewMessages?.([newMessage]);
// //   }
// // }

// // const MessageList: React.FC<MessageListProps> = ({ chatId, userName, userProfileImage }) => {
// //   const channel = useMemo(() => new ChatChannel(chatId, userName), [chatId, userName]);
// //   const messageListRef = useRef<VirtuosoHandle>(null);
// //   const [loadingNewer, setLoadingNewer] = useState(false);
// //   const [messages, setMessages] = useState<CoreMessage[]>([]);
// //   const firstMessageId = useRef<number | null>(null);

// //   useEffect(() => {
// //     channel.onNewMessages = (newMessages) => {
// //       setMessages(prevMessages => [...prevMessages, ...newMessages]);
// //     };

// //     if (!channel.loaded) {
// //       channel.getMessages({ limit: 100 })
// //         .then((newMessages) => {
// //           if (newMessages !== null) {
// //             firstMessageId.current = newMessages[0].id;
// //             setMessages(newMessages);
// //           }
// //         })
// //         .catch((error) => {
// //           console.error(error);
// //         });
// //     }
// //   }, [channel]);

// //   const onScroll = useCallback(
// //     (event: React.UIEvent<HTMLElement>) => {
// //       const target = event.target as HTMLDivElement;
// //       if (target.scrollTop < 100 && !loadingNewer && firstMessageId.current) {
// //         setLoadingNewer(true);
// //         channel.getMessages({ limit: 20, before: firstMessageId.current })
// //           .then((newMessages) => {
// //             if (newMessages !== null) {
// //               firstMessageId.current = newMessages[0].id;
// //               setMessages(prevMessages => [...newMessages, ...prevMessages]);
// //               setLoadingNewer(false);
// //             }
// //           })
// //           .catch((error) => {
// //             console.error(error);
// //           });
// //       }
// //     },
// //     [channel, loadingNewer]
// //   );

// //   const ItemContent: React.FC<{ index: number; data: CoreMessage }> = ({ data: message }) => {
// //     const ownMessage = channel.currentUser === userName && message.role === 'user';
// //     return (
// //       <div className={`flex items-start mb-2 ${ownMessage ? 'justify-end' : 'justify-start'}`}>
// //         <div className={`flex items-start p-3 rounded-lg ${ownMessage ? 'bg-gray-500 text-white' : 'bg-gray-700 text-white'}`}>
// //           <img
// //             src={ownMessage ? userProfileImage : "https://preview.redd.it/f8fchc9lepx51.jpg?auto=webp&s=17d0cbdb13ac08582b84c41167697859712cfa5b"}
// //             alt={ownMessage ? 'User' : 'AI'}
// //             className="w-8 h-8 rounded-full mr-2"
// //           />
// //           <div>
// //             <strong>{ownMessage ? userName.split(' ')[0] : 'AI'}:</strong> {message.content}
// //             <div className="text-gray-400 text-sm flex justify-end">
// //               {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// //             </div>
// //           </div>
// //         </div>
// //         {!message.delivered && <div className="text-gray-400 text-sm">Delivering...</div>}
// //       </div>
// //     );
// //   };

// //   const Header: React.FC = () => (
// //     <div className="h-8 flex items-center justify-center">
// //       {loadingNewer ? 'Loading...' : ''}
// //     </div>
// //   );

// //   return (
// //     <div className="flex flex-col h-full">
// //       <Virtuoso
// //         data={messages}
// //         totalCount={messages.length}
// //         followOutput="smooth"
// //         alignToBottom
// //         atBottomStateChange={(atBottom: boolean) => {
// //           if (atBottom) {
// //             // Handle reaching the bottom if needed
// //           }
// //         }}
// //         onScroll={onScroll}
// //         itemContent={(index, message) => <ItemContent index={index} data={message} />}
// //         components={{
// //           Header,
// //           EmptyPlaceholder: () => (
// //             <div className="flex flex-col items-center justify-center h-full text-gray-500">
// //               {!channel.loaded ? 'Loading...' : (
// //                 <>
// //                   <img className='w-20 h-20 mb-2' src='https://n8n.io/_nuxt/image/928f9a.svg' alt="Welcome Icon" />
// //                   <p>How can I help you today?</p>
// //                 </>
// //               )}
// //             </div>
// //           )
// //         }}
// //         style={{ flex: 1 }}
// //         ref={messageListRef}
// //       />
// //       <div className="flex gap-4 p-4 justify-end">
// //         <button
// //           className="px-4 py-2 bg-blue-500 text-white rounded"
// //           onClick={() => {
// //             const tempMessage = channel.sendOwnMessage();
// //             setMessages(prevMessages => [...prevMessages, tempMessage]);
// //           }}
// //         >
// //           Send
// //         </button>
// //         <button
// //           className="px-4 py-2 bg-green-500 text-white rounded"
// //           onClick={() => {
// //             channel.createNewMessageFromAnotherUser();
// //           }}
// //         >
// //           Receive
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default MessageList;
// import React from 'react';
// import { Virtuoso } from 'react-virtuoso';

// interface CoreMessage {
//   role?: 'user' | 'assistant';
//   content?: string;
//   questionCreatedAt?: string;
//   answerCreatedAt?: string;
// }

// interface MessageListProps {
//   messages: CoreMessage[];
//   userName: string;
//   userProfileImage: string;
// }

// const MessageList: React.FC<MessageListProps> = ({ messages, userName, userProfileImage }) => {
//   // Function to format date
//   const formatDate = (dateString?: string) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   // Render message items
//   const ItemContent: React.FC<{ message: CoreMessage }> = ({ message }) => {
//     const isUser = message.role === 'user';
//     return (
//       <div className={`flex items-start mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
//         <div className={`flex items-start p-3 rounded-lg ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'}`}>
//           <img
//             src={isUser ? userProfileImage : "https://preview.redd.it/f8fchc9lepx51.jpg?auto=webp&s=17d0cbdb13ac08582b84c41167697859712cfa5b"}
//             alt={isUser ? 'User' : 'Assistant'}
//             className="w-8 h-8 rounded-full mr-2"
//           />
//           <div>
//             <strong>{isUser ? userName : 'Assistant'}:</strong> {message.content}
//             <div className="text-gray-400 text-sm">
//               {message.questionCreatedAt 
//                 ? formatDate(message.questionCreatedAt) 
//                 : formatDate(message.answerCreatedAt)}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex flex-col h-full">
//       {messages.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-full text-gray-500">
//           <p>No messages yet. Start the conversation!</p>
//         </div>
//       ) : (
//         <Virtuoso
//           data={messages}
//           itemContent={(index, message) => <ItemContent key={index} message={message} />}
//           style={{ flex: 1 }}
//         />
//       )}
//     </div>
//   );
// };

// export default MessageList;

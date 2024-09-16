import React from 'react';

interface SidebarProps {
  chats: { id: string; title: string }[]; // Array of chats
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ chats = [], onSelectChat, onNewChat }) => {
  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <header className="p-4 bg-gray-900 flex items-center justify-between">
        <h2 className="text-lg font-bold">Chats</h2>
        <button
          onClick={onNewChat}
          className="bg-blue-600 px-2 py-1 rounded-md hover:bg-blue-700 transition duration-200"
        >
          New Chat
        </button>
      </header>
      <ul className="flex-1 overflow-auto">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <li
              key={chat.id}
              className="p-4 cursor-pointer hover:bg-gray-700"
              onClick={() => onSelectChat(chat.id)}
            >
              {chat.title}
            </li>
          ))
        ) : (
          <li className="p-4 text-gray-400">No chats available</li>
        )}
      </ul>

      
    </aside>
  );
};

export default Sidebar;

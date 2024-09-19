import React from 'react';

interface MessageInputFormProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean; 
}

const MessageInputForm: React.FC<MessageInputFormProps> = ({
  input,
  setInput,
  isListening,
  startListening,
  stopListening,
  onSubmit
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-gray-700 border-t border-gray-300 p-2 flex items-center"
    >
      <input
        className="flex-1 p-2  bg-gray-600 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
        value={input}
        placeholder="Message AI"
        onChange={e => setInput(e.target.value)}
        aria-label="Type your message"
      />
      <div className="flex items-center space-x-2 ml-2">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`bg-gray-600 text-black rounded-2xl shadow-sm h-8 w-8 flex items-center justify-center hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${isListening ? 'animate-blink' : ''}`}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" x2="12" y1="19" y2="22"></line>
          </svg>
        </button>
        <button
          type="submit"
          className="bg-gray-600 text-black h-8 w-8 rounded-2xl shadow-sm flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Send message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="m3 3 3 9-3 9 19-9Z"></path>
            <path d="M6 12h16"></path>
          </svg>
        </button>
      </div>
    </form>
  );
};

export default MessageInputForm;

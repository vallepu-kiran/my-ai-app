import { createOllama } from 'ollama-ai-provider';
import { streamText, convertToCoreMessages, StreamData, tool } from 'ai';
import { z } from 'zod';

// Create an instance of Ollama with the desired configuration
const ollama = createOllama({
  // Add your configuration options here if needed
});

// Define the streaming model
const streamingModel = ollama('llama3.1');

// Define tools (e.g., weather tool for demo)
const weatherTool = tool({
  description: 'Get the weather in a location',
  parameters: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async ({ location }) => ({
    location,
    temperature: 72 + Math.floor(Math.random() * 21) - 10, // Mock temperature
  }),
});

// Define the message schema (adjusted for your table structure)
const messageSchema = z.array(z.object({
  id: z.number().optional(),  // Message ID
  question: z.string().optional(), // User's input
  answer: z.string().optional(),  // AI response
}));

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate messages using the adjusted schema
    messageSchema.parse(messages);

    if (!messages || messages.length === 0) {
      throw new Error('Messages are required.');
    }

    // Handle streaming data
    const data = new StreamData();

    // Map the input messages to the correct format expected by the AI model
    const coreMessages = messages.map((msg: any) => {
      if (msg.question) {
        return { role: 'user', content: msg.question };
      } else if (msg.answer) {
        return { role: 'assistant', content: msg.answer };
      }
      return null;
    }).filter(Boolean);  // Filter out nulls

    // Stream text using the Ollama model and handle streaming responses
    const result = await streamText({
      model: streamingModel,
      tools: {
        weather: weatherTool,
      },
      messages: coreMessages,  // Use the mapped messages
      onFinish() {
        data.close();
      },
    });

    return result.toDataStreamResponse({ data });
  } catch (error) {
    console.error('Error processing request:', error);
    // Check if error is from Zod validation
    if (error instanceof z.ZodError) {
      return new Response(`Invalid data: ${error.message}`, { status: 400 });
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}

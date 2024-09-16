//chat routes in frontend
import { createOllama } from 'ollama-ai-provider';
import { streamText, convertToCoreMessages, StreamData, tool } from 'ai';
import { z } from 'zod';

// Create an instance of Ollama with the desired configuration
const ollama = createOllama({
  // Add your configuration options here if needed
});

// Define the streaming model
const streamingModel = ollama('llama3.1');

// Define tools
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

export async function POST(req: Request) {
  try {
    const { messages, embeddingPrompt } = await req.json();

    if (!messages) {
      throw new Error('Messages are required.');
    }

    // Handle streaming data
    const data = new StreamData();
    
    // Stream text using the Ollama model and handle streaming responses
    const result = await streamText({
      model: streamingModel,
      tools: {
        weather: weatherTool, // Add your tool here
      },
      messages: convertToCoreMessages(messages),
      onFinish() {
        data.close();
      },
    });

    return result.toDataStreamResponse({ data });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

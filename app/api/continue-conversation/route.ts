// app/api/continue-conversation/route.ts

import { NextResponse } from 'next/server';
import { continueConversation } from '@/app/actions'; 

export async function POST(request: Request) {
  const { messages } = await request.json();
  const result = await continueConversation(messages);
  return NextResponse.json(result);
}

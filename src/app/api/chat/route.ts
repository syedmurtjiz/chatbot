import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  // Get Supabase session/user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Store user message in Supabase
  const { data: userMessage, error: userMessageError } = await supabase
    .from('messages')
    .insert([
      { user_id: user.id, text: message, is_bot: false }
    ])
    .select();

  if (userMessageError) {
    console.error('Error saving user message:', userMessageError);
  } else {
    console.log('User message saved:', userMessage);
  }

  // Call Claude (Anthropic) API
  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.CLAUDE_API_KEY!,   // Use your Claude API key
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',          // Required version header
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022', // or another Claude model
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    }),
  });

  const anthropicData = await anthropicRes.json();
  console.log('Claude API response:', anthropicData);

  const botReply =
    anthropicData.content?.[0]?.text || 'Sorry, no reply.';

  // Store bot reply in Supabase
  const { data: botMessage, error: botMessageError } = await supabase
    .from('messages')
    .insert([
      { user_id: user.id, text: botReply, is_bot: true }
    ])
    .select();

  if (botMessageError) {
    console.error('Error saving bot message:', botMessageError);
  } else {
    console.log('Bot message saved:', botMessage);
  }

  return NextResponse.json({ reply: botReply });
}

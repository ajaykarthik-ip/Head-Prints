import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    
    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Try both environment variable names
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('GEMINI')));
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Simple system prompt for Gemini-like assistant
    const systemPrompt = `You are a helpful, smart, and conversational AI assistant similar to Google's Gemini. You should:

- Be friendly, informative, and engaging
- Provide accurate and helpful responses
- Explain complex topics clearly
- Help with various tasks like writing, analysis, coding, math, and general questions
- Be concise but thorough when needed
- Show personality while remaining professional
- Ask clarifying questions when helpful

Respond naturally and conversationally.`;

    // Prepare the API request
    const requestBody = {
      contents: [
        {
          parts: [
            { text: `${systemPrompt}\n\nUser: ${message}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    // Make request to Gemini API - FIXED: Use correct model name
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to get response from Gemini',
        details: errorData.error?.message || `HTTP ${response.status}`
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Extract the AI response
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiMessage) {
      console.error('No message in Gemini response:', data);
      return NextResponse.json({ 
        error: 'No response generated from Gemini' 
      }, { status: 500 });
    }

    return NextResponse.json({
      message: aiMessage.trim(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Sorry, I encountered an error. Please try again.'
    }, { status: 500 });
  }
}
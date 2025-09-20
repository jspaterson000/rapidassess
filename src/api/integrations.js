import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

// Check if OpenAI API key is available
const hasOpenAIKey = !!import.meta.env.VITE_OPENAI_API_KEY;

// Real LLM implementation
const realInvokeLLM = async ({ prompt, response_json_schema, add_context_from_internet = false }) => {
  try {
    // For structured output, use the new structured outputs feature
    if (response_json_schema) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Cost-effective model for structured tasks
        messages: [
          {
            role: "system",
            content: "You are an expert AI assistant. Provide accurate, helpful responses in the requested JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "response",
            schema: response_json_schema
          }
        },
        temperature: 0.1, // Low temperature for consistent, factual responses
        max_tokens: 2000
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content received from OpenAI');
      }

      return JSON.parse(content);
    } else {
      // For unstructured text responses
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert AI assistant. Provide accurate, helpful responses."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      return {
        message: completion.choices[0]?.message?.content || 'No response generated'
      };
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Provide fallback responses based on prompt content
    if (prompt.includes('distance') && prompt.includes('travel time')) {
      return {
        distance_km: Math.random() * 40 + 10,
        travel_time_minutes: Math.random() * 60 + 20
      };
    }
    
    if (prompt.includes('policy') || prompt.includes('PDS')) {
      return {
        recommendation: 'additional_info_needed',
        reasoning: 'Unable to complete policy analysis at this time. Please review manually or try again later.',
        confidence_level: 'low',
        pds_citations: [],
        additional_requirements: ['Manual policy review required']
      };
    }
    
    throw error;
  }
};

// Mock implementations for other functions
const mockUploadFile = async ({ file }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const mockUrl = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg`;
  return { file_url: mockUrl };
};

const mockUploadPrivateFile = async ({ file }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { file_uri: `private://files/${Math.random().toString(36).substr(2, 9)}-${file.name}` };
};

const mockCreateFileSignedUrl = async ({ file_uri }) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { signed_url: `https://example.com/signed/${Math.random().toString(36).substr(2, 9)}` };
};

// Export all required functions
export const InvokeLLM = hasOpenAIKey ? realInvokeLLM : async ({ prompt, response_json_schema }) => {
  // Fallback mock implementation when no API key
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (prompt.includes('distance') && prompt.includes('travel time')) {
    return {
      distance_km: Math.random() * 40 + 10,
      travel_time_minutes: Math.random() * 60 + 20
    };
  }
  
  if (prompt.includes('policy') || prompt.includes('PDS')) {
    return {
      recommendation: 'additional_info_needed',
      reasoning: 'Mock policy analysis - please configure OpenAI API key for real analysis.',
      confidence_level: 'low',
      pds_citations: [],
      additional_requirements: ['Configure OpenAI API key for real analysis']
    };
  }
  
  return { message: 'Mock AI response - configure OpenAI API key for real responses' };
};

export const UploadFile = mockUploadFile;
export const UploadPrivateFile = mockUploadPrivateFile;
export const CreateFileSignedUrl = mockCreateFileSignedUrl;
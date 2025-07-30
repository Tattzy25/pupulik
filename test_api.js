// Quick test script for Groq API integration
const axios = require('axios');
require('react-native-config');

async function testGroqAPI() {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    console.error('❌ Please set your actual GROQ_API_KEY in .env file');
    return;
  }

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.2-11b-vision-preview',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Is this image safe for work? Respond with only "SAFE" or "EXPLICIT"'
          },
          {
            type: 'image_url',
            image_url: {
              url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/AB8A'
            }
          }
        ]
      }],
      max_tokens: 10
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Groq API test successful:', response.data.choices[0].message.content);
  } catch (error) {
    console.error('❌ Groq API test failed:', error.response?.data || error.message);
  }
}

// Run test
testGroqAPI();
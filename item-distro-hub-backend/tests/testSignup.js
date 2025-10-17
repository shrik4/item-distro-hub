import fetch from 'node-fetch';

const signup = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Body:', data);
  } catch (error) {
    console.error('Error during signup:', error);
  }
};

signup();
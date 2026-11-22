const fetch = globalThis.fetch;

async function test() {
  try {
    const response = await fetch('http://localhost:5000/api/v1/health', {
      method: 'GET'
    });
    
    const data = await response.json();
    console.log('Health Status:', response.status);
    console.log('Health Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
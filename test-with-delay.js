const fetch = globalThis.fetch;

async function test() {
  try {
    console.log('Sending request to health endpoint...');
    const response = await fetch('http://localhost:5000/api/v1/health', {
      method: 'GET'
    });
    
    const data = await response.json();
    console.log('Health Status:', response.status);
    console.log('Health Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
  }
  
  // Wait to see server logs
  await new Promise(r => setTimeout(r, 5000));
  console.log('Test completed');
}

test();
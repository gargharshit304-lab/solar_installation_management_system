const fetch = globalThis.fetch;

async function test() {
  try {
    const response = await fetch('http://localhost:5000/api/v1/health', {
      method: 'GET'
    });
    
    const data = await response.json();
    console.log('Health Status:', response.status);
    console.log('Health Response:', JSON.stringify(data, null, 2));
    
    // Wait a bit to see if logs appear
    await new Promise(r => setTimeout(r, 2000));
    console.log('Test completed, check server console now');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
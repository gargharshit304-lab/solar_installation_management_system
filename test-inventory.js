const fetch = globalThis.fetch;

async function test() {
  try {
    const response = await fetch('http://localhost:5000/api/v1/inventory', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    const data = await response.json();
    console.log('Inventory Status:', response.status);
    console.log('Inventory Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
const fetch = globalThis.fetch;

async function test() {
  try {
    const response = await fetch('http://localhost:5000/api/v1/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        fullName: 'Test Employee',
        employeeCode: 'EMP-999',
        email: 'test@sunpowersolutions.in',
        phone: '+91 99999 99999',
        department: 'Installation & Commissioning',
        designation: 'Test Engineer',
        role: 'install_tech',
        hourlyRate: 250
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
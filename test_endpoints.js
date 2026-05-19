const axios = require('axios');

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  await wait(2000); // Wait for servers to start
  console.log('--- STARTING TESTS ---');
  try {
    console.log('1. Testing GET Profile for demo user (ID 1)...');
    const pRes = await axios.get('http://localhost:3003/profile/1');
    console.log('Profile (ID 1):', pRes.data);

    console.log('\n2. Testing Register...');
    const rRes = await axios.post('http://localhost:3001/register', {
      correoElectronico: 'test@ajedrez.com',
      contrasena: '123456',
      nombreUsuario: 'testuser'
    });
    console.log('Register Response:', rRes.data);

    console.log('\n3. Testing Login for new user...');
    const lRes = await axios.post('http://localhost:3002/login', {
      correoElectronico: 'test@ajedrez.com',
      contrasena: '123456'
    });
    console.log('Login Response:', lRes.data);
    
    console.log('\n4. Testing Profile for new user (ID ' + lRes.data.usuarioId + ')...');
    const pRes2 = await axios.get(`http://localhost:3003/profile/${lRes.data.usuarioId}`);
    console.log('Profile Response:', pRes2.data);

    console.log('\n--- ALL TESTS PASSED SUCCESSFULLY! ---');
  } catch(e) {
    console.error('Test error:', e.response ? e.response.data : e.message);
  }
}

run();

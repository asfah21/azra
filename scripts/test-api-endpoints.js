// scripts/test-api-endpoints.js
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testRoleAPI() {
  console.log('🧪 Testing Role API Endpoints...\n');
  
  try {
    // Test GET /api/roles
    console.log('📋 Testing GET /api/roles');
    const rolesResponse = await fetch(`${API_BASE}/roles`, {
      headers: {
        'Cookie': 'your-session-cookie-here' // Note: Dalam production perlu session yang valid
      }
    });
    
    if (rolesResponse.ok) {
      const roles = await rolesResponse.json();
      console.log(`✅ GET /api/roles - Success (${roles.length} roles found)`);
      console.log('   Roles:', roles.map(r => `${r.name} (${r.code})`).join(', '));
    } else {
      console.log(`❌ GET /api/roles - Failed (${rolesResponse.status})`);
      const error = await rolesResponse.text();
      console.log('   Error:', error);
    }

    // Test POST /api/roles (akan gagal karena tidak ada session)
    console.log('\n🆕 Testing POST /api/roles');
    const createResponse = await fetch(`${API_BASE}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: 'test_role',
        name: 'Test Role',
        description: 'Test role for API testing',
        color: 'info',
        priority: 99
      })
    });
    
    console.log(`📝 POST /api/roles - Status: ${createResponse.status}`);
    const createResult = await createResponse.text();
    console.log('   Response:', createResult);

    console.log('\n🎉 API endpoints structure test completed!');
    console.log('💡 Note: Authentication errors are expected without valid session');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRoleAPI();

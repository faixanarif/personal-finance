/**
 * Automated Verification Script for Personal Finance Express API with Live MySQL
 */

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🚀 Starting Automated MySQL Backend API Verification...\n');
  let passCount = 0;
  let failCount = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passCount++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failCount++;
    }
  };

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthJson = await healthRes.json();
    assert(
      healthRes.status === 200 && healthJson.status === 'healthy' && healthJson.database === 'personalfinancedb',
      'GET /api/health returns 200 healthy and connects to personalfinancedb'
    );

    // 2. Demo User Login
    const demoLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@finance.io', password: 'password123' }),
    });
    const demoLoginJson = await demoLoginRes.json();
    assert(demoLoginRes.status === 200 && demoLoginJson.token, 'POST /api/auth/login succeeds for MySQL demo user');

    // 3. Register a New User into MySQL
    const testEmail = `mysql_user_${Date.now()}@apexcapital.io`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ElenaRostova',
        email: testEmail,
        password: 'securePassword99!',
      }),
    });
    const regJson = await regRes.json();
    assert(
      regRes.status === 201 && regJson.token && regJson.user.email === testEmail && typeof regJson.user.id === 'number',
      'POST /api/auth/register inserts row into MySQL users table and returns auto-increment ID'
    );
    const userToken = regJson.token;
    const userId = regJson.user.id;

    // 4. Duplicate Registration Guard
    const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ElenaRostova',
        email: testEmail,
        password: 'securePassword99!',
      }),
    });
    assert(dupRes.status === 400, 'POST /api/auth/register rejects duplicate email with 400 Bad Request');

    // 5. Invalid Login Guard
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'wrongPassword123' }),
    });
    assert(badLoginRes.status === 401, 'POST /api/auth/login rejects wrong password with 401 Unauthorized');

    // 6. Protected Endpoint without Token
    const unauthRes = await fetch(`${BASE_URL}/api/auth/me`);
    assert(unauthRes.status === 401, 'GET /api/auth/me without token returns 401 Unauthorized');

    // 7. Protected Endpoint with Token
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const meJson = await meRes.json();
    assert(meRes.status === 200 && meJson.user.email === testEmail, 'GET /api/auth/me with Bearer token returns profile');

    // 8. Create Income/Credit Transaction in MySQL
    const today = new Date().toISOString().split('T')[0];
    const incRes = await fetch(`${BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        title: 'Institutional Advisory Fee',
        amount: 8500.00,
        type: 'income',
        category: 'Consulting',
        date: today,
      }),
    });
    const incJson = await incRes.json();
    assert(
      incRes.status === 201 && incJson.data.id && incJson.data.amount === 8500,
      'POST /api/transactions inserts Credit row into MySQL transactions table'
    );
    const createdTxId = incJson.data.id;

    // 9. Create Expense/Debit Transaction in MySQL
    const expRes = await fetch(`${BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        title: 'Compute GPU Cluster Lease',
        amount: 1500.00,
        type: 'expense',
        category: 'Cloud Services',
        date: today,
      }),
    });
    const expJson = await expRes.json();
    assert(
      expRes.status === 201 && (expJson.data.type === 'debit' || expJson.data.type === 'expense'),
      'POST /api/transactions inserts Debit row into MySQL transactions table'
    );

    // 10. Fetch User Transactions scoped to req.user.id
    const listRes = await fetch(`${BASE_URL}/api/transactions`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const listJson = await listRes.json();
    assert(listRes.status === 200 && listJson.data.length === 2, 'GET /api/transactions fetches rows scoped to MySQL user_id');

    // 11. Dashboard Summary with MySQL conditional aggregation
    const summaryRes = await fetch(`${BASE_URL}/api/dashboard/summary`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const summaryJson = await summaryRes.json();
    assert(
      summaryRes.status === 200 &&
      summaryJson.data.totalBalance === 7000.00 &&
      summaryJson.data.monthlyIncome === 8500.00 &&
      summaryJson.data.monthlyExpenses === 1500.00 &&
      summaryJson.data.savingsRate > 0.8,
      'GET /api/dashboard/summary aggregates total balance (7000), monthly income (8500), and expenses (1500) via MySQL COALESCE/SUM'
    );

    // 12. Delete Transaction from MySQL
    const delRes = await fetch(`${BASE_URL}/api/transactions/${createdTxId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(delRes.status === 200, 'DELETE /api/transactions/:id successfully deletes row from MySQL');

    // 13. Verify deletion in count
    const afterDelRes = await fetch(`${BASE_URL}/api/transactions`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const afterDelJson = await afterDelRes.json();
    assert(afterDelJson.data.length === 1, 'GET /api/transactions confirms row removed from MySQL table');

    console.log(`\n========================================`);
    console.log(`Results: ${passCount} passed, ${failCount} failed.`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

runTests();

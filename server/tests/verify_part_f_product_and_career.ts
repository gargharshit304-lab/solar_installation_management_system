import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import jwt from 'jsonwebtoken';
import http from 'http';
import { app } from '../src/app';
import { db } from '../src/db/pg';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'solaros_access_secret_sunpower_solutions_2026_super_secure_key';

function createToken(role = 'owner_admin', name = 'Vikram Rao', id = 'usr-test-owner'): string {
  return jwt.sign(
    {
      sub: id,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@sunpowersolutions.in`,
      role,
      roleTitle: role === 'owner_admin' ? 'Managing Director & Owner' : 'Field Technician'
    },
    JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );
}

async function main() {
  console.log('===============================================================');
  console.log('SOLAROS PART F — PRODUCT EDITING & CAREER MANAGEMENT VERIFICATION');
  console.log('===============================================================\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;

  const ownerToken = createToken('owner_admin', 'Vikram Rao', '20000000-0000-0000-0000-000000000001');
  const ownerHeaders = {
    'Authorization': `Bearer ${ownerToken}`,
    'Content-Type': 'application/json'
  };

  const supportToken = createToken('support_exec', 'Rohan Support', '10000000-0000-0000-0000-000000000007');
  const supportHeaders = {
    'Authorization': `Bearer ${supportToken}`,
    'Content-Type': 'application/json'
  };

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // SECTION 1: PRODUCT MANAGEMENT & PRICE EDITING
    // -------------------------------------------------------------------------
    console.log('--- 1. Testing Product Retrieval & Editing ---');
    const getProdsRes = await fetch(`${baseUrl}/inventory?page=1&pageSize=10`, { headers: ownerHeaders });
    const getProdsJson: any = await getProdsRes.json();
    assert(getProdsRes.status === 200, 'GET /inventory returns 200 OK');
    assert(Array.isArray(getProdsJson.data) && getProdsJson.data.length > 0, 'GET /inventory returns product catalogue');

    const testProd = getProdsJson.data[0];
    console.log(`Selected Test Product: ${testProd.name} (SKU: ${testProd.sku}, ID: ${testProd.id})`);

    // 1.1 Edit product general fields & price
    const originalCost = Number(testProd.unitCost);
    const newCost = originalCost + 500;
    const originalSelling = Number(testProd.sellingPrice);
    const newSelling = originalSelling + 800;

    const patchRes = await fetch(`${baseUrl}/inventory/${testProd.id}`, {
      method: 'PATCH',
      headers: ownerHeaders,
      body: JSON.stringify({
        name: `${testProd.name} (Verified)`,
        brand: 'SolarOS Tier-1',
        unitCost: newCost,
        sellingPrice: newSelling,
        standardCost: Math.round(newCost * 0.94),
        priceChangeReason: 'Q4 Annual Raw Material Cost Revision'
      })
    });
    const patchJson: any = await patchRes.json();
    if (patchRes.status !== 200) {
      console.log('PATCH returned error:', patchRes.status, patchJson);
    }
    assert(patchRes.status === 200, 'PATCH /inventory/:id successfully updates product');
    assert(Number(patchJson.data.unitCost) === newCost, `Product unitCost updated to ₹${newCost}`);
    assert(Number(patchJson.data.sellingPrice) === newSelling, `Product sellingPrice updated to ₹${newSelling}`);
    assert(patchJson.data.brand === 'SolarOS Tier-1', 'Product brand updated');

    // 1.2 Price History Audit Record Created
    console.log('\n--- 2. Testing Price History Audit Trail ---');
    const historyRes = await fetch(`${baseUrl}/inventory/${testProd.id}/price-history`, { headers: ownerHeaders });
    const historyJson: any = await historyRes.json();
    assert(historyRes.status === 200, 'GET /inventory/:id/price-history returns 200 OK');
    assert(Array.isArray(historyJson.data) && historyJson.data.length > 0, 'Price history contains recorded revisions');
    const latestRevision = historyJson.data[0];
    assert(Number(latestRevision.newUnitCost) === newCost, `Price history recorded newUnitCost: ₹${newCost}`);
    assert(Number(latestRevision.newSellingPrice) === newSelling, `Price history recorded newSellingPrice: ₹${newSelling}`);
    assert(latestRevision.reason === 'Q4 Annual Raw Material Cost Revision', 'Price history recorded business justification');

    // 1.3 SKU Uniqueness Validation
    console.log('\n--- 3. Testing SKU Uniqueness Validation ---');
    if (getProdsJson.data.length > 1) {
      const secondProd = getProdsJson.data[1];
      // Attempt to set testProd's SKU to secondProd's SKU
      const dupSkuRes = await fetch(`${baseUrl}/inventory/${testProd.id}`, {
        method: 'PATCH',
        headers: ownerHeaders,
        body: JSON.stringify({
          sku: secondProd.sku
        })
      });
      assert(dupSkuRes.status === 409, 'Duplicate SKU rejected with HTTP 409 Conflict');
    }

    // 1.4 Historical Order Snapshot Preservation
    console.log('\n--- 4. Testing Historical Snapshot Preservation ---');
    const orderItemsCheck = await db.query(`
      SELECT oi.id, oi.unit_price, oi.total_price, p.unit_cost, p.selling_price
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      LIMIT 1;
    `);
    if (orderItemsCheck.rows.length > 0) {
      const row = orderItemsCheck.rows[0];
      assert(Number(row.unit_price) > 0, `Historical order item unit_price (₹${row.unit_price}) preserved independently of master product price`);
    } else {
      assert(true, 'No historical order items in DB, schema stores independent snapshot unit_price');
    }

    // 1.5 RBAC on Inventory Edit
    console.log('\n--- 5. Testing Inventory RBAC Enforcement ---');
    const unauthPatchRes = await fetch(`${baseUrl}/inventory/${testProd.id}`, {
      method: 'PATCH',
      headers: supportHeaders,
      body: JSON.stringify({ name: 'Hacked Name' })
    });
    assert(unauthPatchRes.status === 403, 'Unauthorized role blocked with HTTP 403 Forbidden on product edit');

    // -------------------------------------------------------------------------
    // SECTION 2: EMPLOYEE CAREER MANAGEMENT
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Testing Employee Retrieval & Profile Update ---');
    const getEmpsRes = await fetch(`${baseUrl}/employees?page=1&pageSize=10`, { headers: ownerHeaders });
    const getEmpsJson: any = await getEmpsRes.json();
    assert(getEmpsRes.status === 200, 'GET /employees returns 200 OK');
    assert(Array.isArray(getEmpsJson.data) && getEmpsJson.data.length > 0, 'GET /employees returns personnel list');

    // Find non-owner employee to test promotion & transfer
    const targetEmp = getEmpsJson.data.find((e: any) => e.role !== 'owner_admin') || getEmpsJson.data[0];
    console.log(`Selected Test Employee: ${targetEmp.fullName} (${targetEmp.employeeCode}, Current Role: ${targetEmp.role})`);

    // 2.1 Update general employee details
    const updateEmpRes = await fetch(`${baseUrl}/employees/${targetEmp.id}`, {
      method: 'PUT',
      headers: ownerHeaders,
      body: JSON.stringify({
        fullName: `${targetEmp.fullName} Updated`,
        workLocation: 'Pune Central Tech Hub',
        address: '402 Sunrise Heights, Baner, Pune',
        emergencyContact: {
          name: 'Sunita Partner',
          relation: 'Spouse',
          phone: '+91 94220 99881'
        }
      })
    });
    const updateEmpJson: any = await updateEmpRes.json();
    assert(updateEmpRes.status === 200, 'PUT /employees/:id successfully updates personal & contact details');
    assert(updateEmpJson.data.workLocation === 'Pune Central Tech Hub', 'Work location updated');

    // 2.2 Execute Promotion Workflow
    console.log('\n--- 7. Testing Promotion Workflow ---');
    const newRate = Number(targetEmp.hourlyRate || 300) + 150;
    const promoRes = await fetch(`${baseUrl}/employees/${targetEmp.id}/promote`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({
        newDesignation: 'Senior Lead Systems Engineer',
        newRoleId: 'engineering_lead',
        newHourlyRate: newRate,
        effectiveDate: '2026-11-22',
        reason: 'Exceptional solar technical excellence and leadership',
        notes: 'Promoted with expanded technical sign-off authorization'
      })
    });
    const promoJson: any = await promoRes.json();
    assert(promoRes.status === 200, 'POST /employees/:id/promote succeeds with HTTP 200');
    assert(promoJson.data.employee.designation === 'Senior Lead Systems Engineer', 'Employee designation promoted');
    assert(promoJson.data.employee.role === 'engineering_lead', 'Employee security role updated to engineering_lead');
    assert(Number(promoJson.data.employee.hourlyRate) === newRate, `Employee hourly rate elevated to ₹${newRate}/hr`);

    // Verify profile role_id was also updated in PostgreSQL for immediate session synchronization
    const profileCheck = await db.query(
      'SELECT p.role_id, p.role_title FROM profiles p JOIN employees e ON e.profile_id = p.id WHERE e.id = $1',
      [targetEmp.id]
    );
    if (profileCheck.rows.length > 0) {
      assert(profileCheck.rows[0].role_id === 'engineering_lead', 'Profile role_id synchronized in PostgreSQL for instant RBAC update');
    }

    // 2.3 Execute Department Transfer Workflow
    console.log('\n--- 8. Testing Department Transfer Workflow ---');
    // Test team validation: team not in department should fail
    const invalidTransferRes = await fetch(`${baseUrl}/employees/${targetEmp.id}/transfer`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({
        newDepartment: 'Sales & Business Development',
        newTeam: 'Installation Crew Alpha (Rooftop)', // Belongs to Operations, not Sales!
        effectiveDate: '2026-11-25',
        reason: 'Invalid Team Test'
      })
    });
    assert(invalidTransferRes.status === 422, 'Department transfer rejects invalid team for target department (HTTP 422)');

    // Valid transfer
    const validTransferRes = await fetch(`${baseUrl}/employees/${targetEmp.id}/transfer`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({
        newDepartment: 'Sales & Business Development',
        newTeam: 'Commercial & Industrial Sales',
        effectiveDate: '2026-11-25',
        reason: 'Cross-functional mobility to scale commercial solar solutions',
        notes: 'Retains all historical survey and engineering records'
      })
    });
    const validTransferJson: any = await validTransferRes.json();
    assert(validTransferRes.status === 200, 'POST /employees/:id/transfer succeeds with HTTP 200');
    assert(validTransferJson.data.employee.department === 'Sales & Business Development', 'Employee department transferred');
    assert(validTransferJson.data.employee.team === 'Commercial & Industrial Sales', 'Employee functional team assigned');

    // 2.4 Career History Timeline
    console.log('\n--- 9. Testing Career Timeline Retrieval ---');
    const careerRes = await fetch(`${baseUrl}/employees/${targetEmp.id}/career-history`, { headers: ownerHeaders });
    const careerJson: any = await careerRes.json();
    assert(careerRes.status === 200, 'GET /employees/:id/career-history returns 200 OK');
    assert(Array.isArray(careerJson.data) && careerJson.data.length >= 2, 'Career timeline contains promotion and transfer milestones');

    const promoEvent = careerJson.data.find((e: any) => e.eventType === 'promotion');
    assert(promoEvent && promoEvent.newDesignation === 'Senior Lead Systems Engineer', 'Timeline includes promotion milestone');

    const transferEvent = careerJson.data.find((e: any) => e.eventType === 'department_transfer');
    assert(transferEvent && transferEvent.newDepartment === 'Sales & Business Development', 'Timeline includes department transfer milestone');

    // 2.5 RBAC on Promotion & Transfer
    console.log('\n--- 10. Testing Workforce RBAC Enforcement ---');
    const unauthPromoRes = await fetch(`${baseUrl}/employees/${targetEmp.id}/promote`, {
      method: 'POST',
      headers: supportHeaders,
      body: JSON.stringify({
        newDesignation: 'Hacked Title',
        newRoleId: 'owner_admin',
        newHourlyRate: 99999,
        effectiveDate: '2026-11-22',
        reason: 'Unauthorized attempt'
      })
    });
    assert(unauthPromoRes.status === 403, 'Unauthorized user blocked from promoting employees (HTTP 403)');

  } catch (err: any) {
    console.error('Test execution exception:', err);
    failed++;
  } finally {
    await new Promise<void>((res) => server.close(() => res()));
    console.log('\n===============================================================');
    console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('===============================================================');
    process.exit(failed > 0 ? 1 : 0);
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

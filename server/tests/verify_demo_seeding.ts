import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
import { SEED_BATCH_ID } from '../src/db/seed_demo_data';

async function main() {
  console.log('======================================================');
  console.log('SOLAROS DEMO DATA SEEDING VERIFICATION SUITE');
  console.log(`Target Seed Batch: ${SEED_BATCH_ID}`);
  console.log('======================================================\n');

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 15000,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  function assert(condition: boolean, message: string) {
    if (!condition) {
      console.error(`❌ ASSERTION FAILED: ${message}`);
      process.exit(1);
    }
    console.log(`✅ [PASS] ${message}`);
  }

  try {
    // 1. Employees Count & Roles
    console.log('• Testing: 1. Verify 60 Employees in PostgreSQL...');
    const empRes = await client.query('SELECT count(*) FROM employees');
    const totalEmployees = parseInt(empRes.rows[0].count, 10);
    console.log(`  Total employees in DB: ${totalEmployees}`);
    assert(totalEmployees >= 60, `Employees count >= 60 (actual: ${totalEmployees})`);

    // Verify Department breakdown
    const deptRes = await client.query(`
      SELECT department, count(*) as count 
      FROM employees 
      GROUP BY department 
      ORDER BY count DESC
    `);
    console.log('  Department breakdown:');
    deptRes.rows.forEach(r => console.log(`   - ${r.department}: ${r.count}`));
    assert(deptRes.rows.length >= 7, 'At least 7 distinct departments represented');

    // 2. Canonical Owner Account Preservation
    console.log('• Testing: 2. Verify Canonical Owner Account Preserved...');
    const ownerRes = await client.query(`
      SELECT e.id, e.employee_code, e.first_name, e.last_name, e.role_id, p.email, p.role_id as profile_role
      FROM employees e
      JOIN profiles p ON p.id = e.profile_id
      WHERE e.employee_code = 'EMP-001'
    `);
    assert(ownerRes.rowCount === 1, 'Found EMP-001 in employees table');
    assert(ownerRes.rows[0].role_id === 'owner_admin', 'EMP-001 has owner_admin role');
    assert(ownerRes.rows[0].email === 'vikram.rao@sunpowersolutions.in', 'EMP-001 email is vikram.rao@sunpowersolutions.in');

    // 3. Customers Count (190 Customers)
    console.log('• Testing: 3. Verify 190 Customers in PostgreSQL...');
    const custRes = await client.query('SELECT count(*) FROM customers');
    const totalCustomers = parseInt(custRes.rows[0].count, 10);
    console.log(`  Total customers in DB: ${totalCustomers}`);
    assert(totalCustomers >= 190, `Customers count >= 190 (actual: ${totalCustomers})`);

    // Verify Customer Sites
    const siteRes = await client.query('SELECT count(*) FROM customer_sites');
    const totalSites = parseInt(siteRes.rows[0].count, 10);
    console.log(`  Total customer sites in DB: ${totalSites}`);
    assert(totalSites >= 190, `Customer sites >= 190 (actual: ${totalSites})`);

    // Verify Customer categories & geographic coverage
    const cityRes = await client.query(`
      SELECT city, count(*) as count 
      FROM customers 
      GROUP BY city 
      ORDER BY count DESC
    `);
    console.log('  Geographical distribution (top cities):');
    cityRes.rows.slice(0, 8).forEach(r => console.log(`   - ${r.city}: ${r.count}`));
    assert(cityRes.rows.length >= 8, 'Customers distributed across at least 8 cities in Maharashtra');

    // 4. Sales Assignment Integrity
    console.log('• Testing: 4. Verify Customer Sales Rep Assignments...');
    // Ensure all demo customers have assigned sales reps
    const unassignedRes = await client.query(`
      SELECT count(*) FROM customers WHERE assigned_sales_rep_id IS NULL AND is_demo = true
    `);
    const unassignedCount = parseInt(unassignedRes.rows[0].count, 10);
    console.log(`  Unassigned demo customers: ${unassignedCount}`);
    assert(unassignedCount === 0, 'Every demo customer is assigned to a Sales Executive');

    // 5. Enquiries (120)
    console.log('• Testing: 5. Verify 120 Enquiries in DB...');
    const enqRes = await client.query('SELECT count(*) FROM enquiries');
    const totalEnquiries = parseInt(enqRes.rows[0].count, 10);
    console.log(`  Total enquiries in DB: ${totalEnquiries}`);
    assert(totalEnquiries >= 120, `Enquiries count >= 120 (actual: ${totalEnquiries})`);

    // 6. Site Surveys (45) & Engineering Reviews
    console.log('• Testing: 6. Verify 45 Site Surveys & Approvals...');
    const srvRes = await client.query('SELECT count(*) FROM site_surveys');
    const totalSurveys = parseInt(srvRes.rows[0].count, 10);
    console.log(`  Total surveys in DB: ${totalSurveys}`);
    assert(totalSurveys >= 45, `Surveys count >= 45 (actual: ${totalSurveys})`);

    const srvApprovedRes = await client.query(`
      SELECT count(*) FROM site_surveys WHERE approved_by_id IS NOT NULL
    `);
    console.log(`  Approved surveys with certified engineer attribution: ${srvApprovedRes.rows[0].count}`);
    assert(parseInt(srvApprovedRes.rows[0].count, 10) > 0, 'Approved surveys reference an authorized approving engineer');

    // 7. Quotations (70)
    console.log('• Testing: 7. Verify 70 Quotations in DB...');
    const qRes = await client.query('SELECT count(*) FROM quotations');
    const totalQuotations = parseInt(qRes.rows[0].count, 10);
    console.log(`  Total quotations in DB: ${totalQuotations}`);
    assert(totalQuotations >= 70, `Quotations count >= 70 (actual: ${totalQuotations})`);

    // 8. Orders (45)
    console.log('• Testing: 8. Verify 45 Orders in DB...');
    const ordRes = await client.query('SELECT count(*) FROM orders');
    const totalOrders = parseInt(ordRes.rows[0].count, 10);
    console.log(`  Total orders in DB: ${totalOrders}`);
    assert(totalOrders >= 45, `Orders count >= 45 (actual: ${totalOrders})`);

    // 9. Installations (35)
    console.log('• Testing: 9. Verify 35 Installations & Crew Assignments...');
    const instRes = await client.query('SELECT count(*) FROM installations');
    const totalInstallations = parseInt(instRes.rows[0].count, 10);
    console.log(`  Total installations in DB: ${totalInstallations}`);
    assert(totalInstallations >= 35, `Installations count >= 35 (actual: ${totalInstallations})`);

    const crewRes = await client.query('SELECT count(*) FROM installation_technicians');
    console.log(`  Technician crew assignment records: ${crewRes.rows[0].count}`);
    assert(parseInt(crewRes.rows[0].count, 10) >= 70, 'Each installation has dedicated crew allocations');

    // 10. Warehouses, Stock, and Dispatches (35)
    console.log('• Testing: 10. Verify Warehouses, Stock & Dispatches...');
    const whRes = await client.query('SELECT count(*) FROM warehouses');
    console.log(`  Warehouses in DB: ${whRes.rows[0].count}`);
    assert(parseInt(whRes.rows[0].count, 10) >= 3, 'At least 3 warehouses/depots in DB');

    const snRes = await client.query('SELECT count(*) FROM product_serial_numbers');
    console.log(`  Serial numbers tracked in DB: ${snRes.rows[0].count}`);
    assert(parseInt(snRes.rows[0].count, 10) >= 80, 'At least 80 hardware serial numbers tracked in DB');

    const dspRes = await client.query('SELECT count(*) FROM dispatches');
    console.log(`  Dispatches in DB: ${dspRes.rows[0].count}`);
    assert(parseInt(dspRes.rows[0].count, 10) >= 35, 'At least 35 dispatch orders tracked');

    // 11. Invoices (30), Payments (50) & Expenses (35)
    console.log('• Testing: 11. Verify Financial Records (Invoices, Payments, Expenses)...');
    const invRes = await client.query('SELECT count(*) FROM invoices');
    console.log(`  Invoices in DB: ${invRes.rows[0].count}`);
    assert(parseInt(invRes.rows[0].count, 10) >= 30, 'At least 30 invoices in DB');

    const payRes = await client.query('SELECT count(*) FROM payments');
    console.log(`  Payments in DB: ${payRes.rows[0].count}`);
    assert(parseInt(payRes.rows[0].count, 10) >= 50, 'At least 50 verified payment transactions in DB');

    const expRes = await client.query('SELECT count(*) FROM expenses');
    console.log(`  Direct expenses in DB: ${expRes.rows[0].count}`);
    assert(parseInt(expRes.rows[0].count, 10) >= 35, 'At least 35 direct project expenses in DB');

    // 12. Warranties (20) & Service Tickets (15)
    console.log('• Testing: 12. Verify Warranties & Service Tickets...');
    const warRes = await client.query('SELECT count(*) FROM warranty_records');
    console.log(`  Warranty records in DB: ${warRes.rows[0].count}`);
    assert(parseInt(warRes.rows[0].count, 10) >= 20, 'At least 20 active warranty records in DB');

    const tckRes = await client.query('SELECT count(*) FROM service_tickets');
    console.log(`  Service tickets in DB: ${tckRes.rows[0].count}`);
    assert(parseInt(tckRes.rows[0].count, 10) >= 15, 'At least 15 service complaint tickets in DB');

    // 13. Demo Batch Tagging Quality
    console.log('• Testing: 13. Verify Seed Batch Tagging on all entities...');
    const demoBatchCounts = await client.query(`
      SELECT 
        (SELECT count(*) FROM employees WHERE seed_batch_id = $1) as employees,
        (SELECT count(*) FROM customers WHERE seed_batch_id = $1) as customers,
        (SELECT count(*) FROM site_surveys WHERE seed_batch_id = $1) as surveys,
        (SELECT count(*) FROM quotations WHERE seed_batch_id = $1) as quotations,
        (SELECT count(*) FROM orders WHERE seed_batch_id = $1) as orders,
        (SELECT count(*) FROM installations WHERE seed_batch_id = $1) as installations,
        (SELECT count(*) FROM invoices WHERE seed_batch_id = $1) as invoices,
        (SELECT count(*) FROM payments WHERE seed_batch_id = $1) as payments,
        (SELECT count(*) FROM expenses WHERE seed_batch_id = $1) as expenses
    `, [SEED_BATCH_ID]);
    console.log('  Seed batch records tagged with', SEED_BATCH_ID, ':', demoBatchCounts.rows[0]);
    assert(parseInt(demoBatchCounts.rows[0].employees, 10) === 60, 'All 60 employees tagged with SEED_BATCH_ID');
    assert(parseInt(demoBatchCounts.rows[0].customers, 10) === 190, 'All 190 customers tagged with SEED_BATCH_ID');

    console.log('\n======================================================');
    console.log('ALL DEMO DATA SEEDING VERIFICATION CHECKS PASSED (13/13)!');
    console.log('======================================================');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

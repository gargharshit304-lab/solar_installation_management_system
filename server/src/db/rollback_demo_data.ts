/**
 * SolarOS Enterprise Demo Data Rollback Script
 * Safely removes ONLY records created under seed_batch_id = 'SOLAROS_DEMO_2026_01'.
 * Preserves all production records, existing users, and baseline system settings.
 */

import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
import { SEED_BATCH_ID } from './seed_demo_data';

async function rollback() {
  console.log('======================================================');
  console.log('SOLAROS DEMO DATA ROLLBACK PROCEDURE');
  console.log(`Target Batch Identifier: ${SEED_BATCH_ID}`);
  console.log('======================================================\n');

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 15000,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('• Rollback transaction started.');

    // Delete in reverse foreign key dependency order
    const tablesInReverseFkOrder = [
      'operational_delegations',
      'service_tickets',
      'warranty_records',
      'expenses',
      'payments',
      'invoices',
      'dispatch_items',
      'dispatches',
      'installation_technicians',
      'installations',
      'order_items',
      'orders',
      'quotation_items',
      'quotations',
      'survey_assignments',
      'site_surveys',
      'enquiries',
      'product_serial_numbers',
      'storage_locations',
      'warehouses',
      'suppliers',
      'customer_sites',
      'customers',
      'employees',
      'profiles'
    ];

    for (const tbl of tablesInReverseFkOrder) {
      // For employees and profiles, NEVER delete canonical owner EMP-001 or id 10000000-0000-0000-0000-000000000001
      let deleteSql = `DELETE FROM ${tbl} WHERE seed_batch_id = $1`;
      if (tbl === 'employees') {
        deleteSql += ` AND employee_code != 'EMP-001'`;
      }
      if (tbl === 'profiles') {
        deleteSql += ` AND id != '10000000-0000-0000-0000-000000000001'`;
      }

      const res = await client.query(deleteSql, [SEED_BATCH_ID]);
      console.log(`- Cleared ${res.rowCount} records from ${tbl} (seed_batch_id = '${SEED_BATCH_ID}')`);
    }

    await client.query('COMMIT');
    console.log('\n======================================================');
    console.log('✅ ROLLBACK COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ ROLLBACK FAILED - TRANSACTION ROLLED BACK:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Only run directly if invoked as script
if (process.argv[1]?.includes('rollback_demo_data')) {
  rollback();
}

export { rollback };

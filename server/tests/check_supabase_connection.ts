import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';

async function checkConnection() {
  const connStr = process.env.DATABASE_URL || '';
  if (!connStr) {
    console.error('❌ DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  let sanitizedHost = 'unknown';
  let port = '6543';
  let database = 'postgres';
  try {
    const parsed = new URL(connStr.replace('postgresql://', 'http://'));
    sanitizedHost = parsed.hostname;
    port = parsed.port || '6543';
    database = parsed.pathname.replace('/', '') || 'postgres';
  } catch (e) {
    // fallback
  }

  console.log('====================================================');
  console.log('🔍 SUPABASE POSTGRESQL CONNECTION DIAGNOSTIC');
  console.log('====================================================');
  console.log(`📡 Target Host: ${sanitizedHost}`);
  console.log(`🔌 Target Port: ${port} (Transaction Pooler)`);
  console.log(`🗄️  Database:    ${database}`);
  console.log('----------------------------------------------------');

  const pool = new pg.Pool({
    connectionString: connStr,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }
  });

  const startTime = Date.now();
  try {
    const client = await pool.connect();
    const connectLatency = Date.now() - startTime;

    console.log(`✅ CONNECTION SUCCESSFUL (Handshake: ${connectLatency}ms)`);
    console.log('----------------------------------------------------');

    // 1. Basic Server Info
    const infoRes = await client.query(`
      SELECT 
        version() as pg_version,
        current_database() as db_name,
        current_user as db_user,
        now() as server_time,
        inet_server_addr() as server_ip
    `);
    const info = infoRes.rows[0];
    console.log('📊 Server Details:');
    console.log(`   - PostgreSQL Version: ${info.pg_version.split(' ')[0]} ${info.pg_version.split(' ')[1]}`);
    console.log(`   - Database Name:      ${info.db_name}`);
    console.log(`   - Connected As User:  ${info.db_user}`);
    console.log(`   - Supabase Time:      ${info.server_time}`);

    // 2. SSL Verification
    const sslRes = await client.query(`
      SELECT ssl_is_used() as ssl_active, ssl_cipher() as cipher
    `).catch(() => null);
    if (sslRes && sslRes.rows[0]) {
      console.log(`   - SSL Status:         ${sslRes.rows[0].ssl_active ? 'Active (Encrypted)' : 'Inactive'} [${sslRes.rows[0].cipher || 'TLS'}]`);
    }

    // 3. Key Tables and Row Counts
    console.log('\n📦 Table Row Counts:');
    const tablesToCheck = [
      'profiles',
      'employees',
      'customers',
      'orders',
      'quotations',
      'inventory_items',
      'products',
      'site_surveys',
      'audit_logs'
    ];

    for (const tbl of tablesToCheck) {
      try {
        const countRes = await client.query(`SELECT count(*)::int as cnt FROM "${tbl}"`);
        console.log(`   - ${tbl.padEnd(20)}: ${countRes.rows[0].cnt} records`);
      } catch {
        // Table might have alternate name or not exist
      }
    }

    // 4. Read Verification Query
    const empSample = await client.query(`
      SELECT employee_code, first_name, last_name, department, designation 
      FROM employees 
      ORDER BY employee_code ASC 
      LIMIT 3
    `);
    console.log('\n👥 Personnel Sample Check:');
    for (const r of empSample.rows) {
      console.log(`   - [${r.employee_code}] ${r.first_name} ${r.last_name} (${r.designation} - ${r.department})`);
    }

    client.release();
    await pool.end();

    console.log('\n====================================================');
    console.log('🎉 OVERALL STATUS: Supabase PostgreSQL is ONLINE & HEALTHY');
    console.log('====================================================');
    process.exit(0);
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ CONNECTION FAILED after ${duration}ms`);
    console.error(`   Error Code:    ${err.code || 'UNKNOWN'}`);
    console.error(`   Error Message: ${err.message}`);
    await pool.end();
    process.exit(1);
  }
}

checkConnection();

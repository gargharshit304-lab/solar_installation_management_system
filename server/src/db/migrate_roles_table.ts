import dotenv from 'dotenv';
dotenv.config();
import { pool } from './prisma';

const INITIAL_ROLE_MATRIX: Record<string, Record<string, string[]>> = {
  owner_admin: {
    overview: ['view', 'manage', 'export'],
    customers: ['view', 'create', 'edit', 'delete', 'manage', 'export'],
    enquiries: ['view', 'create', 'edit', 'delete', 'assign', 'manage', 'export'],
    follow_ups: ['view', 'create', 'edit', 'delete', 'manage', 'export'],
    surveys: ['view', 'create', 'edit', 'delete', 'assign', 'approve', 'manage', 'export'],
    survey_review: ['view', 'approve', 'edit', 'manage'],
    quotations: ['view', 'create', 'edit', 'delete', 'approve', 'manage', 'export'],
    orders: ['view', 'create', 'edit', 'delete', 'approve', 'manage', 'export'],
    inventory: ['view', 'create', 'edit', 'delete', 'manage', 'export'],
    dispatch: ['view', 'create', 'edit', 'approve', 'manage', 'export'],
    installations: ['view', 'create', 'edit', 'assign', 'approve', 'manage', 'export'],
    workforce: ['view', 'create', 'edit', 'delete', 'assign', 'approve', 'manage', 'export'],
    departments: ['view', 'create', 'edit', 'delete', 'manage', 'export'],
    roles_permissions: ['view', 'create', 'edit', 'delete', 'manage'],
    roles: ['view', 'create', 'edit', 'delete', 'manage'],
    permissions: ['view', 'create', 'edit', 'delete', 'manage'],
    approvals: ['view', 'approve', 'edit', 'delete', 'manage'],
    finance: ['view', 'create', 'edit', 'approve', 'manage', 'export'],
    reports: ['view', 'manage', 'export'],
    ai_agents: ['view', 'create', 'edit', 'manage'],
    warranty: ['view', 'create', 'edit', 'approve', 'manage', 'export'],
    service: ['view', 'create', 'edit', 'delete', 'manage'],
    subsidies: ['view', 'create', 'edit', 'approve', 'manage', 'export'],
    activity_center: ['view', 'export'],
    audit: ['view', 'view_company_wide', 'export'],
    settings: ['view', 'edit', 'manage']
  },
  sales_exec: {
    overview: ['view'],
    customers: ['view', 'create', 'edit'],
    enquiries: ['view', 'create', 'edit'],
    follow_ups: ['view', 'create', 'edit'],
    surveys: ['view', 'create', 'assign'],
    quotations: ['view', 'create', 'edit', 'export'],
    orders: ['view', 'create'],
    subsidies: ['view', 'create'],
    reports: ['view']
  },
  survey_tech: {
    overview: ['view'],
    surveys: ['view', 'create', 'edit'],
    customers: ['view']
  },
  engineering_lead: {
    overview: ['view'],
    surveys: ['view', 'edit'],
    survey_review: ['view', 'approve', 'edit'],
    installations: ['view'],
    reports: ['view']
  },
  warehouse_mgr: {
    overview: ['view'],
    inventory: ['view', 'create', 'edit', 'manage', 'export'],
    dispatch: ['view', 'create', 'edit', 'manage', 'export'],
    warranty: ['view'],
    installations: ['view']
  },
  install_tech: {
    overview: ['view'],
    installations: ['view', 'edit'],
    service: ['view', 'edit'],
    inventory: ['view'],
    surveys: ['view']
  },
  support_exec: {
    overview: ['view'],
    service: ['view', 'create', 'edit', 'manage'],
    warranty: ['view', 'create', 'edit', 'approve', 'manage'],
    customers: ['view']
  },
  accountant: {
    overview: ['view'],
    finance: ['view', 'create', 'edit', 'approve', 'manage', 'export'],
    orders: ['view', 'edit', 'export'],
    subsidies: ['view', 'edit', 'approve'],
    reports: ['view', 'export'],
    approvals: ['view', 'create']
  }
};

async function main() {
  console.log('Connecting to PostgreSQL to migrate roles table...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Add updated_at and version columns
    console.log('Adding updated_at and version columns to roles table...');
    await client.query(`
      ALTER TABLE roles 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;
    `);

    // 2. Populate permissions as structured JSON matrix for any roles that have arrays or missing data
    console.log('Syncing canonical permissions matrix to roles table...');
    for (const [roleId, perms] of Object.entries(INITIAL_ROLE_MATRIX)) {
      // Check if role exists
      const existing = await client.query('SELECT id, permissions FROM roles WHERE id = $1', [roleId]);
      if (existing.rowCount === 0) {
        await client.query(`
          INSERT INTO roles (id, name, description, permissions, created_at, updated_at, version)
          VALUES ($1, $2, $3, $4, NOW(), NOW(), 1)
        `, [roleId, roleId, `Role for ${roleId}`, JSON.stringify(perms)]);
      } else {
        // If current permissions in DB is an array, convert to dictionary
        const currentPerms = existing.rows[0].permissions;
        if (Array.isArray(currentPerms) || typeof currentPerms !== 'object' || Object.keys(currentPerms).length === 0) {
          await client.query(`
            UPDATE roles 
            SET permissions = $1, updated_at = NOW(), version = version + 1
            WHERE id = $2
          `, [JSON.stringify(perms), roleId]);
          console.log(`Updated permissions matrix for role: ${roleId}`);
        } else {
          console.log(`Role ${roleId} already has dictionary permissions.`);
        }
      }
    }

    await client.query('COMMIT');
    console.log('✅ Successfully migrated roles table with updated_at and versioning!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();

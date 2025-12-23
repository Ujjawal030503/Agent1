import { db } from './database.js';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Migration configuration
const MIGRATIONS_DIR = join(__dirname, '..', '..', 'migrations');
const MIGRATIONS_TABLE = 'schema_migrations';

// Migration interface
interface Migration {
  version: string;
  filename: string;
  applied: boolean;
}

// Schema for migrations table
const CREATE_MIGRATIONS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
    version VARCHAR(255) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Initialize migrations table
async function initializeMigrationsTable(): Promise<void> {
  await db.execute(CREATE_MIGRATIONS_TABLE_SQL);
}

// Get list of available migrations
function getAvailableMigrations(): Migration[] {
  if (!existsSync(MIGRATIONS_DIR)) {
    console.log(`📂 Migrations directory not found: ${MIGRATIONS_DIR}`);
    return [];
  }

  const files = readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  return files.map(file => ({
    version: file.split('_')[0],
    filename: file,
    applied: false,
  }));
}

// Get applied migrations from database
async function getAppliedMigrations(): Promise<Migration[]> {
  const rows = await db.query<any>(
    `SELECT version, filename, applied_at FROM ${MIGRATIONS_TABLE} ORDER BY version`,
  );
  
  return rows.map(row => ({
    version: row.version,
    filename: row.filename,
    applied: true,
  }));
}

// Load migration SQL content
function loadMigration(filename: string): string {
  const path = join(MIGRATIONS_DIR, filename);
  return readFileSync(path, 'utf8');
}

// Run a single migration
async function runMigration(migration: Migration): Promise<void> {
  console.log(`🔄 Running migration: ${migration.filename}`);
  
  const sql = loadMigration(migration.filename);
  
  // Run migration in a transaction
  const client = await db.getConnection();
  try {
    await client.query('BEGIN');
    
    // Execute migration SQL
    await client.query(sql);
    
    // Record migration as applied
    await client.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (version, filename) VALUES ($1, $2)`,
      [migration.version, migration.filename],
    );
    
    await client.query('COMMIT');
    console.log(`✅ Migration ${migration.filename} applied successfully`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Failed to apply migration ${migration.filename}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Undo a specific migration (not implemented for this MVP)
async function undoMigration(migration: Migration): Promise<void> {
  console.warn(`⚠️  Reversing migrations not implemented for: ${migration.filename}`);
  // For production, implement this with down migrations
}

// Main migration runner
export async function runMigrations(): Promise<void> {
  console.log('🚀 Starting database migrations...');
  
  await initializeMigrationsTable();
  
  const available = getAvailableMigrations();
  const applied = await getAppliedMigrations();
  
  const appliedMap = new Map(applied.map(m => [m.version, m]));
  
  // Find pending migrations
  const pending = available.filter(m => !appliedMap.has(m.version));
  
  if (pending.length === 0) {
    console.log('✅ All migrations are already applied');
    return;
  }
  
  console.log(`📋 Found ${pending.length} pending migration(s)`);
  
  // Run pending migrations
  for (const migration of pending) {
    await runMigration(migration);
  }
  
  console.log('✅ Database migrations completed successfully');
}

// Check migration status
export async function checkMigrationStatus(): Promise<void> {
  await initializeMigrationsTable();
  
  const available = getAvailableMigrations();
  const applied = await getAppliedMigrations();
  
  const appliedMap = new Map(applied.map(m => [m.version, m]));
  
  console.log('📊 Migration Status:');
  console.log(`Total migrations: ${available.length}`);
  console.log(`Applied: ${applied.length}`);
  console.log(`Pending: ${available.length - applied.length}`);
  
  console.log('\n📋 Migration Details:');
  for (const migration of available) {
    const status = appliedMap.has(migration.version) ? '✅ Applied' : '⏳ Pending';
    console.log(`${migration.filename}: ${status}`);
  }
}

// Reset database (use with caution in development)
export async function resetDatabase(): Promise<void> {
  console.warn('⚠️  This will drop all tables and reset the database!');
  console.warn('Only use this in development!');
  
  const confirm = process.env.NODE_ENV === 'development' ? 
    true : process.env.RESET_DATABASE_CONFIRM === 'true';
  
  if (!confirm) {
    throw new Error('Database reset denied. Set RESET_DATABASE_CONFIRM=true to proceed.');
  }
  
  console.log('🧹 Resetting database...');
  
  try {
    // Drop all tables (in reverse order of dependencies)
    await db.execute('DROP TABLE IF EXISTS research_insights CASCADE');
    await db.execute('DROP TABLE IF EXISTS generated_posts CASCADE');
    await db.execute('DROP TABLE IF EXISTS content_requests CASCADE');
    await db.execute('DROP TABLE IF EXISTS brand_kits CASCADE');
    await db.execute('DROP TABLE IF EXISTS users CASCADE');
    await db.execute('DROP TABLE IF EXISTS schema_migrations CASCADE');
    
    // Drop enum types
    await db.execute('DROP TYPE IF EXISTS platform_type CASCADE');
    await db.execute('DROP TYPE IF EXISTS content_request_status CASCADE');
    await db.execute('DROP TYPE IF EXISTS research_source_type CASCADE');
    
    console.log('✅ Database reset completed');
    console.log('🔄 Re-running migrations...');
    
    await runMigrations();
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
}

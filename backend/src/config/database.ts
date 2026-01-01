import type { PoolClient } from 'pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration interface
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number; // Maximum number of connections
  idleTimeoutMillis: number; // Idle timeout in milliseconds
  connectionTimeoutMillis: number; // Connection timeout in milliseconds
}

// Parse and validate configuration from environment
export function getDatabaseConfig(): DatabaseConfig {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const database = process.env.DB_NAME || 'social_content_db';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres_password';

  // Default pool configuration
  const max = parseInt(process.env.DB_POOL_MAX || '20', 10);
  const idleTimeoutMillis = parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10);
  const connectionTimeoutMillis = parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000', 10);

  // Validate required configuration
  if (!database || !user) {
    throw new Error('Database configuration missing: DB_NAME and DB_USER are required');
  }

  return {
    host,
    port,
    database,
    user,
    password,
    max,
    idleTimeoutMillis,
    connectionTimeoutMillis,
  };
}

// Create and configure connection pool
class DatabaseConnection {
  private pool: Pool | null = null;
  private config: DatabaseConfig;

  constructor() {
    this.config = getDatabaseConfig();
  }

  // Initialize connection pool
  async initialize(): Promise<void> {
    try {
      this.pool = new Pool(this.config);
      
      // Test connection on startup
      const client = await this.pool.connect();
      
      console.log(
        '✅ Database connected successfully:' +
        ` ${this.config.user}@${this.config.host}:${this.config.port}/${this.config.database}`,
      );
      
      client.release();
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  // Get a connection from the pool
  async getConnection(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database connection not initialized');
    }
    return await this.pool.connect();
  }

  // Close all connections and shutdown pool
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ Database connection closed');
    }
  }

  // Execute a query and return results
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const client = await this.getConnection();
    try {
      const result = await client.query(text, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Execute a query that returns a single row
  async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const client = await this.getConnection();
    try {
      const result = await client.query(text, params);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Execute a query without returning results (INSERT, UPDATE, DELETE)
  async execute(text: string, params?: any[]): Promise<void> {
    const client = await this.getConnection();
    try {
      await client.query(text, params);
    } finally {
      client.release();
    }
  }
}

// Export singleton instance
export const db = new DatabaseConnection();

// Type-safe query builder helper
export class QueryBuilder {
  private conditions: string[] = [];
  private params: any[] = [];
  private paramCount = 0;

  addCondition(condition: string, param?: any): void {
    this.conditions.push(condition);
    if (param !== undefined) {
      this.params.push(param);
    }
  }

  addParam(value: any): void {
    this.paramCount++;
    this.params.push(value);
  }

  getWhereClause(): string {
    if (this.conditions.length === 0) {
      return '';
    }
    return ' WHERE ' + this.conditions.join(' AND ');
  }

  getParams(): any[] {
    return [...this.params];
  }

  reset(): void {
    this.conditions = [];
    this.params = [];
    this.paramCount = 0;
  }
}
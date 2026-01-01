// @ts-nocheck
import { PoolClient } from 'pg';
import { db } from '../config/database.js';
import type {
  User,
  CreateUser,
  UpdateUser,
  BrandKit,
  CreateBrandKit,
  UpdateBrandKit,
  ContentRequest,
  CreateContentRequest,
  UpdateContentRequest,
  GeneratedPost,
  CreateGeneratedPost,
  UpdateGeneratedPost,
  ResearchInsight,
  CreateResearchInsight,
  UpdateResearchInsight,
  UUID,
  ContentRequestStatus,
  ResearchSource } from '../../../shared/types/database.js';
import {
  Platform,
} from '../../../shared/types/database.js';
import { QueryBuilder } from '../config/database.js';

// Base repository class with common methods
class BaseRepository<T> {
  constructor(protected tableName: string) {}

  protected buildSelectQuery(filters: Record<string, any>): { query: string; params: any[] } {
    const qb = new QueryBuilder();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          qb.addCondition(`${key} >= $${qb['params'].length + 1}`, value);
        } else if (Array.isArray(value)) {
          qb.addCondition(`${key} && $${qb['params'].length + 1}`, value);
        } else if (typeof value === 'string' && value.includes('%')) {
          qb.addCondition(`${key} ILIKE $${qb['params'].length + 1}`, value);
        } else {
          qb.addCondition(`${key} = $${qb['params'].length + 1}`, value);
        }
      }
    });

    return {
      query: `SELECT * FROM ${this.tableName}${qb.getWhereClause()}`,
      params: qb.getParams(),
    };
  }

  async findOne(id: UUID): Promise<T | null> {
    return await db.queryOne<T>(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id],
    );
  }

  async findAll(filters: Record<string, any> = {}): Promise<T[]> {
    const { query, params } = this.buildSelectQuery(filters);
    return await db.query<T>(query, params);
  }

  async delete(id: UUID): Promise<void> {
    await db.execute(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id],
    );
  }
}

// User repository
class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  async create(data: CreateUser): Promise<User> {
    const result = await db.queryOne<User>(
      `INSERT INTO users (email, password_hash) 
       VALUES ($1, $2) 
       RETURNING *`,
      [data.email, data.password_hash],
    );
    return result!;
  }

  async update(id: UUID, data: UpdateUser): Promise<User | null> {
    const updates: string[] = [];
    const values: any[] = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        updates.push(`${key} = $${updates.length + 1}`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return await this.findOne(id);
    }

    const result = await db.queryOne<User>(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${updates.length + 1} RETURNING *`,
      [...values, id],
    );
    return result;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await db.queryOne<User>(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );
  }
}

// Brand kit repository
class BrandKitRepository extends BaseRepository<BrandKit> {
  constructor() {
    super('brand_kits');
  }

  async create(data: CreateBrandKit): Promise<BrandKit> {
    const result = await db.queryOne<BrandKit>(
      `INSERT INTO brand_kits (user_id, brand_name, tone, personality, words_to_use, words_to_avoid, example_posts)
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        data.user_id,
        data.brand_name,
        data.tone || null,
        data.personality || null,
        data.words_to_use || null,
        data.words_to_avoid || null,
        data.example_posts || null,
      ],
    );
    return result!;
  }

  async update(id: UUID, data: UpdateBrandKit): Promise<BrandKit | null> {
    const updates: string[] = [];
    const values: any[] = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${updates.length + 1}`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return await this.findOne(id);
    }

    const result = await db.queryOne<BrandKit>(
      `UPDATE brand_kits SET ${updates.join(', ')} WHERE id = $${updates.length + 1} RETURNING *`,
      [...values, id],
    );
    return result;
  }

  async findByUserId(userId: UUID): Promise<BrandKit[]> {
    return await db.query<BrandKit>(
      'SELECT * FROM brand_kits WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId],
    );
  }
}

// Content request repository
class ContentRequestRepository extends BaseRepository<ContentRequest> {
  constructor() {
    super('content_requests');
  }

  async create(data: CreateContentRequest): Promise<ContentRequest> {
    const result = await db.queryOne<ContentRequest>(
      `INSERT INTO content_requests (user_id, brand_kit_id, niche, platform, status)
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        data.user_id,
        data.brand_kit_id || null,
        data.niche,
        data.platform,
        data.status || 'pending',
      ],
    );
    return result!;
  }

  async update(id: UUID, data: UpdateContentRequest): Promise<ContentRequest | null> {
    const updates: string[] = [];
    const values: any[] = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${updates.length + 1}`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return await this.findOne(id);
    }

    const result = await db.queryOne<ContentRequest>(
      `UPDATE content_requests SET ${updates.join(', ')} WHERE id = $${updates.length + 1} RETURNING *`,
      [...values, id],
    );
    return result;
  }

  async findByUserId(userId: UUID): Promise<ContentRequest[]> {
    return await db.query<ContentRequest>(
      `SELECT cr.*, bk.brand_name 
       FROM content_requests cr
       LEFT JOIN brand_kits bk ON cr.brand_kit_id = bk.id
       WHERE cr.user_id = $1 
       ORDER BY cr.updated_at DESC`,
      [userId],
    );
  }

  async findByStatus(status: ContentRequestStatus): Promise<ContentRequest[]> {
    return await db.query<ContentRequest>(
      'SELECT * FROM content_requests WHERE status = $1 ORDER BY created_at ASC',
      [status],
    );
  }
}

// Generated post repository
class GeneratedPostRepository extends BaseRepository<GeneratedPost> {
  constructor() {
    super('generated_posts');
  }

  async create(data: CreateGeneratedPost): Promise<GeneratedPost> {
    const result = await db.queryOne<GeneratedPost>(
      `INSERT INTO generated_posts (content_request_id, platform, post_text, confidence_score)
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [
        data.content_request_id,
        data.platform,
        data.post_text,
        data.confidence_score || null,
      ],
    );
    return result!;
  }

  async update(id: UUID, data: UpdateGeneratedPost): Promise<GeneratedPost | null> {
    const updates: string[] = [];
    const values: any[] = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${updates.length + 1}`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return await this.findOne(id);
    }

    const result = await db.queryOne<GeneratedPost>(
      `UPDATE generated_posts SET ${updates.join(', ')} WHERE id = $${updates.length + 1} RETURNING *`,
      [...values, id],
    );
    return result;
  }

  async findByContentRequestId(contentRequestId: UUID): Promise<GeneratedPost[]> {
    return await db.query<GeneratedPost>(
      'SELECT * FROM generated_posts WHERE content_request_id = $1 ORDER BY created_at DESC',
      [contentRequestId],
    );
  }

  async findTopScored(limit: number = 10): Promise<GeneratedPost[]> {
    return await db.query<GeneratedPost>(
      'SELECT * FROM generated_posts WHERE confidence_score IS NOT NULL ORDER BY confidence_score DESC LIMIT $1',
      [limit],
    );
  }
}

// Research insight repository
class ResearchInsightRepository extends BaseRepository<ResearchInsight> {
  constructor() {
    super('research_insights');
  }

  async create(data: CreateResearchInsight): Promise<ResearchInsight> {
    const result = await db.queryOne<ResearchInsight>(
      `INSERT INTO research_insights (content_request_id, source, summary, extracted_language_patterns)
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [
        data.content_request_id,
        data.source,
        data.summary,
        data.extracted_language_patterns || null,
      ],
    );
    return result!;
  }

  async update(id: UUID, data: UpdateResearchInsight): Promise<ResearchInsight | null> {
    const updates: string[] = [];
    const values: any[] = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${updates.length + 1}`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return await this.findOne(id);
    }

    const result = await db.queryOne<ResearchInsight>(
      `UPDATE research_insights SET ${updates.join(', ')} WHERE id = $${updates.length + 1} RETURNING *`,
      [...values, id],
    );
    return result;
  }

  async findByContentRequestId(contentRequestId: UUID): Promise<ResearchInsight[]> {
    return await db.query<ResearchInsight>(
      'SELECT * FROM research_insights WHERE content_request_id = $1 ORDER BY created_at DESC',
      [contentRequestId],
    );
  }

  async findBySource(source: ResearchSource): Promise<ResearchInsight[]> {
    return await db.query<ResearchInsight>(
      'SELECT * FROM research_insights WHERE source = $1 ORDER BY created_at DESC',
      [source],
    );
  }
}

// Initialize repositories
export const userRepo = new UserRepository();
export const brandKitRepo = new BrandKitRepository();
export const contentRequestRepo = new ContentRequestRepository();
export const generatedPostRepo = new GeneratedPostRepository();
export const researchInsightRepo = new ResearchInsightRepository();

// Export types
export type { User, BrandKit, ContentRequest, GeneratedPost, ResearchInsight };

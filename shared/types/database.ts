// Database schema types
// These types reflect the PostgreSQL schema and are used throughout the application

// Core types
export type UUID = string;

// Platform types
export const PlatformTypes = ['reddit', 'linkedin', 'x'] as const;
export type Platform = typeof PlatformTypes[number];

// Content request status types
export const ContentRequestStatuses = ['pending', 'processing', 'completed', 'failed'] as const;
export type ContentRequestStatus = typeof ContentRequestStatuses[number];

// Research source types
export const ResearchSourceTypes = ['reddit', 'blog', 'forum', 'qa'] as const;
export type ResearchSource = typeof ResearchSourceTypes[number];

// Timestamp type
export interface TimestampFields {
  created_at: Date;
  updated_at?: Date;
}

// Users table
export interface User extends TimestampFields {
  id: UUID;
  email: string;
  password_hash: string;
}

// Brand kits table
export interface BrandKit extends TimestampFields {
  id: UUID;
  user_id: UUID;
  brand_name: string;
  tone: string | null;
  personality: string | null;
  words_to_use: string[] | null;
  words_to_avoid: string[] | null;
  example_posts: string | null;
}

// Content requests table
export interface ContentRequest extends TimestampFields {
  id: UUID;
  user_id: UUID;
  brand_kit_id: UUID | null;
  niche: string;
  platform: Platform;
  status: ContentRequestStatus;
}

// Generated posts table
export interface GeneratedPost extends TimestampFields {
  id: UUID;
  content_request_id: UUID;
  platform: Platform;
  post_text: string;
  confidence_score: number | null;
}

// Research insights table
export interface ResearchInsight extends TimestampFields {
  id: UUID;
  content_request_id: UUID;
  source: ResearchSource;
  summary: string;
  extracted_language_patterns: string | null;
}

// Create/Insert types (without ID and timestamps)
export interface CreateUser {
  email: string;
  password_hash: string;
}

export interface CreateBrandKit {
  user_id: UUID;
  brand_name: string;
  tone?: string;
  personality?: string;
  words_to_use?: string[];
  words_to_avoid?: string[];
  example_posts?: string;
}

export interface CreateContentRequest {
  user_id: UUID;
  brand_kit_id?: UUID;
  niche: string;
  platform: Platform;
  status?: ContentRequestStatus;
}

export interface CreateGeneratedPost {
  content_request_id: UUID;
  platform: Platform;
  post_text: string;
  confidence_score?: number;
}

export interface CreateResearchInsight {
  content_request_id: UUID;
  source: ResearchSource;
  summary: string;
  extracted_language_patterns?: string;
}

// Update types (partial fields)
export interface UpdateUser {
  email?: string;
  password_hash?: string;
}

export interface UpdateBrandKit {
  brand_name?: string;
  tone?: string;
  personality?: string;
  words_to_use?: string[];
  words_to_avoid?: string[];
  example_posts?: string;
}

export interface UpdateContentRequest {
  brand_kit_id?: UUID;
  niche?: string;
  platform?: Platform;
  status?: ContentRequestStatus;
}

export interface UpdateGeneratedPost {
  post_text?: string;
  confidence_score?: number;
}

export interface UpdateResearchInsight {
  source?: ResearchSource;
  summary?: string;
  extracted_language_patterns?: string;
}

// Query filters
export interface UserQuery {
  id?: UUID;
  email?: string;
  created_after?: Date;
  created_before?: Date;
}

export interface BrandKitQuery {
  id?: UUID;
  user_id?: UUID;
  brand_name?: string;
  updated_after?: Date;
  updated_before?: Date;
}

export interface ContentRequestQuery {
  id?: UUID;
  user_id?: UUID;
  brand_kit_id?: UUID;
  platform?: Platform;
  status?: ContentRequestStatus;
  niche?: string;
  created_after?: Date;
  created_before?: Date;
}

export interface GeneratedPostQuery {
  id?: UUID;
  content_request_id?: UUID;
  platform?: Platform;
  confidence_min?: number;
  confidence_max?: number;
  created_after?: Date;
  created_before?: Date;
}

export interface ResearchInsightQuery {
  id?: UUID;
  content_request_id?: UUID;
  source?: ResearchSource;
  created_after?: Date;
  created_before?: Date;
}

// Response types for API
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// Aggregate types
export interface ContentRequestWithDetails extends ContentRequest {
  brand_kit?: BrandKit;
  generated_posts?: GeneratedPost[];
  research_insights?: ResearchInsight[];
}

export interface UserWithRelations extends User {
  brand_kits?: BrandKit[];
  content_requests?: ContentRequest[];
}
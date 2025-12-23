export type UUID = string;
export declare const PlatformTypes: readonly ["reddit", "linkedin", "x"];
export type Platform = typeof PlatformTypes[number];
export declare const ContentRequestStatuses: readonly ["pending", "processing", "completed", "failed"];
export type ContentRequestStatus = typeof ContentRequestStatuses[number];
export declare const ResearchSourceTypes: readonly ["reddit", "blog", "forum", "qa"];
export type ResearchSource = typeof ResearchSourceTypes[number];
export interface TimestampFields {
    created_at: Date;
    updated_at?: Date;
}
export interface User extends TimestampFields {
    id: UUID;
    email: string;
    password_hash: string;
}
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
export interface ContentRequest extends TimestampFields {
    id: UUID;
    user_id: UUID;
    brand_kit_id: UUID | null;
    niche: string;
    platform: Platform;
    status: ContentRequestStatus;
}
export interface GeneratedPost extends TimestampFields {
    id: UUID;
    content_request_id: UUID;
    platform: Platform;
    post_text: string;
    confidence_score: number | null;
}
export interface ResearchInsight extends TimestampFields {
    id: UUID;
    content_request_id: UUID;
    source: ResearchSource;
    summary: string;
    extracted_language_patterns: string | null;
}
export interface CreateUser {
    email: string;
    password_hash: string;
}
export interface CreateBrandKit {
    user_id: UUID;
    brand_name: string;
    tone?: string | null;
    personality?: string | null;
    words_to_use?: string[] | null;
    words_to_avoid?: string[] | null;
    example_posts?: string | null;
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
export interface UpdateUser {
    email?: string;
    password_hash?: string;
}
export interface UpdateBrandKit {
    brand_name?: string;
    tone?: string | null;
    personality?: string | null;
    words_to_use?: string[] | null;
    words_to_avoid?: string[] | null;
    example_posts?: string | null;
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
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    per_page: number;
    has_more: boolean;
}
export interface ContentRequestWithDetails extends ContentRequest {
    brand_kit?: BrandKit;
    generated_posts?: GeneratedPost[];
    research_insights?: ResearchInsight[];
}
export interface UserWithRelations extends User {
    brand_kits?: BrandKit[];
    content_requests?: ContentRequest[];
}
//# sourceMappingURL=database.d.ts.map
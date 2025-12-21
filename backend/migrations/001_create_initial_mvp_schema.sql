-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE platform_type AS ENUM ('reddit', 'linkedin', 'x');
CREATE TYPE content_request_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE research_source_type AS ENUM ('reddit', 'blog', 'forum', 'qa');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brand kits table
CREATE TABLE brand_kits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_name VARCHAR(255) NOT NULL,
    tone TEXT,
    personality TEXT,
    words_to_use TEXT[],
    words_to_avoid TEXT[],
    example_posts TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content requests table
CREATE TABLE content_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_kit_id UUID REFERENCES brand_kits(id) ON DELETE SET NULL,
    niche VARCHAR(255) NOT NULL,
    platform platform_type NOT NULL,
    status content_request_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated posts table
CREATE TABLE generated_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_request_id UUID NOT NULL REFERENCES content_requests(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    post_text TEXT NOT NULL,
    confidence_score NUMERIC(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Research insights table
CREATE TABLE research_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_request_id UUID NOT NULL REFERENCES content_requests(id) ON DELETE CASCADE,
    source research_source_type NOT NULL,
    summary TEXT NOT NULL,
    extracted_language_patterns TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_brand_kits_user_id ON brand_kits(user_id);
CREATE INDEX idx_brand_kits_created_at ON brand_kits(created_at);
CREATE INDEX idx_brand_kits_updated_at ON brand_kits(updated_at);

CREATE INDEX idx_content_requests_user_id ON content_requests(user_id);
CREATE INDEX idx_content_requests_brand_kit_id ON content_requests(brand_kit_id);
CREATE INDEX idx_content_requests_platform ON content_requests(platform);
CREATE INDEX idx_content_requests_status ON content_requests(status);
CREATE INDEX idx_content_requests_created_at ON content_requests(created_at);
CREATE INDEX idx_content_requests_updated_at ON content_requests(updated_at);

CREATE INDEX idx_generated_posts_content_request_id ON generated_posts(content_request_id);
CREATE INDEX idx_generated_posts_platform ON generated_posts(platform);
CREATE INDEX idx_generated_posts_created_at ON generated_posts(created_at);

CREATE INDEX idx_research_insights_content_request_id ON research_insights(content_request_id);
CREATE INDEX idx_research_insights_source ON research_insights(source);
CREATE INDEX idx_research_insights_created_at ON research_insights(created_at);

-- Create function and trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_brand_kits_updated_at BEFORE UPDATE ON brand_kits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_requests_updated_at BEFORE UPDATE ON content_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert test data (optional - remove for production)
-- Insert a test user
INSERT INTO users (email, password_hash) 
VALUES ('test@demo.com', 'hashed_password_demo')
ON CONFLICT (email) DO NOTHING;

-- Insert a test brand kit for the test user
INSERT INTO brand_kits (user_id, brand_name, tone, personality, words_to_use, words_to_avoid, example_posts)
SELECT 
    u.id,
    'Demo Brand',
    'Professional and friendly',
    'Innovative, customer-focused, trustworthy',
    ARRAY['cutting-edge', 'solution', 'excellence'],
    ARRAY['cheap', 'problematic', 'difficult'],
    'Check out our amazing new features! \\nWeekend vibes with our latest design'
FROM users u 
WHERE u.email = 'test@demo.com'
ON CONFLICT DO NOTHING;
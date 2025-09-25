-- SafeCity Profile Features - Minimal Database Enhancement
-- Run this in your Supabase SQL Editor
-- This only adds essential fields for profile functionality without major structural changes

-- Add minimal fields to users table for profile features
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure reports table ID can handle large numbers
ALTER TABLE reports ALTER COLUMN id TYPE BIGINT;

-- Add minimal fields to reports table for user tracking
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Create simple upvotes table for upvote functionality
CREATE TABLE IF NOT EXISTS upvotes (
    id SERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID,
    user_email TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate upvotes
    UNIQUE(report_id, user_id),
    UNIQUE(report_id, ip_address)
);

-- Add basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_report_id ON upvotes(report_id);

-- Function to automatically update report upvote counts
CREATE OR REPLACE FUNCTION update_report_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the upvotes count in the reports table
    UPDATE reports 
    SET upvotes = (
        SELECT COUNT(*) 
        FROM upvotes 
        WHERE report_id = COALESCE(NEW.report_id, OLD.report_id)
    )
    WHERE id = COALESCE(NEW.report_id, OLD.report_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger to automatically update upvote counts
DROP TRIGGER IF EXISTS update_upvote_count_trigger ON upvotes;
CREATE TRIGGER update_upvote_count_trigger
    AFTER INSERT OR DELETE ON upvotes
    FOR EACH ROW
    EXECUTE FUNCTION update_report_upvote_count();

-- Fix existing upvotes table if it exists with wrong data type
DO $$
BEGIN
    -- Drop and recreate upvotes table with correct data types
    DROP TABLE IF EXISTS upvotes CASCADE;
    
    CREATE TABLE upvotes (
        id SERIAL PRIMARY KEY,
        report_id BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
        user_id UUID,
        user_email TEXT,
        ip_address INET,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        
        -- Prevent duplicate upvotes
        UNIQUE(report_id, user_id),
        UNIQUE(report_id, ip_address)
    );
    
    -- Recreate the index
    CREATE INDEX IF NOT EXISTS idx_upvotes_report_id ON upvotes(report_id);
    
    -- Recreate the trigger
    CREATE TRIGGER update_upvote_count_trigger
        AFTER INSERT OR DELETE ON upvotes
        FOR EACH ROW
        EXECUTE FUNCTION update_report_upvote_count();
        
END $$;

-- Success message
SELECT 'Profile features have been successfully added to your database!' as message;
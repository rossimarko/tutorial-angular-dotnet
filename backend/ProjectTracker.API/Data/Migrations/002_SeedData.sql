-- Seed test data for development
-- Demo user with email: demo@example.com and password: Demo@123
-- The bcrypt hash is pre-generated for consistency: $2a$12$j9UtxkkUx7ufKjvvVjzADu46Qj7u/6xK5pT5M7cN8pP9Q0R1S2Z3t

-- Delete existing demo user if it exists (for idempotency)
DELETE FROM [RefreshTokens] WHERE UserId IN (SELECT Id FROM [Users] WHERE Email = 'demo@example.com');
DELETE FROM [Projects] WHERE UserId IN (SELECT Id FROM [Users] WHERE Email = 'demo@example.com');
DELETE FROM [Users] WHERE Email = 'demo@example.com';

-- Insert demo user
INSERT INTO [Users] ([Email], [PasswordHash], [FirstName], [LastName], [IsActive])
VALUES ('demo@example.com', '$2a$12$j9UtxkkUx7ufKjvvVjzADu46Qj7u/6xK5pT5M7cN8pP9Q0R1S2Z3t', 'Demo', 'User', 1);

-- Get the inserted user ID and insert some sample projects
DECLARE @UserId INT = (SELECT TOP 1 Id FROM [Users] WHERE Email = 'demo@example.com' ORDER BY CreatedAt DESC);

INSERT INTO [Projects] ([UserId], [Title], [Description], [Status], [Priority], [StartDate], [DueDate])
VALUES 
    (@UserId, 'Setup Development Environment', 'Configure local dev environment with Angular and .NET', 'Active', 1, GETUTCDATE(), DATEADD(day, 7, GETUTCDATE())),
    (@UserId, 'Database Schema Design', 'Design and create SQL Server database schema', 'In Progress', 1, DATEADD(day, -5, GETUTCDATE()), DATEADD(day, 2, GETUTCDATE())),
    (@UserId, 'API Authentication', 'Implement JWT authentication in backend API', 'Active', 2, DATEADD(day, -3, GETUTCDATE()), DATEADD(day, 5, GETUTCDATE())),
    (@UserId, 'Frontend Components', 'Create reusable Angular components', 'Pending', 2, DATEADD(day, 3, GETUTCDATE()), DATEADD(day, 14, GETUTCDATE())),
    (@UserId, 'Unit Tests', 'Write unit tests for business logic', 'Pending', 3, DATEADD(day, 10, GETUTCDATE()), DATEADD(day, 21, GETUTCDATE()));

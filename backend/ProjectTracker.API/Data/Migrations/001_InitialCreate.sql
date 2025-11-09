-- Create Users table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Users' AND type = 'U')
BEGIN
    CREATE TABLE [Users] (
        [Id] INT PRIMARY KEY IDENTITY(1,1),
        [Email] NVARCHAR(255) NOT NULL UNIQUE,
        [PasswordHash] NVARCHAR(MAX) NOT NULL,
        [FirstName] NVARCHAR(100),
        [LastName] NVARCHAR(100),
        [IsActive] BIT DEFAULT 1,
        [CreatedAt] DATETIME2 DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 DEFAULT GETUTCDATE()
    );
END

-- Create index on Email for faster lookups
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Users_Email' AND object_id = OBJECT_ID('[Users]'))
BEGIN
    CREATE INDEX [IX_Users_Email] ON [Users]([Email]);
END

-- Create Projects table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Projects' AND type = 'U')
BEGIN
    CREATE TABLE [Projects] (
        [Id] INT PRIMARY KEY IDENTITY(1,1),
        [UserId] INT NOT NULL,
        [Title] NVARCHAR(255) NOT NULL,
        [Description] NVARCHAR(MAX),
        [Status] NVARCHAR(50) DEFAULT 'Active',
        [Priority] INT DEFAULT 1,
        [StartDate] DATETIME2,
        [DueDate] DATETIME2,
        [CreatedAt] DATETIME2 DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE
    );
END

-- Create index on UserId for faster lookups
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Projects_UserId' AND object_id = OBJECT_ID('[Projects]'))
BEGIN
    CREATE INDEX [IX_Projects_UserId] ON [Projects]([UserId]);
END

-- Create RefreshTokens table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'RefreshTokens' AND type = 'U')
BEGIN
    CREATE TABLE [RefreshTokens] (
        [Id] INT PRIMARY KEY IDENTITY(1,1),
        [UserId] INT NOT NULL,
        [Token] NVARCHAR(MAX) NOT NULL,
        [ExpiresAt] DATETIME2 NOT NULL,
        [RevokedAt] DATETIME2,
        [CreatedAt] DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE
    );
END

-- Create index on UserId and ExpiresAt
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_RefreshTokens_UserId_ExpiresAt' AND object_id = OBJECT_ID('[RefreshTokens]'))
BEGIN
    CREATE INDEX [IX_RefreshTokens_UserId_ExpiresAt] ON [RefreshTokens]([UserId], [ExpiresAt]);
END

-- Create Users table
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

-- Create index on Email for faster lookups
CREATE INDEX [IX_Users_Email] ON [Users]([Email]);

-- Create Projects table
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

-- Create index on UserId for faster lookups
CREATE INDEX [IX_Projects_UserId] ON [Projects]([UserId]);

-- Create RefreshTokens table
CREATE TABLE [RefreshTokens] (
    [Id] INT PRIMARY KEY IDENTITY(1,1),
    [UserId] INT NOT NULL,
    [Token] NVARCHAR(MAX) NOT NULL,
    [ExpiresAt] DATETIME2 NOT NULL,
    [RevokedAt] DATETIME2,
    [CreatedAt] DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE
);

-- Create index on UserId and ExpiresAt
CREATE INDEX [IX_RefreshTokens_UserId_ExpiresAt] ON [RefreshTokens]([UserId], [ExpiresAt]);

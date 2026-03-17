-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "twitchUserId" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "profileImageUrl" TEXT,
    "broadcasterType" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TwitchConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "encryptedAccessToken" TEXT NOT NULL,
    "encryptedRefreshToken" TEXT NOT NULL,
    "tokenExpiresAt" DATETIME NOT NULL,
    "scopeText" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "channelLogin" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISCONNECTED',
    "eventSubSessionId" TEXT,
    "lastError" TEXT,
    "lastConnectedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TwitchConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GiveawaySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "broadcasterId" TEXT NOT NULL,
    "overlayKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "entryCommand" TEXT NOT NULL DEFAULT '!join',
    "leaveCommand" TEXT NOT NULL DEFAULT '!leave',
    "status" TEXT NOT NULL DEFAULT 'CLOSED',
    "removeWinnerAfterDraw" BOOLEAN NOT NULL DEFAULT true,
    "allowDuplicateEntries" BOOLEAN NOT NULL DEFAULT false,
    "maxEntriesPerUser" INTEGER NOT NULL DEFAULT 1,
    "followerOnlyMode" BOOLEAN NOT NULL DEFAULT false,
    "subscriberOnlyMode" BOOLEAN NOT NULL DEFAULT false,
    "announceWinnerInChat" BOOLEAN NOT NULL DEFAULT true,
    "excludeBroadcaster" BOOLEAN NOT NULL DEFAULT true,
    "minimumAccountAgeDays" INTEGER NOT NULL DEFAULT 0,
    "spinCountdownSeconds" INTEGER NOT NULL DEFAULT 4,
    "lastSpinPayloadJson" TEXT,
    "lastWinnerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GiveawaySession_broadcasterId_fkey" FOREIGN KEY ("broadcasterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entrant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "giveawaySessionId" TEXT NOT NULL,
    "twitchUserId" TEXT,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "entryCount" INTEGER NOT NULL DEFAULT 1,
    "isFollower" BOOLEAN NOT NULL DEFAULT false,
    "isSubscriber" BOOLEAN NOT NULL DEFAULT false,
    "isVip" BOOLEAN NOT NULL DEFAULT false,
    "isModerator" BOOLEAN NOT NULL DEFAULT false,
    "isBroadcaster" BOOLEAN NOT NULL DEFAULT false,
    "accountCreatedAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "removedReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Entrant_giveawaySessionId_fkey" FOREIGN KEY ("giveawaySessionId") REFERENCES "GiveawaySession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Winner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "giveawaySessionId" TEXT NOT NULL,
    "entrantId" TEXT,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "twitchUserId" TEXT,
    "selectedWeight" REAL NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'draw',
    "announcedInChat" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Winner_giveawaySessionId_fkey" FOREIGN KEY ("giveawaySessionId") REFERENCES "GiveawaySession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Winner_entrantId_fkey" FOREIGN KEY ("entrantId") REFERENCES "Entrant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoleWeightSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "broadcasterId" TEXT NOT NULL,
    "viewerWeight" REAL NOT NULL DEFAULT 1,
    "followerWeight" REAL NOT NULL DEFAULT 1.25,
    "subscriberWeight" REAL NOT NULL DEFAULT 2,
    "vipWeight" REAL NOT NULL DEFAULT 2.5,
    "moderatorWeight" REAL NOT NULL DEFAULT 3,
    "broadcasterWeight" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoleWeightSettings_broadcasterId_fkey" FOREIGN KEY ("broadcasterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserWeightOverride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "broadcasterId" TEXT NOT NULL,
    "usernameLower" TEXT NOT NULL,
    "usernameDisplay" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserWeightOverride_broadcasterId_fkey" FOREIGN KEY ("broadcasterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "broadcasterId" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorLogin" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadataJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_broadcasterId_fkey" FOREIGN KEY ("broadcasterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_twitchUserId_key" ON "User"("twitchUserId");

-- CreateIndex
CREATE UNIQUE INDEX "TwitchConnection_userId_key" ON "TwitchConnection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GiveawaySession_overlayKey_key" ON "GiveawaySession"("overlayKey");

-- CreateIndex
CREATE INDEX "GiveawaySession_broadcasterId_createdAt_idx" ON "GiveawaySession"("broadcasterId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Entrant_giveawaySessionId_isActive_idx" ON "Entrant"("giveawaySessionId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Entrant_giveawaySessionId_username_key" ON "Entrant"("giveawaySessionId", "username");

-- CreateIndex
CREATE INDEX "Winner_giveawaySessionId_createdAt_idx" ON "Winner"("giveawaySessionId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "RoleWeightSettings_broadcasterId_key" ON "RoleWeightSettings"("broadcasterId");

-- CreateIndex
CREATE UNIQUE INDEX "UserWeightOverride_broadcasterId_usernameLower_key" ON "UserWeightOverride"("broadcasterId", "usernameLower");

-- CreateIndex
CREATE INDEX "AuditLog_broadcasterId_createdAt_idx" ON "AuditLog"("broadcasterId", "createdAt" DESC);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GiveawaySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "broadcasterId" TEXT NOT NULL,
    "overlayKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "entryCommand" TEXT NOT NULL DEFAULT '!ticket',
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
    "minimumFollowageDays" INTEGER NOT NULL DEFAULT 0,
    "spinCountdownSeconds" INTEGER NOT NULL DEFAULT 1,
    "lastSpinPayloadJson" TEXT,
    "lastWinnerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GiveawaySession_broadcasterId_fkey" FOREIGN KEY ("broadcasterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GiveawaySession" ("allowDuplicateEntries", "announceWinnerInChat", "broadcasterId", "createdAt", "entryCommand", "excludeBroadcaster", "followerOnlyMode", "id", "lastSpinPayloadJson", "lastWinnerId", "leaveCommand", "maxEntriesPerUser", "minimumAccountAgeDays", "overlayKey", "removeWinnerAfterDraw", "spinCountdownSeconds", "status", "subscriberOnlyMode", "title", "updatedAt") SELECT "allowDuplicateEntries", "announceWinnerInChat", "broadcasterId", "createdAt", "entryCommand", "excludeBroadcaster", "followerOnlyMode", "id", "lastSpinPayloadJson", "lastWinnerId", "leaveCommand", "maxEntriesPerUser", "minimumAccountAgeDays", "overlayKey", "removeWinnerAfterDraw", "spinCountdownSeconds", "status", "subscriberOnlyMode", "title", "updatedAt" FROM "GiveawaySession";
DROP TABLE "GiveawaySession";
ALTER TABLE "new_GiveawaySession" RENAME TO "GiveawaySession";
CREATE UNIQUE INDEX "GiveawaySession_overlayKey_key" ON "GiveawaySession"("overlayKey");
CREATE INDEX "GiveawaySession_broadcasterId_createdAt_idx" ON "GiveawaySession"("broadcasterId", "createdAt" DESC);
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

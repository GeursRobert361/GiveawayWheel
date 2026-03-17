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
    "spinCountdownSeconds" INTEGER NOT NULL DEFAULT 1,
    "lastSpinPayloadJson" TEXT,
    "lastWinnerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GiveawaySession_broadcasterId_fkey" FOREIGN KEY ("broadcasterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_GiveawaySession" (
    "id",
    "broadcasterId",
    "overlayKey",
    "title",
    "entryCommand",
    "leaveCommand",
    "status",
    "removeWinnerAfterDraw",
    "allowDuplicateEntries",
    "maxEntriesPerUser",
    "followerOnlyMode",
    "subscriberOnlyMode",
    "announceWinnerInChat",
    "excludeBroadcaster",
    "minimumAccountAgeDays",
    "spinCountdownSeconds",
    "lastSpinPayloadJson",
    "lastWinnerId",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "broadcasterId",
    "overlayKey",
    "title",
    "entryCommand",
    "leaveCommand",
    "status",
    "removeWinnerAfterDraw",
    "allowDuplicateEntries",
    "maxEntriesPerUser",
    "followerOnlyMode",
    "subscriberOnlyMode",
    "announceWinnerInChat",
    "excludeBroadcaster",
    "minimumAccountAgeDays",
    CASE
        WHEN "spinCountdownSeconds" = 4 THEN 1
        ELSE "spinCountdownSeconds"
    END,
    "lastSpinPayloadJson",
    "lastWinnerId",
    "createdAt",
    "updatedAt"
FROM "GiveawaySession";

DROP TABLE "GiveawaySession";
ALTER TABLE "new_GiveawaySession" RENAME TO "GiveawaySession";

CREATE UNIQUE INDEX "GiveawaySession_overlayKey_key" ON "GiveawaySession"("overlayKey");
CREATE INDEX "GiveawaySession_broadcasterId_createdAt_idx" ON "GiveawaySession"("broadcasterId", "createdAt" DESC);

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

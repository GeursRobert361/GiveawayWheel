export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

export interface WeightSettingsView {
  viewerWeight: number;
  followerWeight: number;
  subscriberWeight: number;
  vipWeight: number;
  moderatorWeight: number;
  broadcasterWeight: number;
}

export interface WeightOverrideView {
  id: string;
  username: string;
  weight: number;
  isBlocked: boolean;
  notes: string | null;
}

export interface WeightedEntrantView {
  id: string;
  username: string;
  displayName: string;
  entryCount: number;
  effectiveWeight: number;
  multiplier: number;
  roleLabel: string;
  chancePercent: number;
  isEligible: boolean;
  roleFlags: {
    follower: boolean;
    subscriber: boolean;
    vip: boolean;
    moderator: boolean;
    broadcaster: boolean;
  };
  accountCreatedAt: string | null;
  updatedAt: string;
}

export interface WinnerView {
  id: string;
  username: string;
  displayName: string;
  selectedWeight: number;
  source: string;
  announcedInChat: boolean;
  createdAt: string;
}

export interface AuditLogView {
  id: string;
  actorType: string;
  actorLogin: string;
  action: string;
  message: string;
  createdAt: string;
}

export interface LastSpinPayload {
  eventId: string;
  winnerEntrantId: string;
  winnerUsername: string;
  winnerDisplayName: string;
  winnerChancePercent: number;
  targetIndex: number;
  entrantCount: number;
  rotationDegrees: number;
  durationMs: number;
  countdownSeconds: number;
  scheduledAt: string;
  completedAt: string;
  source: string;
}

export interface GiveawaySnapshot {
  id: string;
  overlayKey: string;
  title: string;
  entryCommand: string;
  leaveCommand: string;
  status: "OPEN" | "CLOSED";
  removeWinnerAfterDraw: boolean;
  allowDuplicateEntries: boolean;
  maxEntriesPerUser: number;
  followerOnlyMode: boolean;
  subscriberOnlyMode: boolean;
  announceWinnerInChat: boolean;
  excludeBroadcaster: boolean;
  minimumAccountAgeDays: number;
  minimumFollowageDays: number;
  spinCountdownSeconds: number;
  overlayVisible: boolean;
  entrants: WeightedEntrantView[];
  entrantCount: number;
  winners: WinnerView[];
  recentActivity: AuditLogView[];
  weightSettings: WeightSettingsView;
  overrides: WeightOverrideView[];
  lastSpin: LastSpinPayload | null;
  resetCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSnapshot {
  broadcaster: {
    id: string;
    login: string;
    displayName: string;
    profileImageUrl: string | null;
    channelId: string | null;
    channelLogin: string | null;
    channelName: string | null;
    hasCompletedSetup: boolean;
  };
  twitch: {
    status: ConnectionStatus;
    lastError: string | null;
    eventSubSessionId: string | null;
    lastConnectedAt: string | null;
  };
  giveaway: GiveawaySnapshot | null;
  overlayUrl: string | null;
  generatedAt: string;
}

export interface OverlaySnapshot {
  overlayKey: string;
  title: string;
  status: "OPEN" | "CLOSED";
  entryCommand: string;
  entrantCount: number;
  overlayVisible: boolean;
  entrants: Array<{
    id: string;
    displayName: string;
    chancePercent: number;
    effectiveWeight: number;
  }>;
  winners: WinnerView[];
  lastSpin: LastSpinPayload | null;
  generatedAt: string;
}

export interface HistoryItem extends WinnerView {
  sessionTitle: string;
}

export interface MeResponse {
  broadcaster: DashboardSnapshot["broadcaster"];
  twitch: DashboardSnapshot["twitch"];
  overlayUrl: string | null;
  hasCompletedSetup: boolean;
}

export type PublicConnectionStatus = "connected" | "reconnecting" | "disconnected";

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

export interface DashboardSnapshot {
  broadcaster: {
    id: string;
    login: string;
    displayName: string;
    profileImageUrl: string | null;
    channelId: string | null;
    channelLogin: string | null;
    channelName: string | null;
  };
  twitch: {
    status: PublicConnectionStatus;
    lastError: string | null;
    eventSubSessionId: string | null;
    lastConnectedAt: string | null;
  };
  giveaway: {
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
    createdAt: string;
    updatedAt: string;
  } | null;
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
  entrants: Array<Pick<WeightedEntrantView, "id" | "displayName" | "chancePercent" | "effectiveWeight">>;
  winners: WinnerView[];
  lastSpin: LastSpinPayload | null;
  generatedAt: string;
}

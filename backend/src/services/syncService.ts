import type WebSocket from "ws";
import { LiveUpdateHub } from "./liveUpdateHub";
import { SnapshotService } from "./snapshotService";

export class SyncService {
  constructor(
    private readonly snapshotService: SnapshotService,
    private readonly liveUpdateHub: LiveUpdateHub
  ) {}

  async sendDashboardSnapshot(userId: string, socket: WebSocket) {
    this.liveUpdateHub.registerDashboard(userId, socket);
    socket.send(
      JSON.stringify({
        type: "snapshot",
        scope: "dashboard",
        data: await this.snapshotService.getDashboardSnapshot(userId)
      })
    );
  }

  async sendOverlaySnapshot(overlayKey: string, socket: WebSocket) {
    this.liveUpdateHub.registerOverlay(overlayKey, socket);
    socket.send(
      JSON.stringify({
        type: "snapshot",
        scope: "overlay",
        data: await this.snapshotService.getOverlaySnapshotByKey(overlayKey)
      })
    );
  }

  async broadcastForUser(userId: string) {
    const dashboard = await this.snapshotService.getDashboardSnapshot(userId);
    this.liveUpdateHub.broadcastDashboard(userId, {
      type: "snapshot",
      scope: "dashboard",
      data: dashboard
    });

    if (dashboard.giveaway) {
      const overlay = await this.snapshotService.getOverlaySnapshotByKey(dashboard.giveaway.overlayKey);
      this.liveUpdateHub.broadcastOverlay(dashboard.giveaway.overlayKey, {
        type: "snapshot",
        scope: "overlay",
        data: overlay
      });
    }
  }
}

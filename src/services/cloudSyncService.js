class CloudSyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.lastSyncTime = localStorage.getItem('izaia_last_cloud_sync') || null;
    this.syncStatus = 'synced'; // 'synced' | 'syncing' | 'offline' | 'error'
    this.listeners = [];

    window.addEventListener('online', () => this.setOnlineStatus(true));
    window.addEventListener('offline', () => this.setOnlineStatus(false));
  }

  setOnlineStatus(online) {
    this.isOnline = online;
    this.syncStatus = online ? 'synced' : 'offline';
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(l => l({
      isOnline: this.isOnline,
      syncStatus: this.syncStatus,
      lastSyncTime: this.lastSyncTime
    }));
  }

  async syncPatientData(data) {
    if (!this.isOnline) {
      this.syncStatus = 'offline';
      this.notifyListeners();
      return { success: false, reason: 'offline' };
    }

    this.syncStatus = 'syncing';
    this.notifyListeners();

    // Simulate Cloud API latency & encryption handshake
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date().toISOString();
        this.lastSyncTime = now;
        localStorage.setItem('izaia_last_cloud_sync', now);
        this.syncStatus = 'synced';
        this.notifyListeners();
        resolve({ success: true, timestamp: now });
      }, 1200);
    });
  }
}

export const cloudSyncService = new CloudSyncService();

type SyncStatusValue = 'pending' | 'synced' | 'error';

export class SyncStatus {
  constructor(readonly value: SyncStatusValue) {
    Object.freeze(this);
  }

  isPending(): boolean { return this.value === 'pending'; }
  isSynced(): boolean  { return this.value === 'synced'; }
  isError(): boolean   { return this.value === 'error'; }

  toSynced(): SyncStatus {
    return new SyncStatus('synced');
  }

  toError(): SyncStatus {
    if (this.value === 'synced') {
      throw new Error("Não é possível alterar o status de 'synced' para 'error'.");
    }
    return new SyncStatus('error');
  }

  equals(other: SyncStatus): boolean {
    return this.value === other.value;
  }

  // Factory methods
  static pending(): SyncStatus { return new SyncStatus('pending'); }
  static synced(): SyncStatus  { return new SyncStatus('synced'); }
  static error(): SyncStatus   { return new SyncStatus('error'); }
}

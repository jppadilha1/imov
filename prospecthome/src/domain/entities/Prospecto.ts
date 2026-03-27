import { Coordinates } from "../value-objects/Coordinates";
import { PhotoPath } from "../value-objects/PhotoPath";
import { Address } from "../value-objects/Address";
import { ProspectoStatus } from "../value-objects/ProspectoStatus";
import { SyncStatus } from "../value-objects/SyncStatus";

type CreateParams = {
  id: string;
  userId: string;
  photoPath: PhotoPath;
  coordinates: Coordinates;
  notes?: string;
};

type ReconstructParams = {
  id: string;
  userId: string;
  photoPath: PhotoPath;
  coordinates: Coordinates;
  address: Address | null;
  notes: string | null;
  status: ProspectoStatus;
  syncStatus: SyncStatus;
  remoteId: string | null;
  createdAt: Date;
};

export class Prospecto {
  readonly id: string;
  readonly userId: string;
  readonly photoPath: PhotoPath;
  readonly coordinates: Coordinates;
  readonly createdAt: Date;

  private _address: Address | null = null;
  private _notes: string | null = null;
  private _status: ProspectoStatus;
  private _syncStatus: SyncStatus;
  private _remoteId: string | null = null;

  get address(): Address | null { return this._address; }
  get notes(): string | null { return this._notes; }
  get status(): ProspectoStatus { return this._status; }
  get syncStatus(): SyncStatus { return this._syncStatus; }
  get remoteId(): string | null { return this._remoteId; }

  private constructor(params: CreateParams | ReconstructParams) {
    this.id = params.id;
    this.userId = params.userId;
    this.photoPath = params.photoPath;
    this.coordinates = params.coordinates;

    if ('createdAt' in params) {
      this.createdAt = params.createdAt;
      this._address = params.address;
      this._notes = params.notes;
      this._status = params.status;
      this._syncStatus = params.syncStatus;
      this._remoteId = params.remoteId;
    } else {
      this.createdAt = new Date();
      this._address = null;
      this._notes = params.notes || null;
      this._status = ProspectoStatus.novo();
      this._syncStatus = SyncStatus.pending();
      this._remoteId = null;
    }
  }

  static create(params: CreateParams): Prospecto {
    return new Prospecto(params);
  }

  static reconstruct(params: ReconstructParams): Prospecto {
    return new Prospecto(params);
  }

  markAsContacted(): void {
    const nextStatus = ProspectoStatus.contatado();
    if (!this._status.canTransitionTo(nextStatus)) {
      throw new Error("Transição de status inválida.");
    }
    this._status = nextStatus;
  }

  updateNotes(notes: string): void {
    this._notes = notes;
  }

  resolveAddress(address: Address): void {
    this._address = address;
  }

  markSynced(remoteId: string): void {
    this._remoteId = remoteId;
    this._syncStatus = this._syncStatus.toSynced();
  }

  markSyncError(): void {
    this._syncStatus = this._syncStatus.toError();
  }

  isPending(): boolean {
    return this._syncStatus.isPending();
  }
}

import { SyncStatus } from "./SyncStatus";

describe("SyncStatus Value Object", () => {
  it("deve criar o status 'pending' usando a factory method", () => {
    const status = SyncStatus.pending();
    expect(status.value).toBe("pending");
    expect(status.isPending()).toBe(true);
    expect(status.isSynced()).toBe(false);
    expect(status.isError()).toBe(false);
  });

  it("deve criar o status 'synced' usando a factory method", () => {
    const status = SyncStatus.synced();
    expect(status.value).toBe("synced");
    expect(status.isSynced()).toBe(true);
  });

  it("deve criar o status 'error' usando a factory method", () => {
    const status = SyncStatus.error();
    expect(status.value).toBe("error");
    expect(status.isError()).toBe(true);
  });

  it("deve verificar a igualdade entre instancias (equals)", () => {
    const status1 = SyncStatus.pending();
    const status2 = SyncStatus.pending();
    const status3 = SyncStatus.synced();

    expect(status1.equals(status2)).toBe(true);
    expect(status1.equals(status3)).toBe(false);
  });
});

// Vaults are configurable per unit (see lib/config.ts), so a vault id is a string.
export type VaultId = string;

export type Role = "owner" | "member";

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  vaults: VaultId[];
  salt: string;
  hash: string;
}

export interface PublicUser {
  id: string;
  username: string;
  name: string;
  role: Role;
  vaults: VaultId[];
}

export interface Chunk {
  text: string;
  embedding: number[] | null;
}

export interface DocRecord {
  id: string;
  vault: VaultId;
  title: string;
  createdAt: string;
  createdBy: string;
  chunks: Chunk[];
}

export interface AuditEntry {
  id: string;
  at: string;
  userId: string;
  username: string;
  action: string;
  detail: string;
  prevHash: string;
  hash: string;
}

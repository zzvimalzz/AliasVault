import { AliasMetadata } from '../types';

const METADATA_KEY = 'alias-metadata-v1';

export function getMetadata(): Record<string, AliasMetadata> {
  try {
    const data = localStorage.getItem(METADATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function getAliasMetadata(aliasId: string): AliasMetadata {
  const allMetadata = getMetadata();
  return allMetadata[aliasId] || {};
}

export function setAliasMetadata(aliasId: string, metadata: AliasMetadata): void {
  const allMetadata = getMetadata();
  allMetadata[aliasId] = {
    ...allMetadata[aliasId],
    ...metadata,
  };
  localStorage.setItem(METADATA_KEY, JSON.stringify(allMetadata));
}

export function deleteAliasMetadata(aliasId: string): void {
  const allMetadata = getMetadata();
  delete allMetadata[aliasId];
  localStorage.setItem(METADATA_KEY, JSON.stringify(allMetadata));
}

export function exportMetadata(): string {
  const metadata = getMetadata();
  return JSON.stringify(metadata, null, 2);
}

export function importMetadata(jsonString: string): void {
  try {
    const metadata = JSON.parse(jsonString);
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}

export function clearAllMetadata(): void {
  localStorage.removeItem(METADATA_KEY);
}

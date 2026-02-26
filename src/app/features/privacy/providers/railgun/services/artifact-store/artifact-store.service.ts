import { Injectable } from '@angular/core';
import { ArtifactStore } from '@railgun-community/wallet';

@Injectable({
  providedIn: 'root'
})
export class ArtifactStoreService {
  private rootDirPromise: Promise<FileSystemDirectoryHandle> | null = null;

  constructor() {}

  public createArtifactStore(): ArtifactStore {
    const store = new ArtifactStore(
      this.getFile.bind(this),
      this.storeFile.bind(this),
      this.fileExists.bind(this)
    );
    return store;
  }

  private async getFile(path: string): Promise<string | Uint8Array> {
    const root = await this.getRootDir();
    const { dir, fileName } = this.splitPath(path);

    const dirHandle = dir ? await this.ensureDir(root, dir) : root;
    const fileHandle = await dirHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();

    // VKEY is JSON text
    if (fileName.toLowerCase().includes('vkey')) {
      return await file.text(); // <-- return string
    }

    const buffer = await file.arrayBuffer();
    return new Uint8Array(buffer);
  }

  private async storeFile(dir: string, path: string, item: string | Uint8Array): Promise<void> {
    const root = await this.getRootDir();

    if (dir) {
      await this.ensureDir(root, dir);
    }

    const { dir: fullDir, fileName } = this.splitPath(path);
    const dirHandle = fullDir ? await this.ensureDir(root, fullDir) : root;

    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();

    const data = typeof item === 'string' ? new TextEncoder().encode(item) : item;

    await writable.write(data);
    await writable.close();
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      const root = await this.getRootDir();
      const { dir, fileName } = this.splitPath(path);
      const dirHandle = dir ? await this.ensureDir(root, dir) : root;
      await dirHandle.getFileHandle(fileName);
      return true;
    } catch {
      return false;
    }
  }

  private async getRootDir(): Promise<FileSystemDirectoryHandle> {
    if (!this.rootDirPromise) {
      this.rootDirPromise = navigator.storage.getDirectory();
    }
    return this.rootDirPromise;
  }

  private async ensureDir(
    root: FileSystemDirectoryHandle,
    path: string
  ): Promise<FileSystemDirectoryHandle> {
    const parts = path.split('/').filter(Boolean);
    let current = root;

    for (const part of parts) {
      current = await current.getDirectoryHandle(part, { create: true });
    }

    return current;
  }

  private splitPath(path: string): { dir: string; fileName: string } {
    const parts = path.split('/').filter(Boolean);
    const fileName = parts.pop()!;
    return {
      dir: parts.join('/'),
      fileName
    };
  }
}

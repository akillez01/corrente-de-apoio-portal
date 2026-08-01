import "server-only";
import { mkdir, readFile as fsReadFile, writeFile } from "fs/promises";
import { dirname, resolve, sep } from "path";

const STORAGE_ROOT = resolve(process.env.STORAGE_DIR ?? "./.data/uploads");

function resolvePath(relativePath: string): string {
  const full = resolve(STORAGE_ROOT, relativePath);
  if (full !== STORAGE_ROOT && !full.startsWith(STORAGE_ROOT + sep)) {
    throw new Error("Caminho de arquivo inválido.");
  }
  return full;
}

export async function saveFile(relativePath: string, buffer: Buffer): Promise<void> {
  const full = resolvePath(relativePath);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, buffer);
}

export async function readFile(relativePath: string): Promise<Buffer> {
  return fsReadFile(resolvePath(relativePath));
}

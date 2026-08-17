import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function filePath(name: string) {
  return path.join(dataDir, `${name}.json`);
}

export function readCollection<T>(name: string): T[] {
  ensureDataDir();
  const file = filePath(name);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "[]", "utf-8");
    return [];
  }
  const raw = fs.readFileSync(file, "utf-8");
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export function writeCollection<T>(name: string, items: T[]) {
  ensureDataDir();
  fs.writeFileSync(filePath(name), JSON.stringify(items, null, 2), "utf-8");
}

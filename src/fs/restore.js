import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

// todo:  rootPath from snapshot should be treated as metadata and must not affect restore destination. так и не понял че это значит
const restore = async () => {
  const __dirname = import.meta.dirname;
  const rootPath = path.resolve(__dirname, "../../");
  const workspaceRestoredDir = path.resolve(rootPath, "workspace_restored");

  try {
    await fs.mkdir(workspaceRestoredDir);
  } catch (err) {
    if (err.code === "EEXIST") {
      throw new Error("FS operation failed");
    }
  }

  const snapshotPath = path.resolve(rootPath, "snapshot.json");
  let snapshot;
  try {
    snapshot = JSON.parse(await fs.readFile(snapshotPath, "utf-8"));
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error("FS operation failed");
    }
  }

  for (const file of snapshot.entries) {
    if (file.type === "file") {
      const filePath = path.resolve(workspaceRestoredDir, file.path);
      await fs.writeFile(filePath, atob(file.content));
    } else if (file.type === "directory") {
      const dirPath = path.resolve(workspaceRestoredDir, file.path);
      await fs.mkdir(dirPath);
    }
  }
};

await restore();

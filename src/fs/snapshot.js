import fs from "node:fs/promises";
import fsCB from "node:fs";
import path from "node:path";

const snapshot = async () => {
  const __dirname = import.meta.dirname;

  console.log("test", path.resolve(__dirname, "../../"));

  const rootPath = path.resolve(__dirname, "../../");
  const workspaceDir = path.resolve(rootPath, "workspace");
  const files = await fs.readdir(workspaceDir, { recursive: true });

  const entries = [];
  for (const file of files) {
    const filePath = path.resolve(workspaceDir, file);
    const stat = await fs.stat(filePath);

    if (stat.isFile()) {
      const content = await fs.readFile(filePath, "utf-8");
      entries.push({ path: file, type: "file", size: stat.size, content });
    } else {
      entries.push({ path: file, type: "directory" });
    }
  }

  const result = {
    rootPath: workspaceDir,
    entries,
  };

  const snapshotFilePath = path.resolve(rootPath, "snapshot.json");
  await fs.writeFile(snapshotFilePath, JSON.stringify(result));
};

await snapshot();

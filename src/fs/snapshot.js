import fs from "node:fs/promises";
import fsCB from "node:fs";
import path from "node:path";

const snapshot = async () => {
  const __dirname = import.meta.dirname;

  const rootPath = path.resolve(__dirname, "../../workspace");
  const files = await fs.readdir(rootPath, { recursive: true });

  const entries = [];
  for (const file of files) {
    const filePath = path.resolve(rootPath, file);
    const stat = await fs.stat(filePath);

    if (stat.isFile()) {
      const content = await fs.readFile(filePath, "utf-8");
      entries.push({ path: file, type: "file", size: stat.size, content });
    } else {
      entries.push({ path: file, type: "directory" });
    }
  }

  const result = {
    rootPath,
    entries,
  };

  await fs.writeFile("snapshot.json", JSON.stringify(result));
};

await snapshot();

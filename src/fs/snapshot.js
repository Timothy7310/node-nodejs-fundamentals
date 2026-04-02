import fs from "node:fs/promises";
import fsCB from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const snapshot = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootPath = path.resolve(__dirname, "../../workspace");

  // вариант с промисами
  const jsonPromise = { rootPath, entries: [] };
  const scanPromise = async (_path) => {
    let files;
    try {
      files = await fs.readdir(_path);
    } catch (_) {
      throw new Error("FS operation failed");
    }
    for (const file of files) {
      // path.join, чтоб работало и в юникс и в винде. \ /.
      const filePath = path.join(_path, file);
      const relativePath = path.relative(rootPath, filePath);
      const stat = await fs.stat(filePath);
      if (stat.isFile()) {
        const content = await fs.readFile(filePath, { encoding: "base64" });
        jsonPromise.entries.push({
          path: relativePath,
          content,
          type: "file",
          size: stat.size,
        });
      } else {
        jsonPromise.entries.push({ path: relativePath, type: "directory" });
        await scanPromise(filePath);
      }
    }
  };
  await scanPromise(rootPath);

  // это если я правильно понял, что надо класть snapshot.json рядом с папкой workspace, а не внутрь нее класть
  const snapshotPath = path.join(path.dirname(rootPath), "snapshot.json");
  await fs.writeFile(snapshotPath, JSON.stringify(jsonPromise));

  // вариант с колбэками
  // const jsonCB = { rootPath, entries: [] };
  // const scanCB = (_path) => {
  //   fsCB.readdir(_path, {}, (err, files) => {
  //     if (err) throw new Error("FS operation failed");

  //     for (const file of files) {
  //       const filePath = path.join(_path, file);
  //       const relativePath = path.relative(rootPath, filePath);
  //       fsCB.stat(filePath, (_err, stats) => {
  //         if (stats.isFile()) {
  //           fsCB.readFile(filePath, { encoding: "base64" }, (_err, data) => {
  //             jsonCB.entries.push({
  //               path: relativePath,
  //               content: data,
  //               type: "file",
  //               size: stats.size,
  //             });
  //             const snapshotPath = path.join(
  //               path.dirname(rootPath),
  //               "snapshot.json",
  //             );
  //             fsCB.writeFile(
  //               snapshotPath,
  //               JSON.stringify(jsonCB),
  //               (_err) => {},
  //             );
  //           });
  //         } else {
  //           jsonCB.entries.push({ path: relativePath, type: "directory" });
  //           scanCB(filePath);
  //         }
  //       });
  //     }
  //   });
  // };
  // scanCB(rootPath);
};

await snapshot();

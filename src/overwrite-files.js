import fs from "fs";


const overwriteFiles = (json) => {
  Object.keys(json.publishr.files).forEach((key) => {
    const oldFilePath = json.publishr.files[key];
    const newFilePath = key;

    fs.readFile(oldFilePath, "utf8", (readErr, contents) => {
      if (readErr) {
        throw new Error(`READ ERROR: ${oldFilePath}`);
      }

      fs.writeFile(newFilePath, contents, "utf8", (writeErr) => {
        if (writeErr) {
          throw new Error("WRITE ERROR ${newFilePath}");
        }
      });
    });
  });

  fs.writeFile("package.json", JSON.stringify(json, null, 2), "utf8", (writeErr) => {
    if (writeErr) {
      throw new Error("WRITE ERROR: package.json");
    }
  });
};

export default overwriteFiles;

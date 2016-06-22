import fs from "fs";
import overwriteFiles from "./overwrite-files";
import overwritePackage from "./overwrite-package";


const postversion = () => {
  fs.readFile("package.json", "utf8", (err, contents) => {
    if (err) {
      throw new Error("Error reading package.json.");
    }

    const packageJSON = JSON.parse(contents);

    overwriteFiles(packageJSON).then((files) => {
      overwritePackage(packageJSON, files);
    });
  });
};

export default postversion;

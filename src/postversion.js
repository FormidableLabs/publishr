import fs from "fs";
import moveDependencies from "./move-dependencies";
import overwriteFiles from "./overwrite-files";


const postversion = () => {
  fs.readFile("package.json", "utf8", (readErr, contents) => {
    if (readErr) {
      console.log("READ ERROR");

      return;
    }

    const packageJSON = JSON.parse(contents);

    moveDependencies(packageJSON);
    overwriteFiles(packageJSON);
  });
};

export default postversion;

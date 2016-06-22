import fixFiles from "./fix-files";
import fs from "fs";


const postpublish = () => {
  fs.readFile("package.json", "utf8", (err, contents) => {
    if (err) {
      throw new Error("Error reading package.json.");
    }

    const packageJSON = JSON.parse(contents);

    fixFiles(packageJSON);
  });
};

export default postpublish;

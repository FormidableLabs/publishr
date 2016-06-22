import fixFiles from "./fix-files";


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

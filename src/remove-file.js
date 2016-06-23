import rm from "rimraf";


const removeFile = (filePath) => {
  rm(filePath, (err) => {
    if (err) {
      throw new Error(`Error removing ${filePath}.`);
    }
  });
};

export default removeFile;

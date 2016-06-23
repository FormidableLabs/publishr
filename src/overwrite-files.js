import handleFiles from "./handle-files";
import {Promise} from "es6-promise";


const overwriteFiles = (json) => {
  return new Promise((resolve, reject) => {
    const files = Object.keys(json.publishr.files).map((file) => ({
      newPath: file,
      oldPath: json.publishr.files[file]
    }));

    handleFiles.stat(files)
    .then(handleFiles.read)
    .then(handleFiles.write)
    .then((result) => resolve(result))
    .catch((err) => reject(err));
  });
};

export default overwriteFiles;

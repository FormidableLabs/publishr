import fileUtils from "./file-utils";
import {Promise} from "es6-promise";


const overwriteFiles = (json) => {
  return new Promise((resolve, reject) => {
    const files = Object.keys(json.publishr.files).map((file) => ({
      newPath: file,
      oldPath: json.publishr.files[file]
    }));

    fileUtils.statFiles(files)
    .then(fileUtils.readFiles)
    .then(fileUtils.writeFiles)
    .then((result) => resolve(result))
    .catch((err) => reject(err));
  });
};

export default overwriteFiles;

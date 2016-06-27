import fileUtils from "./file-utils";
import packageUtils from "./package-utils";


const fileHandler = {
  fixFiles(json) {
    json._publishr.forEach((file) => {
      if (file.created) {
        fileUtils.removeFile(file.path);
      } else {
        fileUtils.checkoutFile(file.path);
      }
    });
  },

  overwriteFiles(json) {
    const files = Object.keys(json.publishr.files).map((file) => ({
      newPath: file,
      oldPath: json.publishr.files[file]
    }));

    return fileUtils
      .statFiles(files)
      .then(fileUtils.readFiles)
      .then(fileUtils.writeFiles)
      .then((allFiles) => fileHandler.overwritePackage(json, allFiles));
  },

  overwritePackage(json, files) {
    packageUtils.updateMeta(json, files);
    packageUtils.updateDependencies(json);

    return fileUtils.writePackage(json);
  }
};

export default fileHandler;

import fileUtils from "./file-utils";
import packageUtils from "./package-utils";


const fileHandler = {
  fixFiles(json) {
    json._publishr = json._publishr || [];

    return Promise.all(json._publishr.map((file) => {
      if (file.created) {
        return fileUtils.removeFile(file.path);
      }

      return fileUtils.checkoutFile(file.path);
    }));
  },

  overwriteFiles(json) {
    json.publishr = json.publishr || {};
    json.publishr.files = json.publishr.files || {};
    json.publishr.dependencies = json.publishr.dependencies || [];

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

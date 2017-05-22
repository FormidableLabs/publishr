import { Promise } from "es6-promise";
import fileUtils from "./file-utils";
import git from "./git";
import packageUtils from "./package-utils";


const fileHandler = {
  fixFiles(json) {
    json._publishr = json._publishr || [];

    return Promise.all(json._publishr.map((file) => {
      return file.created ?
        fileUtils.removeFile(file.path) :
        git.checkout(file.path);
    }));
  },

  overwriteFiles(json) {
    json.publishr = json.publishr || {};
    json.publishr.files = json.publishr.files || {};
    json.publishr.dependencies = json.publishr.dependencies || [];
    json.publishr.scripts = json.publishr.scripts || {};

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
    packageUtils.updateScripts(json);

    return fileUtils.writePackage(json);
  }
};

export default fileHandler;

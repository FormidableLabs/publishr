import fileHandler from "./file-handler";
import fileUtils from "./file-utils";


const postversion = {
  run() {
    return fileUtils
      .readPackage()
      .then(fileHandler.overwriteFiles);
  }
};

export default postversion;

import fileHandler from "./file-handler";
import fileUtils from "./file-utils";


const postversion = () => {
  return fileUtils
    .readPackage()
    .then(fileHandler.overwriteFiles);
};

export default postversion;

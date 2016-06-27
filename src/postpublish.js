import fileHandler from "./file-handler";
import fileUtils from "./file-utils";


const postpublish = () => {
  return fileUtils
    .readPackage()
    .then(fileHandler.fixFiles);
};

export default postpublish;

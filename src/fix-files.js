import checkoutFile from "./checkout-file";
import removeFile from "./remove-file";


const fixFiles = (json) => {
  json._publishr.forEach((file) => {
    if (file.created) {
      removeFile(file.path);
    } else {
      checkoutFile(file.path);
    }
  });
};

export default fixFiles;

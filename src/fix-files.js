import {exec} from "child_process";
import rm from "rimraf";


const checkoutFile = (file) => {
  exec(`git checkout ${file.path}`, (err) => {
    if (err) {
      throw new Error(`Error checking out ${file.path}.`);
    }
  });
};

const removeFile = (file) => {
  rm(file.path, (err) => {
    if (err) {
      throw new Error(`Error removing ${file}.`);
    }
  });
};

const fixFiles = (json) => {
  const files = json._publishr;

  files.push({
    path: "package.json",
    created: false
  });

  files.forEach((file) => {
    if (file.created) {
      removeFile(file);
    } else {
      checkoutFile(file);
    }
  });
};

export default fixFiles;

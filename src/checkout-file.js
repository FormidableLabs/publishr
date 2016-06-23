import {exec} from "child_process";


const checkoutFile = (filePath) => {
  exec(`git checkout ${filePath}`, (err) => {
    if (err) {
      throw new Error(`Error checking out ${filePath}.`);
    }
  });
};

export default checkoutFile;

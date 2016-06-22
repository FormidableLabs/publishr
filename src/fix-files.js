import {exec} from "child_process";


const fixFiles = () => {
  exec("git clean -df && git checkout .", (err) => {
    if (err) {
      throw new Error("GIT ERROR");
    }
  });
};

export default fixFiles;

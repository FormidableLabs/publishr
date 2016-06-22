import {exec} from "child_process";


const postpublish = () => {
  exec("git clean -df && git checkout .", (err) => {
    if (err) {
      console.log(err);
    }
  });
};

export default postpublish;

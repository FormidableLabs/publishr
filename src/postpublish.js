import {exec} from 'child_process';


export default function postpublish() {
  exec('git clean -df && git checkout .', (err, stdout) => {
    if (err) {
      console.log(err);
    }
  });
}

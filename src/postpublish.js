import {exec} from 'child_process';


export default function postpublish() {
  exec('git clean -d && git checkout .', (err, stdout) => {
    if (err) {
      console.log(err);
    }
  });
}

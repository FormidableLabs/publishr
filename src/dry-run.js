import childProcess from "child_process";
import fileUtils from "./file-utils";
import fs from "fs";
import postpublish from "./postpublish";
import sinon from "sinon";


const dryRun = () => {
  return fileUtils
    .readPackage()
    .then((json) => {
      const sandbox = sinon.sandbox.create();

      sandbox.stub(childProcess, "exec", () => {
        console.log("called exec");
      });

      sandbox.stub(fs, "readFile", () => {
        console.log("called readFile");

        return JSON.stringify(json, null, 2);
      });

      sandbox.stub(fs, "unlink", () => {
        console.log("called unlink");
      });

      postpublish();

      sandbox.restore();
    });
};

export default dryRun;

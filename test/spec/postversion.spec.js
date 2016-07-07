import {Promise} from "es6-promise";
import fileHandler from "file-handler";
import fileUtils from "file-utils";
import postversion from "postversion";
import sinon from "sinon";


describe("postversion", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  it("should overwrite files", () => {
    const contents = {
      publishr: {
        dependencies: ["^babel"]
      }
    };
    const files = [{newPath: "file.js"}];

    sandbox.stub(fileHandler, "overwriteFiles").returns(Promise.resolve(files));
    sandbox.stub(fileUtils, "readPackage").returns(Promise.resolve(contents));

    return postversion.run().then(() => {
      expect(fileUtils.readPackage).to.have.callCount(1);
      expect(fileHandler.overwriteFiles)
        .to.have.callCount(1).and
        .to.have.been.calledWith({
          publishr: {
            dependencies: ["^babel"]
          }
        });
    });
  });
});

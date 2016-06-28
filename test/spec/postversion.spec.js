import {Promise} from "es6-promise";
import fileHandler from "file-handler";
import fileUtils from "file-utils";
import postversion from "postversion";
import sinon from "sinon";


describe("postversion", () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it("should overwrite files", () => {
    const contents = {
      publishr: {
        dependencies: ["^babel"]
      }
    };
    const files = [{newPath: "file.js"}];

    sandbox.stub(fileHandler, "overwriteFiles", () => Promise.resolve(files));
    sandbox.stub(fileUtils, "readPackage", () => Promise.resolve(contents));

    return postversion().then(() => {
      expect(fileUtils.readPackage).to.have.callCount(1);
      expect(fileHandler.overwriteFiles).to.have.callCount(1);
      expect(fileHandler.overwriteFiles).to.have.been.calledWith({
        publishr: {
          dependencies: ["^babel"]
        }
      });
    });
  });
});

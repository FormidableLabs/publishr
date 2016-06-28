import {Promise} from "es6-promise";
import fileUtils from "file-utils";
import fileHandler from "file-handler";
import postpublish from "postpublish";
import sinon from "sinon";


describe("postpublish", () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it("should fix files", () => {
    const contents = {
      _publishr: [{
        created: true,
        path: "file.js"
      }]
    };

    sandbox.stub(fileUtils, "readPackage", () => Promise.resolve(contents));
    sandbox.stub(fileHandler, "fixFiles");

    return postpublish().then(() => {
      expect(fileUtils.readPackage).to.have.callCount(1);
      expect(fileHandler.fixFiles)
      .to.have.callCount(1).and
      .to.have.been.calledWith({
        _publishr: [{
          created: true,
          path: "file.js"
        }]
      });
    });
  });
});

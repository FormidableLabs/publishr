import {Promise} from "es6-promise";
import fileUtils from "file-utils";
import overwriteFiles from "overwrite-files";
import sinon from "sinon";


describe("overwriteFiles", () => {
  it("should stat, read, and write files", () => {
    const handler = (files) => Promise.resolve(files);

    sinon.stub(fileUtils, "statFiles", handler);
    sinon.stub(fileUtils, "readFiles", handler);
    sinon.stub(fileUtils, "writeFiles", handler);

    return overwriteFiles({
      publishr: {
        files: {
          "first.js": "first.js.publishr",
          "second.js": "second.js.publishr"
        }
      }
    }).then((files) => {
      expect(fileUtils.statFiles).to.have.callCount(1);
      expect(fileUtils.readFiles).to.have.callCount(1);
      expect(fileUtils.writeFiles).to.have.callCount(1);
      expect(files).to.deep.equal([{
        newPath: "first.js",
        oldPath: "first.js.publishr"
      }, {
        newPath: "second.js",
        oldPath: "second.js.publishr"
      }]);

      fileUtils.statFiles.restore();
      fileUtils.readFiles.restore();
      fileUtils.writeFiles.restore();
    });
  });

  it("should reject on an error", () => {
    const mockErr = new Error("Something bad happend!");

    sinon.stub(fileUtils, "statFiles", () => {
      return new Promise((resolve, reject) => {
        reject(mockErr);
      });
    });

    return overwriteFiles({
      publishr: {
        files: {
          "file.js": "file.js.publishr"
        }
      }
    }).catch((err) => {
      expect(err).to.equal(mockErr);

      fileUtils.statFiles.restore();
    });
  });
});

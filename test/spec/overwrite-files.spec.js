import {Promise} from "es6-promise";
import handleFiles from "handle-files";
import overwriteFiles from "overwrite-files";
import sinon from "sinon";


describe("overwriteFiles", () => {
  it("should stat, read, and write files", () => {
    const handler = (files) => Promise.resolve(files);

    sinon.stub(handleFiles, "stat", handler);
    sinon.stub(handleFiles, "read", handler);
    sinon.stub(handleFiles, "write", handler);

    return overwriteFiles({
      publishr: {
        files: {
          "first.js": "first.js.publishr",
          "second.js": "second.js.publishr"
        }
      }
    }).then((files) => {
      expect(handleFiles.stat).to.have.callCount(1);
      expect(handleFiles.read).to.have.callCount(1);
      expect(handleFiles.write).to.have.callCount(1);
      expect(files).to.deep.equal([{
        newPath: "first.js",
        oldPath: "first.js.publishr"
      }, {
        newPath: "second.js",
        oldPath: "second.js.publishr"
      }]);

      handleFiles.stat.restore();
      handleFiles.read.restore();
      handleFiles.write.restore();
    });
  });

  it("should reject on an error", () => {
    const mockErr = new Error("Something bad happend!");

    sinon.stub(handleFiles, "stat", () => {
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

      handleFiles.stat.restore();
    });
  });
});

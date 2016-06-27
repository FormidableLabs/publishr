import {Promise} from "es6-promise";
import fileUtils from "file-utils";
import fileHandler from "file-handler";
import packageUtils from "package-utils";
import sinon from "sinon";


describe("fileHandler", () => {
  describe("fixFiles", () => {
    it("should checkout files", () => {
      sinon.stub(fileUtils, "checkoutFile");
      sinon.stub(fileUtils, "removeFile");

      fileHandler.fixFiles({
        _publishr: [{
          created: false,
          path: "checkout.js"
        }]
      });
      expect(fileUtils.removeFile).to.have.callCount(0);
      expect(fileUtils.checkoutFile).to.have.callCount(1);
      expect(fileUtils.checkoutFile).to.have.been.calledWith("checkout.js");

      fileUtils.checkoutFile.restore();
      fileUtils.removeFile.restore();
    });

    it("should remove files", () => {
      sinon.stub(fileUtils, "checkoutFile");
      sinon.stub(fileUtils, "removeFile");

      fileHandler.fixFiles({
        _publishr: [{
          created: true,
          path: "remove.js"
        }]
      });
      expect(fileUtils.checkoutFile).to.have.callCount(0);
      expect(fileUtils.removeFile).to.have.callCount(1);
      expect(fileUtils.removeFile).to.have.been.calledWith("remove.js");

      fileUtils.checkoutFile.restore();
      fileUtils.removeFile.restore();
    });

    it("should handle multiple files", () => {
      sinon.stub(fileUtils, "checkoutFile");
      sinon.stub(fileUtils, "removeFile");

      fileHandler.fixFiles({
        _publishr: [{
          created: false,
          path: "checkout1.js"
        }, {
          created: true,
          path: "remove1.js"
        }, {
          created: false,
          path: "checkout2.js"
        }, {
          created: true,
          path: "remove2.js"
        }]
      });
      expect(fileUtils.checkoutFile).to.have.callCount(2);
      expect(fileUtils.removeFile).to.have.callCount(2);
      expect(fileUtils.checkoutFile).to.have.been.calledWith("checkout1.js");
      expect(fileUtils.checkoutFile).to.have.been.calledWith("checkout2.js");
      expect(fileUtils.removeFile).to.have.been.calledWith("remove1.js");
      expect(fileUtils.removeFile).to.have.been.calledWith("remove2.js");

      fileUtils.checkoutFile.restore();
      fileUtils.removeFile.restore();
    });
  });

  describe("overwriteFiles", () => {
    it("should overwrite files", () => {
      const handler = (files) => Promise.resolve(files);

      sinon.stub(fileUtils, "statFiles", handler);
      sinon.stub(fileUtils, "readFiles", handler);
      sinon.stub(fileUtils, "writeFiles", handler);
      sinon.stub(fileHandler, "overwritePackage", handler);

      return fileHandler.overwriteFiles({
        publishr: {
          files: {
            "first.js": "first.js.publishr",
            "second.js": "second.js.publishr"
          }
        }
      }).then((json) => {
        expect(fileUtils.statFiles).to.have.callCount(1);
        expect(fileUtils.readFiles).to.have.callCount(1);
        expect(fileUtils.writeFiles).to.have.callCount(1);
        expect(fileHandler.overwritePackage).to.have.callCount(1);
        expect(fileUtils.statFiles).to.have.been.calledWith([{
          newPath: "first.js",
          oldPath: "first.js.publishr"
        }, {
          newPath: "second.js",
          oldPath: "second.js.publishr"
        }]);
        expect(json).to.deep.equal({
          publishr: {
            files: {
              "first.js": "first.js.publishr",
              "second.js": "second.js.publishr"
            }
          }
        });

        fileUtils.statFiles.restore();
        fileUtils.readFiles.restore();
        fileUtils.writeFiles.restore();
        fileHandler.overwritePackage.restore();
      });
    });

    it("should reject on an error", () => {
      const mockErr = new Error("Something bad happend!");

      sinon.stub(fileUtils, "statFiles", () => {
        return new Promise((resolve, reject) => {
          reject(mockErr);
        });
      });

      return fileHandler.overwriteFiles({
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

  describe("overwritePackage", () => {
    it("should overwrite the package.json file", () => {
      const packageJSON = {
        dependencies: {
          babel: "1.0.0"
        },
        devDependencies: {
          eslint: "1.0.0"
        }
      };
      const files = [{
        created: false,
        path: ".npmignore"
      }];

      sinon.stub(fileUtils, "writePackage", () => Promise.resolve());
      sinon.stub(packageUtils, "updateDependencies");
      sinon.stub(packageUtils, "updateMeta");

      return fileHandler.overwritePackage(packageJSON, files).then(() => {
        expect(packageUtils.updateDependencies).to.have.callCount(1);
        expect(packageUtils.updateMeta).to.have.callCount(1);
        expect(fileUtils.writePackage).to.have.callCount(1);
        expect(packageUtils.updateDependencies).to.have.been.calledWith(packageJSON);
        expect(packageUtils.updateMeta).to.have.been.calledWith(packageJSON, files);
        expect(fileUtils.writePackage).to.have.been.calledWith({
          dependencies: {
            babel: "1.0.0"
          },
          devDependencies: {
            eslint: "1.0.0"
          }
        });

        fileUtils.writePackage.restore();
        packageUtils.updateDependencies.restore();
        packageUtils.updateMeta.restore();
      });
    });
  });
});

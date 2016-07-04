import {Promise} from "es6-promise";
import fileUtils from "file-utils";
import fileHandler from "file-handler";
import packageUtils from "package-utils";
import sinon from "sinon";


describe("fileHandler", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("fixFiles", () => {
    it("should checkout files", () => {
      sandbox.stub(fileUtils, "checkoutFile");
      sandbox.stub(fileUtils, "removeFile");

      fileHandler.fixFiles({
        _publishr: [{
          created: false,
          path: "checkout.js"
        }]
      });
      expect(fileUtils.removeFile).to.have.callCount(0);
      expect(fileUtils.checkoutFile)
        .to.have.callCount(1).and
        .to.have.been.calledWith("checkout.js");
    });

    it("should remove files", () => {
      sandbox.stub(fileUtils, "checkoutFile");
      sandbox.stub(fileUtils, "removeFile");

      fileHandler.fixFiles({
        _publishr: [{
          created: true,
          path: "remove.js"
        }]
      });
      expect(fileUtils.checkoutFile).to.have.callCount(0);
      expect(fileUtils.removeFile)
        .to.have.callCount(1).and
        .to.have.been.calledWith("remove.js");
    });

    it("should handle multiple files", () => {
      sandbox.stub(fileUtils, "checkoutFile");
      sandbox.stub(fileUtils, "removeFile");

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
      expect(fileUtils.checkoutFile)
        .to.have.callCount(2).and
        .to.have.been.calledWith("checkout1.js").and
        .to.have.been.calledWith("checkout2.js");
      expect(fileUtils.removeFile)
        .to.have.callCount(2).and
        .to.have.been.calledWith("remove1.js").and
        .to.have.been.calledWith("remove2.js");
    });

    it("should handle no _publishr config", () => {
      sandbox.stub(fileUtils, "checkoutFile");
      sandbox.stub(fileUtils, "removeFile");

      fileHandler.fixFiles({});
      expect(fileUtils.checkoutFile).to.have.callCount(0);
      expect(fileUtils.removeFile).to.have.callCount(0);
    });
  });

  describe("overwriteFiles", () => {
    it("should overwrite files", () => {
      const handler = (files) => Promise.resolve(files);

      sandbox.stub(fileUtils, "statFiles", handler);
      sandbox.stub(fileUtils, "readFiles", handler);
      sandbox.stub(fileUtils, "writeFiles", handler);
      sandbox.stub(fileHandler, "overwritePackage", handler);

      return fileHandler.overwriteFiles({
        publishr: {
          files: {
            "first.js": "first.js.publishr",
            "second.js": "second.js.publishr"
          }
        }
      }).then((json) => {
        expect(fileUtils.statFiles)
          .to.have.callCount(1).and
          .to.have.been.calledWith([{
            newPath: "first.js",
            oldPath: "first.js.publishr"
          }, {
            newPath: "second.js",
            oldPath: "second.js.publishr"
          }]);
        expect(fileUtils.readFiles).to.have.callCount(1);
        expect(fileUtils.writeFiles).to.have.callCount(1);
        expect(fileHandler.overwritePackage).to.have.callCount(1);
        expect(json).to.deep.equal({
          publishr: {
            dependencies: [],
            files: {
              "first.js": "first.js.publishr",
              "second.js": "second.js.publishr"
            }
          }
        });
      });
    });

    it("should reject on an error", () => {
      const mockErr = new Error("Something bad happend!");

      sandbox.stub(fileUtils, "statFiles", () => Promise.reject(mockErr));

      return fileHandler.overwriteFiles({
        publishr: {
          files: {
            "file.js": "file.js.publishr"
          }
        }
      }).catch((err) => {
        expect(err).to.equal(mockErr);
      });
    });

    it("should handle no publishr config", () => {
      const handler = (files) => Promise.resolve(files);

      sandbox.stub(fileUtils, "statFiles", handler);
      sandbox.stub(fileUtils, "readFiles", handler);
      sandbox.stub(fileUtils, "writeFiles", handler);
      sandbox.stub(fileHandler, "overwritePackage", handler);

      return fileHandler.overwriteFiles({}).then((json) => {
        expect(fileUtils.statFiles)
          .to.have.callCount(1).and
          .to.have.been.calledWith([]);
        expect(fileUtils.readFiles).to.have.callCount(1);
        expect(fileUtils.writeFiles).to.have.callCount(1);
        expect(fileHandler.overwritePackage).to.have.callCount(1);
        expect(json).to.deep.equal({
          publishr: {
            dependencies: [],
            files: {}
          }
        });
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

      sandbox.stub(fileUtils, "writePackage", () => Promise.resolve());
      sandbox.stub(packageUtils, "updateDependencies");
      sandbox.stub(packageUtils, "updateMeta");

      return fileHandler.overwritePackage(packageJSON, files).then(() => {
        expect(packageUtils.updateDependencies)
          .to.have.callCount(1).and
          .to.have.been.calledWith(packageJSON);
        expect(packageUtils.updateMeta)
          .to.have.callCount(1).and
          .to.have.been.calledWith(packageJSON, files);
        expect(fileUtils.writePackage)
          .to.have.callCount(1).and
          .to.have.been.calledWith({
            dependencies: {
              babel: "1.0.0"
            },
            devDependencies: {
              eslint: "1.0.0"
            }
          });
      });
    });
  });
});

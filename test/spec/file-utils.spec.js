/* eslint-disable max-params, max-nested-callbacks */

import childProcess from "child_process";
import fileUtils from "file-utils";
import fs from "fs";
import sinon from "sinon";


describe("fileUtils", () => {
  describe("checkoutFile", () => {
    it("should exec git checkout on file", () => {
      sinon.stub(childProcess, "exec", (filePath, cb) => cb(null, "mock stdout"));

      return fileUtils.checkoutFile("checkout.js").then((stdout) => {
        expect(stdout).to.equal("mock stdout");

        childProcess.exec.restore();
      });
    });

    it("should reject on an error", () => {
      sinon.stub(childProcess, "exec", (filePath, cb) => cb("mock error"));

      return fileUtils.checkoutFile("checkout.js").catch((err) => {
        expect(err).to.equal("mock error");

        childProcess.exec.restore();
      });
    });
  });

  describe("fixFiles", () => {
    it("should checkout files", () => {
      sinon.stub(fileUtils, "checkoutFile");
      sinon.stub(fileUtils, "removeFile");

      fileUtils.fixFiles([{
          created: false,
          path: "checkout.js"
      }]);
      expect(fileUtils.removeFile).to.have.callCount(0);
      expect(fileUtils.checkoutFile).to.have.callCount(1);
      expect(fileUtils.checkoutFile).to.have.been.calledWith("checkout.js");

      fileUtils.checkoutFile.restore();
      fileUtils.removeFile.restore();
    });

    it("should remove files", () => {
      sinon.stub(fileUtils, "checkoutFile");
      sinon.stub(fileUtils, "removeFile");

      fileUtils.fixFiles([{
          created: true,
          path: "remove.js"
      }]);
      expect(fileUtils.checkoutFile).to.have.callCount(0);
      expect(fileUtils.removeFile).to.have.callCount(1);
      expect(fileUtils.removeFile).to.have.been.calledWith("remove.js");

      fileUtils.checkoutFile.restore();
      fileUtils.removeFile.restore();
    });

    it("should handle multiple files", () => {
      sinon.stub(fileUtils, "checkoutFile");
      sinon.stub(fileUtils, "removeFile");

      fileUtils.fixFiles([{
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
      }]);
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

  describe("readFiles", () => {
    it("should append contents to files", () => {
      const files = [{
        oldPath: "file-1.js"
      }, {
        oldPath: "file-2.js"
      }];

      sinon.stub(fs, "readFile", (filePath, opts, cb) => cb(null, "mock contents"));

      return fileUtils.readFiles(files).then((result) => {
        expect(result).to.deep.equal([{
          contents: "mock contents",
          oldPath: "file-1.js"
        }, {
          contents: "mock contents",
          oldPath: "file-2.js"
        }]);

        fs.readFile.restore();
      });
    });

    it("should reject on read error", () => {
      const files = [{
        oldPath: "file-1.js"
      }, {
        oldPath: "file-2.js"
      }];

      sinon.stub(fs, "readFile", (filePath, opts, cb) => cb("mock error"));

      return fileUtils.readFiles(files).catch((err) => {
        expect(err).to.equal("mock error");

        fs.readFile.restore();
      });
    });
  });

  describe("removeFile", () => {
    it("should not throw without a remove file error", () => {
      sinon.stub(fs, "unlink", (filePath, cb) => cb());

      return fileUtils.removeFile("remove.js").then((result) => {
        expect(result).to.be.undefined;

        fs.unlink.restore();
      });
    });

    it("should reject on an error", () => {
      sinon.stub(fs, "unlink", (filePath, cb) => cb("mock error"));

      return fileUtils.removeFile("remove.js").catch((err) => {
        expect(err).to.equal("mock error");

        fs.unlink.restore();
      });
    });
  });

  describe("statFiles", () => {
    it("should mark files created", () => {
      const files = [{
        newPath: "new-file-1.js"
      }, {
        newPath: "new-file-2.js"
      }];

      sinon.stub(fs, "stat", (filePath, cb) => cb({code: "ENOENT"}));

      return fileUtils.statFiles(files).then((result) => {
        expect(result).to.deep.equal([{
          newPath: "new-file-1.js",
          created: true
        }, {
          newPath: "new-file-2.js",
          created: true
        }]);

        fs.stat.restore();
      });
    });

    it("should mark files not created", () => {
      const files = [{
        newPath: "existing-file-1.js"
      }, {
        newPath: "existing-file-2.js"
      }];

      sinon.stub(fs, "stat", (filePath, cb) => cb());

      return fileUtils.statFiles(files).then((result) => {
        expect(result).to.deep.equal([{
          newPath: "existing-file-1.js",
          created: false
        }, {
          newPath: "existing-file-2.js",
          created: false
        }]);

        fs.stat.restore();
      });
    });

    it("should reject on other stat errors", () => {
      const files = [{
        newPath: "existing-file-1.js"
      }];

      sinon.stub(fs, "stat", (filePath, cb) => cb({code: "EIO"}));

      return fileUtils.statFiles(files).catch((err) => {
        expect(err).to.deep.equal({code: "EIO"});

        fs.stat.restore();
      });
    });
  });

  describe("writeFiles", () => {
    it("should write and mark files", () => {
      const files = [{
        contents: "mock contents",
        newPath: "file-1.js"
      }, {
        contents: "mock contents",
        newPath: "file-2.js"
      }];

      sinon.stub(fs, "writeFile", (filePath, contents, opts, cb) => cb());

      return fileUtils.writeFiles(files).then((result) => {
        expect(result).to.deep.equal([{
          contents: "mock contents",
          newPath: "file-1.js",
          "written": true
        }, {
          contents: "mock contents",
          newPath: "file-2.js",
          "written": true
        }]);

        fs.writeFile.restore();
      });
    });

    it("should reject on write error", () => {
      const files = [{
        contents: "mock contents",
        newPath: "file-1.js"
      }, {
        contents: "mock contents",
        newPath: "file-2.js"
      }];

      sinon.stub(fs, "writeFile", (filePath, contents, opts, cb) => cb("mock error"));

      return fileUtils.writeFiles(files).catch((err) => {
        expect(err).to.equal("mock error");

        fs.writeFile.restore();
      });
    });
  });
});

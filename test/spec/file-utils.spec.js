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

  describe("readPackage", () => {
    it("should read the package.json file", () => {
      sinon.stub(fs, "readFile", (filePath, opts, cb) => {
        expect(filePath).to.equal("package.json");
        expect(opts).to.equal("utf8");
        cb(null, JSON.stringify({
          dependencies: {
            lodash: "1.0.0"
          }
        }));
      });

      return fileUtils.readPackage().then((contents) => {
        expect(contents).to.deep.equal({
          dependencies: {
            lodash: "1.0.0"
          }
        });

        fs.readFile.restore();
      });
    });

    it("should reject on read error", () => {
      sinon.stub(fs, "readFile", (filePath, opts, cb) => cb("mock error"));

      return fileUtils.readPackage().catch((err) => {
        expect(err).to.equal("mock error");

        fs.readFile.restore();
      });
    });
  });

  describe("removeFile", () => {
    it("should not throw without a remove file error", () => {
      sinon.stub(fs, "unlink", (filePath, cb) => cb());

      return fileUtils.removeFile("remove.js").then((result) => {
        expect(result).to.equal(undefined);

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

  describe("writePackage", () => {
    it("should write the package.json file", () => {
      sinon.stub(fs, "writeFile", (filePath, contents, opts, cb) => {
        expect(filePath).to.equal("package.json");
        expect(contents).to.equal(JSON.stringify({
          dependencies: {
            lodash: "1.0.0"
          }
        }, null, 2));
        expect(opts).to.equal("utf8");

        cb();
      });

      return fileUtils.writePackage({
        dependencies: {
          lodash: "1.0.0"
        }
      }).then(() => {
        fs.writeFile.restore();
      });
    });

    it("should reject on read error", () => {
      sinon.stub(fs, "writeFile", (filePath, contents, opts, cb) => cb("mock error"));

      return fileUtils.writePackage().catch((err) => {
        expect(err).to.equal("mock error");

        fs.writeFile.restore();
      });
    });
  });
});

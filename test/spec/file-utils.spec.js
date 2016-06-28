/* eslint-disable max-params, max-nested-callbacks */

import childProcess from "child_process";
import fileUtils from "file-utils";
import fs from "fs";
import sinon from "sinon";


describe("fileUtils", () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  describe("checkoutFile", () => {
    it("should exec git checkout on file", () => {
      sandbox.stub(childProcess, "exec", (filePath, cb) => cb(null, "mock stdout"));

      return fileUtils.checkoutFile("checkout.js").then((stdout) => {
        expect(stdout).to.equal("mock stdout");
      });
    });

    it("should reject on an error", () => {
      sandbox.stub(childProcess, "exec", (filePath, cb) => cb("mock error"));

      return fileUtils.checkoutFile("checkout.js").catch((err) => {
        expect(err).to.equal("mock error");
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

      sandbox.stub(fs, "readFile", (filePath, opts, cb) => cb(null, "mock contents"));

      return fileUtils.readFiles(files).then((result) => {
        expect(result).to.deep.equal([{
          contents: "mock contents",
          oldPath: "file-1.js"
        }, {
          contents: "mock contents",
          oldPath: "file-2.js"
        }]);
      });
    });

    it("should reject on read error", () => {
      const files = [{
        oldPath: "file-1.js"
      }, {
        oldPath: "file-2.js"
      }];

      sandbox.stub(fs, "readFile", (filePath, opts, cb) => cb("mock error"));

      return fileUtils.readFiles(files).catch((err) => {
        expect(err).to.equal("mock error");
      });
    });
  });

  describe("readPackage", () => {
    it("should read the package.json file", () => {
      sandbox.stub(fs, "readFile", (filePath, opts, cb) => {
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
      });
    });

    it("should reject on a JSON parse error", () => {
      sandbox.stub(fs, "readFile", (filePath, opts, cb) => cb(null, "bad"));

      return fileUtils.readPackage().catch((err) => {
        expect(err).to.be.an.instanceOf(SyntaxError);
      });
    });

    it("should reject on read error", () => {
      sandbox.stub(fs, "readFile", (filePath, opts, cb) => cb("mock error"));

      return fileUtils.readPackage().catch((err) => {
        expect(err).to.equal("mock error");
      });
    });
  });

  describe("removeFile", () => {
    it("should not throw without a remove file error", () => {
      sandbox.stub(fs, "unlink", (filePath, cb) => cb());

      return fileUtils.removeFile("remove.js").then((result) => {
        expect(result).to.equal(undefined);
      });
    });

    it("should reject on an error", () => {
      sandbox.stub(fs, "unlink", (filePath, cb) => cb("mock error"));

      return fileUtils.removeFile("remove.js").catch((err) => {
        expect(err).to.equal("mock error");
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

      sandbox.stub(fs, "stat", (filePath, cb) => cb({code: "ENOENT"}));

      return fileUtils.statFiles(files).then((result) => {
        expect(result).to.deep.equal([{
          newPath: "new-file-1.js",
          created: true
        }, {
          newPath: "new-file-2.js",
          created: true
        }]);
      });
    });

    it("should mark files not created", () => {
      const files = [{
        newPath: "existing-file-1.js"
      }, {
        newPath: "existing-file-2.js"
      }];

      sandbox.stub(fs, "stat", (filePath, cb) => cb());

      return fileUtils.statFiles(files).then((result) => {
        expect(result).to.deep.equal([{
          newPath: "existing-file-1.js",
          created: false
        }, {
          newPath: "existing-file-2.js",
          created: false
        }]);
      });
    });

    it("should reject on other stat errors", () => {
      const files = [{
        newPath: "existing-file-1.js"
      }];

      sandbox.stub(fs, "stat", (filePath, cb) => cb({code: "EIO"}));

      return fileUtils.statFiles(files).catch((err) => {
        expect(err).to.deep.equal({code: "EIO"});
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

      sandbox.stub(fs, "writeFile", (filePath, contents, opts, cb) => cb());

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

      sandbox.stub(fs, "writeFile", (filePath, contents, opts, cb) => cb("mock error"));

      return fileUtils.writeFiles(files).catch((err) => {
        expect(err).to.equal("mock error");
      });
    });
  });

  describe("writePackage", () => {
    it("should write the package.json file", () => {
      sandbox.stub(fs, "writeFile", (filePath, contents, opts, cb) => {
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
      });
    });

    it("should reject on a stringify error", () => {
      const packageJSON = {};

      packageJSON.packageJSON = packageJSON; // Create a circular structure

      return fileUtils.writePackage(packageJSON).catch((err) => {
        expect(err).to.be.an.instanceOf(TypeError);
      });
    });

    it("should reject on read error", () => {
      sandbox.stub(fs, "writeFile", (filePath, contents, opts, cb) => cb("mock error"));

      return fileUtils.writePackage().catch((err) => {
        expect(err).to.equal("mock error");
      });
    });
  });
});

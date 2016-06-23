/* eslint-disable max-params */

import proxyquire from "proxyquire";


describe("handleFiles", () => {
  describe("read", () => {
    it("should append contents to files", () => {
      const handleFiles = proxyquire("handle-files", {
        fs: {
          readFile: (filePath, opts, cb) => cb(null, "mock contents")
        }
      }).default;
      const files = [{
        oldPath: "file-1.js"
      }, {
        oldPath: "file-2.js"
      }];

      return expect(handleFiles.read(files)).to.eventually.deep.equal([{
        contents: "mock contents",
        oldPath: "file-1.js"
      }, {
        contents: "mock contents",
        oldPath: "file-2.js"
      }]);
    });

    it("should reject on read error", () => {
      const handleFiles = proxyquire("handle-files", {
        fs: {
          readFile: (filePath, opts, cb) => cb("mock error")
        }
      }).default;
      const files = [{
        oldPath: "file-1.js"
      }, {
        oldPath: "file-2.js"
      }];

      return expect(handleFiles.read(files)).to.be.rejectedWith("mock error");
    });
  });

  describe("stat", () => {
    it("should mark files created", () => {
      const handleFiles = proxyquire("handle-files", {
        fs: {
          stat: (filePath, cb) => cb({code: "ENOENT"})
        }
      }).default;
      const files = [{
        newPath: "new-file-1.js"
      }, {
        newPath: "new-file-2.js"
      }];

      return expect(handleFiles.stat(files)).to.eventually.deep.equal([{
        newPath: "new-file-1.js",
        created: true
      }, {
        newPath: "new-file-2.js",
        created: true
      }]);
    });

    it("should mark files not created", () => {
      const handleFiles = proxyquire("handle-files", {
        fs: {
          stat: (filePath, cb) => cb()
        }
      }).default;
      const files = [{
        newPath: "existing-file-1.js"
      }, {
        newPath: "existing-file-2.js"
      }];

      return expect(handleFiles.stat(files)).to.eventually.deep.equal([{
        newPath: "existing-file-1.js",
        created: false
      }, {
        newPath: "existing-file-2.js",
        created: false
      }]);
    });

    it("should reject on other stat errors", () => {
      const handleFiles = proxyquire("handle-files", {
        fs: {
          stat: (filePath, cb) => cb({code: "EIO"})
        }
      }).default;
      const files = [{
        newPath: "existing-file-1.js"
      }];

      return expect(handleFiles.stat(files)).to.be.rejectedWith({code: "EIO"});
    });
  });

  describe("write", () => {
    it("should write and mark files", () => {
      const handleFiles = proxyquire("handle-files", {
        fs: {
          writeFile: (filePath, contents, opts, cb) => cb(null)
        }
      }).default;
      const files = [{
        contents: "mock contents",
        newPath: "file-1.js"
      }, {
        contents: "mock contents",
        newPath: "file-2.js"
      }];

      return expect(handleFiles.write(files)).to.eventually.deep.equal([{
        contents: "mock contents",
        newPath: "file-1.js",
        "written": true
      }, {
        contents: "mock contents",
        newPath: "file-2.js",
        "written": true
      }]);
    });

    it("should reject on write error", () => {
      const handleFiles = proxyquire("handle-files", {
        fs: {
          writeFile: (filePath, contents, opts, cb) => cb("mock error")
        }
      }).default;
      const files = [{
        contents: "mock contents",
        newPath: "file-1.js"
      }, {
        contents: "mock contents",
        newPath: "file-2.js"
      }];

      return expect(handleFiles.write(files)).to.be.rejectedWith("mock error");
    });
  });
});

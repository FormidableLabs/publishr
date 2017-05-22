import { Promise } from "es6-promise";
import fileUtils from "file-utils";
import mockfs from "mock-fs";
import testHelpers from "../test-helpers";


describe("fileUtils", () => {
  afterEach(() => {
    mockfs.restore();
  });

  describe("readFiles", () => {
    it("should append contents to files", () => {
      const files = [{
        oldPath: "file-1.js"
      }, {
        oldPath: "file-2.js"
      }];

      mockfs({
        "file-1.js": "mock contents file 1",
        "file-2.js": "mock contents file 2"
      });

      return fileUtils.readFiles(files).then((result) => {
        expect(result).to.deep.equal([{
          contents: "mock contents file 1",
          oldPath: "file-1.js"
        }, {
          contents: "mock contents file 2",
          oldPath: "file-2.js"
        }]);
      });
    });

    it("should reject on read error", () => {
      const files = [{
        oldPath: "file-1.js"
      }];

      mockfs({});

      return fileUtils.readFiles(files).catch((err) => {
        expect(err).to.have.property("code", "ENOENT");
      });
    });
  });

  describe("readPackage", () => {
    it("should read the package.json file", () => {
      mockfs({
        "package.json": JSON.stringify({
          dependencies: {
            lodash: "1.0.0"
          }
        }, null, 2)
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
      mockfs({
        "package.json": "bad"
      });

      return fileUtils.readPackage().catch((err) => {
        expect(err).to.be.an.instanceOf(SyntaxError);
      });
    });

    it("should reject on read error", () => {
      mockfs({});

      return fileUtils.readPackage().catch((err) => {
        expect(err).to.have.property("code", "ENOENT");
      });
    });
  });

  describe("removeFile", () => {
    it("should not throw without a remove file error", () => {
      mockfs({
        "remove.js": "mock contents"
      });

      return fileUtils
        .removeFile("remove.js")
        .then(() => testHelpers.fileExists("remove.js"))
        .then((fileExists) => {
          expect(fileExists).to.equal(false);
        });
    });

    it("should reject on an error", () => {
      mockfs({});

      return fileUtils.removeFile("remove.js").catch((err) => {
        expect(err).to.have.property("code", "ENOENT");
      });
    });
  });

  describe("statFiles", () => {
    it("should mark files created or not created", () => {
      const files = [{
        newPath: "new-file.js"
      }, {
        newPath: "existing-file.js"
      }];

      mockfs({
        "existing-file.js": "mock contents"
      });

      return fileUtils.statFiles(files).then((result) => {
        expect(result).to.deep.equal([{
          newPath: "new-file.js",
          created: true
        }, {
          newPath: "existing-file.js",
          created: false
        }]);
      });
    });

    it("should reject on other stat errors", () => {
      const files = [{
        newPath: "private/existing-file.js"
      }];

      mockfs({
        "private": mockfs.directory({
          items: {
            "existing-file.js": "mock contents"
          },
          mode: 0
        })
      });

      return fileUtils.statFiles(files).catch((err) => {
        expect(err).to.have.property("code", "EACCES");
      });
    });
  });

  describe("writeFiles", () => {
    it("should write and mark files", () => {
      const files = [{
        contents: "new contents 1",
        newPath: "file-1.js"
      }, {
        contents: "new contents 2",
        newPath: "file-2.js"
      }];

      mockfs({
        "file-1.js": "old contents 1"
      });

      return fileUtils
      .writeFiles(files)
      .then((result) => Promise.all([
        Promise.resolve(result),
        fileUtils.readFile(files[0].newPath),
        fileUtils.readFile(files[1].newPath)
      ]))
      .then((results) => {
        expect(results[0]).to.deep.equal([{
          contents: "new contents 1",
          newPath: "file-1.js",
          written: true
        }, {
          contents: "new contents 2",
          newPath: "file-2.js",
          written: true
        }]);

        expect(results[1]).to.equal("new contents 1");
        expect(results[2]).to.equal("new contents 2");
      });
    });

    it("should reject on write error", () => {
      const files = [{
        contents: "new mock contents",
        newPath: "file-1.js"
      }];

      mockfs({
        "file-1.js": mockfs.file({
          mode: 0
        })
      });

      return fileUtils.writeFiles(files).catch((err) => {
        expect(err).to.have.property("code", "EACCES");
      });
    });
  });

  describe("writePackage", () => {
    it("should write the package.json file", () => {
      mockfs({
        "package.json": JSON.stringify({
          old: "contents"
        })
      });

      return fileUtils
        .writePackage({
          dependencies: {
            lodash: "1.0.0"
          }
        })
        .then(() => fileUtils.readFile("package.json"))
        .then((result) => expect(result).to.equal(JSON.stringify({
          dependencies: {
            lodash: "1.0.0"
          }
        }, null, 2)));
    });

    it("should reject on a stringify error", () => {
      const packageJSON = {};

      packageJSON.packageJSON = packageJSON; // Create a circular structure

      return fileUtils.writePackage(packageJSON).catch((err) => {
        expect(err).to.be.an.instanceOf(TypeError);
      });
    });

    it("should reject on write error", () => {
      mockfs({
        "package.json": mockfs.file({
          mode: 0
        })
      });

      return fileUtils.writePackage().catch((err) => {
        expect(err).to.have.property("code", "EACCES");
      });
    });
  });
});

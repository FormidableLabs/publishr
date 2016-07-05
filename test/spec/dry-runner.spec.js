import dryRunner from "dry-runner";
import {Promise} from "es6-promise";
import fileUtils from "file-utils";
import git from "git";
import logger from "logger";
import mockfs from "mock-fs";
import postpublish from "postpublish";
import postversion from "postversion";
import sinon from "sinon";


describe("dryRunner", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
    mockfs.restore();
  });

  describe("afterDryRun", () => {
    it("should tear down after the dry run", () => {
      sandbox.stub(dryRunner, "restoreFileSystem");
      sandbox.stub(git, "disableDry");
      sandbox.stub(logger, "disable");

      return dryRunner.afterDryRun().then(() => {
        expect(git.disableDry).to.have.callCount(1);
        expect(dryRunner.restoreFileSystem).to.have.callCount(1);
        expect(logger.disable).to.have.callCount(1);
      });
    });
  });

  describe("beforeDryRun", () => {
    it("should set up before the dry run", () => {
      sandbox.stub(dryRunner, "patchFileSystem", () => Promise.resolve());
      sandbox.stub(dryRunner, "validateFiles", (json) => {
        return Promise.resolve({files: "mock files", json});
      });
      sandbox.stub(dryRunner, "validatePackage", (json) => Promise.resolve(json));
      sandbox.stub(fileUtils, "readPackage", () => Promise.resolve("mock json"));
      sandbox.stub(git, "enableDry");
      sandbox.stub(logger, "enable");

      return dryRunner.beforeDryRun().then(() => {
        expect(git.enableDry).to.have.callCount(1);
        expect(dryRunner.patchFileSystem)
          .to.have.callCount(1).and
          .to.have.been.calledWith("mock json", "mock files");
        expect(dryRunner.validateFiles)
          .to.have.callCount(1).and
          .to.have.been.calledWith("mock json");
        expect(dryRunner.validatePackage)
          .to.have.callCount(1).and
          .to.have.been.calledWith("mock json");
        expect(logger.enable).to.have.callCount(1);
      });
    });
  });

  describe("run", () => {
    it("should dry run postpublish", () => {
      sandbox.stub(logger, "info");
      sandbox.stub(postpublish, "run");

      dryRunner.postpublish();
      expect(logger.info)
        .to.have.callCount(1).and
        .to.have.been.calledWith("Validating postpublish...");
      expect(postpublish.run).to.have.callCount(1);
    });

    it("should dry run postversion", () => {
      sandbox.stub(logger, "info");
      sandbox.stub(postversion, "run");

      dryRunner.postversion();
      expect(logger.info)
        .to.have.callCount(1).and
        .to.have.been.calledWith("Validating postversion...");
      expect(postversion.run).to.have.callCount(1);
    });

    it("should call each dry run step", () => {
      sandbox.stub(dryRunner, "beforeDryRun", () => Promise.resolve());
      sandbox.stub(dryRunner, "postversion", () => Promise.resolve());
      sandbox.stub(dryRunner, "postpublish", () => Promise.resolve());
      sandbox.stub(dryRunner, "afterDryRun", () => Promise.resolve());

      return dryRunner.run().then(() => {
        expect(dryRunner.beforeDryRun).to.have.callCount(1);
        expect(dryRunner.postversion).to.have.callCount(1);
        expect(dryRunner.postpublish).to.have.callCount(1);
        expect(dryRunner.afterDryRun).to.have.callCount(1);
      });
    });
  });

  describe("patchFileSystem", () => {
    it("should patch the file system", () => {
      const packageJSON = {
        dependencies: {
          lodash: "1.0.0"
        }
      };

      dryRunner.patchFileSystem(packageJSON, [{
        path: ".npmignore.publishr",
        stats: {
          mode: parseInt("0777", 8)
        }
      }, {
        path: ".babelrc.publishr",
        stats: {
          mode: parseInt("0777", 8)
        }
      }]);

      return Promise.all([
        fileUtils.readFile("package.json"),
        fileUtils.readFile(".npmignore.publishr"),
        fileUtils.readFile(".babelrc.publishr")
      ]).then((fileContents) => {
        expect(fileContents[0]).to.equal(JSON.stringify(packageJSON, null, 2));
        expect(fileContents[1]).to.equal(".npmignore.publishr contents");
        expect(fileContents[2]).to.equal(".babelrc.publishr contents");
      });
    });

    it("should patch the file system with existing read permissions", () => {
      const packageJSON = {
        dependencies: {
          lodash: "1.0.0"
        }
      };

      dryRunner.patchFileSystem(packageJSON, [{
        path: ".npmignore.publishr",
        stats: {
          mode: 0
        }
      }]);

      return fileUtils.readFile(".npmignore.publishr").catch((err) => {
        expect(err).to.have.property("code", "EACCES");
      });
    });

    it("should restore the file system", () => {
      sandbox.stub(mockfs, "restore");

      dryRunner.restoreFileSystem();
      expect(mockfs.restore).to.have.callCount(1);
    });
  });

  describe("validateFiles", () => {
    it("should validate files", () => {
      const packageJSON = {
        publishr: {
          files: {
            ".babelrc": ".babelrc.publishr",
            ".npmignore": ".npmignore.publishr"
          }
        }
      };

      sandbox.stub(dryRunner, "validateFileRead", (filePath) => Promise.resolve({
        path: filePath,
        stats: "mock stats"
      }));
      sandbox.stub(dryRunner, "validateFileWrite", () => Promise.resolve());

      mockfs({
        ".babelrc.publishr": "mock contents",
        ".npmignore.publishr": "mock contents"
      });

      return dryRunner.validateFiles(packageJSON).then((result) => {
        expect(result).to.deep.equal({
          files: [{
            path: ".babelrc.publishr",
            stats: "mock stats"
          }, {
            path: ".npmignore.publishr",
            stats: "mock stats"
          }],
          json: packageJSON
        });
      });
    });

    it("should validate files when there are no files", () => {
      const packageJSON = {
        publishr: {
          dependencies: ["^babel"]
        }
      };

      sandbox.stub(dryRunner, "validateFileRead");
      sandbox.stub(dryRunner, "validateFileWrite");

      mockfs({});

      return dryRunner.validateFiles(packageJSON).then(() => {
        expect(dryRunner.validateFileRead).to.have.callCount(0);
        expect(dryRunner.validateFileRead).to.have.callCount(0);
      });
    });
  });

  describe("validateFileRead", () => {
    it("should validate a file read", () => {
      sandbox.stub(fileUtils, "statFile", () => Promise.resolve("mock stats"));

      return dryRunner.validateFileRead(".npmignore.publishr").then((result) => {
        expect(result).to.deep.equal({
          path: ".npmignore.publishr",
          stats: "mock stats"
        });
      });
    });

    it("should invalidate a file read", () => {
      sandbox.stub(fileUtils, "statFile", () => Promise.reject("mock error"));

      return dryRunner.validateFileRead(".npmignore.publishr").catch((err) => {
        expect(err).to.equal("mock error");
      });
    });
  });

  describe("validateFileWrite", () => {
    it("should validate a file write", () => {
      sandbox.stub(fileUtils, "statFile", () => Promise.resolve("mock stats"));

      return dryRunner.validateFileWrite(".npmignore.publishr").then((result) => {
        expect(result).to.deep.equal({
          path: ".npmignore.publishr",
          stats: "mock stats"
        });
      });
    });

    it("should validate a file write for no file", () => {
      sandbox.stub(fileUtils, "statFile", () => Promise.reject({code: "ENOENT"}));

      return dryRunner.validateFileWrite(".npmignore.publishr").then((result) => {
        expect(result).to.equal(undefined);
      });
    });

    it("should invalidate a file write", () => {
      sandbox.stub(fileUtils, "statFile", () => Promise.reject({code: "EACCES"}));

      return dryRunner.validateFileWrite(".npmignore.publishr").catch((err) => {
        expect(err).to.have.property("code", "EACCES");
      });
    });
  });

  describe("validatePackage", () => {
    it("should validate a package", () => {
      const packageJSON = {
        publishr: {
          dependencies: ["^babel"]
        }
      };

      sandbox.stub(logger, "success");

      return dryRunner.validatePackage(packageJSON).then((result) => {
        expect(logger.success)
          .to.have.callCount(1).and
          .to.have.been.calledWith("validate 'package.json'");
        expect(result).to.equal(packageJSON);
      });
    });

    it("should invalidate a package without a publishr config", () => {
      const packageJSON = {};

      sandbox.stub(logger, "error");

      return dryRunner.validatePackage(packageJSON).catch((err) => {
        expect(logger.error)
          .to.have.callCount(1).and
          .to.have.been.calledWith("validate 'package.json'", err);

        expect(err).to.have.property(
          "message",
          "No publishr configuration in 'package.json'"
        );
      });
    });

    it("should invalidate a package without an invalid publishr config", () => {
      const packageJSON = {
        publishr: {
          deps: [],
          fils: {}
        }
      };

      sandbox.stub(logger, "error");

      return dryRunner.validatePackage(packageJSON).catch((err) => {
        expect(logger.error)
          .to.have.callCount(1).and
          .to.have.been.calledWith("validate 'package.json'", err);
        expect(err).to.have.property(
          "message",
          "No files or dependencies in publishr configuration"
        );
      });
    });
  });
});

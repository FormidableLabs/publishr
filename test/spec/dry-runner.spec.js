import childProcess from "child_process";
import dryRunner from "dry-runner";
import {Promise} from "es6-promise";
import fileUtils from "file-utils";
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
      sandbox.stub(dryRunner, "restoreExec");
      sandbox.stub(dryRunner, "restoreFileSystem");
      sandbox.stub(logger, "disable");

      return dryRunner.afterDryRun().then(() => {
        expect(dryRunner.restoreExec).to.have.callCount(1);
        expect(dryRunner.restoreFileSystem).to.have.callCount(1);
        expect(logger.disable).to.have.callCount(1);
      });
    });
  });

  describe("beforeDryRun", () => {
    it("should set up before the dry run", () => {
      sandbox.stub(dryRunner, "patchExec");
      sandbox.stub(dryRunner, "patchFileSystem", () => Promise.resolve());
      sandbox.stub(dryRunner, "validateFiles", (json) => {
        return Promise.resolve({files: "mock files", json});
      });
      sandbox.stub(dryRunner, "validatePackage", (json) => Promise.resolve(json));
      sandbox.stub(fileUtils, "readPackage", () => Promise.resolve("mock json"));
      sandbox.stub(logger, "enable");

      return dryRunner.beforeDryRun().then(() => {
        expect(dryRunner.patchExec).to.have.callCount(1);
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

  describe("patchExec", () => {
    it("should handle an exec patch", () => {
      const original = sandbox.stub(childProcess, "exec");
      const patch = sandbox.stub(dryRunner.exec, "patch");

      dryRunner.patchExec();
      childProcess.exec();
      expect(patch).to.have.callCount(1);
      expect(original).to.have.callCount(0);
    });

    it("should call the patched exec callback", () => {
      const cb = sandbox.stub();

      dryRunner.exec.patch("mock cmd", cb);
      expect(cb).to.have.callCount(1);
    });

    it("should handle an exec restore", () => {
      dryRunner.patchExec();
      expect(childProcess.exec).to.equal(dryRunner.exec.patch);
      dryRunner.restoreExec();
      expect(childProcess.exec).to.equal(dryRunner.exec.original);
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

      dryRunner.patchFileSystem(packageJSON, [
        ".npmignore.publishr",
        ".babelrc.publishr"
      ]);

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

      sandbox.stub(logger, "success");

      mockfs({
        ".babelrc.publishr": "mock contents",
        ".npmignore.publishr": "mock contents"
      });

      return dryRunner.validateFiles(packageJSON).then(() => {
        expect(logger.success)
          .to.have.callCount(2).and
          .to.have.been.calledWith("validate '.babelrc.publishr'").and
          .to.have.been.calledWith("validate '.npmignore.publishr'");
      });
    });

    it("should invalidate when a file does not exist", () => {
      const packageJSON = {
        publishr: {
          files: {
            ".npmignore": ".npmignore.publishr"
          }
        }
      };

      sandbox.stub(logger, "error");

      mockfs({});

      return dryRunner.validateFiles(packageJSON).catch((err) => {
        expect(err).to.have.property("code", "ENOENT");
        expect(logger.error)
          .to.have.callCount(1).and
          .to.have.been.calledWith("validate '.npmignore.publishr'", err);
      });
    });

    it("should validate files when there are no files", () => {
      const packageJSON = {
        publishr: {
          dependencies: ["^babel"]
        }
      };

      sandbox.stub(logger, "error");
      sandbox.stub(logger, "success");

      mockfs({});

      return dryRunner.validateFiles(packageJSON).then(() => {
        expect(logger.error).to.have.callCount(0);
        expect(logger.success).to.have.callCount(0);
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

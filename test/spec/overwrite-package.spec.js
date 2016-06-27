/* eslint-disable max-params */

import fs from "fs";
import packageUtils from "package-utils";
import overwritePackage from "overwrite-package";
import sinon from "sinon";


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

    sinon.stub(fs, "writeFile", (filePath, contents, opts, cb) => {
      cb(null);
    });
    sinon.stub(packageUtils, "updateDependencies");
    sinon.stub(packageUtils, "updateMeta");

    return overwritePackage(packageJSON, files).then(() => {
      expect(packageUtils.updateDependencies).to.have.callCount(1);
      expect(packageUtils.updateMeta).to.have.callCount(1);
      expect(fs.writeFile).to.have.callCount(1);
      expect(packageUtils.updateDependencies).to.have.been.calledWith(packageJSON);
      expect(packageUtils.updateMeta).to.have.been.calledWith(packageJSON, files);
      expect(fs.writeFile).to.have.been.calledWith(
        "package.json",
        JSON.stringify(packageJSON, null, 2),
        "utf8"
      );

      fs.writeFile.restore();
      packageUtils.updateDependencies.restore();
      packageUtils.updateMeta.restore();
    });
  });

  it("should reject on an error", () => {
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

    sinon.stub(fs, "writeFile", (filePath, contents, opts, cb) => {
      cb("mock error");
    });
    sinon.stub(packageUtils, "updateDependencies");
    sinon.stub(packageUtils, "updateMeta");

    return overwritePackage(packageJSON, files).catch((err) => {
      expect(err).to.equal("mock error");
      expect(packageUtils.updateDependencies).to.have.callCount(1);
      expect(packageUtils.updateMeta).to.have.callCount(1);
      expect(fs.writeFile).to.have.callCount(1);
      expect(packageUtils.updateDependencies).to.have.been.calledWith(packageJSON);
      expect(packageUtils.updateMeta).to.have.been.calledWith(packageJSON, files);
      expect(fs.writeFile).to.have.been.calledWith(
        "package.json",
        JSON.stringify(packageJSON, null, 2),
        "utf8"
      );

      fs.writeFile.restore();
      packageUtils.updateDependencies.restore();
      packageUtils.updateMeta.restore();
    });
  });
});

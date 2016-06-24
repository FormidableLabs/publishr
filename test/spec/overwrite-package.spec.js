/* eslint-disable max-params */

import fs from "fs";
import handlePackage from "handle-package";
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
    sinon.stub(handlePackage, "updateDependencies");
    sinon.stub(handlePackage, "updateMeta");

    return overwritePackage(packageJSON, files).then(() => {
      expect(handlePackage.updateDependencies).to.have.callCount(1);
      expect(handlePackage.updateMeta).to.have.callCount(1);
      expect(fs.writeFile).to.have.callCount(1);
      expect(handlePackage.updateDependencies).to.have.been.calledWith(packageJSON);
      expect(handlePackage.updateMeta).to.have.been.calledWith(packageJSON, files);
      expect(fs.writeFile).to.have.been.calledWith(
        "package.json",
        JSON.stringify(packageJSON, null, 2),
        "utf8"
      );

      fs.writeFile.restore();
      handlePackage.updateDependencies.restore();
      handlePackage.updateMeta.restore();
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
    sinon.stub(handlePackage, "updateDependencies");
    sinon.stub(handlePackage, "updateMeta");

    return overwritePackage(packageJSON, files).catch((err) => {
      expect(err).to.equal("mock error");
      expect(handlePackage.updateDependencies).to.have.callCount(1);
      expect(handlePackage.updateMeta).to.have.callCount(1);
      expect(fs.writeFile).to.have.callCount(1);
      expect(handlePackage.updateDependencies).to.have.been.calledWith(packageJSON);
      expect(handlePackage.updateMeta).to.have.been.calledWith(packageJSON, files);
      expect(fs.writeFile).to.have.been.calledWith(
        "package.json",
        JSON.stringify(packageJSON, null, 2),
        "utf8"
      );

      fs.writeFile.restore();
      handlePackage.updateDependencies.restore();
      handlePackage.updateMeta.restore();
    });
  });
});

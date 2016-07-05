import childProcess from "child_process";
import git from "git";
import sinon from "sinon";


describe("git", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("checkout", () => {
    it("should exec git checkout on file", () => {
      sandbox.stub(childProcess, "exec", (filePath, cb) => cb(null, "mock stdout"));

      return git.checkout("checkout.js").then((stdout) => {
        expect(childProcess.exec)
          .to.have.callCount(1).and
          .to.have.been.calledWith("git checkout checkout.js");
        expect(stdout).to.equal("mock stdout");
      });
    });

    it("should reject on an error", () => {
      sandbox.stub(childProcess, "exec", (filePath, cb) => cb("mock error"));

      return git.checkout("checkout.js").catch((err) => {
        expect(childProcess.exec)
          .to.have.callCount(1).and
          .to.have.been.calledWith("git checkout checkout.js")
        expect(err).to.equal("mock error");
      });
    });
  });
});

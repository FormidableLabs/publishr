import proxyquire from "proxyquire";
import sinon from "sinon";


describe("removeFile", () => {
  it("should remove a file", () => {
    const rm = sinon.stub();
    const removeFile = proxyquire("remove-file", {
      rimraf: rm
    }).default;

    removeFile("remove.js");
    expect(rm).to.have.callCount(1);
    expect(rm).to.have.to.have.been.calledWith("remove.js");
  });

  it("should throw on a remove file error", () => {
    const rm = (filePath, cb) => cb("mock error");
    const removeFile = proxyquire("remove-file", {
      rimraf: rm
    }).default;

    expect(() => {
      removeFile("remove.js");
    }).to.throw("Error removing remove.js.");
  });

  it("should not throw without a remove file error", () => {
    const rm = (filePath, cb) => cb();
    const removeFile = proxyquire("remove-file", {
      rimraf: rm
    }).default;

    expect(() => {
      removeFile("remove.js");
    }).to.not.throw();
  });
});

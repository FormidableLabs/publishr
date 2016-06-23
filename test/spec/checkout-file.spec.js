import proxyquire from "proxyquire";
import sinon from "sinon";


const childProcess = {exec: () => {}};
const checkoutFile = proxyquire("checkout-file", {
  child_process: childProcess
}).default;

describe("checkoutFile", () => {
  it("should exec git checkout on file", () => {
    sinon.stub(childProcess, "exec");

    checkoutFile("checkout.js");
    expect(childProcess.exec).to.have.callCount(1);
    expect(childProcess.exec).to.have.to.have.been.calledWith("git checkout checkout.js");

    childProcess.exec.restore();
  });

  it("should handle a checkout error", () => {
    sinon.stub(childProcess, "exec", (path, cb) => {
      cb("mock error");
    });

    checkoutFile("checkout.js");

  });
});

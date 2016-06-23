import proxyquire from "proxyquire";
import sinon from "sinon";


const checkoutFile = sinon.stub();
const removeFile = sinon.stub();
const fixFiles = proxyquire("fix-files", {
  "./checkout-file": {
      "default": checkoutFile
    },
  "./remove-file": {
      "default": removeFile
    }
}).default;

describe("fixFiles", () => {
  beforeEach(() => {
    checkoutFile.reset();
    removeFile.reset();
  });

  it("should checkout files", () => {
    fixFiles({
      _publishr: [{
        created: false,
        path: "checkout.js"
      }]
    });
    expect(removeFile).to.have.callCount(0);
    expect(checkoutFile).to.have.callCount(1);
    expect(checkoutFile).to.have.been.calledWith("checkout.js");
  });

  it("should remove files", () => {
    fixFiles({
      _publishr: [{
        created: true,
        path: "remove.js"
      }]
    });
    expect(checkoutFile).to.have.callCount(0);
    expect(removeFile).to.have.callCount(1);
    expect(removeFile).to.have.been.calledWith("remove.js");
  });

  it("should handle multiple files", () => {
    fixFiles({
      _publishr: [{
        created: false,
        path: "checkout1.js"
      }, {
        created: true,
        path: "remove1.js"
      }, {
        created: false,
        path: "checkout2.js"
      }, {
        created: true,
        path: "remove2.js"
      }]
    });
    expect(checkoutFile).to.have.callCount(2);
    expect(removeFile).to.have.callCount(2);
    expect(checkoutFile).to.have.been.calledWith("checkout1.js");
    expect(checkoutFile).to.have.been.calledWith("checkout2.js");
    expect(removeFile).to.have.been.calledWith("remove1.js");
    expect(removeFile).to.have.been.calledWith("remove2.js");
  });
});

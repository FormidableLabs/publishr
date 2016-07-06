import errorHandler from "error-handler";
import logger from "logger";
import sinon from "sinon";


describe("errorHandler", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(logger, "error");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should handle an error with a stack", () => {
    const err = {stack: "mock stack"};

    errorHandler.onError(err);
    expect(logger.error)
      .to.have.callCount(1).and
      .to.have.been.calledWith("mock stack");
  });

  it("should handle an error without a stack", () => {
    const err = {toString: () => {}};

    sandbox.stub(err, "toString", () => "mock error");

    errorHandler.onError(err);
    expect(logger.error)
      .to.have.callCount(1).and
      .to.have.been.calledWith("mock error");
    expect(err.toString).to.have.callCount(1);
  });
});

import errorHandler from "error-handler";
import logger from "logger";
import sinon from "sinon";


describe("errorHandler", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(logger, "enable");
    sandbox.stub(logger, "error");
    sandbox.stub(logger, "info");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("onError", () => {
    it("should handle an error with a stack", () => {
      const err = {stack: "mock stack"};

      errorHandler.onError(err);
      expect(logger.error)
        .to.have.callCount(1).and
        .to.have.been.calledWith("mock stack\n");
    });

    it("should handle an error without a stack", () => {
      const err = {toString: () => {}};

      sandbox.stub(err, "toString", () => "mock error");

      errorHandler.onError(err);
      expect(logger.enable).to.have.callCount(1);
      expect(logger.error)
        .to.have.callCount(1).and
        .to.have.been.calledWith("mock error\n");
      expect(err.toString).to.have.callCount(1);
    });
  });

  describe("dryRunnerError", () => {
    it("should handle a dry-run error", () => {
      sandbox.stub(errorHandler, "onError");

      errorHandler.dryRunnerError("mock error");
      expect(errorHandler.onError)
        .to.have.callCount(1).and
        .to.have.been.calledWith("mock error");
      expect(logger.info).to.have.callCount(1);
    });
  });

  describe("postpublishError", () => {
    it("should handle a postpublish error", () => {
      sandbox.stub(errorHandler, "scriptError");

      errorHandler.postpublishError("mock error");
      expect(errorHandler.scriptError)
        .to.have.callCount(1).and
        .to.have.been.calledWith("mock error", "postpublish");
    });
  });

  describe("postversionError", () => {
    it("should handle a postversion error", () => {
      sandbox.stub(errorHandler, "scriptError");

      errorHandler.postversionError("mock error");
      expect(errorHandler.scriptError)
        .to.have.callCount(1).and
        .to.have.been.calledWith("mock error", "postversion");
    });
  });

  describe("scriptError", () => {
    it("should handle a script error", () => {
      sandbox.stub(errorHandler, "onError");

      errorHandler.scriptError("mock error");
      expect(errorHandler.onError)
        .to.have.callCount(1).and
        .to.have.been.calledWith("mock error");
      expect(logger.info).to.have.callCount(1);
    });
  });
});

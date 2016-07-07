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

  describe("defaultError", () => {
    it("should handle an error with a stack", () => {
      const err = {stack: "mock stack"};

      errorHandler.defaultError(err);
      expect(logger.error)
        .to.have.callCount(1).and
        .to.have.been.calledWith("mock stack\n");
    });

    it("should handle an error without a stack", () => {
      const err = {toString: () => {}};

      sandbox.stub(err, "toString", () => "mock error");

      errorHandler.defaultError(err);
      expect(logger.enable).to.have.callCount(1);
      expect(logger.error)
        .to.have.callCount(1).and
        .to.have.been.calledWith("mock error\n");
      expect(err.toString).to.have.callCount(1);
    });
  });

  describe("dryRunnerError", () => {
    it("should handle a dry-run error", () => {
      sandbox.stub(errorHandler, "defaultError");

      errorHandler.dryRunnerError("mock error");
      expect(errorHandler.defaultError)
        .to.have.callCount(1).and
        .to.have.been.calledWith("mock error");
      expect(logger.info).to.have.callCount(1);
    });
  });

  describe("postpublishError", () => {
    it("should handle a postpublish error", () => {
      sandbox.stub(errorHandler, "postScriptError");

      errorHandler.postpublishError("mock error");
      expect(errorHandler.postScriptError)
        .to.have.callCount(1).and
        .to.have.been.calledWith("mock error", "postpublish");
    });
  });

  describe("postversionError", () => {
    it("should handle a postversion error", () => {
      sandbox.stub(errorHandler, "postScriptError");

      errorHandler.postversionError("mock error");
      expect(errorHandler.postScriptError)
        .to.have.callCount(1).and
        .to.have.been.calledWith("mock error", "postversion");
    });
  });

  describe("postScriptError", () => {
    it("should handle a post script error", () => {
      sandbox.stub(errorHandler, "defaultError");

      errorHandler.postScriptError("mock error");
      expect(errorHandler.defaultError)
        .to.have.callCount(1).and
        .to.have.been.calledWith("mock error");
      expect(logger.info).to.have.callCount(1);
    });
  });
});

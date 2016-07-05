import chalk from "chalk";
import logger from "logger";
import logSymbols from "log-symbols";
import sinon from "sinon";


describe("logger", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should log an error message with an error", () => {
    sandbox.stub(logger, "log");

    logger.error("mock message", {message: "mock error message"});
    expect(logger.log)
      .to.have.callCount(2).and
      .to.have.been.calledWith(`${logSymbols.error}  ${chalk.gray("mock message")}`).and
      .to.have.been.calledWith(chalk.red("mock error message"));
  });

  it("should log an error message without an error", () => {
    sandbox.stub(logger, "log");

    logger.error("mock message");
    expect(logger.log)
      .to.have.callCount(1).and
      .to.have.been.calledWith(`${logSymbols.error}  ${chalk.gray("mock message")}`);
  });

  it("should log success", () => {
    sandbox.stub(logger, "log");

    logger.success("mock message");
    expect(logger.log)
      .to.have.callCount(1).and
      .to.have.been.calledWith(`${logSymbols.success}  ${chalk.gray("mock message")}`);
  });

  it("should log info", () => {
    sandbox.stub(logger, "log");

    logger.info("mock message");
    expect(logger.log)
      .to.have.callCount(1).and
      .to.have.been.calledWith(chalk.white("mock message"));
  });

  it("should log when enabled", () => {
    sandbox.stub(console, "log");

    logger.enable();
    logger.log("mock message");
    expect(console.log) // eslint-disable-line no-console
      .to.have.callCount(1).and
      .to.have.been.calledWith("mock message");

    logger.disable();
  });

  it("should not log when disabled", () => {
    sandbox.stub(console, "log");

    logger.log("mock message");
    expect(console.log).to.have.callCount(0); // eslint-disable-line no-console

    logger.disable();
  });
});

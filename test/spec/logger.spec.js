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

  it("should log an fail message with an error", () => {
    sandbox.stub(logger, "log");

    logger.fail("mock message", {message: "mock error message"});
    expect(logger.log)
      .to.have.callCount(2).and
      .to.have.been.calledWith(`${logSymbols.error}  ${chalk.gray("mock message")}`).and
      .to.have.been.calledWith(chalk.red("mock error message"));
  });

  it("should log a fail message without an error", () => {
    sandbox.stub(logger, "log");

    logger.fail("mock message");
    expect(logger.log)
      .to.have.callCount(1).and
      .to.have.been.calledWith(`${logSymbols.error}  ${chalk.gray("mock message")}`);
  });

  it("should log pass", () => {
    sandbox.stub(logger, "log");

    logger.pass("mock message");
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

  it("should always call log on error", () => {
    sandbox.stub(console, "log");

    logger.disable();
    logger.error("mock error");
    expect(console.log).to.have.callCount(1); // eslint-disable-line no-console
  });
});

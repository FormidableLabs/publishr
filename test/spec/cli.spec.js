import args from "args";
import cli from "cli";
import dryRunner from "dry-runner";
import logger from "logger";
import postpublish from "postpublish";
import postversion from "postversion";
import sinon from "sinon";


describe("cli", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(args, "init");
    sandbox.stub(args, "showHelp");
    sandbox.stub(dryRunner, "run");
    sandbox.stub(logger, "enable");
    sandbox.stub(postpublish, "run");
    sandbox.stub(postversion, "run");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should run postpublish", () => {
    args.init.returns({
      argv: {
        _: ["postpublish"]
      }
    });

    cli();
    expect(postpublish.run).to.have.callCount(1);
    expect(postversion.run).to.have.callCount(0);
    expect(dryRunner.run).to.have.callCount(0);
  });

  it("should run postversion", () => {
    args.init.returns({
      argv: {
        _: ["postversion"]
      }
    });

    cli();
    expect(postversion.run).to.have.callCount(1);
    expect(postpublish.run).to.have.callCount(0);
    expect(dryRunner.run).to.have.callCount(0);
  });

  it("should run dry-run", () => {
    args.init.returns({
      argv: {
        _: ["dry-run"]
      }
    });

    cli();
    expect(dryRunner.run).to.have.callCount(1);
    expect(postpublish.run).to.have.callCount(0);
    expect(postversion.run).to.have.callCount(0);
  });

  it("should show help on bad commands", () => {
    args.init.returns({
      argv: {
        _: []
      }
    });

    cli();
    expect(args.showHelp).to.have.callCount(1);
  });

  it("should turn on logging in verbose mode", () => {
    args.init.returns({
      argv: {
        _: [],
        verbose: true
      }
    });

    cli();
    expect(logger.enable).to.have.callCount(1);
  });
});

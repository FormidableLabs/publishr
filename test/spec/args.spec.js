import args from "args";
import sinon from "sinon";
import yargs from "yargs";


describe("args", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should call various yargs commands", () => {
    sandbox.stub(yargs, "alias").returns(yargs);
    sandbox.stub(yargs, "command").returns(yargs);
    sandbox.stub(yargs, "help").returns(yargs);
    sandbox.stub(yargs, "option").returns(yargs);
    sandbox.stub(yargs, "usage").returns(yargs);
    sandbox.stub(yargs, "version").returns(yargs);

    args.init();
    expect(yargs.alias)
      .to.have.callCount(3).and
      .to.have.been.calledWith("h", "help").and
      .to.have.been.calledWith("V", "verbose").and
      .to.have.been.calledWith("v", "version");
    expect(yargs.command)
      .to.have.callCount(3).and
      .to.have.been.calledWith("dry-run", "Perform a dry run of postversion and postpublish").and
      .to.have.been.calledWith("postpublish", "Clean up any actions taken by postversion").and
      .to.have.been.calledWith("postversion", "Create and overwrite files for publishing");
    expect(yargs.help).to.have.callCount(1);
    expect(yargs.option)
      .to.have.callCount(1).and
      .to.have.been.calledWith("verbose", {
        describe: "Log each step during postversion/postpublish",
        type: "boolean"
      });
    expect(yargs.usage).to.have.callCount(1);
    expect(yargs.version).to.have.callCount(1);
  });

  it("should show help", () => {
    sandbox.stub(yargs, "showHelp");

    args.showHelp();
    expect(yargs.showHelp).to.have.callCount(1);
  });
});

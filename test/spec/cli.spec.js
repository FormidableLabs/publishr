import cli from "cli";
import dryRunner from "dry-runner";
import postpublish from "postpublish";
import postversion from "postversion";
import sinon from "sinon";


describe("cli", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(dryRunner, "run");
    sandbox.stub(postpublish, "run");
    sandbox.stub(postversion, "run");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should run postpublish", () => {
    cli("postpublish");
    expect(postpublish.run).to.have.callCount(1);
    expect(postversion.run).to.have.callCount(0);
    expect(dryRunner.run).to.have.callCount(0);
  });

  it("should run postversion", () => {
    cli("postversion");
    expect(postversion.run).to.have.callCount(1);
    expect(postpublish.run).to.have.callCount(0);
    expect(dryRunner.run).to.have.callCount(0);
  });

  it("should run dry-run", () => {
    cli("dry-run");
    expect(dryRunner.run).to.have.callCount(1);
    expect(postpublish.run).to.have.callCount(0);
    expect(postversion.run).to.have.callCount(0);
  });

  it("should throw an error on bad commands", () => {
    expect(() => {
      cli("preversion");
    }).to.throw("Unknown command preversion");
  });
});

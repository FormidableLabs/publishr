import sinon from "sinon";
import proxyquire from "proxyquire";


const postpublish = sinon.stub();
const postversion = sinon.stub();
const cli = proxyquire("cli", {
  "./postpublish": {
    default: postpublish
  },
  "./postversion": {
    default: postversion
  }
}).default;

describe("cli", () => {
  afterEach(() => {
    postpublish.reset();
    postversion.reset();
  });

  it("should run postpublish", () => {
    cli("postpublish");
    expect(postpublish).to.have.callCount(1);
    expect(postversion).to.have.callCount(0);
  });

  it("should run postversion", () => {
    cli("postversion");
    expect(postversion).to.have.callCount(1);
    expect(postpublish).to.have.callCount(0);
  });

  it("should throw an error on bad commands", () => {
    expect(() => {
      cli("preversion")
    }).to.throw("Unknown command: preversion");
  });
});

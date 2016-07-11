import childProcess from "child_process";
import {Promise} from "es6-promise";
import fileUtils from "file-utils";
import mockfs from "mock-fs";
import postpublish from "postpublish";
import postversion from "postversion";
import sinon from "sinon";
import testHelpers from "../test-helpers";


describe("end-to-end", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    mockfs.restore();
    sandbox.restore();
  });

  it("should handle a full postversion/postpublish pipeline", () => {
    mockfs({
      ".babelrc": "old .babelrc content",
      ".babelrc.publishr": "new .babelrc content",
      ".npmignore.publishr": "new .npmignore content",
      "package.json": JSON.stringify({
        dependencies: {
          lodash: "^1.0.0",
          "babel-cli": "^6.0.0",
          "babel-core": "^6.0.0"
        },
        devDependencies: {
          eslint: "^1.0.0"
        },
        publishr: {
          dependencies: ["^babel"],
          files: {
            ".babelrc": ".babelrc.publishr",
            ".npmignore": ".npmignore.publishr"
          }
        }
      })
    });

    sandbox.stub(childProcess, "exec", (cmd, cb) => cb());

    return postversion.run().then(() => {
      return Promise.all([
        fileUtils.readFile(".babelrc"),
        fileUtils.readFile(".npmignore"),
        fileUtils.readFile("package.json")
      ]).then((results) => {
        expect(results[0]).to.equal("new .babelrc content");
        expect(results[1]).to.equal("new .npmignore content");
        expect(JSON.parse(results[2])).to.deep.equal({
          dependencies: {
            lodash: "^1.0.0"
          },
          devDependencies: {
            "babel-cli": "^6.0.0",
            "babel-core": "^6.0.0",
            eslint: "^1.0.0"
          },
          publishr: {
            dependencies: ["^babel"],
            files: {
              ".babelrc": ".babelrc.publishr",
              ".npmignore": ".npmignore.publishr"
            }
          },
          _publishr: [{
            created: false,
            path: ".babelrc"
          }, {
            created: true,
            path: ".npmignore"
          }, {
            created: false,
            path: "package.json"
          }]
        });

        return postpublish
          .run()
          .then(() => testHelpers.fileExists(".npmignore"))
          .then((fileExists) => {
            expect(fileExists).to.equal(false);
            expect(childProcess.exec)
              .to.have.callCount(2).and
              .to.have.been.calledWith("git checkout package.json").and
              .to.have.been.calledWith("git checkout .babelrc");
          });
      });
    });
  });
});

import packageUtils from "package-utils";


describe("packageUtils", () => {
  describe("updateDependencies", () => {
    it("should move dependencies to devDependencies", () => {
      const packageJSON = {
        dependencies: {
          babel: "1.0.0",
          "babel-core": "1.0.0",
          "lodash": "1.0.0"
        },
        devDependencies: {
          eslint: "1.0.0"
        },
        publishr: {
          dependencies: ["^babel"]
        }
      };

      packageUtils.updateDependencies(packageJSON);

      expect(packageJSON).to.deep.equal({
        dependencies: {
          lodash: "1.0.0"
        },
        devDependencies: {
          babel: "1.0.0",
          "babel-core": "1.0.0",
          eslint: "1.0.0"
        },
        publishr: {
          dependencies: ["^babel"]
        }
      });
    });

    it("should handle no dependencies", () => {
      const packageJSON = {
        devDependencies: {
          eslint: "1.0.0"
        },
        publishr: {
          dependencies: ["^babel"]
        }
      };

      packageUtils.updateDependencies(packageJSON);

      expect(packageJSON).to.deep.equal({
        dependencies: {},
        devDependencies: {
          eslint: "1.0.0"
        },
        publishr: {
          dependencies: ["^babel"]
        }
      });
    });

    it("should handle no devDependencies", () => {
      const packageJSON = {
        dependencies: {
          lodash: "1.0.0"
        },
        publishr: {
          dependencies: ["^babel"]
        }
      };

      packageUtils.updateDependencies(packageJSON);

      expect(packageJSON).to.deep.equal({
        dependencies: {
          lodash: "1.0.0"
        },
        devDependencies: {},
        publishr: {
          dependencies: ["^babel"]
        }
      });
    });

    it("should handle no publishr", () => {
      const packageJSON = {
        dependencies: {
          lodash: "1.0.0"
        }
      };

      packageUtils.updateDependencies(packageJSON);

      expect(packageJSON).to.deep.equal({
        dependencies: {
          lodash: "1.0.0"
        }
      });
    });
  });

  describe("updateMeta", () => {
    it("should add meta data", () => {
      const packageJSON = {};
      const files = [{
        created: true,
        newPath: "file.js"
      }];

      packageUtils.updateMeta(packageJSON, files);

      expect(packageJSON).to.deep.equal({
        _publishr: [{
          created: true,
          path: "file.js"
        }, {
          created: false,
          path: "package.json"
        }]
      });
    });
  });

  describe("updateScripts", () => {
    it("should handle no publishr", () => {
      const packageJSON = {
        scripts: {
          "test": "mocha"
        }
      };

      packageUtils.updateScripts(packageJSON);

      expect(packageJSON).to.deep.equal({
        scripts: {
          "test": "mocha"
        }
      });
    });

    it("should handle no scripts", () => {
      const packageJSON = {
        publishr: {
          "dependencies": "^babel"
        }
      };

      packageUtils.updateScripts(packageJSON);

      expect(packageJSON).to.deep.equal({
        publishr: {
          "dependencies": "^babel"
        }
      });
    });

    it("should update scripts", () => {
      const packageJSON = {
        publishr: {
          "scripts": {
            "added": "echo 'added'",
            "cool": "echo 'cool'",
            "postinstall": ""
          }
        },
        scripts: {
          cool: "echo 'not cool'",
          postinstall: "npm run build",
          test: "mocha"
        }
      };

      packageUtils.updateScripts(packageJSON);

      expect(packageJSON).to.deep.equal({
        publishr: {
          "scripts": {
            "added": "echo 'added'",
            "postinstall": "",
            "cool": "echo 'cool'"
          }
        },
        scripts: {
          added: "echo 'added'",
          cool: "echo 'cool'",
          test: "mocha"
        }
      });
    });
  });
});

import handlePackage from "handle-package";


describe("handlePackage", () => {
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

      handlePackage.updateDependencies(packageJSON);

      expect(packageJSON).to.deep.equal({
        dependencies: {
          lodash: "1.0.0"
        },
        devDependencies: {
          babel: "1.0.0",
          "babel-core": "1.0.0",
          eslint: "1.0.0",
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

      handlePackage.updateDependencies(packageJSON);

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

      handlePackage.updateDependencies(packageJSON);

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

      handlePackage.updateDependencies(packageJSON);

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

      handlePackage.updateMeta(packageJSON, files);

      expect(packageJSON).to.deep.equal({
        _publishr: [{
          created: true,
          path: "file.js"
        }, {
          created: false,
          path: "package.json"
        }]
      })
    });
  });
});

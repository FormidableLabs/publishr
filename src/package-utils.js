import logger from "./logger";
import objectAssign from "object-assign";


const packageUtils = {
  updateDependencies(json) {
    if (!json.publishr || !json.publishr.dependencies) {
      return json;
    }

    json.dependencies = objectAssign({}, json.dependencies);
    json.devDependencies = objectAssign({}, json.devDependencies);

    const dependencyKeys = Object.keys(json.dependencies);

    json.publishr.dependencies.forEach((str) => {
      const regex = new RegExp(str);

      dependencyKeys.filter(
        (key) => regex.test(key)
      ).forEach((key) => {
        json.devDependencies[key] = json.dependencies[key];
        logger.pass(`dependency '${key}'`);
      });

      json.dependencies = dependencyKeys.filter(
        (key) => !regex.test(key)
      ).reduce((result, key) => {
        result[key] = json.dependencies[key];

        return result;
      }, {});
    });

    return json;
  },

  updateScripts(json) {
    if (!json.publishr || !json.publishr.scripts) {
      return json;
    }

    json.scripts = objectAssign({}, json.scripts);

    Object.keys(json.publishr.scripts).forEach((key) => {
      const script = json.publishr.scripts[key];

      if (!script) {
        delete json.scripts[key];
        logger.pass(`remove script '${key}'`);
      } else {
        json.scripts[key] = script;
        logger.pass(`replace script '${key}'`);
      }
    });

    return json;
  },

  updateMeta(json, files) {
    json._publishr = files.map((file) => ({
      created: file.created,
      path: file.newPath
    }));
    json._publishr.push({
      created: false,
      path: "package.json"
    });

    return json;
  }
};

export default packageUtils;

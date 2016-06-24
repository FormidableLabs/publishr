import objectAssign from "object-assign";


const handlePackage = {
  updateDependencies(json) {
    if (!json.publishr) {
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

export default handlePackage;

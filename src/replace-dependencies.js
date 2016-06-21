export default function replaceDependencies(json) {
    const dependencyKeys = Object.keys(json.dependencies);

    json.devDependencies = objectAssign({}, json.devDependencies);
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
}
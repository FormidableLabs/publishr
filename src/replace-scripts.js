function replaceScripts(json) {
    json.scripts = objectAssign({}, json.scripts);
    json.scripts.postpublish = [
        'echo postpublishadded',
        json.scripts.postversion
    ].filter((cmd) => cmd).join(' && ');
    json.scripts.postversion = [
        'echo postversionadded',
        json.scripts.postversion
    ].filter((cmd) => cmd).join(' && ');
}

export default replaceScripts;
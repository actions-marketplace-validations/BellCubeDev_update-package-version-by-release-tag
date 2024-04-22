# `BellCubeDev/update-package-version-by-release-tag`

Update your local package.json version from the release tag passed to this workflow run

When triggering a workflow through a release tag

## Usage

Works plug-and-play with release triggers. Just add this action to your workflow and it will update your package.json version to the release tag version.

```yaml
using: BellCubeDev/update-package-version-by-release-tag@v2
```

Should you require more control, all external variables and checks can be controlled entirely by you.

```yaml
using: BellCubeDev/update-package-version-by-release-tag@v2
with:
  # Specify a version to set in the package.json file. If not provided, the release tag will be used.
  version: "1.2.3"

  # If set to "true", will not remove any 'v' prefix from the version number.
  keep-v: "true"

  # If set to "true", will not check if the version number is a valid semver version.
  ignore-semver-check: "true"

  # The path to the package.json file to update relative to the current working directory. Defaults to "./package.json".
  package-json-path: "~/some/project/package.json"

  # The encoding to use when reading and writing the package.json file. Defaults to "utf8".
  encoding: "utf8"
```

## APIs You Must Sacrifice A Goat To When Things Go Wrong

- [node:fs/promises](https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_fs_promises_api)
  - Supported encodings listed in the IF statements in [Node's source code](https://github.com/nodejs/node/blob/main/lib/internal/util.js) (function `slowCases` in `node/lib/internal/util.js`)
- [JSON.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
- This regex: <pre><code>^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]_))_))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)\*))?$</pre></code>

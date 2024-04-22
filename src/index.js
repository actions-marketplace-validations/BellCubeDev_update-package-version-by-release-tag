import * as core from "@actions/core";
import * as github from "@actions/github";
import * as fs from "fs/promises";

async function run() {
  try {
    const payload = github.context.payload;

    let version =
      core.getInput("version", { required: false }) || payload.release.tag_name;
    console.log(`Got version (raw): ${version}`);

    if (core.getInput("keep-v", { required: false }) !== "true")
      if (version.startsWith("v")) version = version.replace("v", "");

    if (core.getInput("ignore-semver-check", { required: false }) !== "true")
      if (
        !/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/.test(
          version,
        )
      ) {
        const error = new Error(
          `The specified version, "${version}"m does not match semantic versioning.`,
        );
        throw error;
      }

    const packageJsonPath = core.getInput("package-json-path", {
      required: false,
    });

    const encoding = core.getInput("encoding", { required: false });
    if (!Buffer.isEncoding(encoding)) {
      const error = new Error(
        `Invalid encoding specified for package.json (reported by Buffer.isEncoding()), "${encoding}"`,
      );
      error.message += ` ("${packageJsonPath}", "${encoding}")`;
      error.stack += `\n   ("${packageJsonPath}", "${encoding}")`;
      throw error;
    }

    /** @type {string} @readonly */
    let packageJsonFile;
    try {
      packageJsonFile = await fs.readFile(packageJsonPath, encoding);
    } catch (error) {
      error.message += ` ("${packageJsonPath}", "${encoding}")`;
      error.stack += `\n   ("${packageJsonPath}", "${encoding}")`;
      console.error("Error reading package.json file", error);
      throw error;
    }

    if (typeof packageJsonFile !== "string") {
      const error = new Error(
        `Invalid encoding specified for package.json, "${encoding}"`,
      );
      error.message += ` ("${packageJsonPath}", "${encoding}")`;
      error.stack += `\n   ("${packageJsonPath}", "${encoding}")`;
      throw error;
    }

    /** @type {Object} @readonly */
    let packageJson;
    try {
      packageJson = JSON.parse(packageJsonFile);
    } catch (error) {
      error.message += ` ("${packageJsonPath}", "${encoding}")`;
      error.stack += `\n   ("${packageJsonPath}", "${encoding}")`;
      console.error("Error parsing package.json file", error);
      console.log("======================================");
      console.log(packageJsonFile);
      console.log("======================================");
      throw error;
    }

    const originalVersion = packageJson.version;
    packageJson.version = version;

    try {
      await fs.writeFile(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2),
        encoding,
      );
    } catch (error) {
      error.message += ` ("${packageJsonPath}", "${encoding}")`;
      error.stack += `\n   ("${packageJsonPath}", "${encoding}")`;
      console.error("Error writing package.json file", error);
      throw error;
    }

    core.info(
      `Modified version number in package.json from ${originalVersion} to ${packageJson.version}`,
    );
  } catch (error) {
    core.setFailed(error);
  }
}

run();

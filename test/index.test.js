const fs = require("fs");
const utils = require("../dynamodb/utils");
const { expect } = require("chai");
const { install, remove, installAsync } = require("../index");
const config = require("../dynamodb/config.json");

describe("install", function() {
  const installPath = `./dynamodb/${config.setup.install_path}`;
  const jarPath = `${installPath}/${config.setup.jar}`;

  beforeEach(() => {
    if (fs.existsSync(jarPath)) {
      fs.unlinkSync(jarPath);
    }
  });

  it("downloads the jar successfully", function(done) {
    this.timeout(60000); // 60 second timeout

    install(function() {
      if (fs.existsSync(jarPath)) {
        done();
      }
    });
  });

  it("can download the jar async", async function() {
    this.timeout(60000); // 60s timeout

    await installAsync();

    if (!fs.existsSync(jarPath)) {
      throw new Error('Jar was not downloaded.');
    }
  });

  it("removes the setup files", function(done) {
    this.timeout(10000);

    remove(function() {
      if (!fs.existsSync(installPath)) {
        done();
      }
    });
  });
});

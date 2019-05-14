const fs = require("fs");
const utils = require("../dynamodb/utils");
const { expect } = require("chai");
const { install, remove } = require("../index");
const config = require("../dynamodb/config.json");

describe("install", function() {
  const installPath = `./dynamodb/${config.setup.install_path}`;
  const jarPath = `${installPath}/${config.setup.jar}`;

  it("downloads the jar successfully", function(done) {
    this.timeout(10000); // 10 second timeout

    install(function() {
      if (fs.existsSync(jarPath)) {
        done();
      }
    });
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

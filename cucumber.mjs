process.env.TS_NODE_PROJECT = "tsconfig.test.json";

const common = {
  requireModule: ["ts-node/register"],
  require: ["./bdd/steps/**/*.ts"],
  paths: ["./bdd/features/**/*.feature"],
  publishQuiet: true,
  format: [
    "progress-bar",
    "html:./test-results/cucumber/report.html",
    "message:./test-results/cucumber/output.ndjson",
  ],
  worldParameters: {},
};

export default {
  default: common,
};

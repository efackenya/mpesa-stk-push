const express = require("express");
const { makeStkPushRequest } = require("../controller/mpesa");
const Router = express();

Router.route("/stk-push-request").post(makeStkPushRequest);

module.exports = Router;

const express = require("express");
const { makeStkPushRequest, stkCallBackUrl } = require("../controller/mpesa");
const Router = express();

Router.route("/stk-push-request").post(makeStkPushRequest);
Router.route("/stk-push/callback").post(stkCallBackUrl);

module.exports = Router;

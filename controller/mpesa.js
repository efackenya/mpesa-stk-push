const { default: axios } = require("axios");
const expressAsyncHandler = require("express-async-handler");
const {
  getAcessToken,
  getMpesaPassword,
  paymentVerification,
} = require("../utils/mpesaUtil");
const moment = require("moment");

const makeStkPushRequest = expressAsyncHandler(async (req, res) => {
  try {
    // Get the access token first
    const { phoneNumber, amount } = req.body;
    const timestamp = moment().format("YYYYMMDDHHmmss");
    const password = getMpesaPassword(
      process.env.SHORT_CODE,
      process.env.MPESA_EXPRESS_PASSKEY,
      timestamp
    );
    let token = await getAcessToken();
    const response = await axios.post(
      process.env.STK_LINK,
      {
        BusinessShortCode: process.env.SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: process.env.SHORT_CODE,
        PhoneNumber: phoneNumber,
        CallBackURL: "https://56ca-102-215-33-203.ngrok-free.ap",
        AccountReference: "Test",
        TransactionDesc: "Test",
      },
      {
        headers: {
          Authorization: ` Bearer ${token}`,
        },
      }
    );
    const CheckoutRequestID = response.data.CheckoutRequestID;
    console.log("CheckoutRequestID", CheckoutRequestID);
    const paymentVerificationResponse = await paymentVerification(
      CheckoutRequestID
    );
    if (!paymentVerificationResponse) {
      res.status(400).json({
        message: "There was an error completing your payment request",
      });
    }
    if (paymentVerificationResponse.success) {
      // DB Logic
    }
    res.status(200).json({ mpesaResponse: paymentVerificationResponse });
  } catch (error) {
    console.log(`Error in making stk push request :${error}`);
    return res.status(500).json({
      message: "There was an error in completing your payment request",
    });
  }
});

module.exports = { makeStkPushRequest };

const { default: axios } = require("axios");
const expressAsyncHandler = require("express-async-handler");
const {
  getAcessToken,
  getMpesaPassword,
  paymentVerification,
  reduceMpesaMetadata,
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
        CallBackURL: `${process.env.APP_DOMAIN}/mpesa/stk-push/callback`,
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
    if (!paymentVerificationResponse || !paymentVerificationResponse.success) {
      res.status(400).json({
        message: "There was an error completing your payment request",
      });
      // DB LOGIC
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

const stkCallBackUrl = expressAsyncHandler(async (req, res) => {
  try {
    console.log("This callback function was called.....");
    console.log("################### MPESA CALLBACK ###############");
    console.log(req.body.Body);
    console.log("################### MPESA CALLBACK ###############");
    const mpesaDumpedData = req.body.Body.stkCallback.CallbackMetadata.Item;
    const { Amount, PhoneNumber, MpesaReceiptNumber, TransactionDate } =
      reduceMpesaMetadata(mpesaDumpedData);
    console.log("Amount Paid", Amount);
    console.log("PhoneNumber Paying", PhoneNumber);
    console.log("Transaction Date", TransactionDate);
    console.log("Mpesa Receipt", MpesaReceiptNumber);
    // Transaction table update
    return res.status(200).json({
      message: `Payment Successful! Your transaction has been recorded`,
      data: {
        Amount,
        PhoneNumber,
        TransactionDate,
        MpesaReceiptNumber,
      },
    });
  } catch (error) {
    console.log(`Error in Callback Function :${error}`);
  }
});

module.exports = { makeStkPushRequest, stkCallBackUrl };

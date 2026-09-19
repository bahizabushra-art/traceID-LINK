import { Request, Response } from 'express';
import crypto from 'crypto';

/**
 * Mock / Sandbox REST API handlers for bKash
 */
export const bkashSandbox = {
  createPayment: (req: Request, res: Response) => {
    const { amount, merchantInvoiceNumber, intent, payerReference } = req.body;
    const paymentId = `TR0011${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    return res.status(200).json({
      statusCode: '0000',
      statusMessage: 'Successful',
      paymentID: paymentId,
      bkashURL: `https://sandbox.payment.bkash.com/redirect?paymentID=${paymentId}`,
      callbackURL: 'https://ais-dev.run.app/api/gateways/bkash/callback',
      amount: String(amount || '1200.00'),
      currency: 'BDT',
      intent: intent || 'sale',
      merchantInvoiceNumber: merchantInvoiceNumber || `INV-${Date.now()}`,
      createTime: new Date().toISOString()
    });
  },

  executePayment: (req: Request, res: Response) => {
    const { paymentID } = req.body;
    const trxID = `BK${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    return res.status(200).json({
      statusCode: '0000',
      statusMessage: 'Successful',
      paymentID: paymentID || `TR0011${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      trxID,
      transactionStatus: 'Completed',
      amount: '1200.00',
      currency: 'BDT',
      intent: 'sale',
      paymentExecuteTime: new Date().toISOString(),
      merchantInvoiceNumber: 'INV-2026-9941',
      payerType: 'Customer',
      payerReference: 'REF-DHAKA-901',
      customerMsisdn: '01711234567'
    });
  },

  queryPayment: (req: Request, res: Response) => {
    const { paymentID } = req.params;
    return res.status(200).json({
      statusCode: '0000',
      statusMessage: 'Successful',
      paymentID,
      trxID: `BK${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      transactionStatus: 'Completed',
      amount: '1200.00',
      currency: 'BDT'
    });
  }
};

/**
 * Mock / Sandbox REST API handlers for Nagad
 */
export const nagadSandbox = {
  initialize: (req: Request, res: Response) => {
    const { orderId, amount } = req.body;
    const paymentRefId = `NG${Date.now()}`;
    return res.status(200).json({
      status: 'Success',
      paymentReferenceId: paymentRefId,
      callBackUrl: 'https://ais-dev.run.app/api/gateways/nagad/callback',
      redirectUrl: `https://sandbox.mynagad.com/pay/${paymentRefId}`,
      amount: amount || 1500,
      orderId: orderId || `ORD-${Date.now()}`
    });
  },

  verify: (req: Request, res: Response) => {
    const { paymentRefId } = req.params;
    return res.status(200).json({
      status: 'Success',
      statusCode: '000',
      merchantId: 'NAGAD_SANDBOX_MERCHANT_01',
      orderId: `ORD-REC-${Date.now().toString().slice(-4)}`,
      paymentRefId,
      amount: '1500.00',
      clientMobileNo: '01819234567',
      merchantMobileNo: '01819000000',
      paymentExecutionTime: new Date().toISOString(),
      issuerPaymentDateTime: new Date().toISOString(),
      issuerPaymentRefNo: `NGTXN-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
    });
  }
};

/**
 * Mock / Sandbox REST API handlers for Pathao Courier
 */
export const pathaoSandbox = {
  createOrder: (req: Request, res: Response) => {
    const { recipient_name, recipient_phone, amount_to_collect, merchant_order_id } = req.body;
    const consignmentId = `PTH-${Date.now().toString().slice(-6)}`;
    
    return res.status(200).json({
      type: 'success',
      message: 'Order created successfully in Pathao Sandbox',
      data: {
        consignment_id: consignmentId,
        merchant_order_id: merchant_order_id || `TR-COD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        recipient_name: recipient_name || 'Customer Name',
        recipient_phone: recipient_phone || '01711000000',
        amount_to_collect: amount_to_collect || 0,
        delivery_fee: 110,
        order_status: 'Pickup Pending',
        tracking_code: `PTH-TRK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
      }
    });
  },

  getOrderStatus: (req: Request, res: Response) => {
    const { id } = req.params;
    return res.status(200).json({
      type: 'success',
      data: {
        consignment_id: id,
        order_status: 'Delivered',
        cod_amount: 2400,
        collected_amount: 2400,
        delivery_fee: 110,
        cod_fee: 24,
        payable_amount: 2266
      }
    });
  }
};

/**
 * Mock / Sandbox REST API handlers for Steadfast Courier
 */
export const steadfastSandbox = {
  createOrder: (req: Request, res: Response) => {
    const { invoice, recipient_name, recipient_phone, cod_amount } = req.body;
    const trackingCode = `STF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    return res.status(200).json({
      status: 200,
      message: 'Order successfully registered in Steadfast Courier Sandbox',
      consignment: {
        consignment_id: Math.floor(100000 + Math.random() * 900000),
        invoice: invoice || `TR-COD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        tracking_code: trackingCode,
        recipient_name,
        recipient_phone,
        cod_amount: cod_amount || 0,
        status: 'in_review',
        created_at: new Date().toISOString()
      }
    });
  },

  getStatus: (req: Request, res: Response) => {
    const { tracking_code } = req.params;
    return res.status(200).json({
      status: 200,
      delivery_status: 'delivered',
      tracking_code,
      payment_status: 'paid'
    });
  }
};

/**
 * Mock / Sandbox REST API handlers for RedX Courier
 */
export const redxSandbox = {
  createParcel: (req: Request, res: Response) => {
    const { customer_name, customer_phone, cash_collection_amount, merchant_invoice_id } = req.body;
    const trackingId = `RDX-${Date.now().toString().slice(-6)}`;

    return res.status(200).json({
      tracking_id: trackingId,
      customer_name,
      customer_phone,
      cash_collection_amount: cash_collection_amount || 0,
      merchant_invoice_id: merchant_invoice_id || `TR-COD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      status: 'ready_for_pickup'
    });
  }
};

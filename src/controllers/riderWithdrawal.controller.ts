import * as riderWithdrawalService from "../services/riderWithdrawal.service.js";

export const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const withdrawal = await riderWithdrawalService.initializeWithdrawal(req.user.id, amount);
    // In a real app, we'd send the OTP via SMS/Email here.
    res.json({
      status: "success",
      message: "Withdrawal initialized. Please verify with OTP.",
      data: { withdrawalId: withdrawal.id },
    });
  } catch (error) {
    next(error);
  }
};

export const confirmWithdrawal = async (req, res, next) => {
  try {
    const { withdrawalId, otp } = req.body;
    const withdrawal = await riderWithdrawalService.verifyAndCompleteWithdrawal(req.user.id, withdrawalId, otp);
    res.json({ status: "success", message: "Withdrawal completed successfully", data: withdrawal });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const history = await riderWithdrawalService.getWithdrawalHistory(req.user.id);
    res.json({ status: "success", data: history });
  } catch (error) {
    next(error);
  }
};

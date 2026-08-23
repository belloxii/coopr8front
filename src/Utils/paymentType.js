// TESCOM staff (salary-deduction) members never pay online — their savings and
// loan repayments are deducted from salary automatically. Self-pay members use
// the Paystack gateway / bank transfer. This helper centralises that check so
// every payment surface gates the same way.

export const isSalaryDeductionUser = (auth) =>
  auth?.user?.user?.paymentType === "GOVERNMENT";

export const SALARY_DEDUCTION_NOTICE =
  "Your monthly savings and loan repayments are deducted from your salary automatically. Online payment is not required.";

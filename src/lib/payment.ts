const allowedPaymentHosts = new Set([
  "my.moneyfusion.net",
  "moneyfusion.net",
  "www.moneyfusion.net",
]);

export const PAYMENT_SUCCESS_MESSAGE_TYPE = "vision-france-payment-success";

export function getSafePaymentUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" || !allowedPaymentHosts.has(url.hostname)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

const CHARIOW_API_URL =
  process.env.CHARIOW_API_URL ?? "https://api.chariow.com";

export const PAYMENT_SUCCESS_MESSAGE_TYPE =
  "vision-france-payment-success";

export const CHARIOW_ENDPOINT = `${CHARIOW_API_URL}/v1/checkout`;

export const CHARIOW_SUCCESS_URL =
  process.env.CHARIOW_REDIRECT_SUCCESS ??
  "http://localhost:3000/payment/success";

export const CHARIOW_CANCEL_URL =
  process.env.CHARIOW_REDIRECT_CANCEL ??
  "http://localhost:3000/payment/cancel";

/**
 * Vérifie qu'une URL est bien une URL HTTPS valide.
 * Utilisé uniquement pour les redirections.
 */
export function getSafeUrl(value?: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
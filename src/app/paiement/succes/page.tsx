import { notFound } from "next/navigation";
import { PaymentSuccessPage } from "@/components/payment-success-page";
import { getSafePaymentUrl } from "@/lib/payment";
import { firstQueryValue } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PaymentSuccessRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaymentSuccessRoute({
  searchParams,
}: PaymentSuccessRouteProps) {
  const params = await searchParams;
  const paymentUrl = getSafePaymentUrl(firstQueryValue(params.paymentUrl));

  if (!paymentUrl) {
    notFound();
  }

  return <PaymentSuccessPage paymentUrl={paymentUrl} />;
}

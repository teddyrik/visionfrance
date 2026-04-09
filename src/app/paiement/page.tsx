import { notFound } from "next/navigation";
import { PaymentPopupFrame } from "@/components/payment-popup-frame";
import { getSafePaymentUrl } from "@/lib/payment";
import { firstQueryValue } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PaymentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const params = await searchParams;
  const paymentUrl = getSafePaymentUrl(firstQueryValue(params.paymentUrl));

  if (!paymentUrl) {
    notFound();
  }

  return <PaymentPopupFrame paymentUrl={paymentUrl} />;
}

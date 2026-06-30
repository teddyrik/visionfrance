import { notFound } from "next/navigation";
import { PaymentPopupFrame } from "@/components/payment-popup-frame";
import { getSafeUrl } from "@/lib/payment";
import { firstQueryValue } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PaymentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaymentPage({
  searchParams,
}: PaymentPageProps) {
  const params = await searchParams;

  const checkoutUrl = getSafeUrl(
    firstQueryValue(params.checkoutUrl)
  );

  if (!checkoutUrl) {
    notFound();
  }

  return <PaymentPopupFrame checkoutUrl={checkoutUrl} />;
}
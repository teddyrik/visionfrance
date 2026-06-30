import { NextRequest, NextResponse } from "next/server";

const PRODUCT_ID = "prd_kfoi9d8z";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch("https://api.chariow.com/v1/checkout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CHARIOW_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: PRODUCT_ID,

        email: body.email,
        first_name: body.firstName,
        last_name: body.lastName,

        phone: {
          number: body.phoneNumber,
          country_code: body.phoneCountryCode,
        },

        redirect_url:
          process.env.CHARIOW_REDIRECT_SUCCESS,

        custom_metadata: {
          scholarshipSlug: body.scholarshipSlug,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          message: result.message,
          errors: result.errors,
        },
        {
          status: response.status,
        },
      );
    }

    return NextResponse.json({
      checkoutUrl: result.data.payment.checkout_url,
      purchaseId: result.data.purchase.id,
      transactionId: result.data.payment.transaction_id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Impossible de créer la session de paiement.",
      },
      {
        status: 500,
      },
    );
  }
}
import React, { useEffect, useState, useContext } from "react";
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import cartContext from "../contexts/cart/cartContext";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { orders } = useContext(cartContext);

  //   const [email, setEmail] = useState(localStorage.getItem("email"));
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.setItem("orders", JSON.stringify(orders));

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url:
          process.env.NODE_ENV === "development"
            ? "http://localhost:3000/success"
            : "https://gfg-sfi.onrender.com/success",
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs",
  };

  return (
    <div className="w-full flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-[30vw] max-w-[900px] shadow-[0px_0px_0px_0.5px_rgba(50,50,93,0.1),_0px_2px_5px_0px_rgba(50,50,93,0.1),_0px_1px_1.5px_0px_rgba(0,0,0,0.07)] rounded-[7px] p-[40px] mt-10"
        style={{ color: "var(--blue-color-8)" }}
      >
        <div id="amount">
          <h1 id="amo">Payment</h1>
          <div id="price">
            Amount : {localStorage.getItem("totalPrice")}.00 ₹
          </div>
        </div>
        <LinkAuthenticationElement id="link-authentication-element" />
        <PaymentElement
          id="payment-element"
          options={paymentElementOptions}
          className="mt-[24px]"
        />
        <button
          className="bg-[#5469d4] font-sans text-white-1 ounded-[4px] border-0 py-[12px] px-[16px] text-[16px] font-semibold cursor-pointer block transition-all duration-200 ease shadow-[0_4px_5.5px_0_rgba(0,0,0,0.07) w-full hover:filter hover:contrast-[115%] disabled:opacity-50 cursor-default"
          disabled={isLoading || !stripe || !elements}
          id="submit"
        >
          <span id="button-text">
            {isLoading ? (
              <span class="flex items-center justify-center">
                <div role="status">
                  <svg
                    aria-hidden="true"
                    class="w-4 h-4 me-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#5469d4]"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span class="sr-only"></span>
                </div>
              </span>
            ) : (
              "Pay now"
            )}
          </span>
        </button>
        {/* Show any error or success messages */}
        {message && (
          <div className="text-[rgba(105,115,134) text-[16px] leading-[20px] pt-[12px] text-center">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

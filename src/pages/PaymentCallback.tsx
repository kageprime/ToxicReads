import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { PiCheckCircle, PiXCircle, PiSpinner } from "react-icons/pi";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";

/** Landing page after Paystack hosted checkout. Verifies and unlocks edition. */
export default function PaymentCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const started = useRef(false);

  const reference = params.get("reference") || params.get("trxref") || "";

  const verify = trpc.purchase.paystackVerify.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.alreadyOwned
          ? "You already own this edition"
          : "Payment confirmed. Enjoy your book."
      );
      navigate(`/book/${data.book.slug ?? data.book.id}`);
    },
  });

  useEffect(() => {
    if (!reference || isAuthLoading || started.current) return;
    if (!isAuthenticated) return;
    started.current = true;
    verify.mutate({ reference });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, isAuthLoading, isAuthenticated]);

  if (!reference) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <EmptyState
          icon={<PiXCircle className="h-5 w-5" aria-hidden="true" />}
          title="Missing payment reference"
          body="We could not locate the payment reference for this order. If you were charged, please contact support."
          actionLabel="Back to catalog"
          onAction={() => navigate("/home")}
        />
      </div>
    );
  }

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <EmptyState
          icon={<PiSpinner className="h-5 w-5" aria-hidden="true" />}
          title="One more step"
          body="Sign back in to finish verifying your payment. Your purchase is safe and will not be charged twice."
          actionLabel="Sign in"
          onAction={() => navigate("/login")}
        />
      </div>
    );
  }

  if (verify.error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <EmptyState
          icon={<PiXCircle className="h-5 w-5" aria-hidden="true" />}
          title="Payment not confirmed"
          body={`${verify.error.message} Reference: ${reference}`}
          actionLabel="Check my library"
          onAction={() => navigate("/my-purchases")}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center text-center max-w-sm">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-border bg-card shadow-soft">
          {verify.isSuccess ? (
            <PiCheckCircle className="h-6 w-6 text-p-green-fg" aria-hidden="true" />
          ) : (
            <PiSpinner className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          )}
        </span>
        <h1 className="mt-5 font-serif text-2xl font-medium tracking-tight text-foreground">
          {verify.isSuccess ? "Order confirmed" : "Confirming your payment..."}
        </h1>
        <p className="tnum mt-2 font-mono text-xs text-muted-foreground">
          {reference}
        </p>
      </div>
    </div>
  );
}

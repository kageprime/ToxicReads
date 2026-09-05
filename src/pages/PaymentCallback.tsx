import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { PiCheckCircle, PiXCircle, PiSpinner } from "react-icons/pi";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";

/** Landing spot after Paystack hosted checkout. Verifies + fulfills. */
export default function PaymentCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const started = useRef(false);

  const reference =
    params.get("reference") || params.get("trxref") || "";

  const verify = trpc.purchase.paystackVerify.useMutation({
    onSuccess: data => {
      toast.success(
        data.alreadyOwned
          ? "You already own this book"
          : "Payment confirmed — enjoy your book"
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
          icon={<PiXCircle size={24} />}
          title="Missing payment reference"
          body="We couldn't find which payment this was for. If you were charged, contact support."
          actionLabel="Back to library"
          onAction={() => navigate("/home")}
        />
      </div>
    );
  }

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <EmptyState
          icon={<PiSpinner size={24} />}
          title="One more step"
          body="Log back in to finish confirming your payment. Your purchase is safe — nothing is charged twice."
          actionLabel="Log in"
          onAction={() => navigate("/login")}
        />
      </div>
    );
  }

  if (verify.error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <EmptyState
          icon={<PiXCircle size={24} />}
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
      <div className="flex flex-col items-center text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-border bg-card">
          {verify.isSuccess ? (
            <PiCheckCircle size={24} className="text-p-green-fg" />
          ) : (
            <PiSpinner size={24} className="animate-spin text-muted-foreground" />
          )}
        </span>
        <h1 className="mt-5 font-serif text-2xl tracking-tight text-baobab">
          {verify.isSuccess ? "Confirmed" : "Confirming your payment…"}
        </h1>
        <p className="tnum mt-2 font-mono text-xs text-muted-foreground">
          {reference}
        </p>
      </div>
    </div>
  );
}

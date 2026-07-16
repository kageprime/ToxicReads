import {
  PiCheckCircle,
  PiInfo,
  PiSpinner,
  PiXCircle,
  PiWarning,
} from "react-icons/pi";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <PiCheckCircle className="size-4" />,
        info: <PiInfo className="size-4" />,
        warning: <PiWarning className="size-4" />,
        error: <PiXCircle className="size-4" />,
        loading: <PiSpinner className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "hsl(var(--popover))",
          "--normal-text": "hsl(var(--popover-foreground))",
          "--normal-border": "hsl(var(--border))",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

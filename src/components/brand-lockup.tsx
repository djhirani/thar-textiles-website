import Image from "next/image";
import { withBasePath } from "@/lib/paths";

export function BrandLockup({
  className = "",
  compact = false,
  priority = false,
}: {
  className?: string;
  compact?: boolean;
  inverse?: boolean;
  priority?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={[
        "owner-lockup",
        compact ? "owner-lockup--compact" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        alt=""
        height={1402}
        priority={priority}
        src={withBasePath("/brand/owner-direction/Logo-reference.png")}
        unoptimized
        width={1122}
      />
    </span>
  );
}

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
        "illustrated-lockup",
        compact ? "illustrated-lockup--compact" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        alt=""
        height={216}
        priority={priority}
        src={withBasePath("/brand/emblem-premium-heritage.svg")}
        unoptimized
        width={216}
      />
      {!compact ? (
        <span className="illustrated-lockup__name">
          THAR <em>TEXTILES</em>
        </span>
      ) : null}
    </span>
  );
}

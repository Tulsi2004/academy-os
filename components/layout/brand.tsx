import type { SVGProps } from "react";

/*
  Brand lockup lifted from academy-os-landing (components/BrandMark.tsx plus
  the .brand / .brand-parent / .brand-product rules in its globals.css):
  navy tulsi leaf, "TULSI" eyebrow over the "Academy OS" product name.
  Keep this in sync with the landing site rather than shipping a bitmap logo.
*/

const BRAND_NAVY = "#2c3a75";

export function BrandMark({
  className = "h-8 w-8",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={BRAND_NAVY}
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M12 21c0-6.5 2.5-11 7-13-1 6-2.5 11-7 13Zm0 0c0-6.5-2.5-11-7-13 1 6 2.5 11 7 13Z" />
      <path
        d="M12 21V9"
        stroke={BRAND_NAVY}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const SIZES = {
  sm: {
    mark: "h-8 w-8",
    parent: "text-[0.625rem]",
    product: "text-[1.0625rem]",
  },
  lg: {
    mark: "h-14 w-14",
    parent: "text-xs",
    product: "text-3xl",
  },
} as const;

export function BrandLockup({
  size = "sm",
  className = "",
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark className={`${s.mark} shrink-0`} />
      <span className="flex flex-col leading-[1.15]">
        <span
          className={`${s.parent} font-brand font-semibold uppercase tracking-[0.14em] text-[#2c3a75]`}
        >
          Tulsi
        </span>
        <span
          className={`${s.product} font-heading font-bold -tracking-[0.01em] text-foreground`}
        >
          Academy OS
        </span>
      </span>
    </span>
  );
}

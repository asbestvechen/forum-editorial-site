import { brandLogoSlugs } from "@/lib/brand";

type BrandLogoProps = {
  name: string;
  className?: string;
};

export function BrandLogo({ name, className = "" }: BrandLogoProps) {
  const logoSlug = brandLogoSlugs[name];

  return (
    <span className={`brand-logo-chip ${className}`.trim()}>
      {logoSlug ? (
        <img
          className="brand-logo-chip__image"
          src={`./images/brands/${logoSlug}.png`}
          alt=""
          width="18"
          height="18"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      ) : null}
      <span className="brand-logo-chip__name">{name}</span>
    </span>
  );
}

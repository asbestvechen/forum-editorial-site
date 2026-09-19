import { brandLogoSlugs, brandWebsiteUrls } from "@/lib/brand";

type BrandLogoProps = {
  name: string;
  className?: string;
};

export function BrandLogo({ name, className = "" }: BrandLogoProps) {
  const logoSlug = brandLogoSlugs[name];
  const websiteUrl = brandWebsiteUrls[name];
  const content = (
    <>
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
    </>
  );

  if (!websiteUrl) return <span className={`brand-logo-chip ${className}`.trim()}>{content}</span>;

  return (
    <a
      className={`brand-logo-chip brand-logo-chip--link ${className}`.trim()}
      href={websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Открыть сайт ${name} в новой вкладке`}
    >
      {content}
    </a>
  );
}

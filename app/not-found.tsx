import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container not-found-main" tabIndex={-1}>
        <p className="eyebrow">Page not found</p>
        <h1>
          Let’s get you back
          <br />
          to the right place.
        </h1>
        <p style={{ margin: "24px 0" }}>The page you’re looking for isn’t available.</p>
        <Link className="button" href="/">
          Back to home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}

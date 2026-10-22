import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ServiceIndex } from "@/components/site/blocks";
import { ROUTES } from "@/lib/routes";

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
        </Link>{" "}
        <Link className="text-link" href={ROUTES.contact} style={{ marginLeft: 16 }}>
          Book an appointment
        </Link>
        <ServiceIndex heading="Looking for a procedure page?" />
      </main>
      <SiteFooter />
    </>
  );
}

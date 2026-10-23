import { ImageKitProvider } from "@imagekit/next";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { GoogleAnalytics } from "@/components/site/google-analytics";
import { AnalyticsEvents } from "@/components/site/analytics-events";
import { CookieBanner } from "@/components/site/cookie-banner";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { imageKitEndpoint } from "@/lib/images";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ImageKitProvider urlEndpoint={imageKitEndpoint()}>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
      <WhatsAppButton />
      <CookieBanner />
      <GoogleAnalytics />
      <AnalyticsEvents />
    </ImageKitProvider>
  );
}

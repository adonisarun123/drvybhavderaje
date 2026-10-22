import { ImageKitProvider } from "@imagekit/next";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { GoogleAnalytics } from "@/components/site/google-analytics";
import { imageKitEndpoint } from "@/lib/images";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ImageKitProvider urlEndpoint={imageKitEndpoint()}>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
      <GoogleAnalytics />
    </ImageKitProvider>
  );
}

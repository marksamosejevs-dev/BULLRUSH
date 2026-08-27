import { AnnouncementBar } from "@/components/AnnouncementBar/AnnouncementBar";
import { Benefits } from "@/components/Benefits/Benefits";
import { BrandInterlude } from "@/components/BrandInterlude/BrandInterlude";
import { BrandMarquee } from "@/components/BrandMarquee/BrandMarquee";
import { BrandStatement } from "@/components/BrandStatement/BrandStatement";
import { BuyModule } from "@/components/BuyModule/BuyModule";
import { CartDrawer } from "@/components/CartDrawer/CartDrawer";
import { ConsistencyChart } from "@/components/ConsistencyChart/ConsistencyChart";
import { ContextGallery } from "@/components/ContextGallery/ContextGallery";
import { DailyStandard } from "@/components/DailyStandard/DailyStandard";
import { FAQ } from "@/components/FAQ/FAQ";
import { FinalCTA } from "@/components/FinalCTA/FinalCTA";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { Hero } from "@/components/Hero/Hero";
import { HorizontalStory } from "@/components/HorizontalStory/HorizontalStory";
import { MaterialInterlude } from "@/components/MaterialInterlude/MaterialInterlude";
import { PerformanceSystem } from "@/components/PerformanceSystem/PerformanceSystem";
import { ProblemNarrative } from "@/components/ProblemNarrative/ProblemNarrative";
import { ProductDossier } from "@/components/ProductDossier/ProductDossier";
import { ProductObject } from "@/components/ProductObject/ProductObject";
import { ProductSystem } from "@/components/ProductSystem/ProductSystem";
import { StickyBuyBar } from "@/components/StickyBuyBar/StickyBuyBar";
import { Timeline } from "@/components/Timeline/Timeline";
import { Transparency } from "@/components/Transparency/Transparency";
import { TrustMarquee } from "@/components/TrustMarquee/TrustMarquee";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main">
        <Hero />

        <TrustMarquee variant="ink" />

        <BrandStatement
          id="standard"
          eyebrow="THE STANDARD"
          lines={["NOT LOUDER.", "BETTER."]}
          body="BULLRUSH is built around performance through discipline, consistency and self-command."
          variant="bone"
        />

        <BuyModule />

        <TrustMarquee variant="bone" />

        <ProductObject />

        <ContextGallery />

        <ProductDossier />

        <ProblemNarrative />

        <HorizontalStory />

        <ConsistencyChart />

        <BrandMarquee />

        <PerformanceSystem />

        <Benefits />

        <DailyStandard />

        <BrandInterlude />

        <Timeline />

        <ProductSystem />

        <MaterialInterlude scene="geometry" line="BUILT IN SILENCE." />

        <MaterialInterlude scene="planes" line="STRENGTH WITH RESTRAINT." />

        <TrustMarquee variant="ink" />

        <Transparency />

        <FAQ />

        <TrustMarquee variant="ink" />

        <FinalCTA />

        <Footer />
      </main>
      <CartDrawer />
      <StickyBuyBar />
    </>
  );
}

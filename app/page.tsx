import { BrandInterlude } from "@/components/BrandInterlude/BrandInterlude";
import { BrandStatement } from "@/components/BrandStatement/BrandStatement";
import { BuyModule } from "@/components/BuyModule/BuyModule";
import { CartDrawer } from "@/components/CartDrawer/CartDrawer";
import { ContextGallery } from "@/components/ContextGallery/ContextGallery";
import { DailyStandard } from "@/components/DailyStandard/DailyStandard";
import { EvidenceSection } from "@/components/EvidenceSection/EvidenceSection";
import { FAQ } from "@/components/FAQ/FAQ";
import { FinalCTA } from "@/components/FinalCTA/FinalCTA";
import { Footer } from "@/components/Footer/Footer";
import { FormulaExplorer } from "@/components/FormulaExplorer/FormulaExplorer";
import { Header } from "@/components/Header/Header";
import { Hero } from "@/components/Hero/Hero";
import { MaterialInterlude } from "@/components/MaterialInterlude/MaterialInterlude";
import { ProductObject } from "@/components/ProductObject/ProductObject";
import { ProductSystem } from "@/components/ProductSystem/ProductSystem";
import { StickyBuyBar } from "@/components/StickyBuyBar/StickyBuyBar";
import { Transparency } from "@/components/Transparency/Transparency";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />

        <BrandStatement
          id="standard"
          eyebrow="THE STANDARD"
          lines={["NOT LOUDER.", "BETTER."]}
          body="BULLRUSH is built around performance through discipline, consistency and self-command."
          variant="bone"
        />

        <ProductObject />

        <BuyModule />

        <ContextGallery />

        <FormulaExplorer />

        <EvidenceSection />

        <DailyStandard />

        <BrandInterlude />

        <ProductSystem />

        <MaterialInterlude scene="geometry" line="BUILT IN SILENCE." />

        <Transparency />

        <FAQ />

        <FinalCTA />

        <Footer />
      </main>
      <CartDrawer />
      <StickyBuyBar />
    </>
  );
}

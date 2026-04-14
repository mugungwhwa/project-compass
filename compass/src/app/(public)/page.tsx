import {
  NavBar,
  HeroV2,
  WhyFailSection,
  QuestionsSection,
  ModulesSection,
  ProductProofSection,
  ChartStoriesSection,
  CopilotSection,
  ExperimentTranslationSection,
  ComparisonSection,
  CtaBottomSection,
  Footer,
} from "@/widgets/landing"

export default function LandingPage() {
  return (
    <>
      <NavBar />
      <main className="pt-14">
        <HeroV2 />
        <WhyFailSection />
        <QuestionsSection />
        <ModulesSection />
        <ProductProofSection />
        <ChartStoriesSection />
        <CopilotSection />
        <ExperimentTranslationSection />
        <ComparisonSection />
        <CtaBottomSection />
      </main>
      <Footer />
    </>
  )
}

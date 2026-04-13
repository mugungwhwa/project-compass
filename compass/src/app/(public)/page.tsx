import {
  NavBar,
  HeroSection,
  ProblemSection,
  ValueProps,
  CtaSection,
  Footer,
} from "@/widgets/landing"

export default function LandingPage() {
  return (
    <>
      <NavBar />
      <main className="pt-14">
        <HeroSection />
        <ProblemSection />
        <ValueProps />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}

import {
  Navbar,
  Hero,
  About,
  Services,
  HowItWorks,
  Contact,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <HowItWorks />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

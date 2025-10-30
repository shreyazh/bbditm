import Header from "@/components/header"
import Hero from "@/components/hero"
import Programs from "@/components/programs"
import About from "@/components/about"
import Admissions from "@/components/admissions"
import Footer from "@/components/footer"
import ChatBot from "@/components/chatbot"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <About />
      <Programs />
      <Admissions />
      <Footer />
      <ChatBot />
    </main>
  )
}

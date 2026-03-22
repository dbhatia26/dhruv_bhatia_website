import Nav from '@/components/ui/Nav'
import Footer from '@/components/ui/Footer'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Work from '@/components/sections/Work'
import Ideas from '@/components/sections/Ideas'
import Speaking from '@/components/sections/Speaking'
import GenieDemo from '@/components/sections/GenieDemo'
import Stack from '@/components/sections/Stack'
import Contact from '@/components/sections/Contact'

export default function Home() {
  return (
    <main id="top">
      <Nav />
      <Hero />
      <About />
      <Work />
      <Ideas />
      <Speaking />
      <GenieDemo />
      <Stack />
      <Contact />
      <Footer />
    </main>
  )
}

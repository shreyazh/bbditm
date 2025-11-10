import Image from "next/image"

export default function Hero() {
  return (
    <section className="relative text-primary-foreground h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <Image
            src="/bbditm_infrastructure.jpeg"
            alt="BBDITM Infrastructure"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/90 via-primary/80 to-primary/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-balance">Welcome to BBDITM</h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 text-balance max-w-2xl mx-auto">
              Babu Banarasi Das Institute of Technology & Management - Shaping Future Leaders in Technology and
              Management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <button className="px-8 py-3 bg-primary-foreground text-primary font-semibold rounded-lg hover:bg-primary-foreground/90 transition">
                Apply Now
              </button>
              <button className="px-8 py-3 border-2 border-primary-foreground text-primary-foreground font-semibold rounded-lg hover:bg-primary-foreground/10 transition">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

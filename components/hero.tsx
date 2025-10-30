export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-balance">Welcome to BBDITM</h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 text-balance max-w-2xl mx-auto">
            Bhagwant Dayal Institute of Information Technology & Management - Shaping Future Leaders in Technology and
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
    </section>
  )
}

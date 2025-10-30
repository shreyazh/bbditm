export default function Admissions() {
  return (
    <section id="admissions" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Admissions</h2>
            <p className="text-foreground/80 mb-6 leading-relaxed">
              We welcome talented and motivated students from across the country. Our admission process is transparent
              and merit-based.
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-foreground mb-2">Eligibility</h3>
                <p className="text-sm text-foreground/80">12th pass for B.Tech, Bachelor's degree for MBA</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-foreground mb-2">Selection Process</h3>
                <p className="text-sm text-foreground/80">Merit-based selection with entrance exam and interview</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-foreground mb-2">Scholarships</h3>
                <p className="text-sm text-foreground/80">Merit and need-based scholarships available</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-foreground mb-2">Application Deadline</h3>
                <p className="text-sm text-foreground/80">Rolling admissions throughout the year</p>
              </div>
            </div>
            <button className="mt-8 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition">
              Apply Now
            </button>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8 border border-primary/20">
            <h3 className="text-2xl font-bold text-primary mb-6">Quick Facts</h3>
            <div className="space-y-6">
              <div>
                <p className="text-3xl font-bold text-primary">2025-26</p>
                <p className="text-sm text-muted-foreground">Academic Year</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Seats Available</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">95%</p>
                <p className="text-sm text-muted-foreground">Average Placement</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">₹8-12 LPA</p>
                <p className="text-sm text-muted-foreground">Average Package</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

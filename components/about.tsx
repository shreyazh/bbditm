export default function About() {
  return (
    <section id="about" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">About BBDITM</h2>
            <p className="text-foreground/80 mb-4 leading-relaxed">
              BBDITM is a premier institution dedicated to providing world-class education in Information Technology and
              Management. With a commitment to excellence, we prepare students for successful careers in the digital
              age.
            </p>
            <p className="text-foreground/80 mb-4 leading-relaxed">
              Our faculty comprises industry experts and academicians who bring real-world experience to the classroom.
              We emphasize practical learning, innovation, and ethical values.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-2xl font-bold text-primary">2000+</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-2xl font-bold text-primary">50+</p>
                <p className="text-sm text-muted-foreground">Faculty Members</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-2xl font-bold text-primary">95%</p>
                <p className="text-sm text-muted-foreground">Placement Rate</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-2xl font-bold text-primary">25+</p>
                <p className="text-sm text-muted-foreground">Years of Excellence</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg p-8 border border-primary/20">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Industry-Aligned Curriculum</h3>
                  <p className="text-sm text-muted-foreground">Updated regularly to match industry standards</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Expert Faculty</h3>
                  <p className="text-sm text-muted-foreground">Experienced professionals from leading companies</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Internship Opportunities</h3>
                  <p className="text-sm text-muted-foreground">Partnerships with top tech companies</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Career Support</h3>
                  <p className="text-sm text-muted-foreground">Dedicated placement and mentoring services</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

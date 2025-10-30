import Header from "@/components/header"
import Footer from "@/components/footer"
import { ArrowRight, BookOpen, Users, Briefcase, Award } from "lucide-react"

export default function ProgramsPage() {
  const programs = [
    {
      id: 1,
      title: "B.Tech in Computer Science",
      duration: "4 Years",
      seats: 120,
      description:
        "Comprehensive program covering software development, databases, and emerging technologies. Students gain hands-on experience with modern programming languages and frameworks.",
      highlights: [
        "Data Structures",
        "Web Development",
        "Cloud Computing",
        "AI & ML",
        "Database Management",
        "Software Engineering",
      ],
      eligibility: "12th pass with Physics, Chemistry, Mathematics",
      fees: "₹1,50,000 per year",
      icon: BookOpen,
    },
    {
      id: 2,
      title: "B.Tech in Information Technology",
      duration: "4 Years",
      seats: 100,
      description:
        "Focus on IT infrastructure, networking, and enterprise solutions. Prepare for careers in system administration, cybersecurity, and IT management.",
      highlights: [
        "Networking",
        "Database Management",
        "System Administration",
        "Cybersecurity",
        "Cloud Infrastructure",
        "IT Project Management",
      ],
      eligibility: "12th pass with Physics, Chemistry, Mathematics",
      fees: "₹1,50,000 per year",
      icon: Briefcase,
    },
    {
      id: 3,
      title: "MBA in Technology Management",
      duration: "2 Years",
      seats: 60,
      description:
        "Blend of business acumen and technical expertise for aspiring tech leaders. Develop skills in strategic management, innovation, and business analytics.",
      highlights: [
        "Strategic Management",
        "Tech Innovation",
        "Project Management",
        "Business Analytics",
        "Leadership",
        "Entrepreneurship",
      ],
      eligibility: "Bachelor's degree with 50% marks",
      fees: "₹3,00,000 per year",
      icon: Award,
    },
    {
      id: 4,
      title: "Diploma in Web Development",
      duration: "1 Year",
      seats: 80,
      description:
        "Intensive program for aspiring web developers. Master full-stack development with real-world projects and industry mentorship.",
      highlights: [
        "Frontend Development",
        "Backend Development",
        "Full Stack",
        "Deployment",
        "Version Control",
        "API Development",
      ],
      eligibility: "12th pass",
      fees: "₹1,50,000 per year",
      icon: Users,
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-balance">Our Programs</h1>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              Choose from our diverse range of programs designed to meet industry demands and shape your future career
            </p>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {programs.map((program) => {
              const IconComponent = program.icon
              return (
                <div
                  key={program.id}
                  className="bg-card rounded-lg border border-border p-8 hover:shadow-lg transition flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-primary mb-2">{program.title}</h3>
                      <p className="text-sm text-muted-foreground">{program.duration}</p>
                    </div>
                    <IconComponent className="w-8 h-8 text-primary flex-shrink-0" />
                  </div>

                  <p className="text-foreground/80 mb-6 flex-grow">{program.description}</p>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">Key Subjects:</p>
                      <div className="flex flex-wrap gap-2">
                        {program.highlights.map((highlight, i) => (
                          <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Eligibility</p>
                        <p className="text-sm font-semibold text-foreground">{program.eligibility}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Annual Fees</p>
                        <p className="text-sm font-semibold text-foreground">{program.fees}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Seats Available</p>
                        <p className="text-sm font-semibold text-foreground">{program.seats}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm font-semibold text-foreground">{program.duration}</p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2">
                    Learn More <ArrowRight size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Why Choose BBDITM?</h2>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              We provide comprehensive education with industry focus and career support
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Industry-Aligned Curriculum",
                description:
                  "Our programs are regularly updated to match current industry standards and emerging technologies.",
              },
              {
                title: "Expert Faculty",
                description:
                  "Learn from experienced professionals with real-world expertise from leading tech companies.",
              },
              {
                title: "Placement Support",
                description: "95% placement rate with average package of ₹8-12 LPA and dedicated career counseling.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-background rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-primary mb-3">{item.title}</h3>
                <p className="text-foreground/80">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

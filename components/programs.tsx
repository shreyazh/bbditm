export default function Programs() {
  const programs = [
    {
      title: "B.Tech in Computer Science",
      duration: "4 Years",
      description: "Comprehensive program covering software development, databases, and emerging technologies.",
      highlights: ["Data Structures", "Web Development", "Cloud Computing", "AI & ML"],
    },
    {
      title: "B.Tech in Information Technology",
      duration: "4 Years",
      description: "Focus on IT infrastructure, networking, and enterprise solutions.",
      highlights: ["Networking", "Database Management", "System Administration", "Cybersecurity"],
    },
    {
      title: "MBA in Technology Management",
      duration: "2 Years",
      description: "Blend of business acumen and technical expertise for tech leaders.",
      highlights: ["Strategic Management", "Tech Innovation", "Project Management", "Business Analytics"],
    },
    {
      title: "Lateral Entry B.Tech in Computer Science",
      duration: "3 Year",
      description: "Intensive program for aspiring software developers after Diploma.",
      highlights: ["Frontend Development", "Backend Development", "Full Stack", "Deployment"],
    },
  ]

  return (
    <section id="programs" className="py-16 md:py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Our Programs</h2>
          <p className="text-foreground/80 max-w-2xl mx-auto">
            Choose from our diverse range of programs designed to meet industry demands
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {programs.map((program, index) => (
            <div key={index} className="bg-background rounded-lg border border-border p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-primary mb-2">{program.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{program.duration}</p>
              <p className="text-foreground/80 mb-6">{program.description}</p>
              <div className="flex flex-wrap gap-2">
                {program.highlights.map((highlight, i) => (
                  <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

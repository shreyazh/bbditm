import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, Calendar, FileText, Users, Award } from "lucide-react"

export default function AdmissionsPage() {
  const steps = [
    {
      number: 1,
      title: "Submit Application",
      description: "Fill out the online application form with your personal and academic details.",
      icon: FileText,
    },
    {
      number: 2,
      title: "Entrance Exam",
      description: "Appear for the entrance examination based on your chosen program.",
      icon: Award,
    },
    {
      number: 3,
      title: "Interview",
      description: "Participate in a personal interview with our admission committee.",
      icon: Users,
    },
    {
      number: 4,
      title: "Admission Offer",
      description: "Receive your admission offer and complete the enrollment process.",
      icon: CheckCircle,
    },
  ]

  const faqs = [
    {
      question: "What is the eligibility criteria for B.Tech programs?",
      answer:
        "Candidates must have passed 12th standard with Physics, Chemistry, and Mathematics. A minimum of 50% aggregate marks is preferred.",
    },
    {
      question: "Are scholarships available?",
      answer:
        "Yes, we offer merit-based and need-based scholarships. Merit scholarships are awarded based on entrance exam performance, while need-based scholarships are available for deserving students.",
    },
    {
      question: "What is the admission timeline?",
      answer:
        "We have rolling admissions throughout the year. However, the main admission cycle is from June to August. Early applications are encouraged.",
    },
    {
      question: "Can I apply for multiple programs?",
      answer:
        "Yes, you can apply for multiple programs. However, you need to appear for the entrance exam for each program separately.",
    },
    {
      question: "What documents are required for admission?",
      answer:
        "You will need 10th and 12th mark sheets, birth certificate, address proof, and passport-sized photographs. Additional documents may be required during the interview.",
    },
    {
      question: "Is there a hostel facility?",
      answer:
        "Yes, we provide hostel facilities for both boys and girls with modern amenities, 24/7 security, and mess facilities.",
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-balance">Admissions</h1>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              Join BBDITM and start your journey towards a successful career in technology and management
            </p>
          </div>
        </div>
      </section>

      {/* Quick Facts */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              { label: "Total Seats", value: "500+" },
              { label: "Placement Rate", value: "95%" },
              { label: "Average Package", value: "₹8-12 LPA" },
              { label: "Years of Excellence", value: "20+" },
            ].map((stat, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-6 text-center">
                <p className="text-3xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Admission Process</h2>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              Follow these simple steps to secure your admission at BBDITM
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const IconComponent = step.icon
              return (
                <div key={step.number} className="relative">
                  <div className="bg-background rounded-lg border border-border p-6 text-center">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                      {step.number}
                    </div>
                    <IconComponent className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-foreground/80">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/30 transform -translate-y-1/2"></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Eligibility & Requirements */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Eligibility & Requirements</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                program: "B.Tech Programs",
                requirements: [
                  "12th pass with Physics, Chemistry, Mathematics",
                  "Minimum 50% aggregate marks",
                  "Valid entrance exam score",
                  "Age: 17-25 years",
                ],
              },
              {
                program: "MBA Programs",
                requirements: [
                  "Bachelor's degree in any discipline",
                  "Minimum 50% aggregate marks",
                  "Valid entrance exam score",
                  "Work experience preferred (not mandatory)",
                ],
              },
              {
                program: "Diploma Programs",
                requirements: [
                  "12th pass from any stream",
                  "No minimum marks requirement",
                  "Age: 17-30 years",
                  "Merit-based selection",
                ],
              },
              {
                program: "Documents Required",
                requirements: [
                  "10th and 12th mark sheets",
                  "Birth certificate",
                  "Address proof (Aadhaar/Passport)",
                  "Passport-sized photographs (4)",
                ],
              },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">{item.program}</h3>
                <ul className="space-y-3">
                  {item.requirements.map((req, j) => (
                    <li key={j} className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Important Dates</h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {[
              { event: "Application Start Date", date: "January 15, 2025" },
              { event: "Application Deadline", date: "August 31, 2025" },
              { event: "Entrance Exam", date: "Rolling basis" },
              { event: "Interview Round", date: "Rolling basis" },
              { event: "Admission Offer", date: "Rolling basis" },
              { event: "Classes Begin", date: "September 1, 2025" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-background rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">{item.event}</span>
                </div>
                <span className="text-primary font-semibold">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-card rounded-lg border border-border p-6 group cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-foreground">
                  {faq.question}
                  <span className="text-primary group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-foreground/80 mt-4">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Apply?</h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Start your application today and take the first step towards your dream career
          </p>
          <button className="px-8 py-3 bg-primary-foreground text-primary font-semibold rounded-lg hover:bg-primary-foreground/90 transition">
            Apply Now
          </button>
        </div>
      </section>

      <Footer />
    </main>
  )
}

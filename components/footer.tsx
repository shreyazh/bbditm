import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">BBDITM</h3>
            <p className="text-sm text-primary-foreground/80">
              Shaping future leaders in technology and management since 2004. Premier institution dedicated to providing
              world-class education in IT and Management.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary-foreground/80 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-primary-foreground/80 transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/programs" className="hover:text-primary-foreground/80 transition">
                  Programs
                </Link>
              </li>
              <li>
                <Link href="/admissions" className="hover:text-primary-foreground/80 transition">
                  Admissions
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-primary-foreground/80 transition">
                  Library
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-foreground/80 transition">
                  Placements
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-foreground/80 transition">
                  Events
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-foreground/80 transition">
                  News
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <MapPin size={16} className="shrink-0 mt-0.5" />
                <span>Lucknow, Uttar Pradesh, India</span>
              </li>
              <li className="flex gap-2">
                <Phone size={16} className="shrink-0 mt-0.5" />
                <span>+91 (522) XXXX-XXXX</span>
              </li>
              <li className="flex gap-2">
                <Mail size={16} className="shrink-0 mt-0.5" />
                <span>info@bbditm.ac.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-primary-foreground/20 pt-8 mb-8">
          <div className="flex justify-center gap-6">
            <Link href="#" className="hover:text-primary-foreground/80 transition" aria-label="Facebook">
              <Facebook size={20} />
            </Link>
            <Link href="#" className="hover:text-primary-foreground/80 transition" aria-label="Twitter">
              <Twitter size={20} />
            </Link>
            <Link href="#" className="hover:text-primary-foreground/80 transition" aria-label="LinkedIn">
              <Linkedin size={20} />
            </Link>
            <Link href="#" className="hover:text-primary-foreground/80 transition" aria-label="Instagram">
              <Instagram size={20} />
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/80">
          <p>&copy; {currentYear} BBDITM. All rights reserved.</p>
          <p className="mt-2 text-xs">
            <Link href="#" className="hover:text-primary-foreground transition">
              Privacy Policy
            </Link>
            {" | "}
            <Link href="#" className="hover:text-primary-foreground transition">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

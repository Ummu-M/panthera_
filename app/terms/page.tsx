import { theme } from '@/lib/theme'
import Link from 'next/link'

const C = theme

export const metadata = {
  title: 'Terms of Service — Panthera Rover Crew'
}

export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.forest950} 0%, ${C.forest900} 100%)`, color: C.text, padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          <img src="/pantheralogo.png" alt="Panthera crest" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 3 }} />
          <div>
            <div style={{ letterSpacing: '0.16em', fontSize: 10.5, color: C.gold500, textTransform: 'uppercase', fontWeight: 600 }}>Panthera Rover Crew</div>
            <h1 style={{ margin: '2px 0 0', fontSize: 25, fontFamily: 'var(--font-display)', fontWeight: 500 }}>Terms of Service</h1>
          </div>
          <nav aria-label="Legal navigation" style={{ marginLeft: 'auto', display: 'flex', gap: 12, fontSize: 12 }}>
            <Link href="/" style={{ color: C.gold600 }}>Home</Link>
            <Link href="/privacy" style={{ color: C.gold600 }}>Privacy</Link>
            <Link href="/terms" style={{ color: C.text, fontWeight: 600 }}>Terms</Link>
          </nav>
        </header>

        <div style={{ background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginTop: 24, boxShadow: '0 14px 36px rgba(18,36,53,0.08)', lineHeight: 1.75, fontSize: 14.5 }}>
          <p style={{ color: C.muted, fontSize: 12.5, marginTop: 0 }}>Last updated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <p>
            These Terms of Service ("Terms") govern your use of the Panthera Rover Crew membership platform (the
            "Service"), operated by Panthera Rover Crew, a Scout crew of the Kenyatta University Scouts Troop under
            the Kenya Scouts Association. By using the Service, you agree to these Terms.
          </p>

          <h2 style={sectionHeading}>1. Eligibility</h2>
          <p>
            The Service is intended for members, leadership, and patrons of Panthera Rover Crew, and prospective
            members applying to join. You must provide accurate information when registering.
          </p>

          <h2 style={sectionHeading}>2. Your account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and for all activity under your
            account. Notify us immediately if you suspect unauthorized use of your account.
          </p>

          <h2 style={sectionHeading}>3. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul style={listStyle}>
            <li>Provide false or misleading information during registration</li>
            <li>Attempt to access administrative functions without authorization</li>
            <li>Upload content to the photo gallery or elsewhere that is unlawful, offensive, or infringes on others' rights</li>
            <li>Use the Service in any way that disrupts or interferes with its operation</li>
          </ul>

          <h2 style={sectionHeading}>4. Content you submit</h2>
          <p>
            By uploading photos or other content to the Service, you confirm you have the right to share that content
            and grant Panthera Rover Crew permission to display it within the platform for crew and community purposes.
          </p>

          <h2 style={sectionHeading}>5. Membership records and administration</h2>
          <p>
            Crew leadership (Crew Leader, Assistant Crew Leader, Secretary, Treasurer, and System Administrators) may
            access and manage membership records, attendance, badge progress, service hours, and dues status as part
            of standard crew administration.
          </p>

          <h2 style={sectionHeading}>6. Availability</h2>
          <p>
            The Service is provided on an "as is" basis. We do not guarantee uninterrupted or error-free operation
            and may modify, suspend, or discontinue features at any time.
          </p>

          <h2 style={sectionHeading}>7. Termination</h2>
          <p>
            We may suspend or terminate your access to the Service if you violate these Terms or for any reason at
            our discretion, including upon your departure from the crew.
          </p>

          <h2 style={sectionHeading}>8. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the Service after changes are posted
            constitutes acceptance of the updated Terms.
          </p>

          <h2 style={sectionHeading}>9. Contact us</h2>
          <p>
            Questions about these Terms can be sent to{' '}
            <a href="mailto:kupantherascouts@gmail.com" style={{ color: C.gold500 }}>kupantherascouts@gmail.com</a>.
          </p>
        </div>
      </div>
    </main>
  )
}

const sectionHeading = { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, marginTop: 28, marginBottom: 8 } as const
const listStyle = { paddingLeft: 20, margin: '8px 0' } as const

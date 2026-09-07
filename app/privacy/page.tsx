import { theme } from '@/lib/theme'
import Link from 'next/link'

const C = theme

export const metadata = {
  title: 'Privacy Policy — Panthera Rover Crew'
}

export default function PrivacyPolicyPage() {
  return (
    <main style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.forest950} 0%, ${C.forest900} 100%)`, color: C.text, padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          <img src="/pantheralogo.png" alt="Panthera crest" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 3 }} />
          <div>
            <div style={{ letterSpacing: '0.16em', fontSize: 10.5, color: C.gold500, textTransform: 'uppercase', fontWeight: 600 }}>Panthera Rover Crew</div>
            <h1 style={{ margin: '2px 0 0', fontSize: 25, fontFamily: 'var(--font-display)', fontWeight: 500 }}>Privacy Policy</h1>
          </div>
          <nav aria-label="Legal navigation" style={{ marginLeft: 'auto', display: 'flex', gap: 12, fontSize: 12 }}>
            <Link href="/" style={{ color: C.gold600 }}>Home</Link>
            <Link href="/privacy" style={{ color: C.text, fontWeight: 600 }}>Privacy</Link>
            <Link href="/terms" style={{ color: C.gold600 }}>Terms</Link>
          </nav>
        </header>

        <div style={{ background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginTop: 24, boxShadow: '0 14px 36px rgba(18,36,53,0.08)', lineHeight: 1.75, fontSize: 14.5 }}>
          <p style={{ color: C.muted, fontSize: 12.5, marginTop: 0 }}>Last updated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <p>
            This Privacy Policy explains how Kenyatta University Panthera Rover Crew ("we," "us," or "our"), a Scout crew of the
            Kenyatta University Scouts Troop under the Kenya Scouts Association, collects, uses, and protects information
            when you use our membership platform (the "Service").
          </p>

          <h2 style={sectionHeading}>1. Information we collect</h2>
          <p>When you register for or use the Service, we may collect:</p>
          <ul style={listStyle}>
            <li>Your name and email address (via Google Sign-In or manual registration)</li>
            <li>Phone number, faculty/school, course, and year of study, if you provide them</li>
            <li>Registration number and membership status</li>
            <li>Event attendance, service hour records, and badge progress associated with your account</li>
            <li>Photos you or an administrator upload to the crew photo gallery</li>
          </ul>

          <h2 style={sectionHeading}>2. How we use your information</h2>
          <p>We use the information we collect to:</p>
          <ul style={listStyle}>
            <li>Create and manage your crew membership account</li>
            <li>Track attendance, service hours, badge progress, and membership dues</li>
            <li>Communicate with you about crew activities and events</li>
            <li>Maintain crew administrative records (finances, inventory, projects)</li>
          </ul>

          <h2 style={sectionHeading}>3. Google Sign-In</h2>
          <p>
            If you sign in with Google, we receive your name, email address, and profile photo from Google as permitted by
            your Google account settings. We do not request access to your Gmail, Google Drive, Calendar, or any other
            Google service beyond basic sign-in information.
          </p>

          <h2 style={sectionHeading}>4. How we share your information</h2>
          <p>
            We do not sell or rent your personal information. Information is visible to authorized crew leadership
            (Crew Leader, Assistant Crew Leader, Secretary, and System Administrators) for the purpose of managing
            crew membership. We do not share your information with third parties for advertising or marketing purposes.
          </p>

          <h2 style={sectionHeading}>5. Data storage and security</h2>
          <p>
            Your information is stored in a secured database and access to administrative functions is restricted to
            authorized crew leadership roles. While we take reasonable measures to protect your information, no method
            of electronic storage is completely secure.
          </p>

          <h2 style={sectionHeading}>6. Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal information by contacting us at the
            email address below. You may also stop using the Service and request that your account be deactivated at
            any time.
          </p>

          <h2 style={sectionHeading}>7. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an
            updated "Last updated" date.
          </p>

          <h2 style={sectionHeading}>8. Contact us</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at{' '}
            <a href="mailto:kupantherascouts@gmail.com" style={{ color: C.gold500 }}>kupantherascouts@gmail.com</a>.
          </p>
        </div>
      </div>
    </main>
  )
}

const sectionHeading = { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, marginTop: 28, marginBottom: 8 } as const
const listStyle = { paddingLeft: 20, margin: '8px 0' } as const

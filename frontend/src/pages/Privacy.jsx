import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle } from 'lucide-react';

const Section = ({ title, children }) => (
  <div>
    <h2 className="font-black text-cyber-text text-lg mb-3 pb-2 border-b border-cyber-border flex items-center gap-2">
      <Shield className="w-4 h-4 text-cyber-cyan" /> {title}
    </h2>
    <div className="text-cyber-muted text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const Privacy = () => (
  <div className="max-w-3xl mx-auto space-y-10">
    <div className="border-b border-cyber-border pb-6">
      <p className="pixel-heading text-cyber-purple text-xs mb-2">LEGAL</p>
      <h1 className="text-4xl font-black text-cyber-text">Privacy Policy</h1>
      <p className="text-cyber-muted text-sm mt-2">Last updated: November 2026</p>
    </div>

    <div className="cyber-card border-cyber-cyan/30 p-5 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-cyber-cyan shrink-0 mt-0.5" />
      <p className="text-sm text-cyber-muted">
        This Privacy Policy describes how <strong className="text-cyber-text">Esportify</strong> collects,
        uses, and protects your personal information when you use our platform.
      </p>
    </div>

    <Section title="Information We Collect">
      <p>When you create an account, we collect:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Full name and username</li>
        <li>Email address</li>
        <li>Contact number (optional)</li>
        <li>In-game name / gamer tag (optional)</li>
        <li>Role (Participant or Organizer)</li>
      </ul>
      <p>We also automatically generate a unique Player ID (e.g. ESP-10001) for participant accounts.</p>
    </Section>

    <Section title="How We Use Your Information">
      <ul className="list-disc pl-5 space-y-1">
        <li>To create and manage your account.</li>
        <li>To facilitate team formation and tournament registration.</li>
        <li>To send in-app notifications about invitations and registration status.</li>
        <li>To allow other players to find you by Player ID or username (name, username, Player ID, and IGN only — never email or contact number).</li>
        <li>To help organizers manage tournament participants.</li>
      </ul>
    </Section>

    <Section title="Information We Share">
      <p>We do <strong className="text-cyber-text">not</strong> sell or share your personal information with third parties.</p>
      <p>Your email address and contact number are never exposed to other players or organizers in search results.</p>
      <p>Your name, username, Player ID, and in-game name are visible to other players when they search for teammates.</p>
    </Section>

    <Section title="Data Security">
      <p>We implement industry-standard security measures including:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Passwords are hashed using bcrypt before storage.</li>
        <li>JWT tokens are used for authentication.</li>
        <li>Database credentials are stored securely in environment variables.</li>
        <li>HTTPS is used for all data transmission.</li>
      </ul>
    </Section>

    <Section title="Data Retention">
      <p>Your account data is retained for as long as your account is active. You can request deletion of your account by contacting us.</p>
    </Section>

    <Section title="Your Rights">
      <ul className="list-disc pl-5 space-y-1">
        <li>Access your personal data through your profile page.</li>
        <li>Update your name, in-game name, and contact number.</li>
        <li>Request deletion of your account and associated data.</li>
      </ul>
    </Section>

    <Section title="Contact Us">
      <p>If you have questions about this Privacy Policy, please contact us via our <Link to="/contact" className="text-cyber-purple hover:underline">Contact page</Link>.</p>
    </Section>
  </div>
);

export default Privacy;

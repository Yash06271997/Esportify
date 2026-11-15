import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const Section = ({ title, children }) => (
  <div>
    <h2 className="font-black text-cyber-text text-lg mb-3 pb-2 border-b border-cyber-border">
      {title}
    </h2>
    <div className="text-cyber-muted text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const Terms = () => (
  <div className="max-w-3xl mx-auto space-y-10">
    <div className="border-b border-cyber-border pb-6">
      <p className="pixel-heading text-cyber-purple text-xs mb-2">LEGAL</p>
      <h1 className="text-4xl font-black text-cyber-text">Terms of Service</h1>
      <p className="text-cyber-muted text-sm mt-2">Last updated: November 2026</p>
    </div>

    <Section title="1. Acceptance of Terms">
      <p>By creating an account or using Esportify, you agree to be bound by these Terms of Service.
      If you do not agree, do not use the platform.</p>
    </Section>

    <Section title="2. Account Registration">
      <ul className="list-disc pl-5 space-y-1">
        <li>You must provide accurate information when creating an account.</li>
        <li>You are responsible for maintaining the security of your account credentials.</li>
        <li>Participants receive a unique, immutable Player ID upon registration.</li>
        <li>Admin access cannot be self-selected — it is assigned by the platform administrators.</li>
        <li>Accounts found to have false information may be suspended.</li>
      </ul>
    </Section>

    <Section title="3. Tournament Participation">
      <ul className="list-disc pl-5 space-y-1">
        <li>Participants must form a team of exactly 5 players to register for a team tournament.</li>
        <li>A participant can belong to only one team per tournament.</li>
        <li>Only the Team Leader can submit the final registration.</li>
        <li>All 4 non-leader members must accept the invitation before registration can be submitted.</li>
        <li>Registrations are subject to organizer approval.</li>
      </ul>
    </Section>

    <Section title="4. Organizer Responsibilities">
      <ul className="list-disc pl-5 space-y-1">
        <li>Organizers are responsible for the accuracy of all tournament information they provide.</li>
        <li>Organizers must manage registrations in a fair and timely manner.</li>
        <li>Tournament cancellations must be communicated clearly to registered participants.</li>
      </ul>
    </Section>

    <Section title="5. Prohibited Conduct">
      <ul className="list-disc pl-5 space-y-1">
        <li>Creating multiple accounts to circumvent restrictions.</li>
        <li>Providing false information in registration or tournament forms.</li>
        <li>Any form of harassment or abusive behavior toward other users.</li>
        <li>Attempting to access other users' accounts or platform systems.</li>
      </ul>
    </Section>

    <Section title="6. Intellectual Property">
      <p>All content on Esportify, including but not limited to logos, design, and software code,
      is owned by or licensed to Esportify. You may not reproduce or distribute it without permission.</p>
    </Section>

    <Section title="7. Limitation of Liability">
      <p>Esportify is provided "as-is" for educational and demonstration purposes. We are not liable for
      any damages arising from the use or inability to use the platform.</p>
    </Section>

    <Section title="8. Changes to Terms">
      <p>We may update these Terms at any time. Continued use of the platform after changes constitutes
      acceptance of the new Terms.</p>
    </Section>

    <Section title="9. Contact">
      <p>For questions about these Terms, please visit our <Link to="/contact" className="text-cyber-purple hover:underline">Contact page</Link>.</p>
    </Section>
  </div>
);

export default Terms;

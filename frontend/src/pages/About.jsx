import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, Users, Trophy, Target, Mail, Code } from 'lucide-react';

const About = () => (
  <div className="space-y-16 max-w-4xl mx-auto">
    {/* Hero */}
    <section className="text-center py-12 cyber-grid-bg">
      <div className="inline-flex items-center gap-2 cyber-badge-purple mb-6">
        <Zap className="w-3 h-3" />
        <span className="font-mono text-xs">ABOUT ESPORTIFY</span>
      </div>
      <h1 className="text-5xl font-black text-cyber-text mb-4">
        One Platform.<br />
        <span className="text-cyber-purple text-glow-purple">All Tournaments.</span>
      </h1>
      <p className="text-cyber-muted text-lg max-w-2xl mx-auto leading-relaxed">
        Esportify is a centralized esports tournament management platform. We eliminate the chaos of managing
        events across spreadsheets, messaging apps, and separate websites — bringing everything under one roof.
      </p>
    </section>

    {/* Problem / Solution */}
    <section className="grid md:grid-cols-2 gap-6">
      <div className="cyber-card p-6 border-l-2 border-cyber-red">
        <h2 className="font-black text-cyber-text text-lg mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-cyber-red" /> The Problem
        </h2>
        <p className="text-cyber-muted text-sm leading-relaxed">
          Esports tournament information is scattered — across spreadsheets, Google Forms, WhatsApp groups,
          and separate websites. Organizers struggle to manage participants; players struggle to find and track tournaments.
        </p>
      </div>
      <div className="cyber-card p-6 border-l-2 border-cyber-green">
        <h2 className="font-black text-cyber-text text-lg mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyber-green" /> Our Solution
        </h2>
        <p className="text-cyber-muted text-sm leading-relaxed">
          Esportify centralizes everything. Players sign up, get a unique Player ID, form 5-player teams through
          our invitation system, and register for tournaments. Organizers manage everything from one dashboard.
        </p>
      </div>
    </section>

    {/* Features */}
    <section>
      <div className="text-center mb-10">
        <p className="pixel-heading text-cyber-cyan text-xs mb-2">WHAT WE OFFER</p>
        <h2 className="text-3xl font-black text-cyber-text">Platform Features</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {[
          { icon: Trophy, title: 'Tournament Discovery', desc: 'Browse all upcoming tournaments, filter by game, status, and format.', color: 'text-cyber-yellow' },
          { icon: Users, title: 'Team Invitation System', desc: 'Search players by Player ID or username, send invitations, and build your 5-player squad.', color: 'text-cyber-cyan' },
          { icon: Shield, title: 'Registration Tracking', desc: 'Leaders submit registrations, organizers approve or reject. Everyone knows the status in real time.', color: 'text-cyber-green' },
          { icon: Zap, title: 'Unique Player IDs', desc: 'Every participant gets a permanent ESP-XXXXX Player ID for quick identification.', color: 'text-cyber-purple' },
          { icon: Target, title: 'Role-Based Access', desc: 'Separate experiences for Participants, Organizers, and Administrators.', color: 'text-cyber-magenta' },
          { icon: Mail, title: 'Notifications', desc: 'In-app notifications for invitations, acceptances, and registration status changes.', color: 'text-cyber-red' },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="cyber-card p-5 hover:border-cyber-purple/40 transition-all">
            <Icon className={`w-6 h-6 ${color} mb-3`} />
            <h3 className="font-black text-cyber-text text-sm mb-2">{title}</h3>
            <p className="text-cyber-muted text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Tech Stack */}
    <section className="cyber-card p-8">
      <div className="text-center mb-6">
        <p className="pixel-heading text-cyber-magenta text-xs mb-2">BUILT WITH</p>
        <h2 className="text-2xl font-black text-cyber-text">Technology Stack</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {[
          { name: 'React 19', label: 'Frontend UI' },
          { name: 'Tailwind CSS', label: 'Styling' },
          { name: 'Node.js + Express', label: 'Backend API' },
          { name: 'MongoDB Atlas', label: 'Database' },
        ].map(({ name, label }) => (
          <div key={name} className="cyber-card p-4">
            <p className="font-black text-cyber-purple text-sm">{name}</p>
            <p className="text-xs text-cyber-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="text-center">
      <h2 className="text-3xl font-black text-cyber-text mb-4">Ready to Compete?</h2>
      <p className="text-cyber-muted mb-6">Sign up and get your Player ID in seconds.</p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link to="/register" className="cyber-btn-primary px-7 py-3 text-sm">Create Account</Link>
        <Link to="/tournaments" className="cyber-btn-cyan px-7 py-3 text-sm">Browse Tournaments</Link>
      </div>
    </section>
  </div>
);

export default About;

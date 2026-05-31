import Link from 'next/link'
import React from 'react'

export default function HomePage() {
  return (
    <div style={container}>
      {/* HERO */}
      <div style={hero}>
        <h1 style={title}>
          AI WhatsApp Receptionist for Businesses
        </h1>

        <p style={subtitle}>
          Automatically replies to customers, qualifies leads, and sends you
          structured sales-ready data — 24/7.
        </p>

        <a
          href="https://wa.me/2349069363183?text=Hi%20I%20want%20a%20demo"
          target="_blank"
          style={cta}
        >
          Try Live Demo on WhatsApp
        </a>

        <p style={smallText}>
          (Click above to test how your customers will interact with your AI receptionist)
        </p>
      </div>

      {/* HOW IT WORKS */}
      <div style={section}>
        <h2>How it works</h2>

        <ol>
          <li>Customer sends WhatsApp message</li>
          <li>AI replies instantly like a receptionist</li>
          <li>System extracts lead details automatically</li>
          <li>You see everything in your CRM dashboard</li>
        </ol>
      </div>

      {/* INDUSTRIES */}
      <div style={section}>
        <h2>Works for any business that gets messages</h2>

        <div style={grid}>
          <div style={card}>
            <h3>🏠 Real Estate</h3>
            <p>Capture buyers & renters automatically</p>
          </div>

          <div style={card}>
            <h3>🚚 Logistics</h3>
            <p>Track deliveries and customer requests</p>
          </div>

          <div style={card}>
            <h3>✈️ Travel Agencies</h3>
            <p>Collect destinations, budgets, and dates</p>
          </div>
        </div>
      </div>

      {/* DEMO OUTPUT */}
      <div style={section}>
        <h2>Example of what your business gets</h2>

        <pre style={codeBox}>
{`Lead:
- Intent: Rent
- Budget: $1000
- Locations: Lekki, Ikoyi
- Stage: Qualified`}
        </pre>
      </div>

      {/* CTA */}
      <div style={finalCta}>
        <h2>Stop missing customer messages</h2>
        <p>Start converting WhatsApp chats into paying customers automatically.</p>

        <a
          href="https://wa.me/2349069363183?text=I%20want%20this%20for%20my%20business"
          target="_blank"
          style={cta}
        >
          Get This for My Business
        </a>
      </div>
    </div>
  )
}

const container = {
  fontFamily: 'Arial',
  padding: 20,
  maxWidth: 900,
  margin: '0 auto',
}

const hero = {
  textAlign: 'center' as const,
  padding: '60px 20px',
}

const title = {
  fontSize: 42,
  fontWeight: 'bold',
}

const subtitle = {
  fontSize: 18,
  color: '#555',
  marginTop: 10,
  marginBottom: 30,
}

const cta = {
  display: 'inline-block',
  padding: '12px 20px',
  background: '#25D366',
  color: 'white',
  borderRadius: 8,
  textDecoration: 'none',
  fontWeight: 'bold',
}

const smallText = {
  fontSize: 12,
  color: '#888',
  marginTop: 10,
}

const section = {
  marginTop: 50,
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 15,
}

const card = {
  padding: 15,
  border: '1px solid #eee',
  borderRadius: 10,
}

const codeBox: React.CSSProperties = {
  background: '#111',
  color: '#0f0',
  padding: 15,
  borderRadius: 8,
  overflowX: 'auto',
}

const finalCta = {
  marginTop: 60,
  textAlign: 'center' as const,
  padding: 30,
  background: '#f5f5f5',
  borderRadius: 10,
}

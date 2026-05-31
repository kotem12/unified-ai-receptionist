import React from 'react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div style={container}>
      {/* FLOATING BLOBS */}
      <div style={blob1}></div>
      <div style={blob2}></div>
      <div style={blob3}></div>

      {/* HERO */}
      <motion.div
        style={hero}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          style={title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          AI WhatsApp Receptionist for Businesses
        </motion.h1>
        <p style={subtitle}>
          Automatically reply to customers, qualify leads, and get structured
          sales-ready data — 24/7.
        </p>
        <motion.a
          href="https://wa.me/2349069363183?text=Hi%20I%20want%20a%20demo"
          target="_blank"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={cta}
        >
          Try Live Demo →
        </motion.a>
      </motion.div>

      {/* FEATURES */}
      <Section title="How it Works">
        <div style={grid}>
          {[
            'Customer sends WhatsApp message',
            'AI replies instantly like a receptionist',
            'System extracts lead details automatically',
            'You see everything in your CRM dashboard',
          ].map((text, i) => (
            <Card key={i} text={text} />
          ))}
        </div>
      </Section>

      {/* INDUSTRIES */}
      <Section title="Works for Any Business That Gets Messages">
        <div style={grid}>
          <Card title="🏠 Real Estate" text="Capture buyers & renters automatically" />
          <Card title="🚚 Logistics" text="Track deliveries & requests" />
          <Card title="✈️ Travel Agencies" text="Collect destinations, budgets, dates" />
        </div>
      </Section>

      {/* EXAMPLE OUTPUT */}
      <Section title="Example AI Output">
        <motion.pre
          style={codeBox}
          whileHover={{
            scale: 1.02,
            boxShadow: '0 0 40px rgba(37, 211, 102, 0.3)',
          }}
        >
{`Lead:
- Intent: Rent
- Budget: $1000
- Locations: Lekki, Ikoyi
- Stage: Qualified`}
        </motion.pre>
      </Section>

      {/* PRICING */}
      <Section title="Pricing Plans">
        <div style={pricingGrid}>
          <PricingCard tier="Starter" price="$29/mo" features={['100 Leads / month', 'Basic CRM']} />
          <PricingCard
            tier="Pro"
            price="$79/mo"
            features={['1000 Leads / month', 'Advanced CRM', 'Priority Support']}
            recommended
          />
          <PricingCard tier="Enterprise" price="Custom" features={['Unlimited Leads', 'Full Automation', 'Dedicated Account Manager']} />
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section title="What Our Customers Say">
        <div style={grid}>
          <Testimonial name="Jane D." company="Real Estate Co." text="AI Receptionist boosted our leads by 300%!" />
          <Testimonial name="Ahmed K." company="Logistics Ltd." text="Our customer response time went from hours to seconds." />
          <Testimonial name="Sophia L." company="Travel Agency" text="We finally manage leads without hiring extra staff." />
        </div>
      </Section>

      {/* FINAL CTA */}
      <motion.div
        style={finalCta}
        whileHover={{ boxShadow: '0 0 60px rgba(37, 211, 102, 0.4)', scale: 1.01 }}
      >
        <h2 style={titleSmall}>Stop Missing Messages</h2>
        <p style={{ opacity: 0.9 }}>Convert WhatsApp chats into paying customers automatically.</p>
        <motion.a
          href="https://wa.me/2349069363183?text=I%20want%20this%20for%20my%20business"
          target="_blank"
          whileHover={{ scale: 1.08, background: 'linear-gradient(135deg,#25D366,#128C7E,#00ff9d)' }}
          whileTap={{ scale: 0.95 }}
          style={cta}
        >
          Get This for My Business →
        </motion.a>
      </motion.div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Section({ title, children }: any) {
  return (
    <motion.div
      style={section}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 style={sectionTitle}>{title}</h2>
      {children}
    </motion.div>
  );
}

function Card({ title, text }: any) {
  return (
    <motion.div
      style={card}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      {title && <h3>{title}</h3>}
      <p>{text}</p>
    </motion.div>
  );
}

function PricingCard({ tier, price, features, recommended }: any) {
  return (
    <motion.div
      style={{
        ...pricingCard,
        border: recommended ? '2px solid #25D366' : pricingCard.border,
        scale: recommended ? 1.05 : 1,
      }}
      whileHover={{ scale: 1.07, boxShadow: '0 25px 50px rgba(0,255,150,0.2)' }}
    >
      {recommended && <div style={recommendedBadge}>Recommended</div>}
      <h3>{tier}</h3>
      <p style={{ fontSize: 28, fontWeight: 700 }}>{price}</p>
      <ul style={{ textAlign: 'left', marginTop: 10 }}>
        {features.map((f: string, i: number) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
      <motion.a
        href="https://wa.me/2349069363183?text=I%20want%20this%20for%20my%20business"
        target="_blank"
        whileHover={{ scale: 1.05 }}
        style={cta}
      >
        Choose Plan
      </motion.a>
    </motion.div>
  );
}

function Testimonial({ name, company, text }: any) {
  return (
    <motion.div
      style={testimonialCard}
      whileHover={{ y: -5, scale: 1.02, boxShadow: '0 15px 40px rgba(0,0,0,0.15)' }}
    >
      <p>"{text}"</p>
      <p style={{ fontWeight: 700, marginTop: 10 }}>
        {name} — {company}
      </p>
    </motion.div>
  );
}

/* ================= STYLES ================= */

const container: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  padding: '40px 20px',
  maxWidth: 1200,
  margin: '0 auto',
  position: 'relative',
  overflow: 'hidden',
  background: '#0b0f14',
  color: 'white',
};

/* FLOATING BLOBS */
const blob1: React.CSSProperties = {
  position: 'absolute',
  width: 300,
  height: 300,
  background: 'rgba(37, 211, 102, 0.25)',
  filter: 'blur(80px)',
  borderRadius: '50%',
  top: '10%',
  left: '5%',
  animation: 'float 8s ease-in-out infinite',
};
const blob2: React.CSSProperties = {
  position: 'absolute',
  width: 250,
  height: 250,
  background: 'rgba(0, 255, 170, 0.2)',
  filter: 'blur(90px)',
  borderRadius: '50%',
  bottom: '10%',

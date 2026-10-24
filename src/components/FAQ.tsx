import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is Hind DB and how does it work?",
      a: "Hind DB is India's first managed database platform by Hind India Private Limited. It provides production-ready Managed PostgreSQL along with real-time WebSockets, auto-generated REST & GraphQL APIs, row-level security (RLS), S3-compatible file storage, and serverless edge functions—all hosted locally within India."
    },
    {
      q: "Where are the data centers located?",
      a: "All Hind DB clusters are hosted natively in Tier-4 sovereign cloud data centers. Your sensitive user data, backups, and media never leave sovereign territory, providing sub-50ms latency across all regions."
    },
    {
      q: "How does the ₹999/month Pro plan billing work?",
      a: "The Pro tier costs ₹999/month and includes 10GB of high-speed PostgreSQL storage, 1 million database rows, real-time WebSockets, and 10GB file storage. Payments are accepted natively via UPI (Google Pay, PhonePe, Paytm), RuPay debit/credit cards, and NetBanking, with full GST invoicing provided."
    },
    {
      q: "Can I connect using standard PostgreSQL tools (Prisma, Drizzle, DBeaver)?",
      a: "Yes! Hind DB is 100% PostgreSQL 16 compatible. You receive standard `postgres://` connection strings with built-in connection pooling, meaning you can connect directly with Prisma, Drizzle ORM, TypeORM, SQLAlchemy, Go pgx, DBeaver, pgAdmin, and any Postgres client."
    },
    {
      q: "What is Row-Level Security (RLS) and why is it useful?",
      a: "Row-Level Security is a native PostgreSQL engine feature that enforces granular access rules per database row based on user identity or JWT claims. This enables your client applications (React, Flutter, iOS, Android) to safely query the database directly without risk of data leaks."
    },
    {
      q: "How do Auto REST and GraphQL APIs work?",
      a: "The moment you create or modify a table in Hind DB, our high-performance edge gateway automatically generates documented, OpenAPI-compliant REST endpoints and GraphQL schemas. You can immediately perform filtered queries, inserts, and mutations without writing backend CRUD handlers."
    },
    {
      q: "Is there a free tier for students and indie hackers?",
      a: "Yes! The Free Starter tier is ₹0/month forever. You get 1GB of database storage, 10,000 rows, auto REST APIs, and 1GB of file storage without entering a credit card. It is perfect for hackathons, learning, and MVP testing."
    },
    {
      q: "How does Hind DB ensure compliance with the DPDP Act 2026?",
      a: "Hind DB guarantees strict Indian data localization in compliance with the Digital Personal Data Protection (DPDP) Act 2026. Data at rest is encrypted using AES-256, TLS 1.3 is enforced in transit, automated audit logs are maintained, and zero cross-border telemetry is transmitted."
    },
    {
      q: "How do Serverless Edge Functions work on Hind DB?",
      a: "Edge Functions allow you to run TypeScript or JavaScript code close to your users at Indian cloud nodes. They have sub-5ms cold start times and are ideal for handling Razorpay payment webhooks, sending WhatsApp notifications, and running background jobs."
    },
    {
      q: "How can I migrate my existing PostgreSQL database to Hind DB?",
      a: "Migrating is as simple as running standard `pg_dump` and `pg_restore`. We also provide a 1-click live replication tool in the Hind DB console that streams existing data into your new Indian cluster with zero downtime."
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-[#F8FAFC] border-b border-[#E2E8F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-xs font-semibold text-[#1E3A8A] mb-4 uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-[#F97316]" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          
          <h2 className="text-[30px] sm:text-[36px] lg:text-[40px] font-semibold text-[#0F172A] tracking-tight font-sans">
            Got Questions? We've Got Answers.
          </h2>
          
          <p className="mt-4 text-[18px] text-[#475569] leading-relaxed">
            Everything you need to know about Hind DB platform capabilities, pricing, security, and data localization.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-blue-200 shadow-md ring-2 ring-blue-500/5'
                    : 'bg-white border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1]'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className={`text-base font-semibold font-sans ${isOpen ? 'text-[#1E3A8A]' : 'text-[#0F172A]'}`}>
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-blue-50 text-[#1E3A8A]' : 'bg-[#F8FAFC] text-[#475569]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-[#475569] leading-relaxed border-t border-[#F1F5F9] animate-in fade-in duration-150">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Have more questions banner */}
        <div className="mt-14 p-8 rounded-3xl bg-white border border-[#E2E8F0] text-center shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h4 className="text-base font-bold text-[#0F172A]">Still have questions about Hind DB?</h4>
            <p className="text-xs text-[#475569] mt-1">Our dedicated engineering and developer support team is ready to help.</p>
          </div>

          <a
            href="mailto:hello@hind.io"
            className="btn-primary-blue px-6 py-3 text-xs font-semibold whitespace-nowrap inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Email hello@hind.io</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
};

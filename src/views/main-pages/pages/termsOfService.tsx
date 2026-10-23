import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Dumbbell,
  Globe,
  Mail,
  ScrollText,
  Shield,
} from "lucide-react";
import { all_routes } from "../../../routes/all_routes";

const TOC = [
  { id: "acceptance", label: "1. Acceptance of Terms" },
  { id: "accounts", label: "2. Accounts & Eligibility" },
  { id: "use", label: "3. Acceptable Use" },
  { id: "subscriptions", label: "4. Subscriptions & Billing" },
  { id: "content", label: "5. Your Data & Content" },
  { id: "ip", label: "6. Intellectual Property" },
  { id: "termination", label: "7. Termination" },
  { id: "disclaimers", label: "8. Disclaimers" },
  { id: "liability", label: "9. Limitation of Liability" },
  { id: "changes", label: "10. Changes to Terms" },
  { id: "contact", label: "11. Contact Us" },
];

const TermsOfService = () => {
  return (
    <>
      <div className="legal-top">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href={all_routes.register} className="flex items-center gap-3">
            <div className="logo-badge w-9 h-9 rounded-xl flex items-center justify-center">
              <Dumbbell className="size-px-18 c-dark" aria-hidden="true" />
            </div>
            <div className="text-base font-black c-text">
              Dreams <span className="gt">GYM</span>
            </div>
          </Link>
          <Link href={all_routes.register} className="back-link">
            <ArrowLeft className="size-px-14" aria-hidden="true" />
            Back
          </Link>
        </div>
      </div>

      <header className="legal-hero">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <span className="badge badge-active px-3 py-1.5">
            <ScrollText className="size-px-13" aria-hidden="true" />
            Legal
          </span>
          <h1 className="text-3xl md:text-4xl font-black c-text mt-4">Terms of Service</h1>
          <p className="text-sm mt-3 max-w-2xl c-muted">
            Please read these terms carefully before using Dreams GYM. By creating an account or
            using our services, you agree to be bound by these terms.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-5 text-xs c-dim">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-px-13 c-gold" aria-hidden="true" />
              Last updated: July 14, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-px-13 c-gold" aria-hidden="true" />
              ~8 min read
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="size-px-13 c-gold" aria-hidden="true" />
              Effective worldwide
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="legal-grid">
          <nav className="toc">
            <div className="text-[10px] font-black uppercase tracking-wider mb-3 px-3 c-dim2">
              On this page
            </div>
            {TOC.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="toc-link">
                {item.label}
              </a>
            ))}
          </nav>

          <article className="prose">
            <section id="acceptance">
              <h2>
                <span className="n">1</span>Acceptance of Terms
              </h2>
              <p>
                These Terms of Service ("Terms") govern your access to and use of the Dreams GYM
                platform, websites, and related services (collectively, the "Service") operated by
                Dreams GYM ("we", "us", or "our"). By accessing or using the Service, you agree to
                be bound by these Terms.
              </p>
              <p>
                If you are entering into these Terms on behalf of a business or other legal
                entity, you represent that you have the authority to bind that entity to these
                Terms. If you do not agree, you may not use the Service.
              </p>
            </section>

            <section id="accounts">
              <h2>
                <span className="n">2</span>Accounts &amp; Eligibility
              </h2>
              <p>
                To use most features of the Service, you must register for an account. You agree
                to provide accurate, current, and complete information and to keep it up to date.
              </p>
              <ul>
                <li>You must be at least 18 years old to create an account.</li>
                <li>
                  You are responsible for safeguarding your password and all activity under your
                  account.
                </li>
                <li>You must notify us immediately of any unauthorized use or security breach.</li>
                <li>One person or entity may not maintain more than one free account.</li>
              </ul>
            </section>

            <section id="use">
              <h2>
                <span className="n">3</span>Acceptable Use
              </h2>
              <p>You agree not to misuse the Service. You may not, and may not permit others to:</p>
              <ul>
                <li>Use the Service for any unlawful, fraudulent, or harmful purpose.</li>
                <li>Attempt to gain unauthorized access to any systems or networks.</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service.</li>
                <li>Upload viruses, malware, or any malicious code.</li>
                <li>Resell, sublicense, or lease the Service without our written consent.</li>
                <li>Collect or harvest personal data of members without proper consent.</li>
              </ul>
              <p>
                We reserve the right to investigate and take appropriate action against anyone who
                violates this section.
              </p>
            </section>

            <section id="subscriptions">
              <h2>
                <span className="n">4</span>Subscriptions &amp; Billing
              </h2>
              <p>
                Certain features of the Service are billed on a subscription basis. By selecting a
                paid plan, you agree to the following:
              </p>
              <ul>
                <li>Subscription fees are billed in advance on a recurring basis (monthly or annually).</li>
                <li>Your subscription renews automatically unless cancelled before the renewal date.</li>
                <li>Fees are non-refundable except where required by law or expressly stated.</li>
                <li>We may change pricing with at least 30 days' notice before your next billing cycle.</li>
              </ul>
              <h3>Free Trial</h3>
              <p>
                We may offer a free trial. At the end of the trial, your selected plan begins and
                your payment method is charged unless you cancel beforehand.
              </p>
            </section>

            <section id="content">
              <h2>
                <span className="n">5</span>Your Data &amp; Content
              </h2>
              <p>
                You retain all rights to the data you submit to the Service, including member
                records, sales data, and other content ("Customer Data"). You grant us a limited
                license to host, process, and display Customer Data solely to provide and improve
                the Service.
              </p>
              <p>
                You are responsible for the accuracy and legality of your Customer Data and for
                obtaining any consents required from your members. Our handling of personal data
                is described in our{" "}
                <Link href={all_routes.privacyPolicy}>Privacy Policy</Link>.
              </p>
            </section>

            <section id="ip">
              <h2>
                <span className="n">6</span>Intellectual Property
              </h2>
              <p>
                The Service, including its software, design, logos, and content (excluding
                Customer Data), is owned by Dreams GYM and protected by intellectual property laws.
                These Terms do not grant you any right to use our trademarks or branding without
                prior written permission.
              </p>
            </section>

            <section id="termination">
              <h2>
                <span className="n">7</span>Termination
              </h2>
              <p>
                You may cancel your account at any time from your account settings. We may suspend
                or terminate your access if you breach these Terms, fail to pay fees, or use the
                Service in a way that could cause harm or legal liability.
              </p>
              <p>
                Upon termination, your right to use the Service ceases immediately. We will make
                Customer Data available for export for <strong>30 days</strong>, after which it may
                be permanently deleted.
              </p>
            </section>

            <section id="disclaimers">
              <h2>
                <span className="n">8</span>Disclaimers
              </h2>
              <p>
                The Service is provided on an <strong>"as is"</strong> and{" "}
                <strong>"as available"</strong> basis without warranties of any kind, whether
                express or implied. We do not warrant that the Service will be uninterrupted,
                error-free, or completely secure.
              </p>
            </section>

            <section id="liability">
              <h2>
                <span className="n">9</span>Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, Dreams GYM shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages, or any loss of
                profits or revenues, whether incurred directly or indirectly.
              </p>
              <p>
                Our total liability for any claim arising out of these Terms or the Service shall
                not exceed the amount you paid us in the twelve (12) months preceding the claim.
              </p>
            </section>

            <section id="changes">
              <h2>
                <span className="n">10</span>Changes to Terms
              </h2>
              <p>
                We may modify these Terms from time to time. If we make material changes, we will
                notify you by email or through the Service at least 30 days before they take
                effect. Your continued use of the Service after changes become effective
                constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section id="contact">
              <h2>
                <span className="n">11</span>Contact Us
              </h2>
              <p>If you have any questions about these Terms, please reach out:</p>
              <div className="gold-border-card p-5 mt-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="icon-box ic-gold">
                    <Mail className="size-px-18 c-gold" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-sm font-bold c-text">Legal &amp; Support</div>
                    <a href="mailto:legal@example.com" className="text-xs">
                      legal@example.com
                    </a>
                  </div>
                </div>
                <p className="text-xs c-dim m-0">
                  Dreams GYM Pvt. Ltd. · 400 Congress Ave, Austin, TX 78701, USA
                </p>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
              <Link
                href={all_routes.register}
                className="btn-gold w-full sm:w-auto px-6 py-3 text-sm flex items-center justify-center gap-2"
              >
                <Check className="size-px-15" aria-hidden="true" />
                I Agree — Continue
              </Link>
              <Link
                href={all_routes.privacyPolicy}
                className="btn-ghost w-full sm:w-auto px-6 py-3 text-sm flex items-center justify-center gap-2"
              >
                <Shield className="size-px-15" aria-hidden="true" />
                Read Privacy Policy
              </Link>
            </div>
          </article>
        </div>
      </div>

      <footer className="border-t bd-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs c-dim2">© 2026 Dreams GYM Pvt. Ltd. All rights reserved.</div>
          <div className="flex items-center gap-5 text-xs">
            <Link href={all_routes.termsOfService} className="c-gold font-semibold">
              Terms
            </Link>
            <Link href={all_routes.privacyPolicy} className="c-dim">
              Privacy
            </Link>
            <Link href={all_routes.login} className="c-dim">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default TermsOfService;

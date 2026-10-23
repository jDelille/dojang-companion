import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Briefcase,
  Code,
  CreditCard,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  LifeBuoy,
  Mail,
  Megaphone,
  MessageCircle,
  Phone,
  Rocket,
  Search,
  Shield,
  Users,
  Video,
} from "lucide-react";
import { all_routes } from "../../../routes/all_routes";

/*
   Help & Support — ported from tailwind/src/help.html and
   assets/js/help.js. Category tiles, searchable FAQ accordion, contact
   actions.
*/

type CategoryKey = "Getting Started" | "Members & Plans" | "Billing & POS" | "Account & Security";

const CATS: { key: CategoryKey; icon: typeof Rocket; cls: string; color: string; count: number }[] = [
  { key: "Getting Started", icon: Rocket, cls: "ic-gold", color: "#D4AF37", count: 8 },
  { key: "Members & Plans", icon: Users, cls: "ic-green", color: "#4ADE80", count: 12 },
  { key: "Billing & POS", icon: CreditCard, cls: "ic-purple", color: "#818CF8", count: 9 },
  { key: "Account & Security", icon: Shield, cls: "ic-cyan", color: "#22D3EE", count: 6 },
];

type Faq = { cat: CategoryKey; q: string; a: string };

const FAQS: Faq[] = [
  {
    cat: "Members & Plans",
    q: "How do I add a new member?",
    a: "Go to <b>Members</b> in the sidebar and click <b>Add Member</b>. Fill in the member details, assign a membership plan, and save. The member will appear instantly in your directory and can start checking in.",
  },
  {
    cat: "Members & Plans",
    q: "How do I renew a membership?",
    a: "Open the member's profile and click <b>Renew</b>, or use the Renewals widget on the dashboard. Select the plan and payment method — the new validity period is applied automatically.",
  },
  {
    cat: "Billing & POS",
    q: "How do I process a sale at the POS?",
    a: "Open <b>Point of Sale</b>, add products or a membership to the cart, apply any coupon, choose a payment method (Cash/Card/Apple Pay/Wallet), and complete the sale. An invoice is generated automatically.",
  },
  {
    cat: "Billing & POS",
    q: "Can I issue a refund?",
    a: "Yes. Go to <b>Payments</b>, find the transaction, and click the refund icon. Only successful payments can be refunded. The transaction is marked as Refunded and totals update instantly.",
  },
  {
    cat: "Billing & POS",
    q: "How do I apply a discount coupon?",
    a: "Create coupons under <b>Offers & Coupons</b>. At the POS, enter the coupon code in the discount field — percentage or flat discounts are applied to the cart total before payment.",
  },
  {
    cat: "Getting Started",
    q: "How do I set up my gym profile?",
    a: "Head to <b>Settings → Business</b> to add your gym name, EIN, contact details, currency, and timezone. These appear on invoices and reports.",
  },
  {
    cat: "Getting Started",
    q: "Can I manage multiple branches?",
    a: "Absolutely. Use the <b>Branches</b> page to add and manage multiple locations. Switch the active branch from the header dropdown to view branch-specific data.",
  },
  {
    cat: "Account & Security",
    q: "How do I enable two-factor authentication?",
    a: "Go to <b>Settings → Security</b> and toggle on <b>Two-Factor Authentication</b>. You'll be guided through linking an authenticator app for an extra layer of protection.",
  },
  {
    cat: "Account & Security",
    q: "How do I reset my password?",
    a: "On the login screen click <b>Forgot password?</b> and enter your email. We'll send a secure reset link that expires in 30 minutes. You can also change it under Settings → Security.",
  },
  {
    cat: "Members & Plans",
    q: "How does the check-in station work?",
    a: "The <b>Check-In</b> page lets staff scan or search a member to log attendance. Every check-in syncs to the member's attendance history and the daily Attendance log.",
  },
  {
    cat: "Getting Started",
    q: "How do I assign a workout or diet plan?",
    a: "Open a member's profile, go to the <b>Fitness Plan</b> tab, or assign directly from <b>Workout Plans</b> / <b>Diet Plans</b> using the Assign button.",
  },
  {
    cat: "Account & Security",
    q: "How do I export my data?",
    a: "Most list pages (Members, Payments, Reports, etc.) have an <b>Export</b> button in the top-right that downloads the current view as a file.",
  },
];

const RESOURCES = [
  { icon: BookOpen, label: "User Guide" },
  { icon: Video, label: "Video Tutorials" },
  { icon: Code, label: "API Documentation" },
  { icon: Megaphone, label: "What's New" },
];

const Help = () => {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<CategoryKey | "All">("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FAQS.filter((f) => {
      const mq = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
      const mc = cat === "All" || f.cat === cat;
      return mq && mc;
    });
  }, [search, cat]);

  const toggleCat = (key: CategoryKey) => {
    setCat((prev) => (prev === key ? "All" : key));
    setOpenIndex(null);
  };

  return (
    <div id="section-help" className="section active-section">
      {/* Hero + search */}
      <div className="help-hero mb-6">
        <div className="grid-bg" />
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 badge badge-active px-3 py-1.5 mb-4">
            <LifeBuoy className="w-[13px] h-[13px]" aria-hidden="true" />
            Help Center
          </div>
          <h2 className="text-2xl md:text-3xl font-black c-text">How can we help you?</h2>
          <p className="text-sm c-dim mt-2">Search our knowledge base or browse popular topics below.</p>
          <div className="relative max-w-lg mx-auto mt-5">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-[16px] h-[16px] c-dim"
              aria-hidden="true"
            />
            <input
              type="text"
              className="fp-input py-3 pl-11 text-sm rounded-14"
              placeholder="Search for answers… e.g. how to add a member"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {CATS.map((c) => {
          const Icon = c.icon;
          const active = cat === c.key;
          return (
            <div
              key={c.key}
              className="cat-card"
              role="button"
              tabIndex={0}
              style={active ? { borderColor: "rgba(212,175,55,0.4)" } : undefined}
              onClick={() => toggleCat(c.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleCat(c.key);
              }}
            >
              <div className={`cat-ic ${c.cls}`}>
                <Icon className="w-[22px] h-[22px]" style={{ color: c.color }} aria-hidden="true" />
              </div>
              <div className="text-sm font-bold c-text">{c.key}</div>
              <div className="text-[11px] c-dim mt-0.5">{c.count} articles</div>
            </div>
          );
        })}
      </div>

      {/* FAQ + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold c-text sec-title">{cat === "All" ? "Frequently Asked Questions" : cat}</h3>
            <span className="text-[11px] c-dim">
              {filtered.length} article{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((f, i) => {
                const open = openIndex === i;
                return (
                  <div key={f.q} className={open ? "faq open" : "faq"}>
                    <div
                      className="faq-q"
                      role="button"
                      tabIndex={0}
                      onClick={() => setOpenIndex(open ? null : i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setOpenIndex(open ? null : i);
                      }}
                    >
                      <HelpCircle
                        className="w-[16px] h-[16px] shrink-0"
                        style={{ color: "#D4AF37" }}
                        aria-hidden="true"
                      />
                      {f.q}
                      <ChevronDown className="faq-chev w-[16px] h-[16px]" aria-hidden="true" />
                    </div>
                    <div className="faq-a" style={{ maxHeight: open ? "400px" : undefined }}>
                      <div className="faq-a-inner" dangerouslySetInnerHTML={{ __html: f.a }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-14">
              <div className="text-[38px] opacity-30 mb-2">🔍</div>
              <div className="text-sm font-bold c-text">No results found</div>
              <div className="text-xs mt-1 c-dim">Try different keywords or contact support</div>
            </div>
          )}
        </div>

        {/* Contact + resources */}
        <div className="space-y-4">
          <div className="gold-border-card p-5">
            <h3 className="font-bold c-text sec-title mb-1">Still need help?</h3>
            <p className="text-[12px] c-dim mb-4">Our support team is available 24/7 to assist you.</p>
            <Link href={all_routes.chatApp} className="contact-card mb-3">
              <div className="cat-ic ic-gold" style={{ width: 40, height: 40 }}>
                <MessageCircle className="w-[18px] h-[18px] c-gold" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold c-text">Live Chat</div>
                <div className="text-[11px] c-dim">Avg. reply in 2 min</div>
              </div>
              <ChevronRight className="w-[15px] h-[15px] c-dim" aria-hidden="true" />
            </Link>
            <a href="mailto:support@example.com" className="contact-card mb-3">
              <div className="cat-ic ic-cyan" style={{ width: 40, height: 40 }}>
                <Mail className="w-[18px] h-[18px] c-cyan" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold c-text">Email Support</div>
                <div className="text-[11px] c-dim">support@example.com</div>
              </div>
              <ChevronRight className="w-[15px] h-[15px] c-dim" aria-hidden="true" />
            </a>
            <a href="tel:1-800-555-0163" className="contact-card">
              <div className="cat-ic ic-green" style={{ width: 40, height: 40 }}>
                <Phone className="w-[18px] h-[18px] c-green" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold c-text">Call Us</div>
                <div className="text-[11px] c-dim">1&#8209;800&#8209;555&#8209;0199</div>
              </div>
              <ChevronRight className="w-[15px] h-[15px] c-dim" aria-hidden="true" />
            </a>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-bold c-text sec-title mb-3">Resources</h3>
            <div className="space-y-1">
              {RESOURCES.map((r) => {
                const Icon = r.icon;
                return (
                  <a
                    key={r.label}
                    href="#"
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-white/5"
                  >
                    <Icon className="w-[15px] h-[15px] c-gold" aria-hidden="true" />
                    <span className="text-[13px] c-text2">{r.label}</span>
                    <ExternalLink className="w-[12px] h-[12px] ml-auto c-dim2" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1 c-green">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[13px] font-bold">All systems operational</span>
            </div>
            <a href="#" className="text-[11px] c-gold hover:underline">
              View status page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;

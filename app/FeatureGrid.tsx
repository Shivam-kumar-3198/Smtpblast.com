import {
  ShieldCheck,
  GaugeCircle,
  BotMessageSquare,
  BarChart,
  Mail,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: <ShieldCheck />,
    title: "Managed IP Warm-up",
    description:
      "We handle the entire IP warm-up process, gradually increasing volume to build a pristine sender reputation for you.",
  },
  {
    icon: <GaugeCircle />,
    title: "Predictive Sending",
    description:
      "Our AI analyzes engagement patterns to send emails at the optimal time for each recipient, maximizing open rates.",
  },
  {
    icon: <BotMessageSquare />,
    title: "AI Subject Line Writer",
    description:
      "Generate high-converting subject lines instantly. Our AI is trained on millions of successful campaigns.",
  },
  {
    icon: <BarChart />,
    title: "Real-time Analytics",
    description:
      "Track opens, clicks, bounces, and spam complaints with a live dashboard that gives you actionable insights.",
  },
  {
    icon: <Mail />,
    title: "Automated DMARC/SPF/DKIM",
    description:
      "We configure and manage all your email authentication records to ensure your emails are trusted by receivers.",
  },
  {
    icon: <Globe />,
    title: "Global Delivery Network",
    description:
      "Leverage our worldwide network of SMTP servers for the lowest latency and highest deliverability, no matter where your users are.",
  },
];

export async function FeatureGrid() {
  // Simulate a network delay to demonstrate the skeleton loader
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return (
    <section id="features" className="bg-[#030712] py-24 sm:py-32">
      <div className="container">
        <h2 className="text-3xl md:text-5xl font-black text-center tracking-tighter text-white mb-16">
          Everything You Need to Scale
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(({ icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-start p-8 rounded-3xl bg-gray-900 border border-white/10 shadow-inner shadow-white/5 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-500/20 transition-all duration-300"
            >
              <div className="bg-accent-500/10 p-3 rounded-xl mb-4 border border-accent-500/20 text-accent-500">
                {icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
              <p className="text-base text-slate-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
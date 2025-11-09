import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2d3250] flex items-center justify-center rounded-xl shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-[#2d3250]">
                  InterviewAI
                </h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-8">
                <Link
                  href="#features"
                  className="text-[#676f9d] hover:text-[#424769] text-sm font-medium transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-[#676f9d] hover:text-[#424769] text-sm font-medium transition-colors"
                >
                  How it Works
                </Link>
                <Link
                  href="#pricing"
                  className="text-[#676f9d] hover:text-[#424769] text-sm font-medium transition-colors"
                >
                  Pricing
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-6 py-2.5 border-2 border-[#676f9d] hover:border-[#424769] text-[#424769] hover:bg-[#f8f9fa] text-sm font-medium transition-all rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-[#f9b17a] hover:bg-[#e89b5f] text-white text-sm font-medium transition-all rounded-lg shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-[#f8f9fa] to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-white border-2 border-[#e9ecef] rounded-3xl p-12 lg:p-20 shadow-xl relative overflow-hidden">
            {/* Decorative corners */}
            <div className="absolute top-0 right-0 w-40 h-40 border-l-4 border-b-4 border-[#676f9d]/20 rounded-bl-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 border-r-4 border-t-4 border-[#f9b17a]/30 rounded-tr-3xl"></div>

            <div className="text-center max-w-5xl mx-auto relative z-10">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#f9b17a]/10 border border-[#f9b17a]/30 rounded-full mb-8">
                <span className="w-2 h-2 bg-[#f9b17a] rounded-full animate-pulse"></span>
                <span className="text-sm text-[#424769] font-medium">
                  Next-Generation Hiring Platform
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#2d3250] mb-6 leading-tight">
                INTERVIEW
                <span className="block mt-2 bg-gradient-to-r from-[#424769] via-[#676f9d] to-[#f9b17a] bg-clip-text text-transparent">
                  INTELLIGENCE
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-[#676f9d] mb-12 max-w-3xl mx-auto leading-relaxed">
                AI-powered interviews that understand context, adapt in
                real-time, and deliver actionable insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="group px-10 py-4 bg-[#f9b17a] hover:bg-[#e89b5f] text-white transition-all flex items-center justify-center gap-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
                >
                  <span>Start Building</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  href="#demo"
                  className="group px-10 py-4 border-2 border-[#424769] hover:bg-[#424769] text-[#424769] hover:text-white transition-all flex items-center justify-center gap-3 font-semibold rounded-xl"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>View Demo</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-sm text-[#424769] font-medium bg-[#676f9d]/10 px-4 py-2 rounded-full border border-[#676f9d]/20">
                Why It Matters
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2d3250] mb-6">
              Built for{" "}
              <span className="text-[#f9b17a]">
                precision
              </span>
            </h2>
            <p className="text-lg text-[#676f9d] max-w-2xl mx-auto leading-relaxed">
              Every feature designed to remove bias, save time, and surface the
              signal in the noise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Context-Aware Dialogue",
                description:
                  "AI that understands nuance and follows conversational threads like a human expert.",
                icon: "💬",
                gradient: "from-[#424769] to-[#676f9d]",
              },
              {
                title: "Real-time Analytics",
                description:
                  "Watch insights form as the conversation unfolds, not after it's over.",
                icon: "📊",
                gradient: "from-[#676f9d] to-[#f9b17a]",
              },
              {
                title: "Bias Detection",
                description:
                  "Automatically flag and neutralize unconscious bias in questioning and evaluation.",
                icon: "⚖️",
                gradient: "from-[#2d3250] to-[#424769]",
              },
              {
                title: "Skill Mapping",
                description:
                  "Connect responses to specific competencies and team needs with precision.",
                icon: "🗺️",
                gradient: "from-[#f9b17a] to-[#fcd4b1]",
              },
              {
                title: "Candidate Experience",
                description:
                  "Interviews that feel like conversations, not interrogations.",
                icon: "✨",
                gradient: "from-[#424769] to-[#f9b17a]",
              },
              {
                title: "Enterprise Security",
                description:
                  "End-to-end encryption and compliance built for the most demanding environments.",
                icon: "🔒",
                gradient: "from-[#2d3250] to-[#676f9d]",
              },
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="relative bg-white border-2 border-[#e9ecef] hover:border-[#f9b17a] p-8 rounded-2xl h-full transform hover:-translate-y-2 transition-all duration-300 shadow-md hover:shadow-xl">
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-bl-3xl`}></div>
                  <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#2d3250] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#676f9d] leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg
                      className="w-6 h-6 text-[#f9b17a]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-24 bg-gradient-to-br from-[#f8f9fa] to-white"
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-sm text-[#424769] font-medium bg-[#f9b17a]/10 px-4 py-2 rounded-full border border-[#f9b17a]/30">
                The Process
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2d3250] mb-6">
              Simple{" "}
              <span className="text-[#f9b17a]">
                by design
              </span>
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#424769] via-[#676f9d] to-[#f9b17a] hidden lg:block opacity-20"></div>

            <div className="space-y-16">
              {[
                {
                  step: "01",
                  title: "Define Parameters",
                  description:
                    "Upload job descriptions and set evaluation criteria. The AI learns what excellence looks like for this role.",
                  position: "left",
                  color: "#424769",
                },
                {
                  step: "02",
                  title: "Conduct Interview",
                  description:
                    "AI conducts natural, adaptive conversations while analyzing responses in real-time across multiple dimensions.",
                  position: "right",
                  color: "#676f9d",
                },
                {
                  step: "03",
                  title: "Receive Intelligence",
                  description:
                    "Get detailed analysis, competency mapping, and hiring recommendations backed by data, not just intuition.",
                  position: "left",
                  color: "#f9b17a",
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col lg:flex-row items-center ${
                    step.position === "left" ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content */}
                  <div
                    className={`lg:w-1/2 ${
                      step.position === "left" ? "lg:pr-16" : "lg:pl-16"
                    } mb-8 lg:mb-0`}
                  >
                    <div className="bg-white border-2 border-[#e9ecef] hover:border-[#f9b17a] p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                      <div className="text-sm text-[#676f9d] font-medium mb-3">
                        Step {step.step}
                      </div>
                      <h3 className="text-2xl font-bold text-[#2d3250] mb-4">
                        {step.title}
                      </h3>
                      <p className="text-[#676f9d] leading-relaxed text-base">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Step indicator */}
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center z-10 shadow-lg border-4 border-white"
                    style={{ backgroundColor: step.color }}
                  >
                    <span className="text-white font-bold text-lg">
                      {step.step}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-block mb-6">
            <span className="text-sm text-[#424769] font-medium bg-[#f9b17a]/10 px-4 py-2 rounded-full border border-[#f9b17a]/30">
              Ready to Begin?
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-[#2d3250] mb-6">
            Start building
            <span className="block text-[#f9b17a]">
              your dream team
            </span>
          </h2>
          <p className="text-lg text-[#676f9d] mb-10 max-w-2xl mx-auto leading-relaxed">
            Join forward-thinking companies that are redefining how talent is
            discovered and evaluated.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link
              href="/register"
              className="group bg-[#f9b17a] text-white hover:bg-[#e89b5f] px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center space-x-3 shadow-lg"
            >
              <span>Create Account</span>
              <svg
                className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="group border-2 border-[#424769] text-[#424769] hover:bg-[#424769] hover:text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center space-x-3"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>Talk to Sales</span>
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[#676f9d] text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#f9b17a] rounded-full"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#676f9d] rounded-full"></div>
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#424769] rounded-full"></div>
              <span>Enterprise-ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2d3250] py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-[#f9b17a] rounded-xl flex items-center justify-center shadow-md">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">
                  InterviewAI
                </h3>
              </div>
              <p className="text-[#adb5bd] leading-relaxed max-w-xs">
                Building the future of talent discovery through intelligent
                conversation.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-6">
                Product
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#features"
                    className="text-[#adb5bd] hover:text-[#f9b17a] transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-[#adb5bd] hover:text-[#f9b17a] transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/demo"
                    className="text-[#adb5bd] hover:text-[#f9b17a] transition-colors"
                  >
                    Case Studies
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-6">
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-[#adb5bd] hover:text-[#f9b17a] transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-[#adb5bd] hover:text-[#f9b17a] transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-[#adb5bd] hover:text-[#f9b17a] transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-6">
                Resources
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/help"
                    className="text-[#adb5bd] hover:text-[#f9b17a] transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-[#adb5bd] hover:text-[#f9b17a] transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-[#adb5bd] hover:text-[#f9b17a] transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#424769] mt-12 pt-8 text-center">
            <p className="text-[#adb5bd] text-sm">
              &copy; 2024 InterviewAI. Crafted with precision.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-black/90 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-black"
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
                <h1 className="text-xl font-bold text-white tracking-tight">
                  InterviewAI
                </h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link
                  href="#features"
                  className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  How it Works
                </Link>
                <Link
                  href="#pricing"
                  className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  Pricing
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-400 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 border border-transparent hover:border-gray-600 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-white text-black hover:bg-gray-100 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 border border-white"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-gray-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-black to-black"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-900 border border-gray-800 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm text-gray-300 font-medium">
                Next-generation hiring platform
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tight">
              Interview
              <span className="block bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Intelligence
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              AI that doesn't just ask questions—it understands context, adapts
              in real-time, and delivers insights that transform how you
              discover talent.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/register"
                className="group bg-white text-black hover:bg-gray-100 px-10 py-5 rounded-2xl text-lg font-semibold transition-all duration-500 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-4 border-2 border-white"
              >
                <span className="tracking-wide">Start Building</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
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
                href="#demo"
                className="group border-2 border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 px-10 py-5 rounded-2xl text-lg font-semibold transition-all duration-500 hover:bg-gray-900/50 flex items-center space-x-4 backdrop-blur-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="tracking-wide">View Case Study</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="text-sm text-gray-500 font-mono tracking-widest uppercase">
                Why It Matters
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight">
              Built for <span className="text-gray-400">precision</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
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
              },
              {
                title: "Real-time Analytics",
                description:
                  "Watch insights form as the conversation unfolds, not after it's over.",
                icon: "📊",
              },
              {
                title: "Bias Detection",
                description:
                  "Automatically flag and neutralize unconscious bias in questioning and evaluation.",
                icon: "⚖️",
              },
              {
                title: "Skill Mapping",
                description:
                  "Connect responses to specific competencies and team needs with precision.",
                icon: "🗺️",
              },
              {
                title: "Candidate Experience",
                description:
                  "Interviews that feel like conversations, not interrogations.",
                icon: "✨",
              },
              {
                title: "Enterprise Security",
                description:
                  "End-to-end encryption and compliance built for the most demanding environments.",
                icon: "🔒",
              },
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-3xl transform group-hover:scale-105 transition-all duration-500"></div>
                <div className="relative bg-black border border-gray-800 p-8 rounded-3xl h-full transform group-hover:-translate-y-2 transition-all duration-500 backdrop-blur-sm">
                  <div className="text-3xl mb-6 transform group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed font-light">
                    {feature.description}
                  </p>
                  <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <svg
                      className="w-6 h-6 text-gray-600"
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
        className="py-24 bg-gradient-to-b from-black to-gray-900 relative"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="text-sm text-gray-500 font-mono tracking-widest uppercase">
                The Process
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight">
              Simple <span className="text-gray-400">by design</span>
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gray-800 hidden lg:block"></div>

            <div className="space-y-12 lg:space-y-0">
              {[
                {
                  step: "01",
                  title: "Define Parameters",
                  description:
                    "Upload job descriptions and set evaluation criteria. The AI learns what excellence looks like for this role.",
                  position: "left",
                },
                {
                  step: "02",
                  title: "Conduct Interview",
                  description:
                    "AI conducts natural, adaptive conversations while analyzing responses in real-time across multiple dimensions.",
                  position: "right",
                },
                {
                  step: "03",
                  title: "Receive Intelligence",
                  description:
                    "Get detailed analysis, competency mapping, and hiring recommendations backed by data, not just intuition.",
                  position: "left",
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
                      step.position === "left" ? "lg:pr-12" : "lg:pl-12"
                    } mb-8 lg:mb-0`}
                  >
                    <div className="bg-black border border-gray-800 p-8 rounded-3xl backdrop-blur-sm">
                      <div className="text-sm text-gray-500 font-mono tracking-widest mb-4">
                        Step {step.step}
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-6 tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed font-light text-lg">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Step indicator */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-black border-2 border-gray-700 rounded-full flex items-center justify-center z-10">
                    <span className="text-white font-bold text-sm">
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
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-black"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-block mb-6">
            <span className="text-sm text-gray-500 font-mono tracking-widest uppercase">
              Ready to Begin?
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            Start building
            <span className="block text-gray-400">your dream team</span>
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Join forward-thinking companies that are redefining how talent is
            discovered and evaluated.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/register"
              className="group bg-white text-black hover:bg-gray-100 px-12 py-6 rounded-2xl text-xl font-semibold transition-all duration-500 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-4 border-2 border-white"
            >
              <span className="tracking-wide">Create Account</span>
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
              className="group border-2 border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 px-12 py-6 rounded-2xl text-xl font-semibold transition-all duration-500 hover:bg-gray-900/50 flex items-center space-x-4 backdrop-blur-sm"
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
              <span className="tracking-wide">Talk to Sales</span>
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center space-x-8 text-gray-500 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span>Enterprise-ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-black"
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
                <h3 className="text-lg font-bold text-white tracking-tight">
                  InterviewAI
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed font-light max-w-xs">
                Building the future of talent discovery through intelligent
                conversation.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-6 tracking-widest uppercase">
                Product
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="#features"
                    className="text-gray-400 hover:text-white transition-all duration-300 font-light"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-gray-400 hover:text-white transition-all duration-300 font-light"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/demo"
                    className="text-gray-400 hover:text-white transition-all duration-300 font-light"
                  >
                    Case Studies
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-6 tracking-widest uppercase">
                Company
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-400 hover:text-white transition-all duration-300 font-light"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-white transition-all duration-300 font-light"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-gray-400 hover:text-white transition-all duration-300 font-light"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-6 tracking-widest uppercase">
                Resources
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/help"
                    className="text-gray-400 hover:text-white transition-all duration-300 font-light"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-gray-400 hover:text-white transition-all duration-300 font-light"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-400 hover:text-white transition-all duration-300 font-light"
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-500 text-sm font-light">
              &copy; 2024 InterviewAI. Crafted with precision.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

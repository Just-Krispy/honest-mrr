/**
 * Honest MRR — Landing Page
 * Public marketing page: hero, features, pricing, CTA
 */

import { CheckCircle2, Shield, Zap, TrendingUp, Lock, ExternalLink, Download, Code } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Honest MRR</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-slate-300 hover:text-white transition">
                Login
              </Link>
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-md font-medium transition"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-6xl font-bold text-white leading-tight">
            Stop the Fake MRR Culture
          </h1>
          <p className="text-2xl text-slate-300">
            Generate cryptographically verified revenue screenshots.
            <br />
            Prove your MRR is <span className="text-purple-400 font-semibold">real</span>.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl"
            >
              Connect Stripe & Get Verified
            </Link>
            <Link
              href="/verify/demo"
              className="border-2 border-purple-600 text-purple-400 hover:bg-purple-600/10 px-8 py-4 rounded-lg font-semibold text-lg transition"
            >
              See Demo
            </Link>
          </div>
          <p className="text-slate-400 text-sm">
            Free tier: 1 verified screenshot per day • No credit card required
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-slate-900/50 border border-slate-700 rounded-lg p-8 backdrop-blur text-center">
          <p className="text-slate-300 text-lg">
            <span className="text-purple-400 font-semibold">Tired of fake revenue screenshots</span> on X/Twitter?
            <br />
            Lifetime deals disguised as MRR. Photoshopped Stripe dashboards. Survivorship bias killing realistic builders.
          </p>
          <p className="text-white font-semibold text-xl mt-4">
            It's time for honest revenue sharing. 💯
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-slate-300">
            Cryptographic proof your MRR is real
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8 backdrop-blur text-center hover:border-purple-600 transition">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Connect Stripe (Read-Only)
            </h3>
            <p className="text-slate-400">
              OAuth integration with <strong>read-only</strong> access. We can't charge cards or modify your data.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8 backdrop-blur text-center hover:border-purple-600 transition">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Generate Verified Screenshot
            </h3>
            <p className="text-slate-400">
              Real MRR from Stripe. SHA-256 cryptographic signature. QR code for public verification.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8 backdrop-blur text-center hover:border-purple-600 transition">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Anyone Can Verify
            </h3>
            <p className="text-slate-400">
              Public verification page. Scan QR code. Check signature. Green checkmark = verified.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-300">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8 backdrop-blur">
            <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
            <p className="text-slate-400 mb-6">For trying it out</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-slate-400">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>1 verified screenshot/day</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Public verification links</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>7-day analytics</span>
              </li>
            </ul>
            <Link
              href="/dashboard"
              className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-md font-medium transition"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-2 border-purple-600 rounded-lg p-8 backdrop-blur relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <p className="text-purple-200 mb-6">For serious builders</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$29</span>
              <span className="text-purple-200">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-white">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span><strong>Unlimited</strong> screenshots</span>
              </li>
              <li className="flex items-start gap-2 text-white">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>12-month analytics</span>
              </li>
              <li className="flex items-start gap-2 text-white">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Privacy mode (blur numbers)</span>
              </li>
              <li className="flex items-start gap-2 text-white">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Growth charts</span>
              </li>
            </ul>
            <Link
              href="/dashboard"
              className="block w-full text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-md font-semibold transition shadow-lg"
            >
              Start Pro Trial
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8 backdrop-blur">
            <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
            <p className="text-slate-400 mb-6">For agencies & power users</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$99</span>
              <span className="text-slate-400">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span><strong>Custom branding</strong> (logo, colors)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span><strong>API access</strong></span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Blockchain anchoring</span>
              </li>
            </ul>
            <Link
              href="/dashboard"
              className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-md font-medium transition"
            >
              Get Premium
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-2 border-purple-600 rounded-lg p-12 text-center backdrop-blur">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to prove your MRR is real?
          </h2>
          <p className="text-xl text-purple-200 mb-8">
            Connect your Stripe account and generate your first verified screenshot in 60 seconds.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-white text-purple-900 hover:bg-purple-50 px-10 py-4 rounded-lg font-bold text-lg transition shadow-lg"
          >
            Get Started Free →
          </Link>
          <p className="text-purple-300 text-sm mt-4">
            Free tier • 1 screenshot/day • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Honest MRR</span>
              </div>
              <p className="text-slate-400 text-sm">
                Fighting fake revenue culture, one verified screenshot at a time.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
                <li><Link href="#" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition">Documentation</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="#" className="hover:text-white transition">About</Link></li>
                <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition">Twitter</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400 text-sm">
            <p>© 2026 Honest MRR. Built with VibeStack 🦞</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

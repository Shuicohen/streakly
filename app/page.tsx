"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Flame, 
  BarChart3, 
  Shield, 
  Smartphone, 
  Zap,
  ArrowRight,
  Star,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: CheckCircle,
    title: "Simple Daily Tracking",
    description: "Mark habits complete in seconds. No complexity, just consistent progress.",
  },
  {
    icon: Flame,
    title: "Streak Building",
    description: "Watch your streaks grow and feel the motivation from visual progress.",
  },
  {
    icon: BarChart3,
    title: "Insightful Analytics",
    description: "See your completion rates and identify patterns to improve faster.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Your data is encrypted and private. We never sell or share your information.",
  },
  {
    icon: Smartphone,
    title: "Works Everywhere",
    description: "Beautiful experience on desktop, tablet, and mobile. Track on the go.",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Real-time updates and satisfying animations keep you engaged.",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Designer",
    content: "Streakly helped me finally build a consistent meditation practice. I've hit a 127-day streak!",
    avatar: "SC",
  },
  {
    name: "Marcus Rodriguez",
    role: "Software Engineer",
    content: "The cleanest habit tracker I've used. I love how it focuses on what matters without overwhelming me.",
    avatar: "MR",
  },
  {
    name: "Priya Patel",
    role: "Founder & CEO",
    content: "My team uses Streakly for our wellness challenges. The simplicity makes it actually stick.",
    avatar: "PP",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started",
    features: [
      "Up to 5 habits",
      "Basic streak tracking",
      "7-day history",
      "Email support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "8",
    description: "For serious habit builders",
    features: [
      "Unlimited habits",
      "Advanced analytics & insights",
      "Full history & exports",
      "Priority support",
      "Custom reminders (soon)",
    ],
    cta: "Start 14-day Trial",
    popular: true,
  },
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-2xl tracking-tight">Streakly</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how" className="hover:text-primary transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Start free</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="space-y-1">
              <span className={`block w-5 h-0.5 bg-foreground transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block w-5 h-0.5 bg-foreground transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-foreground transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background px-6 py-4 flex flex-col gap-3 text-sm">
            <a href="#features" className="py-1.5">Features</a>
            <a href="#how" className="py-1.5">How it works</a>
            <a href="#pricing" className="py-1.5">Pricing</a>
            <div className="pt-3 border-t flex flex-col gap-2">
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/signup">Start free</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm mb-6">
            <Star className="w-4 h-4" /> Trusted by 12,400+ habit builders
          </div>
          
          <h1 className="text-6xl md:text-7xl font-semibold tracking-tighter leading-[1.05] mb-6">
            Build better habits.<br />One day at a time.
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10">
            The beautifully simple habit tracker that helps you stay consistent, 
            build streaks, and actually stick to the habits that matter.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/signup">
                Start building for free <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <a href="#how">See how it works</a>
            </Button>
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground">No credit card required • Free forever plan available</p>
        </div>

        {/* Hero visual - simple dashboard preview */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="relative rounded-3xl border bg-card shadow-2xl overflow-hidden">
            <div className="bg-muted/50 px-6 py-3 border-b flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="text-xs text-muted-foreground ml-3">streakly.app/dashboard</div>
            </div>
            <div className="p-8 bg-card">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <div className="text-sm text-muted-foreground">Good morning, Alex</div>
                  <div className="text-3xl font-semibold tracking-tight">You're on a 47-day streak 🔥</div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-semibold tabular-nums">92%</div>
                  <div className="text-xs text-muted-foreground">this month</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: "Morning Meditation", streak: 47, done: true },
                  { name: "Read 20 pages", streak: 23, done: true },
                  { name: "No sugar", streak: 12, done: false },
                ].map((habit, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border bg-background">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${habit.done ? 'bg-primary text-primary-foreground' : 'border-2'}`}>
                      {habit.done && <CheckCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{habit.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Flame className="w-3 h-3" /> {habit.streak} day streak
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="border-y py-5 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center items-center gap-x-12 gap-y-4 opacity-60 text-sm font-medium tracking-wider">
          <div>PRODUCT HUNT</div>
          <div>INDIE HACKERS</div>
          <div>YC W25</div>
          <div> makers</div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-primary font-medium tracking-widest text-sm mb-3">EVERYTHING YOU NEED</div>
          <h2 className="text-5xl font-semibold tracking-tighter">Simple. Powerful. Yours.</h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-md mx-auto">
            Designed to remove friction so you can focus on what matters — showing up every day.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group border-0 shadow-sm hover:shadow-md transition-all p-1">
              <CardContent className="p-7">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-2xl tracking-tight mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-muted/40 py-20 border-y">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-primary font-medium tracking-widest text-sm mb-3">3 SIMPLE STEPS</div>
            <h2 className="text-5xl font-semibold tracking-tighter">How Streakly works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create your habits", desc: "Add any habit you want to build. From reading to running to drinking more water." },
              { step: "02", title: "Check in daily", desc: "Open the app each day and tap to mark your habits complete. Takes less than 30 seconds." },
              { step: "03", title: "Watch your streaks grow", desc: "See your progress compound. Celebrate milestones and stay motivated with beautiful visuals." },
            ].map((item, i) => (
              <div key={i} className="relative pl-8">
                <div className="absolute left-0 top-1 text-6xl font-mono font-bold text-primary/10 tracking-tighter">{item.step}</div>
                <div className="relative">
                  <h3 className="font-semibold text-2xl tracking-tight mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-3">
            <Users className="w-4 h-4" /> LOVED BY MAKERS
          </div>
          <h2 className="text-5xl font-semibold tracking-tighter">Real results from real people</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-8">
              <div className="flex gap-1 mb-6 text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <blockquote className="text-lg leading-relaxed mb-8">“{testimonial.content}”</blockquote>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-medium">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-20 border-t">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-semibold tracking-tighter mb-3">Simple pricing</h2>
          <p className="text-xl text-muted-foreground">Start free. Upgrade when you need more power.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <Card key={index} className={`relative p-8 flex flex-col ${tier.popular ? 'ring-2 ring-primary shadow-lg' : ''}`}>
              {tier.popular && (
                <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-xs font-medium px-4 py-1 rounded-full tracking-wider">MOST POPULAR</div>
              )}
              <div>
                <div className="font-semibold text-2xl">{tier.name}</div>
                <div className="mt-4 flex items-baseline">
                  <span className="text-6xl font-semibold tabular-nums tracking-tighter">${tier.price}</span>
                  <span className="text-muted-foreground ml-1.5">/mo</span>
                </div>
                <p className="mt-1 text-muted-foreground">{tier.description}</p>
              </div>

              <ul className="mt-8 space-y-3 flex-1">
                {tier.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-primary mt-px flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="mt-8 w-full h-11" 
                variant={tier.popular ? "default" : "outline"}
                asChild
              >
                <Link href="/signup">{tier.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">All plans include a forever-free tier. Cancel anytime.</p>
      </section>

      {/* Final CTA */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-5xl font-semibold tracking-tighter mb-4">Ready to start your streak?</h2>
          <p className="text-xl opacity-90 mb-8">Join thousands building better lives, one habit at a time.</p>
          <Button size="lg" variant="secondary" className="h-12 px-10 text-base" asChild>
            <Link href="/signup">Create your free account</Link>
          </Button>
          <p className="mt-4 text-sm opacity-75">Takes 30 seconds. No credit card needed.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} Streakly. Built with care for habit builders everywhere.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition">Privacy</a>
            <a href="#" className="hover:text-foreground transition">Terms</a>
            <a href="#" className="hover:text-foreground transition">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
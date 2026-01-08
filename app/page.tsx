"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Shield, CreditCard, CheckCircle2, Zap, Sparkles, Rocket, TrendingUp, Clock, Users, Lock, Award, BarChart3, Mail, Phone, Calendar, Star, Play, ArrowDown, CheckCircle, DollarSign, Timer, Target, Globe, Heart, Handshake } from "lucide-react";
import { motion } from "framer-motion";
import { PublicNav } from "@/components/navigation/public-nav";

// Features array - moved outside to prevent re-renders
const FEATURES = [
  {
    id: "contract-creation",
    icon: FileText,
    title: "Professional Contract Creation",
    description: "Create custom contracts using our template library or build from scratch. Add fields, terms, and conditions tailored to your business needs.",
    iconBg: "bg-indigo-500/20",
    iconHover: "group-hover:bg-indigo-500/30",
    iconColor: "text-indigo-400",
  },
  {
    id: "digital-signature",
    icon: Shield,
    title: "Digital Signature & Security",
    description: "Send contracts for signature with legally-binding e-signatures. Track signing status in real-time with complete audit trails and secure document storage.",
    iconBg: "bg-purple-500/20",
    iconHover: "group-hover:bg-purple-500/30",
    iconColor: "text-purple-400",
  },
  {
    id: "payment-processing",
    icon: CreditCard,
    title: "Integrated Payment Processing",
    description: "Collect deposits and full payments directly through Stripe. Automated invoicing, payment tracking, and instant notifications keep cash flow healthy.",
    iconBg: "bg-blue-500/20",
    iconHover: "group-hover:bg-blue-500/30",
    iconColor: "text-blue-400",
  },
  {
    id: "client-management",
    icon: Users,
    title: "Client Management",
    description: "Organize and manage all your clients in one place. Track contract history, communication, and payment records for each client relationship.",
    iconBg: "bg-purple-500/20",
    iconHover: "group-hover:bg-purple-500/30",
    iconColor: "text-purple-400",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics & Reporting",
    description: "Monitor contract performance with detailed analytics. Track signing rates, payment status, and revenue metrics to make data-driven decisions.",
    iconBg: "bg-indigo-500/20",
    iconHover: "group-hover:bg-indigo-500/30",
    iconColor: "text-indigo-400",
  },
  {
    id: "enterprise-security",
    icon: Lock,
    title: "Enterprise Security",
    description: "Bank-level encryption, secure cloud storage, and compliance with industry standards. Your contracts and client data are always protected.",
    iconBg: "bg-blue-500/20",
    iconHover: "group-hover:bg-blue-500/30",
    iconColor: "text-blue-400",
  },
] as const;

// Testimonials array - moved outside to prevent re-renders
const TESTIMONIALS = [
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    role: "General Contractor",
    company: "Johnson Construction",
    content: "Pay2Start has completely transformed how I manage contracts. I've cut my admin time in half and payments come in 3x faster. Game changer!",
    rating: 5,
    avatar: "SJ",
  },
  {
    id: "michael-chen",
    name: "Michael Chen",
    role: "Plumbing Contractor",
    company: "Chen Plumbing Co.",
    content: "The integrated payment processing is incredible. Clients can pay deposits right after signing, and I get notified instantly. Cash flow has never been better.",
    rating: 5,
    avatar: "MC",
  },
  {
    id: "emily-rodriguez",
    name: "Emily Rodriguez",
    role: "Electrical Contractor",
    company: "Rodriguez Electric",
    content: "Finally, a platform built for contractors. Everything I need in one place - contracts, signatures, payments, and client management. Highly recommend!",
    rating: 5,
    avatar: "ER",
  },
] as const;

// Benefits array - moved outside to prevent re-renders
const BENEFITS = [
  { 
    id: "reduce-admin",
    title: "Reduce Admin Time by 80%", 
    description: "Automate contract workflows from creation to signing. Eliminate manual data entry and endless email threads.", 
    icon: Clock 
  },
  { 
    id: "organize",
    title: "Organize Everything", 
    description: "Centralized dashboard for all contracts, clients, and payments. Never lose track of important documents or deadlines.", 
    icon: FileText 
  },
  { 
    id: "cash-flow",
    title: "Improve Cash Flow", 
    description: "Get paid faster with integrated payments. Collect deposits upfront and automate payment reminders to reduce delays.", 
    icon: TrendingUp 
  },
  { 
    id: "security",
    title: "Enterprise-Grade Security", 
    description: "Bank-level encryption, secure document storage, and compliance with legal standards. Your data is always protected.", 
    icon: Shield 
  },
] as const;

// Use cases array - moved outside to prevent re-renders
const USE_CASES = [
  {
    id: "general-contracting",
    title: "General Contractors",
    description: "Manage multiple projects, clients, and contracts. Track progress and payments across all your jobs.",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "plumbing-hvac",
    title: "Plumbing & HVAC",
    description: "Quick contract creation for service calls. Collect deposits upfront and finalize payments on completion.",
    icon: Zap,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "electrical",
    title: "Electrical Contractors",
    description: "Professional contracts for installations and repairs. Secure signatures and fast payment processing.",
    icon: Sparkles,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "roofing",
    title: "Roofing & Siding",
    description: "Handle large project contracts with detailed terms. Manage deposits and milestone payments easily.",
    icon: Shield,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "landscaping",
    title: "Landscaping",
    description: "Seasonal contracts and recurring services. Automated reminders and streamlined client communication.",
    icon: Globe,
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "home-improvement",
    title: "Home Improvement",
    description: "Renovation projects with custom terms. Track materials, labor, and payment schedules all in one place.",
    icon: Rocket,
    color: "from-red-500 to-pink-500",
  },
] as const;

// Trust badges array - moved outside to prevent re-renders
const TRUST_BADGES = [
  { 
    id: "soc2",
    name: "SOC 2 Compliant", 
    icon: Shield 
  },
  { 
    id: "ssl",
    name: "256-bit SSL", 
    icon: Lock 
  },
  { 
    id: "gdpr",
    name: "GDPR Ready", 
    icon: Globe 
  },
  { 
    id: "stripe",
    name: "Stripe Verified", 
    icon: CreditCard 
  },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.05]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>
      
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-purple-950/20 pointer-events-none"></div>

      {/* Navigation */}
      <PublicNav />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Orbs */}
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
        </div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 backdrop-blur-sm"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-400 rounded-full blur-md opacity-50 animate-pulse"></div>
                <Award className="h-4 w-4 text-indigo-400 relative z-10" />
              </div>
              <span className="text-sm font-semibold text-indigo-300">Trusted by contractors nationwide</span>
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                <span className="block">Stop Chasing</span>
                <span className="block relative">
                  <span className="relative z-10 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Contracts & Payments
                  </span>
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 blur-xl"
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </span>
              </h1>
              
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-300 leading-relaxed">
                Start Getting Paid What You&apos;re Worth
              </h2>
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl">
              No more email chains, lost documents, or waiting 30+ days for payment.{" "}
              <span className="font-semibold text-indigo-400 relative">
                Create contracts in minutes
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                />
              </span>
              , get digital signatures instantly, and collect deposits the same day.
            </p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="text-base px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-2xl hover:shadow-indigo-500/50 transition-all font-semibold group rounded-xl relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                  />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 py-6 border-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 hover:text-white transition-all font-semibold rounded-xl"
                >
                  Sign In
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="flex flex-wrap gap-4 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {[
                { icon: CheckCircle2, text: "No credit card", color: "green" },
                { icon: Shield, text: "Bank-level security", color: "indigo" },
                { icon: Zap, text: "5 min setup", color: "yellow" },
                { icon: CreditCard, text: "Integrated payments", color: "purple" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 backdrop-blur-sm rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <item.icon className={`h-4 w-4 text-${item.color}-400`} />
                  <span className="text-xs font-medium text-slate-300">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Visual Elements */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Floating Cards */}
            <div className="relative h-[500px]">
              {/* Main Card */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 shadow-2xl"
                initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="h-3 w-24 bg-slate-700 rounded mb-2"></div>
                    <div className="h-2 w-16 bg-slate-700/50 rounded"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 bg-slate-700/50 rounded"></div>
                  <div className="h-2 bg-slate-700/50 rounded w-3/4"></div>
                  <div className="h-2 bg-slate-700/50 rounded w-5/6"></div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-8 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg border border-indigo-500/30 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="flex-1 h-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-purple-400" />
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 1 - Top Left */}
              <motion.div
                className="absolute top-0 left-0 w-48 bg-slate-800/80 backdrop-blur-xl rounded-xl p-4 border border-slate-700 shadow-xl"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 2, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="h-4 w-4 text-indigo-400" />
                  <div className="h-2 w-20 bg-slate-700 rounded"></div>
                </div>
                <div className="h-2 bg-slate-700/50 rounded mb-2"></div>
                <div className="h-2 bg-slate-700/50 rounded w-2/3"></div>
              </motion.div>

              {/* Floating Card 2 - Top Right */}
              <motion.div
                className="absolute top-10 right-0 w-44 bg-slate-800/80 backdrop-blur-xl rounded-xl p-4 border border-slate-700 shadow-xl"
                animate={{
                  y: [0, 15, 0],
                  rotate: [0, -2, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Handshake className="h-4 w-4 text-green-400" />
                  <div className="h-2 w-16 bg-slate-700 rounded"></div>
                </div>
                <div className="h-2 bg-slate-700/50 rounded"></div>
              </motion.div>

              {/* Floating Card 3 - Bottom Left */}
              <motion.div
                className="absolute bottom-10 left-0 w-52 bg-slate-800/80 backdrop-blur-xl rounded-xl p-4 border border-slate-700 shadow-xl"
                animate={{
                  y: [0, 12, 0],
                  rotate: [0, -1.5, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                  <div className="h-2 w-24 bg-slate-700 rounded"></div>
                </div>
                <div className="h-2 bg-slate-700/50 rounded mb-2"></div>
                <div className="h-2 bg-slate-700/50 rounded w-4/5"></div>
              </motion.div>

              {/* Floating Card 4 - Bottom Right */}
              <motion.div
                className="absolute bottom-0 right-0 w-40 bg-slate-800/80 backdrop-blur-xl rounded-xl p-4 border border-slate-700 shadow-xl"
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 1.5, 0],
                }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                  <div className="h-2 w-16 bg-slate-700 rounded"></div>
                </div>
                <div className="h-2 bg-slate-700/50 rounded"></div>
              </motion.div>

              {/* Connecting Lines (Animated) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <motion.line
                  x1="50%"
                  y1="50%"
                  x2="20%"
                  y2="10%"
                  stroke="url(#gradient1)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 1 }}
                />
                <motion.line
                  x1="50%"
                  y1="50%"
                  x2="80%"
                  y2="15%"
                  stroke="url(#gradient2)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 1.2 }}
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.5" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {[
            { value: "10K+", label: "Contracts Signed", icon: FileText, color: "from-blue-500 to-cyan-500" },
            { value: "5K+", label: "Active Users", icon: Users, color: "from-purple-500 to-pink-500" },
            { value: "99.9%", label: "Uptime", icon: Shield, color: "from-green-500 to-emerald-500" },
            { value: "24/7", label: "Support", icon: Clock, color: "from-orange-500 to-red-500" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700 shadow-sm hover:shadow-md transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-md`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-slate-400 cursor-pointer group"
            onClick={() => {
              const nextSection = document.getElementById('features');
              nextSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="text-sm font-medium group-hover:text-indigo-400 transition-colors">Scroll to explore</span>
            <ArrowDown className="h-5 w-5 group-hover:text-indigo-400 transition-colors" />
          </motion.div>
        </motion.div>
      </section>

      {/* Problem/Solution Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 mb-6">
              <span className="text-sm font-semibold text-red-700">The Problem</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Tired of contract chaos?
            </h2>
            <div className="space-y-4 mb-8">
              {[
                "Hours wasted on manual contract creation",
                "Lost contracts and missed deadlines",
                "Slow payment processing and cash flow issues",
                "No centralized system for tracking everything",
                "Security concerns with email-based workflows",
              ].map((problem, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-900/50 border border-red-700 flex items-center justify-center mt-0.5">
                    <span className="text-red-400 text-sm font-bold">×</span>
                  </div>
                  <p className="text-slate-300 text-lg">{problem}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl transform rotate-3 opacity-20"></div>
            <div className="relative bg-slate-800 rounded-3xl p-8 shadow-2xl border-2 border-slate-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-900/30 border border-green-700/50 mb-6">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm font-semibold text-green-300">The Solution</span>
              </div>
              <h3 className="text-3xl font-bold mb-6 text-white">
                Pay2Start fixes it all
              </h3>
              <div className="space-y-4">
                {[
                  "Create contracts in minutes, not hours",
                  "Everything organized in one secure dashboard",
                  "Get paid 3x faster with integrated payments",
                  "Real-time tracking and automated reminders",
                  "Bank-level security and compliance",
                ].map((solution, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-900/50 border border-green-700 flex items-center justify-center mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <p className="text-slate-300 text-lg font-medium">{solution}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Everything you need to manage contracts
            </h2>
            <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto">
              A comprehensive platform designed for contractors who want to streamline their workflow and get paid faster
            </p>
          </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.id}
              className="p-8 rounded-xl bg-slate-800 border border-slate-700 hover:border-indigo-500 hover:shadow-xl transition-all group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${feature.iconBg} ${feature.iconHover} mb-6 transition-colors`}>
                <feature.icon className={`h-6 w-6 ${feature.iconColor} transition-colors`} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-[15px]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demo/Video Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            See Pay2Start in Action
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Watch how easy it is to create, send, and get paid for contracts
          </p>
        </motion.div>

        <motion.div
          className="relative max-w-5xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700">
            {/* Video Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
              <motion.button
                className="relative z-10 w-20 h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-2xl group transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="h-10 w-10 text-indigo-600 ml-1 group-hover:text-indigo-700" fill="currentColor" />
              </motion.button>
            </div>
            <div className="p-8 bg-gradient-to-r from-slate-800 to-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Pay2Start Platform Demo</h3>
                  <p className="text-slate-300">See how contractors use Pay2Start to streamline their workflow</p>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">3:45</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              How It Works
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Get started in minutes and send your first contract today
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Contract",
                description: "Use our templates or build custom contracts. Add terms, pricing, and client details in minutes.",
                icon: FileText,
                color: "from-indigo-500 to-blue-500",
              },
              {
                step: "2",
                title: "Send for Signature",
                description: "Send secure signing links via email. Clients can sign from any device, anywhere.",
                icon: Mail,
                color: "from-purple-500 to-pink-500",
              },
              {
                step: "3",
                title: "Collect Payment",
                description: "Integrated Stripe payments mean faster deposits. Get paid instantly when contracts are signed.",
                icon: CreditCard,
                color: "from-green-500 to-emerald-500",
              },
              {
                step: "4",
                title: "Track & Manage",
                description: "Monitor all contracts from your dashboard. Automated reminders and real-time status updates.",
                icon: BarChart3,
                color: "from-orange-500 to-red-500",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="bg-slate-800 rounded-2xl p-8 shadow-lg border-2 border-slate-700 hover:border-indigo-500 hover:shadow-xl transition-all h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg`}>
                    {step.step}
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 opacity-20`}>
                    <step.icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                    <ArrowRight className="h-8 w-8 text-indigo-500" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Loved by contractors everywhere
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            See what our customers are saying about Pay2Start
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-8 shadow-lg hover:shadow-xl hover:border-indigo-500 transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }, (_, i) => (
                  <Star key={`star-${testimonial.id}-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed text-[15px]">
                &quot;{testimonial.content}&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                  <p className="text-xs text-slate-500">{testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative bg-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Perfect for Every Contractor
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Whether you&apos;re a solo contractor or managing a team, Pay2Start scales with your business
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {USE_CASES.map((useCase) => {
              const IconComponent = useCase.icon;
              return (
                <motion.div
                  key={useCase.id}
                  className="bg-slate-800 rounded-xl p-6 border-2 border-slate-700 hover:border-indigo-500 hover:shadow-lg transition-all group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{useCase.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{useCase.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative bg-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
                Why contractors choose Pay2Start
              </h2>
              <p className="text-lg text-slate-400 mb-10">
                Built specifically for contractors who want to streamline operations, reduce paperwork, and improve cash flow.
              </p>
              <div className="space-y-6">
                {BENEFITS.map((benefit) => (
                  <motion.div
                    key={benefit.id}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <benefit.icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white mb-1">{benefit.title}</h3>
                      <p className="text-slate-400 text-[15px] leading-relaxed">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-10 shadow-2xl">
                <div className="space-y-8">
                  {[
                    { metric: "80%", label: "Time Saved", desc: "On contract administration" },
                    { metric: "3x", label: "Faster Payments", desc: "With integrated processing" },
                    { metric: "99.9%", label: "Uptime", desc: "Reliable infrastructure" },
                  ].map((stat, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                      <div className="text-4xl font-bold text-white mb-1">{stat.metric}</div>
                      <div className="text-lg font-semibold text-white/90 mb-1">{stat.label}</div>
                      <div className="text-sm text-white/70">{stat.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            See the Difference
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Compare the old way vs. the Pay2Start way
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Before */}
          <motion.div
            className="bg-red-950/30 border-2 border-red-900/50 rounded-2xl p-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                <span className="text-white text-xl font-bold">×</span>
              </div>
              <h3 className="text-2xl font-bold text-white">The Old Way</h3>
            </div>
            <div className="space-y-4">
              {[
                { icon: Clock, text: "2-3 hours per contract creation" },
                { icon: Mail, text: "Endless email threads" },
                { icon: DollarSign, text: "30-60 day payment delays" },
                { icon: FileText, text: "Lost contracts and documents" },
                { icon: Users, text: "Manual client tracking" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-slate-300">
                  <item.icon className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <span className="text-lg">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            className="bg-green-950/30 border-2 border-green-900/50 rounded-2xl p-8 relative overflow-hidden"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              NEW
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">With Pay2Start</h3>
            </div>
            <div className="space-y-4">
              {[
                { icon: Zap, text: "5 minutes per contract" },
                { icon: CheckCircle, text: "Automated workflows" },
                { icon: Timer, text: "Instant payment processing" },
                { icon: Shield, text: "Secure cloud storage" },
                { icon: BarChart3, text: "Centralized dashboard" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-slate-300">
                  <item.icon className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-lg font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-6">Trusted & Secure</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {TRUST_BADGES.map((badge) => {
              const IconComponent = badge.icon;
              return (
                <motion.div
                  key={badge.id}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg hover:border-indigo-500 transition-all"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.3 }}
                >
                  <IconComponent className="h-5 w-5 text-indigo-400" />
                  <span className="font-semibold text-slate-300">{badge.name}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Social Proof Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="bg-gradient-to-r from-slate-800 via-indigo-900/30 to-purple-900/30 rounded-2xl p-12 border-2 border-slate-700 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                10,000+
              </div>
              <p className="text-slate-300 font-semibold text-lg">Contracts Signed</p>
              <p className="text-slate-500 text-sm mt-1">And counting</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                5,000+
              </div>
              <p className="text-slate-300 font-semibold text-lg">Active Contractors</p>
              <p className="text-slate-500 text-sm mt-1">Growing daily</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                $50M+
              </div>
              <p className="text-slate-300 font-semibold text-lg">Processed in Payments</p>
              <p className="text-slate-500 text-sm mt-1">Secure & fast</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-3xl p-12 md:p-16 shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <motion.div 
            className="relative text-center z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Rocket className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">Join 5,000+ contractors today</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Ready to transform your contract workflow?
            </h2>
            <p className="text-xl md:text-2xl text-indigo-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of contractors who are managing contracts smarter and getting paid faster. Start your free trial today.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="text-lg px-10 py-7 bg-white text-indigo-600 hover:bg-gray-50 shadow-2xl hover:shadow-3xl transition-all font-bold group rounded-xl"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-10 py-7 border-3 border-white/40 text-white hover:bg-white/20 backdrop-blur-sm font-bold rounded-xl"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-indigo-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative border-t-2 border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Pay2Start
                </span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md text-base leading-relaxed">
                Professional contract management platform for contractors. Streamline workflows, get paid faster, and grow your business.
              </p>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg shadow-sm">
                  <Shield className="h-4 w-4 text-indigo-400" />
                  <span className="text-sm font-medium text-slate-300">Secure</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-slate-300">Compliant</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg shadow-sm">
                  <Award className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-slate-300">Trusted</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Built with</span>
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                <span>by</span>
                <Link href="/about" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Melvin Peralta
                </Link>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Product</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/pricing" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Pricing</span>
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Sign In</span>
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Get Started</span>
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Features</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Company</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/about" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>About</span>
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Blog</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Careers</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Contact</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Resources</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Documentation</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Support</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Security</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>API</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="pt-8 border-t-2 border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-sm text-slate-400">
                  © {new Date().getFullYear()} <span className="font-semibold text-white">Pay2Start</span>. All rights reserved.
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium">Privacy Policy</a>
                  <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium">Terms of Service</a>
                  <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium">Cookie Policy</a>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500 transition-all shadow-sm hover:shadow-md">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500 transition-all shadow-sm hover:shadow-md">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500 transition-all shadow-sm hover:shadow-md">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Newsletter Signup */}
            <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-6 border-2 border-slate-700">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white mb-1 text-lg">Stay Updated</h4>
                  <p className="text-sm text-slate-400">Get the latest features and updates delivered to your inbox.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 md:w-64 px-4 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
                  />
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

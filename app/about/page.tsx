"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Target, Lightbulb, Users, Code, Rocket, Coffee } from "lucide-react";
import { motion } from "framer-motion";
import { PublicNav } from "@/components/navigation/public-nav";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <PublicNav />

      {/* Hero Section */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-8 shadow-2xl mx-auto"
            animate={{ 
              boxShadow: [
                "0 20px 25px -5px rgba(99, 102, 241, 0.3), 0 10px 10px -5px rgba(99, 102, 241, 0.2)",
                "0 25px 50px -12px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.1)",
                "0 20px 25px -5px rgba(99, 102, 241, 0.3), 0 10px 10px -5px rgba(99, 102, 241, 0.2)",
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="text-5xl font-bold text-white">MP</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Hi, I&apos;m <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Melvin Peralta</span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-slate-300 mb-8 font-medium">
            The creator behind Pay2Start
          </p>

          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12">
            I built Pay2Start because I saw contractors struggling with the same problems I faced: 
            endless paperwork, slow payments, and the constant juggle of managing contracts manually.
          </p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="bg-slate-800 rounded-3xl p-12 shadow-2xl border-2 border-slate-700"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-red-400" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">My Story</h2>
          </div>

          <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
            <p>
              As a developer who worked closely with contractors, I watched them spend hours creating contracts, 
              chasing signatures through email threads, and waiting weeks—sometimes months—to get paid. I saw the 
              frustration, the lost opportunities, and the stress that came with managing everything manually.
            </p>

            <p>
              <strong className="text-white">I knew there had to be a better way.</strong>
            </p>

            <p>
              That&apos;s when I decided to build Pay2Start—a platform that would solve these problems once and for all. 
              I wanted to create something that would save contractors time, help them get paid faster, and give them 
              peace of mind knowing their contracts and payments were handled securely.
            </p>

            <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-6 border-l-4 border-indigo-500 my-8">
              <p className="text-slate-200 font-medium italic">
                &quot;Every feature in Pay2Start was built with one goal in mind: to make contractors&apos; lives easier. 
                Because when you&apos;re focused on your craft, you shouldn&apos;t have to worry about paperwork.&quot;
              </p>
              <p className="text-right mt-4 text-slate-400">— Melvin Peralta</p>
            </div>

            <p>
              Today, Pay2Start is helping thousands of contractors streamline their workflows, get paid faster, 
              and focus on what they do best—building, creating, and serving their clients. And that&apos;s exactly 
              what I set out to achieve.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            What Drives Me
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            The principles that guide everything I build
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: "Solve Real Problems",
              description: "I build solutions for real challenges that contractors face every day. No fluff, just tools that actually work.",
              color: "from-indigo-500 to-blue-500",
            },
            {
              icon: Heart,
              title: "Put People First",
              description: "Every decision is made with contractors in mind. Your success is what drives me to keep improving Pay2Start.",
              color: "from-pink-500 to-red-500",
            },
            {
              icon: Rocket,
              title: "Never Stop Improving",
              description: "I'm constantly listening to feedback and adding features that make your workflow even better. This is just the beginning.",
              color: "from-purple-500 to-indigo-500",
            },
          ].map((value, index) => (
            <motion.div
              key={index}
              className="bg-slate-800 rounded-2xl p-8 border-2 border-slate-700 hover:border-indigo-500 hover:shadow-xl transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -4 }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 shadow-lg`}>
                <value.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
              <p className="text-slate-400 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Personal Touch Section */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-8">
            <Coffee className="h-12 w-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">A Personal Note</h2>
          </div>

          <div className="space-y-6 text-lg leading-relaxed text-white/90 max-w-3xl mx-auto">
            <p>
              Building Pay2Start has been one of the most rewarding experiences of my career. Every time I hear 
              from a contractor who&apos;s saved hours of work or gotten paid faster because of the platform, it reminds 
              me why I started this journey.
            </p>

            <p>
              I&apos;m not just building software—I&apos;m building a tool that helps real people run their businesses better. 
              That&apos;s what gets me up every morning, coding, designing, and constantly thinking about how to make 
              Pay2Start even better.
            </p>

            <p className="font-semibold text-xl mt-8">
              If you&apos;re a contractor reading this, know that I built Pay2Start for you. Your feedback, your stories, 
              and your success are what keep me going.
            </p>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Let&apos;s Build Something Together
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Have feedback, ideas, or just want to say hi? I&apos;d love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button 
                size="lg" 
                className="text-base px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl hover:shadow-2xl transition-all font-semibold"
              >
                Try Pay2Start Free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button 
                size="lg" 
                variant="outline"
                className="text-base px-8 py-6 border-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 hover:text-white font-semibold"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-800 bg-slate-900 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-slate-400 mb-4">
              Built with ❤️ by <span className="font-semibold text-white">Melvin Peralta</span>
            </p>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Pay2Start. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


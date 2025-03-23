'use client';

import { MessageCircle, ArrowRight, ChevronsRight, Shield, Zap, Layers, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import ViewExperienceTip from '@/components/ViewExperienceTip';

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    setIsLargeScreen(window.innerWidth >= 1024);

    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-zinc-900 via-zinc-900 to-black overflow-x-hidden">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-900/70 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-9 sm:w-9 bg-gradient-to-tr from-indigo-500 to-fuchsia-600 rounded-lg flex items-center justify-center transform rotate-6">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white transform -rotate-6" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-white">
              Anony<span className="text-indigo-400">Exchange</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {session ? (
              <Button
                className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700/50 text-sm sm:text-base py-1 px-3 sm:px-4"
                onClick={() => router.push('/dashboard')}
              >
                Dashboard
                <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm sm:text-base py-1 px-2 sm:px-3"
                  onClick={() => router.push('/sign-in')}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm sm:text-base py-1 px-2 sm:px-3"
                  onClick={() => router.replace('/sign-up')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative py-12 sm:py-24 overflow-hidden px-4 sm:px-6">
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-20 right-1/4 w-64 h-64 bg-indigo-900 rounded-full mix-blend-multiply filter blur-[80px]"></div>
            <div className="absolute bottom-40 left-1/4 w-72 h-72 bg-fuchsia-900 rounded-full mix-blend-multiply filter blur-[100px]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-900 rounded-full mix-blend-multiply filter blur-[120px]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 lg:pr-8 w-full">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                    when: "beforeChildren"
                  }}
                  className="mb-6"
                >
                  <span className="px-3 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                    Beta • Free to Use
                  </span>
                </motion.div>

                <motion.h1
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: isLargeScreen ? 0.8 : 0.6,
                    delay: 0.1,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="text-4xl lg:text-6xl font-extrabold tracking-tight text-white mb-6"
                >
                  Exchange <span className="text-indigo-500">authentic thoughts</span> with zero barriers
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: isLargeScreen ? 0.8 : 0.6,
                    delay: isLargeScreen ? 0.3 : 0.2,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="text-lg text-zinc-400 mb-8 max-w-lg"
                >
                  Break down communication walls and faster genuine connections. AnonyExchange creates a safe space for honest dialogue that traditional platforms can't offer.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: isLargeScreen ? 0.5 : 0.3,
                    type: "spring",
                    stiffness: isLargeScreen ? 80 : 100,
                    damping: isLargeScreen ? 15 : 10
                  }}
                  className="flex flex-wrap gap-4 mb-12"
                >
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-lg px-4 py-6 rounded-xl"
                    onClick={() => router.push('/sign-up')}
                  >
                    Start Now
                    <ChevronsRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:bg-zinc-800/50 hover:text-white text-lg px-4 py-6 rounded-xl"
                    onClick={() => router.push('/questions')}
                  >
                    View Demo
                  </Button>
                </motion.div>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-zinc-400">
                  {[
                    {
                      icon: <svg className="w-6 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>,
                      text: "No account required to send"
                    },
                    {
                      icon: <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>,
                      text: "End-to-end encrypted"
                    },
                    {
                      icon: <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>,
                      text: "active users"
                    }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: isLargeScreen ? 0.5 : 0.3,
                        delay: isLargeScreen ? 0.6 + (i * 0.15) : 0.4 + (i * 0.1),
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      className="flex items-center gap-2"
                    >
                      {item.icon}
                      <span>{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: isLargeScreen ? 60 : 80,
                  damping: isLargeScreen ? 20 : 15,
                  delay: isLargeScreen ? 0.3 : 0.2,
                  mass: isLargeScreen ? 1.2 : 1
                }}
                className="lg:w-1/2 mt-16 lg:mt-0 w-full"
              >
                <div className="relative max-w-md mx-auto">
                  <div className="bg-zinc-800/70 backdrop-blur-sm border border-zinc-700/50 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10">
                    <div className="bg-zinc-900/90 px-4 py-3 flex items-center gap-2 border-b border-zinc-800">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="mx-auto text-zinc-500 text-xs font-mono">anonymous-messages.app</div>
                    </div>

                    <div className="p-5">
                      <div className="mb-6 flex justify-between items-center">
                        <h3 className="text-white font-medium">Your Messages</h3>
                        <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full">3 New</span>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                                A
                              </div>
                              <span className="text-zinc-400 text-sm">Anonymous</span>
                            </div>
                            <span className="text-xs text-zinc-500">Just now</span>
                          </div>
                          <p className="text-white text-sm mb-3">I'm curious about your approach to public speaking. Do you have any tips for someone who's just starting out?</p>
                          <div className="flex justify-end">
                            <button className="text-xs px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-full">
                              Reply
                            </button>
                          </div>
                        </div>

                        <div className="bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                                A
                              </div>
                              <span className="text-zinc-400 text-sm">Anonymous</span>
                            </div>
                            <span className="text-xs text-zinc-500">Yesterday</span>
                          </div>
                          <p className="text-white text-sm mb-2">Any advice for someone just starting in this field? I've been following your work for a while.</p>

                          <div className="mt-3 pl-4 border-l-2 border-indigo-500/30">
                            <div className="mb-2 flex items-center gap-2">
                              <span className="text-indigo-400 text-sm font-medium">You</span>
                              <span className="text-xs text-zinc-500">12h ago</span>
                            </div>
                            <p className="text-zinc-300 text-sm">Start with small projects and share your work publicly. That's how I grew my skills!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -z-10 -bottom-6 -right-6 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl"></div>
                  <div className="absolute -z-10 -top-6 -left-6 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-xl"></div>

                  <motion.div
                    initial={{ x: 20, y: -20, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 12,
                      delay: 1
                    }}
                    className="absolute -top-4 -right-4 bg-white p-3 rounded-lg shadow-lg transform rotate-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-3 h-3 text-white" />
                      </div>
                      <div className="text-xs">
                        <p className="text-gray-900 font-medium">New message!</p>
                        <p className="text-gray-500">from anonymous</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 z-0">
            <div className="absolute h-32 w-full bg-gradient-to-b from-zinc-900 to-transparent top-0"></div>
            <div className="absolute h-32 w-full bg-gradient-to-t from-zinc-900 to-transparent bottom-0"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-indigo-500 font-semibold tracking-wider uppercase text-sm">Features</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mt-3 mb-6">Designed for real conversations that matter</h2>
              <p className="text-zinc-400 text-lg">Our platform eliminates social barriers while maintaining the human connection that makes authentic exchanges valuable.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {[
                {
                  icon: Shield,
                  title: "100% Anonymous",
                  description: "Express yourself freely without identity concerns. We've engineered our platform for complete sender anonymity.",
                  color: "from-blue-600 to-indigo-600"
                },
                {
                  icon: MessageCircle,
                  title: "Two-way Conversation",
                  description: "Unlike other platforms, you can respond to anonymous messages, creating real dialogue.",
                  color: "from-violet-600 to-purple-600"
                },
                {
                  icon: Zap,
                  title: "Instant Delivery",
                  description: "Messages are delivered instantly with optional notifications so you never miss anything.",
                  color: "from-fuchsia-600 to-pink-600"
                },
                {
                  icon: Layers,
                  title: "Organized Dashboard",
                  description: "Easily manage and organize all your messages in one intuitive interface.",
                  color: "from-cyan-600 to-blue-600"
                },
                {
                  icon: Upload,
                  title: "Easy Sharing",
                  description: "Share your unique profile link anywhere - social media, email, or business card.",
                  color: "from-emerald-600 to-teal-600"
                },
                {
                  icon: Shield,
                  title: "Content Moderation",
                  description: "AI moderation helps filter out inappropriate content for a safer experience.",
                  color: "from-amber-600 to-orange-600"
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: i * 0.4 }}
                  className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-xl overflow-hidden hover:border-zinc-600/50 hover:bg-zinc-800/50 transition-all duration-300"
                >
                  <div className="p-6">
                    <div className={`w-12 h-12 rounded-xl mb-5 bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-zinc-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-zinc-900/50 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-indigo-500 font-semibold tracking-wider uppercase text-sm">Get Started</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mt-3 mb-6">Three simple steps</h2>
              <p className="text-zinc-400 text-lg">Begin receiving anonymous messages in just minutes</p>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute left-0 right-0 top-24 h-0.5 bg-zinc-800"></div>

              <div className="grid md:grid-cols-3 gap-12">
                {[
                  {
                    step: 1,
                    title: "Create an account",
                    description: "Sign up for free using your email. No credit card required to start."
                  },
                  {
                    step: 2,
                    title: "Share your unique link",
                    description: "Get your personalized URL to share with friends, colleagues, or your audience."
                  },
                  {
                    step: 3,
                    title: "Receive & respond",
                    description: "Get notified of new messages and reply to create meaningful conversations."
                  }
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, delay: i * 0.3 }}
                    className="flex flex-col items-center text-center relative"
                  >
                    <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-6 z-10">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                    <p className="text-zinc-400">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 relative overflow-hidden  bg-zinc-900/50">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/3 aspect-square rounded-full opacity-10 blur-[120px]"></div>
          </div>

          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-gradient-to-b from-zinc-900 to-zinc-900/80 border border-zinc-800 rounded-2xl p-8 md:p-12 backdrop-blur-sm shadow-xl"
            >
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to experience true communication freedom?
                </h2>
                <p className="text-lg text-zinc-400 mb-8 max-w-xl mx-auto">
                  Join the community where authenticity thrives and discover insights you never knew existed
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-5 sm:py-6 px-4 rounded-xl"
                    onClick={() => router.push('/sign-up')}
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <Button
                    variant="outline"
                    className="border-zinc-700 hover:border-zinc-600 text-zinc-500 py-5 sm:py-6 px-4 rounded-xl"
                    onClick={() => router.push('/questions')}
                  >
                    View Example Messages
                  </Button>
                </div>

                <p className="text-sm text-zinc-500">
                  No credit card required • Free tier includes unlimited messages
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-zinc-900 border-t border-zinc-800/50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-tr from-indigo-500 to-fuchsia-600 rounded-lg flex items-center justify-center transform rotate-6">
                <MessageCircle className="w-4 h-4 text-white transform -rotate-6" />
              </div>
              <span className="text-lg font-medium text-white">
                Anony<span className="text-indigo-400">Exchange</span>
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
              <Link href="/" className="text-zinc-400 hover:text-indigo-400 transition-colors">Privacy</Link>
              <Link href="/" className="text-zinc-400 hover:text-indigo-400 transition-colors">Terms</Link>
              <Link href="/" className="text-zinc-400 hover:text-indigo-400 transition-colors">Support</Link>
              <Link href="/" className="text-zinc-400 hover:text-indigo-400 transition-colors">About</Link>
            </div>

            <p className="text-zinc-500 text-sm">
              © 2025 AnonyExchange
            </p>
          </div>
        </div>
      </footer>
      <ViewExperienceTip />
    </div>
  );
}
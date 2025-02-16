'use client';

import { Mail, Send, Lock, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import messages from '@/messages.json';
import Autoplay from 'embla-carousel-autoplay';
import { FC, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface FeatureCardProps {
  icon: FC<{ className?: string }>;
  title: string;
  description: string;
}

const FeatureCard: FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
  <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 transition-all duration-500 border border-white/10">
    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-5 rounded-2xl mb-6">
      <Icon className="w-8 h-8 text-blue-400" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
      {title}
    </h3>
    <p className="text-gray-400 text-lg leading-relaxed">{description}</p>
  </div>
);

export default function Home() {
  const router = useRouter();
  const plugin = useRef(Autoplay({ delay: 3000 }));

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-start px-6 md:px-24 py-16 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#1a1f2e] to-black relative overflow-hidden">
        {/* Grid Background */}
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />

        {/* Hero Section */}
        <section className="text-center mb-24 mt-12 max-w-4xl relative z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-3xl -z-10" />
          <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
            Dive into the World of Anonymous Feedback
          </h1>
          <p className="mt-8 text-2xl text-gray-300 font-light">
            Where your thoughts flow freely and securely.
          </p>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-10 w-full max-w-6xl mb-24">
          <FeatureCard 
            icon={Lock} 
            title="100% Anonymous" 
            description="Share your thoughts freely without revealing your identity" 
          />
          <FeatureCard 
            icon={MessageCircle} 
            title="Real-time Feedback" 
            description="Instant delivery of your messages to the intended recipient" 
          />
          <FeatureCard 
            icon={Send} 
            title="Easy Sharing" 
            description="Simple and intuitive interface for sending feedback" 
          />
        </section>

        {/* Messages Carousel */}
        <div className="w-full max-w-xl mb-24">
          <Carousel plugins={[plugin.current]}>
            <CarouselContent>
              {messages.map((message, index) => (
                <CarouselItem key={index} className="p-2">
                  <div className="p-1">
                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl">
                      <CardHeader>
                        <CardTitle className="text-xl text-white flex items-center gap-3">
                          <Mail className="w-6 h-6 text-blue-400" /> 
                          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {message.title}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300">{message.content}</p>
                        <p className="text-sm text-gray-500 mt-2">{message.received}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* CTA Section */}
        <section className="mt-8 text-center relative z-10 w-full max-w-4xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl -z-10" />
          <h2 className="text-4xl font-bold text-white mb-10 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Start Sharing Anonymous Feedback Today
          </h2>
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-10 py-7 text-lg rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-[0_0_20px_rgba(66,153,225,0.5)] hover:shadow-[0_0_25px_rgba(66,153,225,0.8)] hover:-translate-y-1"
            onClick={() => router.replace('/sign-up')}
          >
            Get Started Now
          </Button>
        </section>
      </main>
    </div>
  );
}
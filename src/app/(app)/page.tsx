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

import { FC } from 'react';

interface FeatureCardProps {
  icon: FC<{ className?: string }>;
  title: string;
  description: string;
}

const FeatureCard: FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center text-center shadow-lg hover:scale-105 transition-transform duration-300">
    <div className="bg-white/20 p-4 rounded-full mb-4 shadow-md">
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="text-2xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-300 text-lg">{description}</p>
  </div>
);

export default function Home() {
  return (
    <main className="flex-grow flex flex-col items-center justify-start px-6 md:px-24 py-16 bg-gradient-to-b from-gray-900 via-[#1a2436] to-black min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <section className="text-center mb-16 mt-12 max-w-4xl relative" style={{ marginTop: '6rem' }}>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-purple-200 animate-pulse ">
          Dive into the World of Anonymous Feedback
        </h1>
        <p className="mt-6 text-2xl text-gray-300">True Feedback - Where your identity remains a secret.</p>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8 w-full max-w-5xl mb-16">
        <FeatureCard icon={Lock} title="100% Anonymous" description="Share your thoughts freely without revealing your identity" />
        <FeatureCard icon={MessageCircle} title="Real-time Feedback" description="Instant delivery of your messages to the intended recipient" />
        <FeatureCard icon={Send} title="Easy Sharing" description="Simple and intuitive interface for sending feedback" />
      </section>

      {/* Testimonials Carousel */}
      <Carousel
        className="w-full max-w-lg mb-16"
        opts={{ align: 'start', loop: true }}
        plugins={[Autoplay({ delay: 2500 })]}
      >
        <CarouselContent>
          {messages.map((message, index) => (
            <CarouselItem key={index}>
              <Card className="bg-white/10 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Mail className="w-6 h-6" /> Message from {message.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300 text-lg">
                  <p>{message.content}</p>
                  <p className="text-sm text-gray-400 mt-4">{message.received}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* CTA Section */}
      <section className="mt-8 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl -z-10" />
        <h2 className="text-4xl font-bold text-white mb-8">Start Sharing Anonymous Feedback Today</h2>
        <Button
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-6 text-lg rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          onClick={() => window.location.href = '/sign-up'}
        >
          Get Started
        </Button>
      </section>
    </main>
  );
}

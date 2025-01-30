'use client';

import { Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Autoplay from 'embla-carousel-autoplay';
import messages from '@/messages.json';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (

    <main className="flex-grow flex flex-col items-center justify-start px-4 md:px-24 py-24 bg-gradient-to-b from-gray-800 via-[#8793ac] to-black min-h-screen">
      <section className="text-center mb-16 mt-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Dive into the World of Anonymous Feedback
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          True Feedback - Where your identity remains a secret.
        </p>
      </section>

      <Carousel
        plugins={[Autoplay({ delay: 2000 })]}
        className="w-full max-w-md"
      >
        <CarouselContent>
          {messages.map((message, index) => (
            <CarouselItem key={index}>
              <Card className="bg-white rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">
                    Message from {message.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-start space-x-4">
                  <Mail className="flex-shrink-0 text-gray-600" />
                  <div>
                    <p className="text-gray-700">{message.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {message.received}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <section className="mt-24 text-center">
        <h2 className="text-3xl font-bold text-white mb-8">Start Sharing Anonymous Feedback Today</h2>
        <Button
          className="bg-gradient-to-r from-[#1a1f2e] to-[#8793ac] text-white font-semibold px-8 py-3 hover:from-[#8793ac] hover:to-[#1a1f2e] transition-all duration-300"
          onClick={() => window.location.href = '/sign-up'}
        >
          Get Started
        </Button>
      </section>
    </main>
  );
}
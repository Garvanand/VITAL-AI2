'use client';

import { HomeLoginStyleBackground } from '@/components/gradients/home-login-style-background';
import { Footer } from '@/components/home/footer/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Heart, Shield, Sparkles, Users, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function AboutPage() {
  return (
    <div className="min-h-screen">
      <HomeLoginStyleBackground />

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-8 relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text mb-4">
          About VitalAI
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Empowering individuals to take control of their health through AI-powered insights, personalized
          recommendations, and preventive care.
        </p>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <Card className="bg-background/80 backdrop-blur-md border-0 shadow-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 md:p-10">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-6">
                VitalAI aims to make preventive healthcare accessible to everyone by providing personalized insights,
                early warning indicators, and lifestyle recommendations that help users maintain optimal health and
                prevent potential issues before they arise.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Personalized Healthcare</h3>
                    <p className="text-sm text-muted-foreground">Tailored health insights based on your unique data.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Preventive Focus</h3>
                    <p className="text-sm text-muted-foreground">
                      Identify potential health issues before they become serious.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Holistic Approach</h3>
                    <p className="text-sm text-muted-foreground">
                      Integrating fitness, nutrition, and mental wellbeing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 bg-gradient-to-br from-indigo-500 to-cyan-500 relative h-[300px] md:h-auto">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="text-white text-center">
                  <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-90" />
                  <blockquote className="text-xl font-medium italic">
                    "Empowering healthier lives through AI-driven preventive care."
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Values */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <h2 className="text-2xl font-bold text-center mb-8">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Care</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We put users' health and wellbeing at the center of everything we do, creating features that truly
                improve lives.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Trust</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We maintain the highest standards of data privacy and security, ensuring your health information remains
                protected.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Innovation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We constantly explore new technologies and approaches to provide cutting-edge solutions for preventive
                healthcare.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <Card className="bg-background/80 backdrop-blur-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Our Team</CardTitle>
            <CardDescription>Passionate experts dedicated to revolutionizing healthcare</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap justify-center gap-8">
              {/* Team Member 1 */}
              <div className="text-center w-[180px]">
                <div className="rounded-full bg-gradient-to-b from-indigo-200 to-indigo-400 w-[120px] h-[120px] mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-indigo-900/50" />
                </div>
                <h3 className="font-medium">Dr. Samantha Chen</h3>
                <p className="text-sm text-muted-foreground">Chief Medical Officer</p>
              </div>

              {/* Team Member 2 */}
              <div className="text-center w-[180px]">
                <div className="rounded-full bg-gradient-to-b from-cyan-200 to-cyan-400 w-[120px] h-[120px] mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-cyan-900/50" />
                </div>
                <h3 className="font-medium">Alex Rodriguez</h3>
                <p className="text-sm text-muted-foreground">Chief Technology Officer</p>
              </div>

              {/* Team Member 3 */}
              <div className="text-center w-[180px]">
                <div className="rounded-full bg-gradient-to-b from-purple-200 to-purple-400 w-[120px] h-[120px] mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-purple-900/50" />
                </div>
                <h3 className="font-medium">Maya Patel</h3>
                <p className="text-sm text-muted-foreground">Head of AI Research</p>
              </div>

              {/* Team Member 4 */}
              <div className="text-center w-[180px]">
                <div className="rounded-full bg-gradient-to-b from-green-200 to-green-400 w-[120px] h-[120px] mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-green-900/50" />
                </div>
                <h3 className="font-medium">James Wilson</h3>
                <p className="text-sm text-muted-foreground">Chief Product Officer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <Card className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
            <p className="mb-6 text-white/90 max-w-2xl mx-auto">
              Join VitalAI today and discover how our AI-powered platform can help you achieve your health and fitness
              goals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary">
                Sign Up Free
              </Button>
              <Link href="/help/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-white/10"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Footer />
      </div>
    </div>
  );
}

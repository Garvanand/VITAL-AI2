'use client';

import { HomeLoginStyleBackground } from '@/components/gradients/home-login-style-background';
import { Footer } from '@/components/home/footer/footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function FAQPage() {
  return (
    <div className="min-h-screen">
      <HomeLoginStyleBackground />
      <div className="container mx-auto px-4 py-16 relative z-10">
        <Card className="bg-background/80 backdrop-blur-md border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
              Frequently Asked Questions
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Find answers to the most common questions about VitalAI
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-medium">What is VitalAI?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  VitalAI is an AI-powered health and fitness platform that serves as your personalized healthcare
                  helper and preventive care companion. The platform helps users proactively monitor their health
                  metrics, track workouts, manage nutrition, and get personalized recipe suggestions.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-medium">
                  How does VitalAI help with preventive healthcare?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  VitalAI provides early warning indicators for potential health issues, personalized health insights
                  based on your metrics, trend analysis to detect changes in your health patterns, and proactive
                  recommendations for maintaining optimal health.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-medium">
                  How accurate are the AI recommendations?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Our AI recommendations are based on the latest health and fitness research, combined with your
                  personal data. While they are designed to be helpful and accurate, they should not replace
                  professional medical advice. Always consult with healthcare professionals for important health
                  decisions.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-medium">How is my health data protected?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We take your privacy seriously. All health data is encrypted and stored securely. We never share your
                  personal health information with third parties without your explicit consent. You can review our
                  privacy policy for more details on how we protect your data.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-medium">
                  Can I use VitalAI with my fitness tracker?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, VitalAI integrates with Google Fit, allowing you to import data from compatible fitness trackers.
                  We are working on adding support for more fitness tracking platforms in the future.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-lg font-medium">
                  How do I customize my workout recommendations?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You can customize your workout recommendations by updating your fitness level, available equipment,
                  and fitness goals in your profile settings. The AI will use this information to generate personalized
                  workout plans tailored to your specific needs.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-7">
                <AccordionTrigger className="text-lg font-medium">Are the Indian recipes authentic?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, our Indian recipe suggestions are powered by Google's Gemini API and are designed to be
                  authentic. You can filter by diet type, meal type, and even spice level to find recipes that match
                  your preferences.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-8">
                <AccordionTrigger className="text-lg font-medium">Is there a free trial available?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, we offer a free tier with basic features. You can upgrade to our premium plans to access advanced
                  features such as personalized AI health insights, detailed nutrition analysis, and more comprehensive
                  workout recommendations.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}

'use client';

import { HomeLoginStyleBackground } from '@/components/gradients/home-login-style-background';
import { Footer } from '@/components/home/footer/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Book, FileText, LifeBuoy, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export function SupportPage() {
  return (
    <div className="min-h-screen">
      <HomeLoginStyleBackground />
      <div className="container mx-auto px-4 py-16 relative z-10">
        <Card className="bg-background/80 backdrop-blur-md border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
              Support Center
            </CardTitle>
            <CardDescription className="text-muted-foreground">Get the help you need with VitalAI</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="help" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="help">Help Resources</TabsTrigger>
                <TabsTrigger value="guides">Guides</TabsTrigger>
                <TabsTrigger value="contact">Contact Support</TabsTrigger>
              </TabsList>
              <TabsContent value="help" className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <FileText className="h-5 w-5 text-primary" />
                        Knowledge Base
                      </CardTitle>
                      <CardDescription>Find articles on common issues and solutions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• Setting up your profile</li>
                        <li>• Tracking workouts and nutrition</li>
                        <li>• Understanding health metrics</li>
                        <li>• Account and billing</li>
                      </ul>
                      <Button variant="outline" className="w-full mt-4 gap-1">
                        Browse Articles
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Community
                      </CardTitle>
                      <CardDescription>Connect with other users and experts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• Ask questions</li>
                        <li>• Share your success stories</li>
                        <li>• Get tips from experienced users</li>
                        <li>• Participate in challenges</li>
                      </ul>
                      <Button variant="outline" className="w-full mt-4 gap-1">
                        Join Community
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <LifeBuoy className="h-5 w-5 text-primary" />
                        Live Support
                      </CardTitle>
                      <CardDescription>Get help from our support team</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-muted-foreground mb-4">
                        <p>Our support team is available:</p>
                        <p className="mt-2">Monday - Friday: 9 AM - 8 PM EST</p>
                        <p>Saturday - Sunday: 10 AM - 6 PM EST</p>
                      </div>
                      <Button className="w-full gap-1">
                        Start Live Chat
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Book className="h-5 w-5 text-primary" />
                        FAQ
                      </CardTitle>
                      <CardDescription>Frequently asked questions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-muted-foreground mb-4">
                        <p>Find quick answers to common questions about using VitalAI, subscription plans, and more.</p>
                      </div>
                      <Link href="/help/faq">
                        <Button variant="outline" className="w-full gap-1">
                          View FAQ
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="guides" className="pt-6">
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Getting Started with VitalAI</CardTitle>
                      <CardDescription>A comprehensive guide to help you get the most out of VitalAI</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border-b pb-2">
                          <h3 className="font-medium mb-1">1. Setting Up Your Account</h3>
                          <p className="text-muted-foreground text-sm">
                            Complete your profile, set your goals, and configure your preferences.
                          </p>
                        </div>

                        <div className="border-b pb-2">
                          <h3 className="font-medium mb-1">2. Tracking Your Health Metrics</h3>
                          <p className="text-muted-foreground text-sm">
                            Learn how to record and monitor your health data effectively.
                          </p>
                        </div>

                        <div className="border-b pb-2">
                          <h3 className="font-medium mb-1">3. Workout Planning</h3>
                          <p className="text-muted-foreground text-sm">
                            Get personalized workout recommendations and track your progress.
                          </p>
                        </div>

                        <div className="border-b pb-2">
                          <h3 className="font-medium mb-1">4. Nutrition Tracking</h3>
                          <p className="text-muted-foreground text-sm">
                            Log your meals, track macros, and discover healthy recipes.
                          </p>
                        </div>

                        <div>
                          <h3 className="font-medium mb-1">5. Understanding Your Health Insights</h3>
                          <p className="text-muted-foreground text-sm">
                            Interpret your personalized AI health recommendations.
                          </p>
                        </div>
                      </div>

                      <Button className="w-full mt-6 gap-1">
                        Read Full Guide
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Workout Optimization</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm mb-4">
                          Learn how to get the most effective workouts based on your goals and equipment.
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          View Guide
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Nutrition Planning</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm mb-4">
                          Discover how to plan your meals and track nutrition for optimal health.
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          View Guide
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Health Monitoring</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm mb-4">
                          Track vital health metrics and understand what they mean for your wellbeing.
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          View Guide
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="pt-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Contact Support</CardTitle>
                    <CardDescription>Our team is here to help with any questions or issues</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Support Hours</h3>
                        <div className="text-muted-foreground">
                          <p>Monday - Friday: 9 AM - 8 PM EST</p>
                          <p>Saturday - Sunday: 10 AM - 6 PM EST</p>
                        </div>

                        <h3 className="text-lg font-medium mt-6 mb-2">Contact Methods</h3>
                        <div className="space-y-3 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <p>Live Chat (Fastest Response)</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-primary"
                            >
                              <rect x="2" y="4" width="20" height="16" rx="2" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                            <p>Email: support@vitalaihub.com</p>
                          </div>
                        </div>

                        <Link href="/help/contact">
                          <Button className="mt-6 gap-1">
                            Contact Form
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Before You Contact Us</h3>
                        <p className="text-muted-foreground mb-4">
                          You may find quick answers to your questions in our resources:
                        </p>

                        <div className="space-y-3">
                          <Link href="/help/faq" className="block">
                            <Button variant="outline" size="sm" className="w-full justify-start">
                              <FileText className="h-4 w-4 mr-2" />
                              FAQ
                            </Button>
                          </Link>

                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Book className="h-4 w-4 mr-2" />
                            Knowledge Base
                          </Button>

                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 mr-2"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 16v-4" />
                              <path d="M12 8h.01" />
                            </svg>
                            Troubleshooting
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}

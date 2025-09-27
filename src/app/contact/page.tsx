import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, ArrowLeft, Phone, Mail, MapPin, Clock, Send, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <Link href="/" className="text-2xl font-bold text-gray-900">
                T.G.'s Tires
              </Link>
            </div>
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about our tire marketplace? Need help with your account? We're here to help!
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      placeholder="Smith"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="account">Account Support</SelectItem>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing Question</SelectItem>
                      <SelectItem value="seller">Seller Support</SelectItem>
                      <SelectItem value="buyer">Buyer Support</SelectItem>
                      <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your question or concern in detail..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full btn-gradient-primary">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>

                <p className="text-sm text-gray-600">
                  We typically respond within 24 hours during business days.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>
                    Multiple ways to reach our support team.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Phone Support</h3>
                      <p className="text-gray-600">(217) 555-0123</p>
                      <p className="text-sm text-gray-500">Mon-Fri 8AM-6PM CST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Email Support</h3>
                      <p className="text-gray-600">support@tgstires.com</p>
                      <p className="text-sm text-gray-500">Response within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Business Address</h3>
                      <p className="text-gray-600">
                        456 Tire Street<br />
                        Springfield, IL 62701
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Business Hours</h3>
                      <div className="text-gray-600 text-sm space-y-1">
                        <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                        <p>Saturday: 8:00 AM - 4:00 PM</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Help */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Help</CardTitle>
                  <CardDescription>
                    Common questions and helpful resources.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-medium">For Sellers:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• How to create tire listings</li>
                      <li>• Setting up payment methods</li>
                      <li>• Managing your inventory</li>
                      <li>• Understanding seller fees</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">For Buyers:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• How to search for tires</li>
                      <li>• Making secure payments</li>
                      <li>• Contacting sellers</li>
                      <li>• Return and refund policies</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Technical Support:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Account login issues</li>
                      <li>• Password reset help</li>
                      <li>• Mobile app support</li>
                      <li>• Payment processing problems</li>
                    </ul>
                  </div>

                  <Button variant="outline" className="w-full mt-4">
                    View FAQ Center
                  </Button>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-800">Emergency Support</CardTitle>
                  <CardDescription className="text-orange-700">
                    For urgent account security issues.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-orange-800 mb-3">
                    If you suspect unauthorized access to your account or fraudulent activity, contact us immediately:
                  </p>
                  <div className="space-y-2">
                    <p className="font-medium text-orange-900">Emergency Hotline: (217) 555-0199</p>
                    <p className="text-sm text-orange-700">Available 24/7 for security issues</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 mb-4 md:mb-0">
              © 2024 T.G.'s Tires. Professional tire marketplace.
            </div>
            <div className="flex space-x-6 text-gray-600">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
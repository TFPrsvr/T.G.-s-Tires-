import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: 'Attributions - T.G.\'s Tires',
  description: 'Icon and asset attributions for T.G.\'s Tires marketplace platform.',
};

export default function AttributionsPage() {
  const attributions = [
    {
      item: "Car Icon",
      creator: "Fasobrun Jamil",
      source: "Noun Project",
      url: "https://thenounproject.com/browse/icons/term/car/",
      license: "CC BY 3.0"
    },
    {
      item: "Sign Icon",
      creator: "Bluetip Design",
      source: "Noun Project",
      url: "https://thenounproject.com/browse/icons/term/sign/",
      license: "CC BY 3.0"
    },
    {
      item: "Tire Rim Icon",
      creator: "Alone forever",
      source: "Noun Project",
      url: "https://thenounproject.com/browse/icons/term/tire-rim/",
      license: "CC BY 3.0"
    },
    {
      item: "Home Icon",
      creator: "Dwi Budiyanto",
      source: "Noun Project",
      url: "https://thenounproject.com/browse/icons/term/home/",
      license: "CC BY 3.0"
    },
    {
      item: "See Icon",
      creator: "suib icon",
      source: "Noun Project",
      url: "https://thenounproject.com/browse/icons/term/see/",
      license: "CC BY 3.0"
    },
    {
      item: "US Dollar Currency Icon",
      creator: "Fahrul Oktaviana",
      source: "Noun Project",
      url: "https://thenounproject.com/browse/icons/term/us-dollar-currency/",
      license: "CC BY 3.0"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">T.G.&apos;s Tires</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Attributions</h1>
            <p className="text-lg text-gray-600">
              We acknowledge and thank the creators of icons and assets used in T.G.&apos;s Tires marketplace platform.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Icon Attributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {attributions.map((attribution, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{attribution.item}</h3>
                        <p className="text-sm text-gray-600">
                          by <span className="font-medium">{attribution.creator}</span> from{" "}
                          <span className="font-medium">{attribution.source}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          License: {attribution.license}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <a
                          href={attribution.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                        >
                          View Source
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>License Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <h4 className="font-semibold text-gray-900 mb-2">Creative Commons Attribution (CC BY 3.0)</h4>
                  <p className="text-gray-600 mb-4">
                    This license allows others to distribute, remix, adapt, and build upon the material
                    in any medium or format, so long as attribution is given to the creator.
                  </p>
                  <p className="text-sm text-gray-500">
                    For more information about Creative Commons licenses, visit{" "}
                    <a
                      href="https://creativecommons.org/licenses/by/3.0/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      creativecommons.org
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-4 mt-16 border-t">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <div className="text-sm text-gray-600">
            © 2024 T.G.&apos;s Tires. Professional Tire Marketplace.
          </div>
          <div className="flex space-x-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
            <Link href="/attributions" className="hover:text-blue-600 transition-colors">Attributions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
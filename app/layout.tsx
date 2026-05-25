import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://checkapis.pages.dev'),
  title: {
    default: 'CheckAPI - Validate LLM API Keys Instantly',
    template: '%s | CheckAPI'
  },
  description: 'Validate API keys for OpenAI, Anthropic, Google Gemini, Groq, Perplexity, HuggingFace, and 12+ LLM providers. Privacy-first client-side validation with detailed results, rate limits, and model lists. Free API and CLI tool available.',
  keywords: ['API key validator', 'LLM API key checker', 'OpenAI key validation', 'Anthropic Claude key', 'Google Gemini API', 'API key tester', 'privacy-first validation', 'client-side API check', 'AI API validator', 'machine learning API keys'],
  authors: [{ name: 'Teycir Ben Soltane', url: 'https://teycirbensoltane.tn' }],
  creator: 'Teycir Ben Soltane',
  publisher: 'CheckAPI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://checkapis.pages.dev',
    siteName: 'CheckAPI',
    title: 'CheckAPI - Validate LLM API Keys Instantly',
    description: 'Privacy-first API key validation for OpenAI, Anthropic, Google Gemini, and 12+ LLM providers. Get instant results with models, latency, and rate limits.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CheckAPI - LLM API Key Validator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CheckAPI - Validate LLM API Keys Instantly',
    description: 'Privacy-first API key validation for OpenAI, Anthropic, Google Gemini, and 12+ LLM providers.',
    images: ['/og-image.png'],
    creator: '@teycir',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://checkapis.pages.dev',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': 'https://checkapis.pages.dev/#webapp',
        name: 'CheckAPI',
        alternateName: 'CheckAPIs',
        url: 'https://checkapis.pages.dev',
        description: 'Privacy-first API key validation tool for OpenAI, Anthropic, Google Gemini, Groq, Perplexity, HuggingFace, Replicate, Together AI, Cohere, Mistral, and other LLM providers. Validates API keys client-side with detailed results including models, latency, and rate limits.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Client-side API key validation',
          'Multi-provider support (OpenAI, Anthropic, Google Gemini, Groq, Perplexity, HuggingFace, Replicate, Together AI, Cohere, Mistral)',
          'Privacy-first - keys never leave your browser',
          'Detailed validation results with models and rate limits',
          'Dark mode support',
          'Free API endpoint',
          'CLI tool for automation',
          'Batch validation support',
        ],
        author: {
          '@type': 'Person',
          '@id': 'https://teycirbensoltane.tn/#person',
          name: 'Teycir Ben Soltane',
          url: 'https://teycirbensoltane.tn',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://checkapis.pages.dev/#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is CheckAPI?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'CheckAPI is a privacy-first web application that validates API keys for LLM providers including OpenAI, Anthropic, Google Gemini, Groq, Perplexity, HuggingFace, Replicate, Together AI, Cohere, and Mistral. All validation happens client-side in your browser, ensuring your API keys are never sent to any server.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which LLM providers does CheckAPI support?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'CheckAPI supports 12+ LLM providers: OpenAI (GPT-4, GPT-3.5), Anthropic (Claude), Google Gemini, Groq, Perplexity, HuggingFace, Replicate, Together AI, Cohere, Mistral, AWS Bedrock (detection only), and Azure OpenAI (detection only).',
            },
          },
          {
            '@type': 'Question',
            name: 'Is CheckAPI safe to use with my API keys?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. CheckAPI is completely safe because all API key validation happens client-side in your browser. Your keys are never sent to any proxy server, never logged, and never stored. The application makes direct API calls from your browser to the provider endpoints.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I use the CheckAPI API endpoint?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'You can validate API keys programmatically by sending a POST request to https://checkapis.pages.dev/api/check with a JSON body containing your keys array. Example: curl -X POST https://checkapis.pages.dev/api/check -H "Content-Type: application/json" -d \'{"keys": ["sk-proj-..."]}\'. The API has a rate limit of 20 requests per minute per IP.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does CheckAPI have a CLI tool?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. CheckAPI provides a command-line interface for automation and scripting. Install with npm, then run: node dist/cli/cli/index.js sk-proj-... or pipe keys from a file. The CLI supports batch validation and JSON output format.',
            },
          },
          {
            '@type': 'Question',
            name: 'What information does CheckAPI return when validating an API key?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'CheckAPI returns comprehensive validation results including: provider name, validity status, available models list, API response latency in milliseconds, rate limit information, and detailed error messages if validation fails.',
            },
          },
        ],
      },
      {
        '@type': 'SoftwareSourceCode',
        '@id': 'https://checkapis.pages.dev/#sourcecode',
        name: 'CheckAPI Source Code',
        description: 'Open-source Next.js application for validating LLM API keys',
        codeRepository: 'https://github.com/Teycir/CheckAPI',
        programmingLanguage: 'TypeScript',
        runtimePlatform: 'Next.js 16',
        license: 'https://opensource.org/licenses/MIT',
      },
      {
        '@type': 'Organization',
        '@id': 'https://checkapis.pages.dev/#organization',
        name: 'CheckAPI',
        url: 'https://checkapis.pages.dev',
        logo: 'https://checkapis.pages.dev/favicon.svg',
        sameAs: [
          'https://github.com/Teycir/CheckAPI',
        ],
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${jetbrainsMono.className} min-h-screen bg-dark-bg text-dark-text flex flex-col`}>
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

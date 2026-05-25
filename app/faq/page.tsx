'use client';

import { motion } from 'framer-motion';
import { BackgroundBeams } from '@/components/ui/background-beams';
import DecryptedText from '@/components/DecryptedText';

export default function FAQPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative w-full overflow-hidden pb-20">
      <BackgroundBeams className="fixed top-0 left-0 w-full h-full z-0" />
      <div className="max-w-4xl w-full space-y-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold glow-text mb-4 px-2">
            <DecryptedText text="FAQ" animateOn="view" className="text-neon-blue" speed={75} maxIterations={20} />
          </h1>
          <p className="text-neon-blue/70 text-sm sm:text-base px-4">Frequently Asked Questions</p>
        </motion.div>

        <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-dark-bg/80 backdrop-blur-sm border-2 border-neon-blue/20 rounded-2xl">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">What is CheckAPIs?</h3>
            <p className="text-neon-blue/60 text-sm">CheckAPIs is a privacy-first tool that validates your LLM API keys instantly. All checks run client-side in your browser—keys are never sent to any server.</p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">Which API providers are supported?</h3>
            <p className="text-neon-blue/60 text-sm mb-2">We support all major LLM providers:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-xs text-neon-blue/60">
              <li>OpenAI (GPT-4, GPT-3.5)</li>
              <li>Anthropic (Claude)</li>
              <li>Google Gemini</li>
              <li>Groq</li>
              <li>Perplexity</li>
              <li>HuggingFace</li>
              <li>Replicate</li>
              <li>Together AI</li>
              <li>Cohere</li>
              <li>Mistral</li>
              <li>AWS Bedrock (detection only)</li>
              <li>Azure OpenAI (detection only)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">Is it safe to paste my API keys?</h3>
            <p className="text-neon-blue/60 text-sm mb-2"><strong className="text-neon-blue">Yes, completely safe.</strong> All validation happens in your browser:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-xs text-neon-blue/60">
              <li>Keys never sent to any proxy server</li>
              <li>Direct API calls from your browser to providers</li>
              <li>Keys never logged or stored</li>
              <li>Open source code for verification</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">How do I use CheckAPIs?</h3>
            <p className="text-neon-blue/60 text-sm mb-2">Simple 3-step process:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-xs text-neon-blue/60">
              <li>Paste your API keys (one per line)</li>
              <li>Click "CHECK KEYS"</li>
              <li>View results with status, models, and rate limits</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">What information does CheckAPIs show?</h3>
            <p className="text-neon-blue/60 text-sm mb-2">For each key, you'll see:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-xs text-neon-blue/60">
              <li><strong className="text-neon-blue">Status:</strong> Valid ✓ or Invalid ✗</li>
              <li><strong className="text-neon-blue">Provider:</strong> Detected API provider</li>
              <li><strong className="text-neon-blue">Models:</strong> Available models for your key</li>
              <li><strong className="text-neon-blue">Latency:</strong> Response time in milliseconds</li>
              <li><strong className="text-neon-blue">Rate Limits:</strong> Usage limits (if available)</li>
              <li><strong className="text-neon-blue">Error Messages:</strong> Detailed error info for invalid keys</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">Can I check multiple keys at once?</h3>
            <p className="text-neon-blue/60 text-sm">Yes! Paste multiple keys (one per line) and CheckAPIs will validate them all simultaneously.</p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">Why are my keys truncated in the results?</h3>
            <p className="text-neon-blue/60 text-sm">For security, we only display the first 8 characters of each key. This helps prevent accidental exposure while still allowing you to identify which key is which.</p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">What does "Invalid Key" mean?</h3>
            <p className="text-neon-blue/60 text-sm mb-2">A key can be invalid for several reasons:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-xs text-neon-blue/60">
              <li>Key has been revoked or deleted</li>
              <li>Key format is incorrect</li>
              <li>Account has insufficient credits</li>
              <li>API access has been suspended</li>
              <li>Key has expired (for time-limited keys)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">Does CheckAPIs store my API keys?</h3>
            <p className="text-neon-blue/60 text-sm"><strong className="text-neon-blue">No.</strong> Keys are only held in browser memory during validation and cleared immediately after. Nothing is saved to disk or sent to any server.</p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">Can I use CheckAPIs offline?</h3>
            <p className="text-neon-blue/60 text-sm">No. CheckAPIs needs internet access to make API calls to providers for validation. However, all processing happens locally in your browser.</p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">Why do some checks take longer than others?</h3>
            <p className="text-neon-blue/60 text-sm">Response times vary by provider based on server location, current load, and network conditions. Typical response times range from 100ms to 2000ms.</p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">What if a provider's API is down?</h3>
            <p className="text-neon-blue/60 text-sm">CheckAPIs will show a timeout or connection error. This doesn't mean your key is invalid—just that the provider's API is temporarily unavailable.</p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">Does checking my key consume API credits?</h3>
            <p className="text-neon-blue/60 text-sm">Most providers charge minimal or zero credits for validation requests. CheckAPIs uses the most lightweight endpoints available (usually list models or account info).</p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">Can I check keys for custom/self-hosted models?</h3>
            <p className="text-neon-blue/60 text-sm">Currently, CheckAPIs only supports major public LLM providers. Custom endpoints and self-hosted models are not supported.</p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">Is CheckAPIs open source?</h3>
            <p className="text-neon-blue/60 text-sm mb-2">Yes! The source code is available on GitHub under MIT license. You can:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-xs text-neon-blue/60">
              <li>Inspect the code for security verification</li>
              <li>Self-host your own instance</li>
              <li>Contribute improvements</li>
              <li>Report issues or request features</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">Does CheckAPIs work on mobile?</h3>
            <p className="text-neon-blue/60 text-sm">Yes! CheckAPIs is fully responsive and works on all devices—desktop, tablet, and mobile.</p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">What browsers are supported?</h3>
            <p className="text-neon-blue/60 text-sm">CheckAPIs works on all modern browsers that support ES6+ JavaScript: Chrome, Firefox, Safari, Edge, and Brave.</p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">Can I integrate CheckAPIs into my app?</h3>
            <p className="text-neon-blue/60 text-sm">Yes! The validation logic is modular and can be imported into your own projects. Check the GitHub repository for integration examples.</p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-neon-blue mb-2">How often is CheckAPIs updated?</h3>
            <p className="text-neon-blue/60 text-sm">We regularly update CheckAPIs to support new providers and API changes. Follow the GitHub repository for updates.</p>
          </div>
        </div>

        <div className="text-center pt-4">
          <a href="/" className="inline-block px-6 py-3 bg-dark-bg/80 backdrop-blur-sm border-2 border-neon-blue rounded-xl hover:border-neon-blue hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all text-neon-blue font-mono">
            CHECK YOUR KEYS
          </a>
        </div>
      </div>
    </div>
  );
}
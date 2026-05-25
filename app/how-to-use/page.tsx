'use client';

import { motion } from 'framer-motion';
import { BackgroundBeams } from '@/components/ui/background-beams';
import DecryptedText from '@/components/DecryptedText';
import { Key, CheckCircle, AlertCircle, Clock, Shield, Zap } from 'lucide-react';

export default function HowToUsePage() {
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
            <DecryptedText text="HOW TO USE" animateOn="view" className="text-neon-blue" speed={75} maxIterations={20} />
          </h1>
          <p className="text-neon-blue/70 text-sm sm:text-base px-4 mb-6">Privacy-First • Client-Side Validation</p>
        </motion.div>

        <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-dark-bg/80 backdrop-blur-sm border-2 border-neon-blue/20 rounded-2xl">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neon-blue mb-4 flex items-center gap-2">
              <Key className="w-6 h-6" /> Step 1: Paste Your API Keys
            </h2>
            <p className="text-neon-blue/80 mb-2 text-sm sm:text-base">Enter Your Keys</p>
            <p className="text-neon-blue/60 text-sm leading-relaxed mb-3">
              In the text area labeled "LLM API keys — one per line", paste your API keys. You can check multiple keys at once by entering each on a new line.
            </p>
            <div className="bg-dark-bg/50 border border-neon-blue/20 rounded-lg p-3 font-mono text-xs text-neon-blue/70">
              sk-ant-api03-...<br/>
              sk-proj-...<br/>
              AIzaSy...
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neon-blue mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6" /> Step 2: Click "CHECK KEYS"
            </h2>
            <p className="text-neon-blue/80 mb-2 text-sm sm:text-base">Instant Validation</p>
            <p className="text-neon-blue/60 text-sm leading-relaxed mb-3">
              Click the glowing "CHECK KEYS" button. CheckAPIs will automatically:
            </p>
            <ul className="text-neon-blue/60 text-sm space-y-2 list-disc list-inside">
              <li>Detect the provider for each key</li>
              <li>Make direct API calls from your browser</li>
              <li>Validate each key in parallel</li>
              <li>Retrieve available models and rate limits</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neon-blue mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" /> Step 3: View Results
            </h2>
            <p className="text-neon-blue/80 mb-2 text-sm sm:text-base">Detailed Information</p>
            <p className="text-neon-blue/60 text-sm leading-relaxed mb-3">
              Results appear in a table showing:
            </p>
            <ul className="text-neon-blue/60 text-sm space-y-2 list-disc list-inside">
              <li><strong className="text-neon-blue">Key:</strong> First 8 characters (truncated for security)</li>
              <li><strong className="text-neon-blue">Provider:</strong> Detected API provider (OpenAI, Anthropic, etc.)</li>
              <li><strong className="text-neon-blue">Status:</strong> ✓ Valid or ✗ Invalid</li>
              <li><strong className="text-neon-blue">Models:</strong> List of available models</li>
              <li><strong className="text-neon-blue">Latency:</strong> Response time in milliseconds</li>
              <li><strong className="text-neon-blue">Rate Limits:</strong> Usage limits (if provided by API)</li>
              <li><strong className="text-neon-blue">Error:</strong> Detailed error message for invalid keys</li>
            </ul>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-dark-bg/80 backdrop-blur-sm border-2 border-neon-blue/20 rounded-2xl">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neon-blue mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6" /> Privacy & Security
            </h2>
            <p className="text-neon-blue/80 mb-2 text-sm sm:text-base">Zero-Trust Architecture</p>
            <p className="text-neon-blue/60 text-sm leading-relaxed mb-3">
              CheckAPIs is designed with privacy as the top priority:
            </p>
            <ul className="text-neon-blue/60 text-sm space-y-2 list-disc list-inside">
              <li><strong className="text-neon-blue">Client-Side Only:</strong> All validation runs in your browser</li>
              <li><strong className="text-neon-blue">Direct API Calls:</strong> Keys sent directly to providers, never to our servers</li>
              <li><strong className="text-neon-blue">No Logging:</strong> Keys never logged, stored, or transmitted to third parties</li>
              <li><strong className="text-neon-blue">No Analytics:</strong> We don't track what keys you check</li>
              <li><strong className="text-neon-blue">Open Source:</strong> Code is public for security audits</li>
              <li><strong className="text-neon-blue">Memory Only:</strong> Keys cleared from memory after validation</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neon-blue mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6" /> Understanding Results
            </h2>
            <p className="text-neon-blue/80 mb-2 text-sm sm:text-base">Status Indicators</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-lg">✓</span>
                <div>
                  <p className="text-neon-blue font-bold">Valid Key</p>
                  <p className="text-neon-blue/60">Key is active and working. You'll see available models and rate limits.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-lg">✗</span>
                <div>
                  <p className="text-neon-blue font-bold">Invalid Key</p>
                  <p className="text-neon-blue/60">Key is revoked, expired, or malformed. Check the error message for details.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-neon-blue font-bold">Timeout/Error</p>
                  <p className="text-neon-blue/60">Provider API is temporarily unavailable. Try again later.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-4 bg-dark-bg/80 backdrop-blur-sm border-2 border-neon-blue/20 rounded-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-neon-blue mb-4">Supported Providers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-neon-blue/60 text-sm">
            <div>
              <p className="text-neon-blue font-bold mb-2">Fully Supported:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>OpenAI (GPT-4, GPT-3.5)</li>
                <li>Anthropic (Claude)</li>
                <li>Google Gemini</li>
                <li>Groq</li>
                <li>Perplexity</li>
                <li>HuggingFace</li>
              </ul>
            </div>
            <div>
              <p className="text-neon-blue font-bold mb-2">Also Supported:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Replicate</li>
                <li>Together AI</li>
                <li>Cohere</li>
                <li>Mistral</li>
                <li>AWS Bedrock (detection)</li>
                <li>Azure OpenAI (detection)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-4 bg-dark-bg/80 backdrop-blur-sm border-2 border-neon-blue/20 rounded-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-neon-blue mb-4">Tips & Best Practices</h2>
          <ul className="text-neon-blue/60 text-sm space-y-2 list-disc list-inside">
            <li><strong className="text-neon-blue">Batch Checking:</strong> Check multiple keys at once for efficiency</li>
            <li><strong className="text-neon-blue">Regular Validation:</strong> Periodically verify keys haven't been revoked</li>
            <li><strong className="text-neon-blue">Error Messages:</strong> Read error details to understand why a key failed</li>
            <li><strong className="text-neon-blue">Latency Monitoring:</strong> High latency may indicate provider issues</li>
            <li><strong className="text-neon-blue">Rate Limits:</strong> Check limits to avoid hitting quotas in production</li>
            <li><strong className="text-neon-blue">Incognito Mode:</strong> Use private browsing for extra security</li>
          </ul>
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
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Activity,
  Globe,
  Database,
  Terminal,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary transition-colors duration-200">
      
      {/* 1. Hero Section */}
      <section className="relative px-6 pt-16 pb-20 lg:px-8 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <span className="inline-flex items-center rounded-badge px-3 py-1 text-xs font-semibold leading-6 text-primary-blue bg-primary-blue/10 dark:text-primary-sky dark:bg-primary-sky/10 border border-primary-blue/20">
              ⚡ Autonomous Cyber Threat Intelligence
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl font-sans bg-clip-text text-transparent bg-gradient-to-r from-light-text-primary to-gray-500 dark:from-dark-text-primary dark:to-gray-400">
              Aegis Threat Hunting Agent
            </h1>
            <p className="text-base sm:text-lg text-light-text-muted dark:text-dark-text-muted">
              Continuous structured & unstructured intelligence ingestion. Auto-triage NVD vulnerabilities, track ransomware campaigns, identify phishing kits, and resolve IOC attributions in real time.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/login">
                <Button size="lg" className="gap-2">
                  Launch Console
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline">
                  Request Access Clearance
                </Button>
              </Link>
            </div>
          </div>

          {/* Cybersecurity Illustration Placeholder */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="w-full max-w-md h-80 rounded-card border border-gray-200 dark:border-gray-800 bg-gradient-to-tr from-primary-navy via-dark-bg-card to-primary-blue/20 shadow-large relative overflow-hidden flex flex-col justify-between p-6">
              <div className="absolute top-0 right-0 h-40 w-40 bg-primary-sky/10 rounded-full blur-3xl" />
              <div className="flex justify-between items-center">
                <Shield className="h-10 w-10 text-primary-sky animate-pulse" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-severity-low/20 text-severity-low font-bold">
                  ACTIVE Triaging
                </span>
              </div>
              
              {/* Visual console simulation */}
              <div className="space-y-2 font-mono text-[10px] text-primary-sky/80 bg-black/40 p-4 rounded-input border border-gray-800">
                <p className="text-gray-500">// Aegis Intelligence Pipeline v1.0.0</p>
                <p className="flex items-center gap-1.5"><Activity className="h-3 w-3 text-severity-high" /> [ALERT]: CVE-2026-1049 detected (CVSS 9.8)</p>
                <p>✔ VirusTotal reputational queries matched: 68/70 AVs</p>
                <p>✔ LangChain extraction: YARA mitigations compiled.</p>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Threat Feed Ingest: 1.4k / min</span>
                <span>Uptime: 99.99%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Overview & Stats */}
      <section className="py-16 bg-light-bg-secondary dark:bg-dark-bg-secondary/40 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <p className="text-4xl font-extrabold text-primary-blue dark:text-primary-sky font-sans">9.8M+</p>
              <p className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">CVE Records Triaged</p>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted">Direct NIST NVD correlation indexes.</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-extrabold text-primary-blue dark:text-primary-sky font-sans">15s</p>
              <p className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">Mean Time to Ingest</p>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted">From advisory publication to structured dashboard.</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-extrabold text-primary-blue dark:text-primary-sky font-sans">94.3%</p>
              <p className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">Slight False Positive Reduction</p>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted">Leverages parallel agent verification models.</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-extrabold text-primary-blue dark:text-primary-sky font-sans">24/7</p>
              <p className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">Continuous Monitoring</p>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted">Autonomously crawls unstructured vulnerability feeds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Key Features */}
      <section className="py-20 px-6 lg:px-8 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary-blue dark:text-primary-sky">System Capabilities</h2>
            <p className="text-3xl font-bold tracking-tight">Full Spectrum Threat Intelligence</p>
            <p className="text-xs text-light-text-muted dark:text-dark-text-muted">Aegis unifies multiple operations centers into a single view.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="rounded-card border border-gray-200 dark:border-gray-850 p-6 bg-white dark:bg-dark-bg-card hover-card">
              <Globe className="h-8 w-8 text-primary-sky mb-4" />
              <h4 className="text-sm font-bold mb-2">Vulnerability Tracking</h4>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                Polls public CVE logs, CVE-KEV, vendor advisories, and correlates them with EPSS (Exploit Prediction Scoring System).
              </p>
            </div>

            <div className="rounded-card border border-gray-200 dark:border-gray-850 p-6 bg-white dark:bg-dark-bg-card hover-card">
              <Database className="h-8 w-8 text-primary-sky mb-4" />
              <h4 className="text-sm font-bold mb-2">Ransomware Campaign Tracking</h4>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                Extracts threat actor payloads, TOR sites, file signatures, and cross-references them using MISP Ransomware clusters.
              </p>
            </div>

            <div className="rounded-card border border-gray-200 dark:border-gray-850 p-6 bg-white dark:bg-dark-bg-card hover-card">
              <Terminal className="h-8 w-8 text-primary-sky mb-4" />
              <h4 className="text-sm font-bold mb-2">Phishing Ingestion Scanner</h4>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                Queries domain registries, mail headers, and aggregates reputations from VirusTotal and Shodan API streams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Testimonials Placeholder */}
      <section className="py-20 px-6 lg:px-8 bg-light-bg-secondary dark:bg-dark-bg-secondary/20">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary-blue dark:text-primary-sky">Analyst Endorsements</h2>
          <blockquote className="text-lg italic font-medium">
            "Aegis Threat Hunter has transformed our security operations center. Instead of manually spending hours reading vulnerability advisories and writing YARA rules, our analysts receive structured reports and verified signatures in seconds."
          </blockquote>
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-primary-blue/20 text-primary-blue flex items-center justify-center font-bold">
              CS
            </div>
            <p className="mt-2 text-xs font-bold">Chief Information Security Officer</p>
            <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted">Global Aerospace Syndicate</p>
          </div>
        </div>
      </section>
    </div>
  );
};

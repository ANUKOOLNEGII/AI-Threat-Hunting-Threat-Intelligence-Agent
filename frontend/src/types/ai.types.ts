/* ============================================================
   AI Assistant — Shared Type Definitions
   ============================================================ */

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error';
export type ConfidenceLevel = 'very-high' | 'high' | 'medium' | 'low';
export type ReferenceSource = 'NVD' | 'MITRE' | 'CISA' | 'VirusTotal' | 'Shodan' | 'MISP' | 'Vendor Advisory' | 'NIST' | 'GitHub';
export type ThreatContext = 'cve' | 'ioc' | 'malware' | 'campaign' | 'actor' | 'general';

/* ---- References ---- */
export interface AIReference {
  id: string;
  source: ReferenceSource;
  title: string;
  url: string;
  relevance: 'high' | 'medium' | 'low';
  publishedDate?: string;
}

/* ---- Response sections ---- */
export interface AIResponseSections {
  executiveSummary: string;
  technicalAnalysis: string;
  threatClassification?: string;
  riskAssessment?: string;
  recommendations?: string[];
  mitreReference?: string;
  detectionRule?: string;
}

/* ---- Individual message ---- */
export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;             // raw markdown-compatible text
  status: MessageStatus;
  timestamp: string;           // ISO 8601
  confidence?: ConfidenceLevel;
  confidenceScore?: number;    // 0–100
  sections?: AIResponseSections;
  references?: AIReference[];
  isBookmarked?: boolean;
  streamedContent?: string;    // partial content while streaming
}

/* ---- Investigation context ---- */
export interface InvestigationContext {
  type: ThreatContext;
  id: string;
  label: string;
  severity?: string;
}

/* ---- Conversation ---- */
export interface AIConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  messages: AIMessage[];
  context?: InvestigationContext;
  isActive?: boolean;
}

/* ---- Suggested question ---- */
export interface SuggestedQuestion {
  id: string;
  label: string;
  icon: string;
  category: 'cve' | 'malware' | 'ioc' | 'ransomware' | 'phishing' | 'general';
  prompt: string;
}

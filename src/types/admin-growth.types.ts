export type GrowthTone = "success" | "info" | "warning" | "danger";

export interface GrowthKpi {
  label: string;
  value: number | string;
  detail: string;
  tone: GrowthTone;
}

export interface GrowthScoreBreakdown {
  recency: number;
  engagement: number;
  learningDepth: number;
  referral: number;
  streak: number;
  premiumSignal: number;
}

export interface GrowthLead {
  id: string;
  name: string;
  email: string;
  username: string | null;
  level: string;
  xp: number;
  streak: number;
  quizCompleted: number;
  isPremium: boolean | null;
  referralCount: number;
  lastLoggedIn: string;
  daysSinceLogin: number;
  leadScore: number;
  churnRisk: number;
  segment: string;
  componentScores: GrowthScoreBreakdown;
  signals: string[];
  recommendedAction: string;
  recommendedHref: string;
}

export interface GrowthSegment {
  id: string;
  label: string;
  description: string;
  count: number;
  percentage: number;
  severity: GrowthTone;
  actionHref: string;
}

export interface GrowthActionItem {
  id: string;
  title: string;
  description: string;
  count: number;
  priority: "high" | "medium" | "low";
  href: string;
  actionLabel: string;
}

export interface GrowthTopic {
  topic: string;
  count: number;
  source: "chat" | "roadmap" | "quiz" | "mixed";
  trend: "up" | "flat" | "down";
}

export interface GrowthRetentionSummary {
  activeToday: number;
  active7Days: number;
  active30Days: number;
  inactive7Days: number;
  inactive30Days: number;
  d1Rate: number;
  d7Rate: number;
  d30Rate: number;
}

export interface GrowthRiskBucket {
  label: string;
  count: number;
  description: string;
  severity: GrowthTone;
}

export interface GrowthRetentionCohort {
  cohort: string;
  users: number;
  activeToday: number;
  active7Days: number;
  active30Days: number;
}

export interface GrowthRetention {
  summary: GrowthRetentionSummary;
  riskBuckets: GrowthRiskBucket[];
  cohorts: GrowthRetentionCohort[];
}

export interface GrowthContentIntelligence {
  topTopics: GrowthTopic[];
  sourceBreakdown: {
    chats: number;
    roadmaps: number;
    publicQuizzes: number;
    quizAttempts: number;
    incorrectAnswers: number;
  };
  weakQuizAreas: {
    topic: string;
    incorrectAnswers: number;
    totalAnswers: number;
    missRate: number;
  }[];
}

export interface GrowthOverview {
  generatedAt: string;
  kpis: GrowthKpi[];
  segments: GrowthSegment[];
  topLeads: GrowthLead[];
  actionItems: GrowthActionItem[];
  topTopics: GrowthTopic[];
  retention: GrowthRetentionSummary;
}

// Types for the challenge data
export interface ChallengeData {
    id: string | number;
    generated_challenge: string;
    challenge_type: string;
    status: string;
    challenge_duration?: number;
    last_updated?: string;
    progress?: number | string;
    financial_goal?: number | string;
  }
  
  export interface ParsedChallenge {
    id: string;
    title: string;
    description: string;
    type: 'savings' | 'investment';
    goal: number;
    currentProgress: number;
    duration: number;
    startDate: string;
    lastUpdated: string;
    isCompleted: boolean;
    isNudged: boolean;
    commitment: string;
    rawData: ChallengeData;
    progress?: number;
  }
  
  // Parse challenge data from API response
  export const parseChallengeData = (challengeData: ChallengeData): ParsedChallenge => {
    // Extract title, description, and other data from the generated_challenge text
    const titleMatch = challengeData.generated_challenge.match(/\*\*Challenge Title:\*\* (.*?)(?:\n|$)/);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Challenge';
  
    // Extract daily/weekly task as description
    let description = '';
    const dailyTaskMatch = challengeData.generated_challenge.match(/\*\*Daily Task:\*\*([\s\S]*?)(?:\n\n\*\*|$)/);
    const weeklyTaskMatch = challengeData.generated_challenge.match(/\*\*Weekly Task:\*\*([\s\S]*?)(?:\n\n\*\*|$)/);
    const dailyWeeklyTaskMatch = challengeData.generated_challenge.match(/\*\*Daily\/Weekly Task:\*\*([\s\S]*?)(?:\n\n\*\*|$)/);
    
    if (dailyWeeklyTaskMatch) {
      description = dailyWeeklyTaskMatch[1].trim();
    } else if (dailyTaskMatch) {
      description = dailyTaskMatch[1].trim();
    } else if (weeklyTaskMatch) {
      description = weeklyTaskMatch[1].trim();
    }
  
    // Extract financial goal
    let goal = 500; // Default goal
    const goalMatch = challengeData.generated_challenge.match(/goal of (?:GHS|GH₵)?\s*(\d+)/i);
    if (goalMatch) {
      goal = parseInt(goalMatch[1], 10);
    }
  
    // Current progress - assume 0 if not available
    let currentProgress = 0;
    if (challengeData.progress !== undefined && challengeData.progress !== null) {
      // Convert to number if it's a string
      currentProgress = typeof challengeData.progress === 'string' 
        ? parseFloat(challengeData.progress) 
        : challengeData.progress;
    }
  
    // Type based on challenge_type field
    const type = challengeData.challenge_type.toLowerCase().includes('savings') ? 'savings' : 'investment';
  
    // Determine if completed based on status field
    const isCompleted = challengeData.status === 'completed';
  
    return {
      id: challengeData.id.toString(),
      title,
      description,
      type,
      goal,
      currentProgress,
      duration: challengeData.challenge_duration || 30,
      startDate: challengeData.last_updated || new Date().toISOString(),
      lastUpdated: challengeData.last_updated || new Date().toISOString(),
      isCompleted,
      progress: typeof challengeData.progress === 'string' ? parseFloat(challengeData.progress) : challengeData.progress || 0,
      isNudged: false,
      commitment: "Daily",
      rawData: challengeData // Store original data for debugging
    };
  };
  
  // Utility functions
  export const formatCurrency = (value: number) => {
    if (isNaN(value) || value === undefined || value === null) {
      return "GH₵0";
    }
    return `GH₵ ${value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };
// utils/formatters.js

/**
 * Formats a number as currency
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
    if (isNaN(amount)) return 'GH₵ 0.00';
    return `GH₵ ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };
  
  /**
   * Calculates days remaining for a challenge
   * @param {string} startDateStr - ISO date string for start date
   * @param {number} durationDays - Duration in days
   * @returns {number} - Days remaining (0 if expired)
   */
  export const getTimeRemaining = (startDateStr: string, durationDays: number): number => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + durationDays);
    const today = new Date();
    return Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  };
  
  /**
   * Formats a date string to a more readable format
   * @param {string} dateStr - ISO date string
   * @returns {string} - Formatted date string (e.g., "Mar 15")
   */
  export const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "-" : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  /**
   * Parses challenge data from API response
   * @param {any} data - Raw challenge data from API
   * @returns {Challenge} - Parsed Challenge object
   */
  export const parseChallengeData = (data: any) => {
    const challenge = {
      id: data.id?.toString() || Math.random().toString(36).substring(2, 9),
      title: data.title || 'Untitled Challenge',
      description: data.description || '',
      type: data.type === 'investment' ? 'investment' : 'savings',
      goal: parseFloat(data.goal) || 0,
      currentProgress: parseFloat(data.current_progress || data.currentProgress) || 0,
      duration: parseInt(data.duration) || 30,
      startDate: data.start_date || data.startDate || new Date().toISOString(),
      lastUpdated: data.last_updated || data.lastUpdated || new Date().toISOString(),
      isCompleted: data.is_completed || data.isCompleted || false,
      isNudged: data.is_nudged || data.isNudged || false,
      commitment: data.commitment || '',
      rawData: data,
      daysLeft: 0, // Initialize daysLeft property
    };
    
    // Calculate days remaining
    challenge.daysLeft = getTimeRemaining(challenge.startDate, challenge.duration);
    
    return challenge;
  };
import type { ScoreResult } from '../types';

export interface FormatOptions {
  includeHeader?: boolean;
  includeTimestamp?: boolean;
  includeCoaching?: boolean;
  includeActionPlans?: boolean;
}

export function formatResultsAsText(
  result: ScoreResult, 
  options: FormatOptions = {}
): string {
  const {
    includeHeader = true,
    includeTimestamp = true,
    includeCoaching = true,
    includeActionPlans = true,
  } = options;

  const lines: string[] = [];
  const now = new Date();

  // Header Section
  if (includeHeader) {
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('        🎯 FACE BLOAT RISK ASSESSMENT RESULTS');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('');
  }

  // Score Section
  lines.push('📊 YOUR SCORE: ' + result.score + '/100');
  lines.push('📈 RISK LEVEL: ' + result.band.label);
  lines.push('');

  // Overview Section
  lines.push('💡 OVERVIEW');
  lines.push('───────────────────────────────────────────────────────────');
  lines.push(wrapText(result.band.blurb, 60));
  lines.push('');

  // Top Risk Factors
  if (result.topDrivers.length > 0) {
    lines.push('🔍 TOP RISK FACTORS');
    lines.push('───────────────────────────────────────────────────────────');
    result.topDrivers.forEach((driver, index) => {
      const emoji = getDriverEmoji(driver.categoryId);
      const dots = '.'.repeat(Math.max(2, 40 - driver.label.length));
      lines.push(`${index + 1}. ${emoji} ${driver.label} ${dots} ${driver.pct}%`);
    });
    lines.push('');
  }

  // Detailed Responses & Coaching
  if (includeCoaching && result.answerContexts.length > 0) {
    lines.push('📝 YOUR RESPONSES & COACHING');
    lines.push('───────────────────────────────────────────────────────────');
    
    result.answerContexts.forEach((answer, index) => {
      if (index > 0) lines.push('');
      
      // Question
      lines.push(`Q${index + 1}: ${answer.questionText}`);
      
      // Answer with risk indicator
      const riskEmoji = answer.choice >= 'F' ? '⚠️' : answer.choice >= 'D' ? '⚡' : '✅';
      lines.push(`${riskEmoji} Your choice (${answer.choice}): ${answer.choiceTitle}`);
      
      // Coaching
      lines.push('💬 Coaching:');
      lines.push('   ' + wrapText(answer.context, 57, '   '));
    });
    lines.push('');
  }

  // Action Plans
  if (includeActionPlans) {
    lines.push('🎯 TODAY\'S ACTION PLAN');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('• Drink 16oz of water with a pinch of sea salt');
    lines.push('• Elevate your head 10-20° for tonight\'s sleep');
    lines.push('• Avoid adding salt to your meals today');
    lines.push('• Set a bedtime alarm for 8+ hours of sleep');
    lines.push('');

    lines.push('📅 7-DAY PLAN');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('• Establish consistent 7.5-8 hour sleep schedule');
    lines.push('• Replace one processed meal daily with fresh ingredients');
    lines.push('• Drink 2+ liters of water, evenly spaced');
    lines.push('• Add potassium-rich foods (banana, spinach) daily');
    lines.push('');
  }

  // Disclaimer
  lines.push('⚠️  IMPORTANT DISCLAIMER');
  lines.push('───────────────────────────────────────────────────────────');
  lines.push(wrapText(
    'This quiz is for educational purposes only and is not medical advice. ' +
    'Results are based on lifestyle factors and should not replace professional ' +
    'medical consultation. If you have persistent facial swelling or health ' +
    'concerns, please consult with a healthcare provider.',
    60
  ));
  lines.push('');

  // Footer
  if (includeTimestamp) {
    lines.push('───────────────────────────────────────────────────────────');
    lines.push(`Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`);
    lines.push('Source: Face Bloat Risk Assessment Tool');
    lines.push('FaceBloat ~ https://www.facebloat.com');
    lines.push('');
    lines.push('');
    lines.push('');
  }

  return lines.join('\n');
}

function wrapText(text: string, maxWidth: number, indent: string = ''): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = indent;

  for (const word of words) {
    const testLine = currentLine + (currentLine === indent ? '' : ' ') + word;
    if (testLine.length <= maxWidth || currentLine === indent) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = indent + word;
    }
  }
  
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  return lines.join('\n');
}

function getDriverEmoji(categoryId: string): string {
  const emojiMap: Record<string, string> = {
    sleep: '😴',
    hydration: '🥤',
    nutrition: '🍽️',
    exercise: '🏃',
    stress: '😰',
    allergies: '🤧',
    hormones: '⚖️',
    medications: '💊',
  };
  
  return emojiMap[categoryId] || '📊';
}

export function downloadTextFile(content: string, filename: string = 'face-bloat-results.txt'): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

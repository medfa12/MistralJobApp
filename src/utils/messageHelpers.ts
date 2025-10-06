export function getMessageText(content: any): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map(item => item.text || '').join(' ');
  }
  return '';
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}


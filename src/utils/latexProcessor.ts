export function processLatex(text: string): string {
  let processed = text;

  processed = processed.replace(/\\begin\{(pmatrix|bmatrix|matrix|align|equation)\}[\s\S]*?\\end\{\1\}/g, (match) => {
    if (match.startsWith('$$') || match.startsWith('\\[')) return match;
    return `$$\n${match}\n$$`;
  });

  processed = processed.replace(/^([^$\n]*\\(?:frac|sqrt|sum|prod|int|lim|binom|begin)\{[^}]*\}.*?)$/gm, (match) => {
    if (match.trim().startsWith('$') || match.trim().startsWith('\\(')) return match;
    const trimmed = match.trim();
    if (trimmed.includes('\n') || trimmed.length > 60) {
      return `$$${trimmed}$$`;
    }
    return `$${trimmed}$`;
  });

  processed = processed.replace(/^([^$\n]*[a-zA-Z0-9]\^\{?[^}]*\}?.*?)$/gm, (match) => {
    if (match.trim().startsWith('$') || match.includes('```') || match.includes('http')) return match;
    const trimmed = match.trim();
    if (/\\[a-zA-Z]+|[\^_]\{/.test(trimmed) && trimmed.length < 100) {
      return `$${trimmed}$`;
    }
    return match;
  });

  return processed;
}

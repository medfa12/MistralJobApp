/**
 * Document Section Parser
 * Utilities for parsing and manipulating markdown documents by section
 */

export interface DocumentSection {
  heading: string;
  level: number;
  content: string;
  startLine: number;
  endLine: number;
}

export function parseMarkdownSections(markdown: string): DocumentSection[] {
  const lines = markdown.split('\n');
  const sections: DocumentSection[] = [];
  let currentSection: DocumentSection | null = null as DocumentSection | null;
  
  lines.forEach((line, index) => {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headingMatch) {
      if (currentSection) {
        currentSection.endLine = index - 1;
        currentSection.content = currentSection.content.trim();
        sections.push(currentSection);
      }
      
      currentSection = {
        heading: headingMatch[2].trim(),
        level: headingMatch[1].length,
        content: '',
        startLine: index,
        endLine: index,
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  });
  
  if (currentSection) {
    currentSection.endLine = lines.length - 1;
    currentSection.content = currentSection.content.trim();
    sections.push(currentSection);
  }
  
  return sections;
}

export function findSection(sections: DocumentSection[], headingQuery: string): DocumentSection | undefined {
  const query = headingQuery.toLowerCase();
  return sections.find(s => 
    s.heading.toLowerCase().includes(query) ||
    query.includes(s.heading.toLowerCase())
  );
}

export function insertSection(
  markdown: string,
  newSection: { heading: string; content: string },
  position: 'start' | 'end' | 'after_heading',
  afterHeading?: string
): string {
  const sections = parseMarkdownSections(markdown);
  const heading = `## ${newSection.heading}`;
  const sectionText = `\n${heading}\n\n${newSection.content}\n`;
  
  if (position === 'start') {
    return sectionText + markdown;
  }
  
  if (position === 'end') {
    return markdown + sectionText;
  }
  
  if (position === 'after_heading' && afterHeading) {
    const targetSection = findSection(sections, afterHeading);
    
    if (targetSection) {
      const lines = markdown.split('\n');
      lines.splice(targetSection.endLine + 1, 0, '', heading, '', newSection.content);
      return lines.join('\n');
    }
  }
  
  return markdown + sectionText;
}

export function updateSection(
  markdown: string,
  headingQuery: string,
  newContent: string,
  mode: 'replace' | 'append' | 'prepend' = 'replace'
): string {
  const sections = parseMarkdownSections(markdown);
  const targetSection = findSection(sections, headingQuery);
  
  if (!targetSection) {
    console.warn(`Section not found: ${headingQuery}`);
    return markdown;
  }
  
  const lines = markdown.split('\n');
  const contentStart = targetSection.startLine + 1;
  const contentEnd = targetSection.endLine + 1;
  
  switch (mode) {
    case 'replace':
      lines.splice(contentStart, contentEnd - contentStart, newContent);
      break;
    case 'append':
      lines.splice(contentEnd, 0, newContent);
      break;
    case 'prepend':
      lines.splice(contentStart, 0, newContent, '');
      break;
  }
  
  return lines.join('\n');
}

export function deleteSection(markdown: string, headingQuery: string): string {
  const sections = parseMarkdownSections(markdown);
  const targetSection = findSection(sections, headingQuery);
  
  if (!targetSection) {
    console.warn(`Section not found: ${headingQuery}`);
    return markdown;
  }
  
  const lines = markdown.split('\n');
  lines.splice(targetSection.startLine, targetSection.endLine - targetSection.startLine + 1);
  
  return lines.join('\n');
}

export function applyFormatting(
  markdown: string,
  section: string,
  action: string,
  target?: string
): string {
  if (section === 'all') {
    switch (action) {
      case 'make_bold':
        if (target) {
          const regex = new RegExp(`\\b${target}\\b`, 'g');
          return markdown.replace(regex, `**${target}**`);
        }
        break;
      case 'make_italic':
        if (target) {
          const regex = new RegExp(`\\b${target}\\b`, 'g');
          return markdown.replace(regex, `*${target}*`);
        }
        break;
      case 'add_code_formatting':
        if (target) {
          const regex = new RegExp(`\\b${target}\\b`, 'g');
          return markdown.replace(regex, `\`${target}\``);
        }
        break;
    }
  } else {
    const sections = parseMarkdownSections(markdown);
    const targetSection = findSection(sections, section);
    
    if (targetSection) {
      let newContent = targetSection.content;
      
      switch (action) {
        case 'make_bold':
          if (target) {
            const regex = new RegExp(`\\b${target}\\b`, 'g');
            newContent = newContent.replace(regex, `**${target}**`);
          }
          break;
        case 'make_italic':
          if (target) {
            const regex = new RegExp(`\\b${target}\\b`, 'g');
            newContent = newContent.replace(regex, `*${target}*`);
          }
          break;
        case 'add_code_formatting':
          if (target) {
            const regex = new RegExp(`\\b${target}\\b`, 'g');
            newContent = newContent.replace(regex, `\`${target}\``);
          }
          break;
      }
      
      return updateSection(markdown, section, newContent, 'replace');
    }
  }
  
  return markdown;
}


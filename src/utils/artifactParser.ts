import { ArtifactData, ArtifactType } from '@/types/types';

export type ArtifactOperation = 'create' | 'edit' | 'delete' | 'revert';

export interface ParsedArtifact extends ArtifactData {
  operation: ArtifactOperation;
  revertToVersion?: number; // For revert operations
}

/**
 * Parses artifact tags from model response
 * New Format: <artifact operation="create|edit|delete" type="react" title="Title">```code```</artifact>
 * Legacy Format: <artifact identifier="id" type="react" title="Title">```code```</artifact>
 */
export function parseArtifacts(text: string): {
  cleanText: string;
  artifacts: ParsedArtifact[];
} {
  const artifacts: ParsedArtifact[] = [];
  
  const newFormatRegex = /<artifact\s+operation=["']([^"']+)["'](?:\s+type=["']([^"']+)["'])?(?:\s+title=["']([^"']+)["'])?(?:\s+version=["']([^"']+)["'])?>([\s\S]*?)<\/artifact>/g;
  const legacyFormatRegex = /<artifact\s+identifier=["']([^"']+)["']\s+type=["']([^"']+)["']\s+title=["']([^"']+)["']>([\s\S]*?)<\/artifact>/g;
  
  let cleanText = text;
  let match;
  
  while ((match = newFormatRegex.exec(text)) !== null) {
    const [fullMatch, operation, type, title, version, content] = match;
    
    if (operation === 'delete') {
      artifacts.push({
        operation: 'delete',
        identifier: 'temp-delete',
        type: 'react',
        title: 'Deleted',
        code: '',
        language: 'jsx',
        createdAt: new Date().toISOString(),
      });
      
      cleanText = cleanText.replace(fullMatch, '\n\n[Artifact deleted]\n\n');
      continue;
    }
    
    // Handle revert operation
    if (operation === 'revert') {
      const versionNumber = version ? parseInt(version, 10) : undefined;
      artifacts.push({
        operation: 'revert',
        identifier: 'current-artifact',
        type: 'react',
        title: 'Reverted',
        code: '',
        language: 'jsx',
        createdAt: new Date().toISOString(),
        revertToVersion: versionNumber,
      });
      
      cleanText = cleanText.replace(fullMatch, `\n\n[Artifact reverted to version ${versionNumber}]\n\n`);
      continue;
    }
    
    if (!type || !isValidArtifactType(type)) {
      console.warn(`Invalid or missing artifact type: ${type}`);
      continue;
    }
    
    let code = extractCode(content.trim());
    
    if (type === 'react' && !code.includes('window.App')) {
      code = autoFixReactExport(code);
    }
    
    const validation = validateArtifactCode(code, type as ArtifactType);
    if (!validation.valid) {
      console.warn(`Artifact code validation warnings for ${type}:`, validation.errors);
      console.warn(`Code preview:`, code.substring(0, 200));
    }
    
    const identifier = operation === 'create' 
      ? `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      : 'current-artifact';

    const artifact: ParsedArtifact = {
      operation: operation as ArtifactOperation,
      identifier,
      type: type as ArtifactType,
      title: title || 'Untitled Artifact',
      code,
      language: getLanguageFromType(type as ArtifactType),
      createdAt: new Date().toISOString(),
    };

    artifacts.push(artifact);
    
    const operationLabel = operation === 'create' ? 'Created' : 'Updated';
    cleanText = cleanText.replace(fullMatch, `\n\n[Artifact ${operationLabel}: ${artifact.title}]\n\n`);
  }
  
  while ((match = legacyFormatRegex.exec(text)) !== null) {
    const [fullMatch, identifier, type, title, content] = match;
    
    if (!isValidArtifactType(type)) {
      console.warn(`Invalid artifact type: ${type}`);
      continue;
    }

    let code = extractCode(content.trim());
    
    if (type === 'react' && !code.includes('window.App')) {
      code = autoFixReactExport(code);
    }
    
    const validation = validateArtifactCode(code, type as ArtifactType);
    if (!validation.valid) {
      console.warn(`Invalid legacy artifact code for ${type}:`, validation.errors);
      console.warn(`Code preview:`, code.substring(0, 200));
      continue;
    }

    const artifact: ParsedArtifact = {
      operation: 'create',
      identifier,
      type: type as ArtifactType,
      title,
      code,
      language: getLanguageFromType(type as ArtifactType),
      createdAt: new Date().toISOString(),
    };

    artifacts.push(artifact);
    cleanText = cleanText.replace(fullMatch, `\n\n[Artifact: ${title}]\n\n`);
  }

  return {
    cleanText: cleanText.trim(),
    artifacts,
  };
}

function autoFixReactExport(code: string): string {
  const functionMatch = code.match(/function\s+([A-Z][a-zA-Z0-9]*)\s*\(/);
  const constMatch = code.match(/const\s+([A-Z][a-zA-Z0-9]*)\s*=/);
  
  const componentName = functionMatch?.[1] || constMatch?.[1];
  
  if (componentName) {
    console.warn(`Auto-fixing React artifact: Adding window.App = ${componentName}`);
    return `${code}\n\nwindow.App = ${componentName};`;
  }
  
  console.warn('Could not auto-fix React artifact: No component found');
  return code;
}

export function extractCode(text: string): string {
  const codeBlockRegex = /```(?:\w+)?\s*\n?([\s\S]*?)```/;
  const match = text.match(codeBlockRegex);
  
  if (match) {
    return match[1].trim();
  }
  
  return text.trim();
}

export function validateArtifactCode(code: string, type: ArtifactType): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  if (!code || code.trim().length === 0) {
    errors.push('Code cannot be empty');
    return { valid: false, errors };
  }

  if (code.length > 50000) {
    errors.push('Code exceeds maximum length of 50KB');
  }
  
  if (type !== 'markdown' && type !== 'document') {
    const dangerousPatterns = [
      { pattern: /\b(window\.top|top\.location|top\.document)\b/gi, name: 'top frame access' },
      { pattern: /\b(window\.parent|parent\.location|parent\.document)\b/gi, name: 'parent frame access' },
      { pattern: /\b__proto__\b/gi, name: 'prototype pollution' },
      { pattern: /\bconstructor\s*\[/gi, name: 'constructor access' },
    ];

    for (const { pattern, name } of dangerousPatterns) {
      if (pattern.test(code)) {
        errors.push(`Code contains potentially dangerous pattern: ${name}`);
      }
    }
  }

  if (type === 'react') {
    if (!code.includes('window.App') && !code.includes('export default')) {
      console.log('Warning: React artifact should export component as window.App');
    }
  }

  if (type === 'html') {
    if (!code.includes('<') || !code.includes('>')) {
      console.log('Warning: HTML artifact should contain valid HTML tags');
    }
  }

  if (type === 'markdown' || type === 'document') {
    if (code.trim().length < 10) {
      console.log('Warning: Document content seems too short');
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

function isValidArtifactType(type: string): boolean {
  return ['react', 'html', 'javascript', 'vue', 'markdown', 'document'].includes(type);
}

function getLanguageFromType(type: ArtifactType): string {
  const languageMap: Record<ArtifactType, string> = {
    react: 'jsx',
    html: 'html',
    javascript: 'javascript',
    vue: 'javascript',
    markdown: 'markdown',
    document: 'markdown',
  };
  return languageMap[type];
}

/**
 * Checks if text contains artifact tags (new or legacy format)
 */
export function hasArtifacts(text: string): boolean {
  return /<artifact\s+(operation=|identifier=)/.test(text);
}

/**
 * Finds an artifact by identifier in a list
 */
export function findArtifact(artifacts: ArtifactData[], identifier: string): ArtifactData | undefined {
  return artifacts.find(a => a.identifier === identifier);
}

/**
 * Updates an existing artifact or adds a new one
 */
export function upsertArtifact(artifacts: ArtifactData[], newArtifact: ArtifactData): ArtifactData[] {
  const existing = findArtifact(artifacts, newArtifact.identifier);
  
  if (existing) {
    // Update existing artifact
    return artifacts.map(a => 
      a.identifier === newArtifact.identifier 
        ? { ...newArtifact, updatedAt: new Date().toISOString() }
        : a
    );
  } else {
    // Add new artifact
    return [...artifacts, newArtifact];
  }
}

/**
 * Extracts element code from DOM element (for inspect feature)
 */
export function extractElementCode(element: Element, sourceType: ArtifactType): string {
  if (sourceType === 'react') {
    // For React, try to extract JSX-like representation
    return convertToJSX(element);
  } else {
    // For HTML, just get outerHTML
    return formatHTML(element.outerHTML);
  }
}

function convertToJSX(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const attributes: string[] = [];

  Array.from(element.attributes).forEach(attr => {
    let name = attr.name;
    let value = attr.value;

    if (name === 'class') {
      name = 'className';
    }

    if (name === 'style') {
      return;
    }

    if (value === '' || value === name) {
      attributes.push(name);
    } else {
      attributes.push(`${name}="${value}"`);
    }
  });

  const computedStyle = window.getComputedStyle(element);
  const importantStyles = [
    'backgroundColor', 'color', 'padding', 'margin',
    'fontSize', 'fontWeight', 'border', 'borderRadius',
    'width', 'height', 'display', 'flexDirection'
  ];

  const styleObj: Record<string, string> = {};
  importantStyles.forEach(prop => {
    const value = computedStyle.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
    if (value && value !== 'none' && value !== 'normal') {
      styleObj[prop] = value;
    }
  });

  if (Object.keys(styleObj).length > 0) {
    const styleString = JSON.stringify(styleObj, null, 2)
      .replace(/"(\w+)":/g, '$1:')
      .replace(/"/g, "'");
    attributes.push(`style={${styleString}}`);
  }

  const attrsString = attributes.length > 0 ? ' ' + attributes.join(' ') : '';
  const innerHTML = element.innerHTML.trim();

  if (innerHTML) {
    return `<${tag}${attrsString}>\n  ${innerHTML}\n</${tag}>`;
  } else {
    return `<${tag}${attrsString} />`;
  }
}

function formatHTML(html: string): string {
  return html
    .replace(/></g, '>\n<')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}


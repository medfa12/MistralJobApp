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
  
  // New format regex: <artifact operation="..." type="..." title="..." version="...">
  const newFormatRegex = /<artifact\s+operation=["']([^"']+)["'](?:\s+type=["']([^"']+)["'])?(?:\s+title=["']([^"']+)["'])?(?:\s+version=["']([^"']+)["'])?>([\s\S]*?)<\/artifact>/g;
  
  // Legacy format regex (for backward compatibility)
  const legacyFormatRegex = /<artifact\s+identifier=["']([^"']+)["']\s+type=["']([^"']+)["']\s+title=["']([^"']+)["']>([\s\S]*?)<\/artifact>/g;
  
  let cleanText = text;
  
  // Parse new format
  let match;
  while ((match = newFormatRegex.exec(text)) !== null) {
    const [fullMatch, operation, type, title, version, content] = match;
    
    // Handle delete operation
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
    
    // Validate type for create/edit
    if (!type || !isValidArtifactType(type)) {
      console.warn(`Invalid or missing artifact type: ${type}`);
      continue;
    }
    
    // Extract code from markdown code blocks
    const code = extractCode(content.trim());
    
    // Validate code
    const validation = validateArtifactCode(code, type as ArtifactType);
    if (!validation.valid) {
      console.warn(`Invalid artifact code for ${type}:`, validation.errors);
      console.warn(`Code preview:`, code.substring(0, 200));
      continue;
    }
    
    // Generate identifier for new artifacts
    const identifier = operation === 'create' 
      ? `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      : 'current-artifact'; // Edit uses same ID

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
    
    // Add a reference marker in the cleaned text
    const operationLabel = operation === 'create' ? 'Created' : 'Updated';
    cleanText = cleanText.replace(fullMatch, `\n\n[Artifact ${operationLabel}: ${artifact.title}]\n\n`);
  }
  
  // Parse legacy format (backward compatibility)
  while ((match = legacyFormatRegex.exec(text)) !== null) {
    const [fullMatch, identifier, type, title, content] = match;
    
    if (!isValidArtifactType(type)) {
      console.warn(`Invalid artifact type: ${type}`);
      continue;
    }

    const code = extractCode(content.trim());
    const validation = validateArtifactCode(code, type as ArtifactType);
    if (!validation.valid) {
      console.warn(`Invalid legacy artifact code for ${type}:`, validation.errors);
      console.warn(`Code preview:`, code.substring(0, 200));
      continue;
    }

    const artifact: ParsedArtifact = {
      operation: 'create', // Legacy format defaults to create
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

/**
 * Extracts code from markdown code blocks
 * Handles ```language ... ``` format
 */
export function extractCode(text: string): string {
  // Match markdown code blocks: ```language\ncode\n```
  const codeBlockRegex = /```(?:\w+)?\s*\n?([\s\S]*?)```/;
  const match = text.match(codeBlockRegex);
  
  if (match) {
    return match[1].trim();
  }
  
  // If no code block, return trimmed text
  return text.trim();
}

/**
 * Validates artifact code for security and correctness
 */
export function validateArtifactCode(code: string, type: ArtifactType): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  // Check if code is empty
  if (!code || code.trim().length === 0) {
    errors.push('Code cannot be empty');
    return { valid: false, errors };
  }

  // Check code length (max 50KB)
  if (code.length > 50000) {
    errors.push('Code exceeds maximum length of 50KB');
  }

  // Security checks - dangerous patterns
  // Note: Some patterns are commented out as they may be too restrictive for legitimate use
  const dangerousPatterns = [
    { pattern: /eval\s*\(/gi, name: 'eval()' },
    { pattern: /Function\s*\(/gi, name: 'Function constructor' },
    { pattern: /new\s+Function/gi, name: 'new Function()' },
    { pattern: /setTimeout\s*\(\s*["'`]/gi, name: 'setTimeout with string' },
    { pattern: /setInterval\s*\(\s*["'`]/gi, name: 'setInterval with string' },
    { pattern: /<script[^>]*src=/gi, name: 'external script' },
    { pattern: /document\.write/gi, name: 'document.write' },
    // innerHTML and outerHTML are commonly used, only block if needed
    // { pattern: /innerHTML\s*=/gi, name: 'innerHTML assignment' },
    // { pattern: /outerHTML\s*=/gi, name: 'outerHTML assignment' },
    { pattern: /import\s*\(/gi, name: 'dynamic import()' },
    { pattern: /XMLHttpRequest/gi, name: 'XMLHttpRequest' },
    // fetch is commonly used for APIs, consider allowing it
    // { pattern: /fetch\s*\(/gi, name: 'fetch() API' },
    { pattern: /WebSocket/gi, name: 'WebSocket' },
    { pattern: /<iframe/gi, name: 'nested iframe' },
    { pattern: /javascript:/gi, name: 'javascript: protocol' },
    // Only block HTML inline handlers like onclick="...", not React's onClick={...}
    { pattern: /<[^>]+\s+on\w+\s*=\s*["']/gi, name: 'inline event handler (in HTML)' },
    { pattern: /\.call\s*\(\s*null/gi, name: 'suspicious .call()' },
    { pattern: /\.apply\s*\(\s*null/gi, name: 'suspicious .apply()' },
    { pattern: /__proto__/gi, name: 'prototype pollution' },
    { pattern: /constructor\[/gi, name: 'constructor access' },
    { pattern: /\[\s*["']constructor["']\s*\]/gi, name: 'constructor string access' },
    { pattern: /globalThis/gi, name: 'globalThis access' },
    { pattern: /process\./gi, name: 'process object access' },
    { pattern: /require\s*\(/gi, name: 'require()' },
    { pattern: /import\s+.*\s+from/gi, name: 'ES6 import statement' },
    { pattern: /<link[^>]*href=["'](?!data:)/gi, name: 'external stylesheet' },
    // Base64 operations are commonly used, consider allowing
    // { pattern: /atob\s*\(/gi, name: 'base64 decode (potential obfuscation)' },
    // { pattern: /btoa\s*\(/gi, name: 'base64 encode (potential obfuscation)' },
    // Storage APIs are commonly used in modern apps
    // { pattern: /localStorage/gi, name: 'localStorage access' },
    // { pattern: /sessionStorage/gi, name: 'sessionStorage access' },
    // { pattern: /indexedDB/gi, name: 'indexedDB access' },
    // Navigator is commonly used for feature detection
    // { pattern: /navigator\./gi, name: 'navigator object access' },
    // Location is commonly used for navigation
    // { pattern: /location\./gi, name: 'location object access' },
    { pattern: /top\./gi, name: 'top frame access' },
    { pattern: /parent\./gi, name: 'parent frame access' },
    { pattern: /window\.open/gi, name: 'window.open()' },
    // Dialogs can be annoying but sometimes useful for demos
    // { pattern: /alert\s*\(/gi, name: 'alert() (annoying)' },
    // { pattern: /confirm\s*\(/gi, name: 'confirm() (annoying)' },
    // { pattern: /prompt\s*\(/gi, name: 'prompt() (annoying)' },
  ];

  for (const { pattern, name } of dangerousPatterns) {
    if (pattern.test(code)) {
      errors.push(`Code contains potentially dangerous pattern: ${name}`);
    }
  }

  // Type-specific validation
  if (type === 'react') {
    // Check for window.App export
    if (!code.includes('window.App')) {
      errors.push('React artifacts must export component as window.App');
    }
  }

  if (type === 'html') {
    // Check for basic HTML structure or content
    if (!code.includes('<') || !code.includes('>')) {
      errors.push('HTML artifacts must contain valid HTML tags');
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Checks if a string is a valid artifact type
 */
function isValidArtifactType(type: string): boolean {
  return ['react', 'html', 'javascript', 'vue'].includes(type);
}

/**
 * Gets the language identifier for syntax highlighting
 */
function getLanguageFromType(type: ArtifactType): string {
  const languageMap: Record<ArtifactType, string> = {
    react: 'jsx',
    html: 'html',
    javascript: 'javascript',
    vue: 'javascript',
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

/**
 * Converts DOM element to JSX-like string
 */
function convertToJSX(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const attributes: string[] = [];

  // Convert attributes to JSX format
  Array.from(element.attributes).forEach(attr => {
    let name = attr.name;
    let value = attr.value;

    // Convert class to className
    if (name === 'class') {
      name = 'className';
    }

    // Convert style string to object notation (simplified)
    if (name === 'style') {
      return; // We'll handle styles separately
    }

    // Handle boolean attributes
    if (value === '' || value === name) {
      attributes.push(name);
    } else {
      attributes.push(`${name}="${value}"`);
    }
  });

  // Get computed styles
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

/**
 * Formats HTML for better readability
 */
function formatHTML(html: string): string {
  // Basic HTML formatting (simplified)
  return html
    .replace(/></g, '>\n<')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}


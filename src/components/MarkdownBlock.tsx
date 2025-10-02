//@ts-ignore
import ReactMarkdown from 'react-markdown';
//@ts-ignore
import remarkMath from 'remark-math';
//@ts-ignore
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { FC, useEffect, useState } from 'react';

interface Props {
  code: string;
  editable?: boolean;
  onChange?: (value: string) => void;
}

export const MarkdownBlock: FC<Props> = ({
  code,
  editable = false,
  onChange = () => {},
}) => {
  const [copyText, setCopyText] = useState<string>('Copy');

  const processLatex = (text: string) => {
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
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCopyText('Copy');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [copyText]);

  const processedCode = processLatex(code);

  return (
    <div className="relative">
      <button
        className="absolute right-0 top-0 z-10 rounded bg-[#1A1B26] p-1 text-xs text-white hover:bg-[#2D2E3A] active:bg-[#2D2E3A]"
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopyText('Copied!');
        }}
      >
        {copyText}
      </button>

      <div className="p-4 h-500px bg-[#1A1B26] text-white overflow-scroll w-[100%] rounded-md">
        <ReactMarkdown 
          className="font-normal w-[100%]"
          remarkPlugins={[remarkMath] as any}
          rehypePlugins={[rehypeKatex] as any}
        >
          {processedCode}
        </ReactMarkdown>
      </div>
    </div>
  );
};

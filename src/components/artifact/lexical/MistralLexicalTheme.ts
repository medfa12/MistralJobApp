import { EditorThemeClasses } from 'lexical';

export const MISTRAL_COLORS = {
  orange: {
    primary: '#FF9559',
    light: '#FFD5BD',
    dark: '#E06020',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    700: '#374151',
    900: '#111827',
  }
};

export const MISTRAL_LEXICAL_THEME: EditorThemeClasses = {
  heading: {
    h1: 'text-4xl font-bold mb-6 pb-3 border-b-2 border-orange-500',
    h2: 'text-3xl font-semibold mb-4 pb-2 border-l-4 border-orange-400 pl-4',
    h3: 'text-2xl font-semibold mb-3 border-l-2 border-orange-300 pl-3',
    h4: 'text-xl font-medium mb-2',
    h5: 'text-lg font-medium mb-2',
    h6: 'text-base font-medium mb-1',
  },

  paragraph: 'text-base mb-4 leading-relaxed font-sans',

  text: {
    bold: 'font-semibold',
    italic: 'italic',
    underline: 'underline decoration-orange-400 decoration-2',
    strikethrough: 'line-through opacity-70',
    code: 'bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-mono text-sm',
  },

  link: 'text-orange-500 hover:text-orange-600 underline cursor-pointer transition-colors',

  code: 'bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto my-4 border-l-4 border-orange-500',

  list: {
    ul: 'list-disc list-inside ml-4 mb-4 space-y-2',
    ol: 'list-decimal list-inside ml-4 mb-4 space-y-2',
    listitem: 'pl-2',
    nested: {
      listitem: 'ml-6'
    },
    listitemChecked: 'line-through opacity-60',
    listitemUnchecked: '',
  },

  quote: 'border-l-4 border-orange-400 pl-4 italic my-4 bg-orange-50 py-3 pr-3 rounded-r',

  table: 'border-collapse w-full my-6 overflow-hidden rounded-lg shadow-sm',
  tableCell: 'border border-gray-300 px-4 py-2 text-left',
  tableCellHeader: 'bg-orange-500 text-white font-semibold border border-orange-600 px-4 py-2 text-left',
};

export const MISTRAL_TYPOGRAPHY = {
  fontFamily: {
    sans: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'Fira Code', 'SF Mono', Monaco, 'Courier New', monospace",
  },
  fontSize: {
    base: '16px',
    large: '18px',
  },
  lineHeight: {
    normal: 1.7,
    relaxed: 1.8,
  },
};



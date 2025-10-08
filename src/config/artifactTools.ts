export type ArtifactToolName = 
  | 'create_artifact'
  | 'edit_artifact'
  | 'delete_artifact'
  | 'revert_artifact'
  | 'insert_section'
  | 'update_section'
  | 'delete_section'
  | 'apply_formatting';

export const ARTIFACT_TOOLS = [
  {
    type: "function",
    function: {
      name: "create_artifact",
      description: "Create a new artifact (code component, markdown document, or rich text document) that renders in the user's interface",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["react", "html", "javascript", "vue", "markdown", "document"],
            description: "Type: react/html/javascript/vue for code, markdown for simple text docs, document for rich text with editing"
          },
          title: {
            type: "string",
            description: "A descriptive title for the artifact"
          },
          code: {
            type: "string",
            description: "For code: complete code. For markdown/document: markdown text with # headings, **bold**, lists, etc."
          },
          language: {
            type: "string",
            description: "For syntax highlighting: jsx, html, javascript, markdown"
          }
        },
        required: ["type", "title", "code"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "edit_artifact",
      description: "Edit the existing artifact. For code: provide complete updated code. For documents: provide complete updated markdown.",
      parameters: {
        type: "object",
        properties: {
          identifier: {
            type: "string",
            description: "Optional: the identifier or title of the target artifact to edit. If omitted, edits apply to the currently focused artifact."
          },
          type: {
            type: "string",
            enum: ["react", "html", "javascript", "vue", "markdown", "document"],
            description: "The type of the artifact"
          },
          title: {
            type: "string",
            description: "Updated title for the artifact"
          },
          code: {
            type: "string",
            description: "Complete updated code or markdown content"
          },
          language: {
            type: "string",
            description: "The language for syntax highlighting"
          }
        },
        required: ["type", "title", "code"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_artifact",
      description: "Delete the current artifact from the interface",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "revert_artifact",
      description: "Revert the artifact to a previous version from its version history",
      parameters: {
        type: "object",
        properties: {
          version: {
            type: "integer",
            description: "The version number to revert to (starting from 1)"
          }
        },
        required: ["version"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "insert_section",
      description: "Insert a new section into a markdown/document artifact at a specific position",
      parameters: {
        type: "object",
        properties: {
          position: {
            type: "string",
            enum: ["start", "end", "after_heading"],
            description: "Where to insert: at start, at end, or after a specific heading"
          },
          heading: {
            type: "string",
            description: "Heading for the new section (e.g., 'Introduction', 'Conclusion')"
          },
          content: {
            type: "string",
            description: "Markdown content for the section"
          },
          afterHeading: {
            type: "string",
            description: "When position is 'after_heading', which heading to insert after"
          }
        },
        required: ["position", "heading", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_section",
      description: "Update content of an existing section in a markdown/document artifact by heading name",
      parameters: {
        type: "object",
        properties: {
          heading: {
            type: "string",
            description: "Heading of the section to update (case-insensitive partial match)"
          },
          newContent: {
            type: "string",
            description: "New markdown content for the section"
          },
          mode: {
            type: "string",
            enum: ["replace", "append", "prepend"],
            description: "How to update: replace entire section, append to end, or prepend to start"
          }
        },
        required: ["heading", "newContent"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_section",
      description: "Remove a section from a markdown/document artifact",
      parameters: {
        type: "object",
        properties: {
          heading: {
            type: "string",
            description: "Heading of the section to delete"
          }
        },
        required: ["heading"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "apply_formatting",
      description: "Apply bold, italic, or other markdown formatting to text in a document section",
      parameters: {
        type: "object",
        properties: {
          section: {
            type: "string",
            description: "Section heading to apply formatting to, or 'all' for entire document"
          },
          action: {
            type: "string",
            enum: ["make_bold", "make_italic", "add_code_formatting", "improve_structure"],
            description: "Formatting action to apply"
          },
          target: {
            type: "string",
            description: "Text to format (for make_bold/make_italic)"
          }
        },
        required: ["section", "action"]
      }
    }
  }
];


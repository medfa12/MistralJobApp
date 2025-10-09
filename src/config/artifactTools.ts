export type ArtifactToolName =
  | 'create_artifact'
  | 'edit_artifact'
  | 'delete_artifact'
  | 'revert_artifact'
  | 'update_content';

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
      description: "Edit the existing artifact. Provide complete updated code or markdown content.",
      parameters: {
        type: "object",
        properties: {
          identifier: {
            type: "string",
            description: "Optional: identifier or title of artifact to edit. If omitted, edits the focused artifact."
          },
          type: {
            type: "string",
            enum: ["react", "html", "javascript", "vue", "markdown", "document"],
            description: "Artifact type"
          },
          title: {
            type: "string",
            description: "Updated title"
          },
          code: {
            type: "string",
            description: "Complete updated code or markdown"
          },
          language: {
            type: "string",
            description: "Language for syntax highlighting"
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
      description: "Delete the current artifact",
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
      description: "Revert artifact to a previous version",
      parameters: {
        type: "object",
        properties: {
          version: {
            type: "integer",
            description: "Version number to revert to (starting from 1)"
          }
        },
        required: ["version"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_content",
      description: "Update markdown or document content directly. For markdown/document artifacts only.",
      parameters: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "Complete markdown content"
          }
        },
        required: ["content"]
      }
    }
  }
];


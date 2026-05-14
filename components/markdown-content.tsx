import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-invert max-w-none prose-sm break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: ({ node, inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : 'plaintext'

          if (inline) {
            return (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
                {...props}
              >
                {children}
              </code>
            )
          }

          return (
            <div className="relative my-2 rounded-lg overflow-hidden bg-muted border border-border">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground">
                  {language}
                </span>
              </div>
              <pre className="overflow-x-auto p-4">
                <code
                  className={`language-${language} text-sm`}
                  {...props}
                >
                  {children}
                </code>
              </pre>
            </div>
          )
        },
        h1: ({ node, ...props }) => (
          <h1 className="text-2xl font-bold mt-6 mb-3 text-foreground" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-xl font-bold mt-5 mb-2 text-foreground" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-lg font-bold mt-4 mb-2 text-foreground" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="mb-2 leading-relaxed text-foreground" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside mb-3 space-y-1 text-foreground" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside mb-3 space-y-1 text-foreground" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="ml-2 text-foreground" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-primary pl-4 py-2 my-2 italic text-muted-foreground"
            {...props}
          />
        ),
        table: ({ node, ...props }) => (
          <table
            className="w-full border-collapse border border-border my-2"
            {...props}
          />
        ),
        th: ({ node, ...props }) => (
          <th className="border border-border bg-muted p-2 text-foreground" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="border border-border p-2 text-foreground" {...props} />
        ),
        a: ({ node, ...props }) => (
          <a
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        }}
      />
    </div>
  )
}

// components/MarkdownWithMath.js
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypePrism from 'rehype-prism-plus';
import 'katex/dist/katex.min.css';
import 'prism-themes/themes/prism-vs.css'; // Choose your preferred Prism theme

const MarkdownWithMath = ({ content }) => {
    return (
        <ReactMarkdown
            children={content}
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex, rehypePrism]}
            components={{
                code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                        <pre className={className}>
              <code {...props}>{children}</code>
            </pre>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
            }}
        />
    );
};

export default MarkdownWithMath;

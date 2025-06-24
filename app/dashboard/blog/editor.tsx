// Editor.js
'use client'
import React, { useState, useEffect, useRef } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const Editor = ({ value, onChange, readOnly = false, placeholder }: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const getSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    return selection.getRangeAt(0);
  };

  const applyFormat = (tag: string, attributes: Record<string, string> = {}) => {
    const range = getSelection();
    if (!range || !editorRef.current) return;

    editorRef.current.focus();

    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    range.surroundContents(element);
    handleInput();
  };

  const toggleFormat = (tag: string) => {
  const range = getSelection();
  if (!range || !editorRef.current) return;

  editorRef.current.focus();

  const element = document.createElement(tag);

  try {
    // Extract the selected content
    const selectedContent = range.extractContents();

    // Append the content inside the new tag
    element.appendChild(selectedContent);

    // Insert the formatted element back into the DOM
    range.insertNode(element);

    // Move cursor after the inserted node
    range.setStartAfter(element);
    range.setEndAfter(element);

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    handleInput();
  } catch (error) {
    console.warn('toggleFormat failed:', error);
  }
};


  const formatHeading = (level: string) => {
    const range = getSelection();
    if (!range || !editorRef.current) return;

    editorRef.current.focus();

    // Get the selected text
    const selectedText = range.toString();

    // Create heading element
    const heading = document.createElement(level);
    if (selectedText) {
      heading.textContent = selectedText;
      // Replace the selected text with the heading
      range.deleteContents();
      range.insertNode(heading);
    } else {
      // If no text selected, create empty heading
      heading.textContent = 'Heading';
      range.insertNode(heading);

      // Select the text so user can type over it
      const newRange = document.createRange();
      newRange.setStart(heading.firstChild!, 0);
      newRange.setEnd(heading.firstChild!, heading.textContent.length);

      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    handleInput();
  };

  const insertList = (ordered: boolean) => {
    const range = getSelection();
    if (!range || !editorRef.current) return;

    editorRef.current.focus();

    // Get the selected text
    const selectedText = range.toString();

    // Create list and list item
    const listType = ordered ? 'ol' : 'ul';
    const list = document.createElement(listType);
    const listItem = document.createElement('li');

    if (selectedText) {
      listItem.textContent = selectedText;
      // Replace the selected text with the list
      range.deleteContents();
      range.insertNode(list);
      list.appendChild(listItem);
    } else {
      // If no text selected, create empty list item
      listItem.textContent = 'List item';
      list.appendChild(listItem);
      range.insertNode(list);

      // Select the text so user can type over it
      const newRange = document.createRange();
      newRange.setStart(listItem.firstChild!, 0);
      newRange.setEnd(listItem.firstChild!, listItem.textContent.length);

      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    handleInput();
  };

  const execCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    switch (command) {
      case 'bold':
        toggleFormat('strong');
        break;
      case 'italic':
        toggleFormat('em');
        break;
      case 'underline':
        toggleFormat('u');
        break;
      case 'paragraph':
        toggleFormat('p');
        break;
      case 'strikeThrough':
        toggleFormat('s');
        break;
      case 'formatBlock':
        if (value) {
          const tagName = value.replace(/[<>]/g, '').trim();
          formatHeading(tagName);
        }
        break;
      case 'insertUnorderedList':
        insertList(false);
        break;
      case 'insertOrderedList':
        insertList(true);
        break;
      case 'removeFormat':
        const range = getSelection();
        if (range) {
          const fragment = range.extractContents();
          range.insertNode(fragment);
          handleInput();
        }
        break;
      case 'foreColor':
        if (value) {
          applyFormat('span', { style: `color: ${value}` });
        }
        break;
      default:
        break;
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url && editorRef.current) {
      const range = getSelection();
      if (range) {
        const link = document.createElement('a');
        link.href = url;
        link.textContent = range.toString() || url;
        range.deleteContents();
        range.insertNode(link);
        handleInput();
      }
    }
  };

  const changeTextColor = () => {
    const color = prompt('Enter color (e.g., #F28C26, red, blue):');
    if (color) {
      execCommand('foreColor', color);
    }
  };

  const toolbarButtons = [
    { label: 'B', command: 'bold', title: 'Bold' },
    { label: 'I', command: 'italic', title: 'Italic' },
    { label: 'U', command: 'underline', title: 'Underline' },
    { label: 'S', command: 'strikeThrough', title: 'Strikethrough' },
    { label: 'P', command: 'paragraph', title: 'Paragraph' },
    { label: 'H1', command: 'formatBlock', value: '<h1>', title: 'Heading 1' },
    { label: 'H2', command: 'formatBlock', value: '<h2>', title: 'Heading 2' },
    { label: 'H3', command: 'formatBlock', value: '<h3>', title: 'Heading 3' },
    { label: '•', command: 'insertUnorderedList', title: 'Bullet List' },
    { label: '1.', command: 'insertOrderedList', title: 'Numbered List' },
    { label: '🔗', command: 'custom', action: insertLink, title: 'Insert Link' },
    { label: '🎨', command: 'custom', action: changeTextColor, title: 'Text Color' },
    { label: '🧹', command: 'removeFormat', title: 'Clear Formatting' },
  ];

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              if (button.command === 'custom' && button.action) {
                button.action();
              } else {
                execCommand(button.command, (button as any).value);
              }
            }}
            title={button.title}
            className="toolbar-button"
          >
            {button.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`editor-content ${isFocused ? 'focused' : ''}`}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <style jsx>{`
        .rich-text-editor {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
        }
        
        h1{
          font-size:6rem;
        }

        .editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          padding: 8px;
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .toolbar-button {
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .toolbar-button:hover {
          background-color: #F28C26;
          color: white;
          border-color: #F28C26;
        }
        
        .editor-content {
          min-height: 300px;
          padding: 16px;
          outline: none;
          font-size: 16px;
          line-height: 1.6;
          background: white;
        }
        
        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
        }
        
        .editor-content.focused {
          border-color: #F28C26;
        }
        
        .editor-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        
        .editor-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        
        .editor-content h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0;
        }
        
        .editor-content blockquote {
          border-left: 4px solid #F28C26;
          margin: 1em 0;
          padding-left: 1em;
          font-style: italic;
        }
        
        .editor-content ul, .editor-content ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .editor-content a {
          color: #F28C26;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Editor;

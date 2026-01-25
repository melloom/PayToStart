"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { useCallback, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Minus,
  Undo,
  Redo,
  Table as TableIcon,
  Plus,
  Trash2,
  RowsIcon,
  ColumnsIcon,
  Highlighter,
  Code,
  Pilcrow,
  ChevronDown,
  Palette,
  MoreHorizontal,
  Keyboard,
  SpellCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SpellChecker, useSpellChecker } from "./spell-checker";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  showMarkdownHint?: boolean;
  showSpellChecker?: boolean;
}

// Toolbar Button Component
function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
  className,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded-md transition-all duration-150",
        isActive
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-400 hover:text-white hover:bg-slate-700",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}

// Toolbar Divider
function ToolbarDivider() {
  return <div className="w-px h-6 bg-slate-700 mx-1" />;
}

// Dropdown Menu Component
function ToolbarDropdown({
  trigger,
  children,
  isOpen,
  setIsOpen,
  title,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={title}
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 rounded-md transition-all duration-150",
          isOpen
            ? "bg-slate-700 text-white"
            : "text-slate-400 hover:text-white hover:bg-slate-700"
        )}
      >
        {trigger}
        <ChevronDown className="h-3 w-3" />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 animate-in slide-in-from-top-2 duration-150">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function DropdownItem({
  onClick,
  isActive,
  children,
  icon: Icon,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-indigo-600/20 text-indigo-400"
          : "text-slate-300 hover:bg-slate-700 hover:text-white"
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start typing your contract content...",
  className,
  minHeight = "400px",
  showMarkdownHint = true,
  showSpellChecker = true,
}: RichTextEditorProps) {
  const [headingOpen, setHeadingOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSpellPanel, setShowSpellPanel] = useState(false);
  const { fixWord, fixAllWords } = useSpellChecker();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        history: {
          depth: 100,
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "contract-table",
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      TextStyle,
      Color,
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-invert prose-sm max-w-none focus:outline-none",
          "prose-headings:text-white prose-headings:font-bold prose-headings:mb-3",
          "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
          "prose-p:text-slate-300 prose-p:leading-relaxed",
          "prose-strong:text-white prose-strong:font-semibold",
          "prose-em:text-slate-200 prose-em:italic",
          "prose-ul:list-disc prose-ul:pl-6 prose-ul:text-slate-300",
          "prose-ol:list-decimal prose-ol:pl-6 prose-ol:text-slate-300",
          "prose-li:my-1",
          "prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-400",
          "prose-code:text-indigo-400 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
          "prose-hr:border-slate-700"
        ),
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setHeadingOpen(false);
      setTableOpen(false);
      setColorOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const insertTable = useCallback(() => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
      setTableOpen(false);
    }
  }, [editor]);

  const insertPaymentScheduleTable = useCallback(() => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({ rows: 4, cols: 4, withHeaderRow: true })
        .run();
      
      // Add header content
      const headerCells = ["Milestone", "Description", "Amount", "Due Date"];
      // Note: TipTap will create the table, user can fill in the content
      setTableOpen(false);
    }
  }, [editor]);

  const insertMilestoneTable = useCallback(() => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({ rows: 5, cols: 3, withHeaderRow: true })
        .run();
      setTableOpen(false);
    }
  }, [editor]);

  const colors = [
    { name: "Default", value: "inherit" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Yellow", value: "#eab308" },
    { name: "Green", value: "#22c55e" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#a855f7" },
    { name: "Pink", value: "#ec4899" },
  ];

  const highlightColors = [
    { name: "Yellow", value: "#fef08a" },
    { name: "Green", value: "#bbf7d0" },
    { name: "Blue", value: "#bfdbfe" },
    { name: "Pink", value: "#fbcfe8" },
    { name: "Purple", value: "#e9d5ff" },
  ];

  if (!editor) {
    return (
      <div className={cn("animate-pulse bg-slate-700/50 rounded-lg", className)} style={{ minHeight }} />
    );
  }

  return (
    <div className={cn("border-2 border-slate-700 rounded-lg overflow-hidden bg-slate-800/50", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-slate-800 border-b border-slate-700">
        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* Headings Dropdown */}
        <div onClick={(e) => e.stopPropagation()}>
          <ToolbarDropdown
            trigger={
              <>
                <Pilcrow className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">Format</span>
              </>
            }
            isOpen={headingOpen}
            setIsOpen={setHeadingOpen}
            title="Text Format"
          >
            <DropdownItem
              onClick={() => {
                editor.chain().focus().setParagraph().run();
                setHeadingOpen(false);
              }}
              isActive={editor.isActive("paragraph")}
              icon={Pilcrow}
            >
              Paragraph
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
                setHeadingOpen(false);
              }}
              isActive={editor.isActive("heading", { level: 1 })}
              icon={Heading1}
            >
              Heading 1
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                setHeadingOpen(false);
              }}
              isActive={editor.isActive("heading", { level: 2 })}
              icon={Heading2}
            >
              Heading 2
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 3 }).run();
                setHeadingOpen(false);
              }}
              isActive={editor.isActive("heading", { level: 3 })}
              icon={Heading3}
            >
              Heading 3
            </DropdownItem>
            <div className="h-px bg-slate-700 my-1" />
            <DropdownItem
              onClick={() => {
                editor.chain().focus().toggleCodeBlock().run();
                setHeadingOpen(false);
              }}
              isActive={editor.isActive("codeBlock")}
              icon={Code}
            >
              Code Block
            </DropdownItem>
          </ToolbarDropdown>
        </div>

        <ToolbarDivider />

        {/* Text Formatting */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* Color & Highlight */}
        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-0.5">
          <ToolbarDropdown
            trigger={<Palette className="h-4 w-4" />}
            isOpen={colorOpen}
            setIsOpen={setColorOpen}
            title="Text Color"
          >
            <div className="px-2 py-1.5">
              <p className="text-xs text-slate-500 mb-2">Text Color</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      if (color.value === "inherit") {
                        editor.chain().focus().unsetColor().run();
                      } else {
                        editor.chain().focus().setColor(color.value).run();
                      }
                      setColorOpen(false);
                    }}
                    className={cn(
                      "w-6 h-6 rounded-md border-2 transition-all hover:scale-110",
                      color.value === "inherit"
                        ? "bg-slate-600 border-slate-500"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: color.value === "inherit" ? undefined : color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 mb-2">Highlight</p>
              <div className="flex flex-wrap gap-1">
                {highlightColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      editor.chain().focus().toggleHighlight({ color: color.value }).run();
                      setColorOpen(false);
                    }}
                    className="w-6 h-6 rounded-md border-2 border-transparent transition-all hover:scale-110"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
                <button
                  onClick={() => {
                    editor.chain().focus().unsetHighlight().run();
                    setColorOpen(false);
                  }}
                  className="w-6 h-6 rounded-md border-2 border-slate-500 bg-slate-700 text-slate-400 flex items-center justify-center text-xs hover:scale-110 transition-all"
                  title="Remove Highlight"
                >
                  ✕
                </button>
              </div>
            </div>
          </ToolbarDropdown>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()}
            isActive={editor.isActive("highlight")}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* Lists */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* Alignment */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* Table */}
        <div onClick={(e) => e.stopPropagation()}>
          <ToolbarDropdown
            trigger={<TableIcon className="h-4 w-4" />}
            isOpen={tableOpen}
            setIsOpen={setTableOpen}
            title="Insert Table"
          >
            <DropdownItem onClick={insertTable} icon={TableIcon}>
              Basic Table (3×3)
            </DropdownItem>
            <DropdownItem onClick={insertPaymentScheduleTable} icon={TableIcon}>
              Payment Schedule (4×4)
            </DropdownItem>
            <DropdownItem onClick={insertMilestoneTable} icon={TableIcon}>
              Milestones (5×3)
            </DropdownItem>
            {editor.isActive("table") && (
              <>
                <div className="h-px bg-slate-700 my-1" />
                <DropdownItem
                  onClick={() => {
                    editor.chain().focus().addRowAfter().run();
                    setTableOpen(false);
                  }}
                  icon={RowsIcon}
                >
                  Add Row Below
                </DropdownItem>
                <DropdownItem
                  onClick={() => {
                    editor.chain().focus().addColumnAfter().run();
                    setTableOpen(false);
                  }}
                  icon={ColumnsIcon}
                >
                  Add Column Right
                </DropdownItem>
                <DropdownItem
                  onClick={() => {
                    editor.chain().focus().deleteRow().run();
                    setTableOpen(false);
                  }}
                  icon={Trash2}
                >
                  Delete Row
                </DropdownItem>
                <DropdownItem
                  onClick={() => {
                    editor.chain().focus().deleteColumn().run();
                    setTableOpen(false);
                  }}
                  icon={Trash2}
                >
                  Delete Column
                </DropdownItem>
                <DropdownItem
                  onClick={() => {
                    editor.chain().focus().deleteTable().run();
                    setTableOpen(false);
                  }}
                  icon={Trash2}
                >
                  Delete Table
                </DropdownItem>
              </>
            )}
          </ToolbarDropdown>
        </div>

        {/* Horizontal Rule */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Line"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Spell Check */}
        {showSpellChecker && (
          <ToolbarButton
            onClick={() => setShowSpellPanel(!showSpellPanel)}
            isActive={showSpellPanel}
            title="Spell Checker"
          >
            <SpellCheck className="h-4 w-4" />
          </ToolbarButton>
        )}

        {/* Keyboard Shortcuts */}
        <ToolbarButton
          onClick={() => setShowShortcuts(!showShortcuts)}
          isActive={showShortcuts}
          title="Keyboard Shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Keyboard Shortcuts Panel */}
      {showShortcuts && (
        <div className="p-3 bg-slate-900/80 border-b border-slate-700 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Keyboard Shortcuts</span>
            <button
              onClick={() => setShowShortcuts(false)}
              className="text-slate-500 hover:text-white text-xs"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
            {[
              { keys: "Ctrl+B", action: "Bold" },
              { keys: "Ctrl+I", action: "Italic" },
              { keys: "Ctrl+U", action: "Underline" },
              { keys: "Ctrl+Z", action: "Undo" },
              { keys: "Ctrl+Shift+Z", action: "Redo" },
              { keys: "Ctrl+Shift+7", action: "Numbered List" },
              { keys: "Ctrl+Shift+8", action: "Bullet List" },
              { keys: "Ctrl+Shift+B", action: "Blockquote" },
              { keys: "---", action: "Horizontal Rule (Markdown)" },
              { keys: "# + Space", action: "Heading 1 (Markdown)" },
              { keys: "## + Space", action: "Heading 2 (Markdown)" },
              { keys: "- + Space", action: "Bullet List (Markdown)" },
            ].map((shortcut) => (
              <div key={shortcut.keys} className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono text-[10px]">
                  {shortcut.keys}
                </kbd>
                <span className="text-slate-500">{shortcut.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spell Checker Panel */}
      {showSpellChecker && showSpellPanel && (
        <div className="border-b border-slate-700 animate-in slide-in-from-top-2 duration-150">
          <SpellChecker
            content={content}
            onFix={(oldWord, newWord) => {
              const newContent = fixWord(content, oldWord, newWord);
              onChange(newContent);
            }}
            onFixAll={(fixes) => {
              const newContent = fixAllWords(content, fixes);
              onChange(newContent);
            }}
            onAutoFix={(fixedContent) => {
              onChange(fixedContent);
            }}
            enableAutoFix={true}
            className="border-0 rounded-none"
          />
        </div>
      )}

      {/* Bubble Menu for quick formatting */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-0.5 p-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl"
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()}
            isActive={editor.isActive("highlight")}
            title="Highlight"
          >
            <Highlighter className="h-3.5 w-3.5" />
          </ToolbarButton>
        </BubbleMenu>
      )}

      {/* Editor Content */}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>

      {/* Markdown Hint & Character Count */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-t border-slate-700 text-xs text-slate-500">
        {showMarkdownHint && (
          <div className="flex items-center gap-2">
            <span>💡 Tip: Use Markdown shortcuts like # for headings, ** for bold, - for lists</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <span>{editor.storage.characterCount?.characters?.() || editor.getText().length} characters</span>
          <span>{editor.storage.characterCount?.words?.() || editor.getText().split(/\s+/).filter(Boolean).length} words</span>
        </div>
      </div>

      {/* Table Styles */}
      <style jsx global>{`
        .contract-table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        
        .contract-table th,
        .contract-table td {
          border: 1px solid #475569;
          padding: 0.5rem 0.75rem;
          text-align: left;
          min-width: 100px;
        }
        
        .contract-table th {
          background-color: #334155;
          font-weight: 600;
          color: #f1f5f9;
        }
        
        .contract-table td {
          background-color: #1e293b;
          color: #cbd5e1;
        }
        
        .contract-table tr:hover td {
          background-color: #334155;
        }
        
        .contract-table .selectedCell {
          background-color: #4f46e5 !important;
        }
        
        .ProseMirror {
          outline: none;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #64748b;
          pointer-events: none;
          height: 0;
        }
        
        .ProseMirror-focused p.is-editor-empty:first-child::before {
          color: #94a3b8;
        }
        
        /* Table resize handles */
        .tableWrapper {
          overflow-x: auto;
        }
        
        .resize-cursor {
          cursor: col-resize;
        }
      `}</style>
    </div>
  );
}

export default RichTextEditor;


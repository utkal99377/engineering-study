import React from 'react';

export const NotesViewer = ({ markdown = '' }) => {
  if (!markdown) {
    return <div className="text-xs text-slate-400">No notes available for this lecture.</div>;
  }

  // Parse lines into clean rendered paragraphs and code blocks
  const parseMarkdown = (md) => {
    const lines = md.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeBuffer = [];
    let codeLang = '';

    lines.forEach((line, idx) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${idx}`} className="my-4 rounded-xl overflow-hidden border border-slate-700/80 bg-[#0B0F19]">
              <div className="px-3 py-1.5 bg-[#141A29] text-[10px] font-mono text-slate-400 border-b border-slate-800 flex justify-between">
                <span>{codeLang || 'CODE'}</span>
                <span>Copy</span>
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
                {codeBuffer.join('\n')}
              </pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLang = line.replace('```', '').trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('# ')) {
        elements.push(<h1 key={idx} className="text-xl font-bold text-white mt-6 mb-3 border-b border-slate-800 pb-2">{line.replace('# ', '')}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={idx} className="text-lg font-semibold text-indigo-300 mt-5 mb-2">{line.replace('## ', '')}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={idx} className="text-sm font-semibold text-slate-200 mt-4 mb-1.5">{line.replace('### ', '')}</h3>);
      } else if (line.startsWith('> [!NOTE]') || line.startsWith('> [!TIP]')) {
        elements.push(
          <div key={idx} className="p-3 my-3 rounded-lg bg-indigo-950/40 border-l-4 border-indigo-500 text-xs text-indigo-200">
            <strong>Note:</strong> {line.replace(/> \[\!.*?\]/, '')}
          </div>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={idx} className="text-xs text-slate-300 ml-4 list-disc my-1">
            {line.replace('- ', '')}
          </li>
        );
      } else if (line.trim() === '') {
        // empty line
      } else {
        elements.push(<p key={idx} className="text-xs text-slate-300 leading-relaxed my-2">{line}</p>);
      }
    });

    return elements;
  };

  return (
    <div className="p-6 bg-[#111827] rounded-xl border border-slate-800/80 shadow-lg select-text">
      {parseMarkdown(markdown)}
    </div>
  );
};

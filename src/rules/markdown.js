export default new Map([
  /* コード */
  [/^```\n*([^`]*\n)```$/gm, (args) => {
    return `<div class="preview-md-code">${escape_html(args[1])}</div>`;
  }],
  /* インラインコード */
  [/`([^`]+)`/g, '<span class="preview-md-code">$1</span>'],
  /* 引用 */
  [/(?:^> ?.*\n)+/gm, (args) => {
    let rows = splitPresence(args[0], '\n');
    let output = '<div class="preview-md-quote">';
    rows.forEach((row) => {
      output += row.replace(/^> ?/, '') + '<br>';
    });
    output += '</div>';
    return output;
  }],
  /* 罫線 */
  [/^-{3,}$/gm, '<hr class="preview-md-hr">'],
  /* リスト */
  [/^(?:[ 	]*- .*?\n)+/gm, (args) => {
    let output = '<ul class="preview-md-list">';
    let rows = splitPresence(args[0], '\n');
    rows.forEach((row) => {
      let indent = 0;
      let text = row.replace(/^(  |	)*- /, (lineHead) => {
        indent = lineHead.split(/  |	/).length-1;
        return '';
      });

      let className = 'preview-md-list-item';        
      if (indent) className += ' preview-md-list-indent-' + indent;
      if (text.startsWith('[ ] ')) {
        text = '<input type="checkbox" class="preview-md-checkbox">' + text.slice(4);
        className += ' preview-md-checklist';
      } else if (text.startsWith('[x] ')) {
        text = '<input type="checkbox" class="preview-md-checkbox" checked>' + text.slice(4);
        className += ' preview-md-checklist';
      }
      output += '<li class="' + className + '">' + text + '</li>';
    });
    output += '</ul>';
    return output;
  }],
  /* 表組み */
  [/(.+\|.+)\n\|?:--:(?:\|:--:)+\|?\n((?:.+\|.+\n)+)/g, (args) => {
    let rows = args[2].split('\n');
    rows.unshift(args[1]);
    
    let outputItems = [];
    rows.forEach((row, rowNo) => {
      let items = row.split('|').filter((v) => { return v !== ''; });
      if (row) {
        outputItems[rowNo] = items;
      }
    });
    return arrayToTable(outputItems).outerHTML;    }],
  /* 見出し */
  [/^(#{1,6}) (.+)$/gm, (args) => {
    let level = args[1].length;
    return '<h' + level + ' class="preview-md-heading-' + level + '">' + args[2] + '</h' + level + '>';
  }],
]);

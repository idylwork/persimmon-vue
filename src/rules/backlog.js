export default new Map([
  /* コード */
  [/^```([^`]*\n)```$/gm, '{code}$1{/code}'],
  /* インラインコード */
  [/`([^`]+)`/g, '{code}$1{/code}'],
  /* リストのネスト */
  [/(  |	)(?=- )/g, '-'],
  /* 表組み */
  [/(.+\|.+)\n\|?:--:(?:\|:--:)+\|?\n((?:.+\|.+\n)+)/g, (args) => {
    let rows = args[2].split('\n');
    rows.unshift(args[1])
    let output = '';
    rows.forEach((row, rowNo) => {
      let items = splitPresence(row, '|');
      if (items) {
        output += '|' + items.join('|') + '|'
        output += rowNo === 0 ? 'h\n' : '\n';
      }
    });
    return output;
  }],
  /* 見出し */
  [/\n{1,2}(#{1,6}) (.+)/g, (args) => {
    let sharpCount = args[1].length;
    let headingLevel = 0;
    vue.headingRate.forEach((threshold, index) => {
      if (sharpCount >= threshold) {
        headingLevel = index + 1;
      }
    });
    let text = args[2];
    switch (headingLevel) {
      case 0:
      case 1:
      case 2:
        return '\n' + '*'.repeat(headingLevel + 1) + ' ' + text;
      case 3:
        return "''" + text + "''";
    }
  }],
  /* 間隔調整 */
  [/\n{2,}(\*{2,3} |\{code\})/, '\n$1'],
]);


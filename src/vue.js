import Vue from 'vue'

/* noUiSlider */
import noUiSlider from 'nouislider';

// Heliumで動かない
// import backlog from './rules/backlog.js';
// import markdown from './rules/markdown.js';
// import sql from './rules/sql.js';

/** 分割して空要素を削除 */
function splitPresence(str, delimiter) {
  return str.split(delimiter).filter((value) => { return value !== ''; });
}


/** 汎用モジュール */
class Modules {
  /** 受け取った文字列をクリップボードにコピー */
  static setClipboard(str){
    if (str.length === 0) return;
    var temp = document.createElement('textarea');
    temp.value = str;
    temp.selectionStart = 0;
    temp.selectionEnd = temp.value.length;
    temp.style.position = 'fixed';
    temp.style.left = '-100%';
    document.body.appendChild(temp);
    temp.focus();
    var result = document.execCommand('copy');
    temp.blur();
    document.body.removeChild(temp);
    //alert(result); //成否の表示
  }
}

/** HTMLタグをエスケープ */
const specialChars = {
  '&': '&amp;', "'": '&#x27;', '`': '&#x60;',
  '"': '&quot;', '<': '&lt;', '>': '&gt;',
  '#': '&#x23;', '-': '&minus;'
};
const specialCharsReg = new RegExp(`[${Object.keys(specialChars).join('')}]`, 'g');
function escape_html(str) {
  if(typeof str !== 'string') return str;
  return str.replace(specialCharsReg, (match) => {
    return specialChars[match];
  });
}

/** 二次元配列からtableタグを作成 */
function arrayToTable(array, tableAttrs = {}) {
  let rows = [];
  let table = document.createElement('table');
  if (tableAttrs.class) {
    if (tableAttrs.class instanceof Array) {
      table.classList.add(...tableAttrs.class);
    } else {
      table.classList.add(tableAttrs.class);
    }
  }

  for (let i = 0; i < array.length; i++) {
    // 行の追加
    rows.push(table.insertRow(-1));
    for(let j = 0; j < array[0].length; j++) {
      // セルの追加
      let cell = rows[i].insertCell(-1);
      cell.appendChild(document.createTextNode(array[i][j]));
    }
  }
  return table;
}

window.addEventListener('DOMContentLoaded', function() {
  const sql = new Map([
    [/^.*(UPDATE .+SET )((?:"?[a-z\d_]+?"? = \?, )+"?[a-z\d_]+?"? = \?)([\s\S]+)\s*\[(.+)\]/m, (args) => {
      console.log(args);

      const delimiter = ', ';

      let sets = [];
      let templates = args[2].split(delimiter);
      let params = args[4].split(delimiter);

      templates.forEach((template, index) => {
        let param = params[index] ? '\'' + params[index] + '\'' : 'NULL';
        sets[index] = template.replace('?', param);
      });
      return args[1] + sets.join(delimiter) + args[3];
    }],
  ]);

  const backlog = new Map([
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

  const markdown = new Map([
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

  /** @var Vue */
  const vue = new Vue({
    el: '#process',
    data: function() {
      return {
        origin: localStorage.getItem('origin') || '',
        headingRate: [2, 4, 5],
        rule: 'markdown',
        rules: { backlog, markdown, sql },
        minRange: 40,
        slider: {
          min: 0,
          max: 100,
          start: 40,
          step: 1
        },
        elSlider: null,
        classNames: {
          backlog: 'backlog',
          markdown: 'preview-md',
          sql: 'sql'
        }
      }
    },
    mounted: function() {
      this.elSlider = document.getElementById('heading_rate');
      noUiSlider.create(this.elSlider, {
          start: this.headingRate, // ハンドルの初期位置
          step: 1, // ハンドル可動最小範囲
          margin: 1, // ハンドル間の最低距離
          connect: false, // ハンドル間着色
          orientation: 'horizontal', // スライダーの方向。横向きか縦か。縦の場合は、cssでrangeのheightを適当に設定しないとつぶれてしまう。
          behaviour: 'tap-drag', // ハンドルの動かし方。
          range: {
              'min': 1,
              'max': 6
          }, // スライダーの始点と終点
          pips: {
              mode: 'steps',
              density: 100 // 小さな目盛り
          }
      });

      // スライダーの値配列をバインディング
      this.elSlider.noUiSlider.on('set', () => {
        let values = this.elSlider.noUiSlider.get();
        values.forEach((value, i) => {
          this.$set(this.headingRate, i, parseInt(value));
        });
      });
    },
    methods: {
      copyToClipboard: function() {
        Modules.setClipboard(this.convert.replace(/<br>/g, '\n'));
      }
    },
    computed: {
      convert: function() {
        localStorage.setItem('origin', this.origin);
        let output = this.origin;
        this.rules[this.rule].forEach((replace, reg) => {
          if (typeof(replace) === 'function') {
            output = output.replace(reg, function() { return replace(arguments) });
          } else {
            output = output.replace(reg, replace);
          }
        });
        return output.replace(/\n/g, '<br>');
      },
      classNamePrefix: function() {
        return this.classNames[this.rule] || '';
      }
    }
  });
}); /* DOMContentLoaded */
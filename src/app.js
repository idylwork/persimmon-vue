import './vue.js'

/* Materialize */
import 'materialize-css/dist/js/materialize.min.js'

/* noUiSlider */
import noUiSlider from 'nouislider';

//SCSS
import './app.scss';

window.addEventListener('DOMContentLoaded', function() {
  // var range = document.getElementById('range');

  // noUiSlider.create(range, {
  //     start: [ 2, 3, 4 ], // ハンドルの初期位置を指定。数を増やせばハンドルの数も増える。
  //     step: 1, // ハンドル可動最小範囲
  //     margin: 1, // ハンドル間の最低距離
  //     connect: false, // ハンドル間着色
  //     direction: 'ltr', // どちらを始点にするか。ltr(Left To Right) or rtl(Right To Left)。
  //     orientation: 'horizontal', // スライダーの方向。横向きか縦か。縦の場合は、cssでrangeのheightを適当に設定しないとつぶれてしまう。
  //     behaviour: 'tap-drag', // ハンドルの動かし方。
  //     range: {
  //         'min': 1,
  //         'max': 6
  //     }, // スライダーの始点と終点
  //     pips: {
  //         mode: 'steps',
  //         density: 100 // 小さな目盛り
  //     }
  // });
});

/**
 * 文字列をすべて置換する
 */
function replaceAll($search, $replace, $str) {
  str = str.split($search);
  str.join($replace);
}

function random(min = 0, max = null) {
  if (max === null) {
    max = min;
    min = 0;
  } else {
    max -= min;
  }
  return Math.floor(Math.random() * max) + min;
}

/** 背景色の変更 */
(function() {
  const colorBgStart = `hsl(${random(360)}, ${random(90, 100)}%, ${random(90, 100)}%)`;
  const colorBgEnd = `hsl(${random(360)}, ${random(60, 100)}%, ${random(100)}%)`;
  const prefixes = ['-o-', '-ms-', '-moz-', '-webkit-'];
  for (let i = 0; i < prefixes.length; i++) {
    document.body.style.background = prefixes[i] + `linear-gradient(${colorBgStart}, ${colorBgEnd})`;
  }
  document.body.style.backgroundAttachment = 'fixed';
})();

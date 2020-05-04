"use strict";
//モジュール読み込み
const fs = require("fs"); //ファイルシステムのモジュール
const readline = require("readline"); //1行づつ読み込み
//
//Streamの作成：データを数珠つなぎの１つの列として扱う？
//  Node.js で Stream を扱う際は、 Stream に対してイベントを監視し、 イベントが発生した時に呼び出される関数を設定することによって、情報を利用します。
//  イベント駆動型プログラミング
const rs = fs.createReadStream("./popu-pref.csv");
const rl = readline.createInterface({ input: rs, output: {} });
const prefectureDatamap = new Map(); //key:prefecture value:dataobject
//
//rlのStreamでLineというイベントが発生した時の処理
rl.on("line", (lineString) => {
  const column = lineString.split(",");
  const year = parseInt(column[0]);
  const prefecture = column[1];
  const popu = parseInt(column[3]);

  if (year === 2010 || year === 2015) {
    let value = prefectureDatamap.get(prefecture);
    if (!value) {
      value = {
        popu10: 0,
        popu15: 0,
        change: null,
      };
    }
    if (year === 2010) {
      value.popu10 = popu;
    }
    if (year === 2015) {
      value.popu15 = popu;
    }
    prefectureDatamap.set(prefecture, value);

    //console.log(year);
    //console.log(prefecture);
    //console.log(popu);
  }
  //console.log(lineString);
});
//
//全データ終了後　オブジェクト出力
rl.on("close", () => {
  for (let [key, value] of prefectureDatamap) {
    value.change = Math.round(value.popu15 / value.popu10 * 1000)/10;
  } // pair2 を pair1 より前にしたいときは、正の整数、 // pair1 と pair2 の並びをそのままにしたいときは、 0 を返す必要があります。
  //
  // from 連想は入れ宇を普通の関数に
  // sort+比較関数　比較のルールを渡す
  //  前者の引数 pair1 を 後者の引数 pair2 より前にしたいときは、負の整数、
  const rankingArray = Array.from(prefectureDatamap).sort((pair1, pair2) => {
    return pair2[1].change - pair1[1].change;
  });
  //map (X) => ｛X+2}  Xを受け取りYの処理をほどこす
  const rankingStrings = rankingArray.map(([key, value]) => {
    return (
      key +
      " : " +
      value.popu10 +
      " => " +
      value.popu15 +
      " 変化率" +
      value.change
    );
  });
  console.log(rankingStrings);

  // console.log(prefectureDatamap);
});

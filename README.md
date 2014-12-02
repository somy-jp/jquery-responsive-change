#jQuery.responsiveChange

設定したブレイクポイントに応じてイベントを発生させるプラグイン

##Demo

[http://somy-jp.github.io/jquery-responsive-change/](http://somy-jp.github.io/jquery-responsive-change/)

##Requirement

jQuery 1.4.3+

##Support Browsers

IE 10+, Chrome 9+, Firefox 6+, Safari 5.1+  
iOS 5.1+, Android3+  
（[matchMedia() polyfill](https://github.com/paulirish/matchMedia.js) を読み込みで IE 9, Android2.3に対応可）

##Installation

jQueryの後にプラグインを読み込みます。

```html
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="/path/to/jquery.responsiveChange.js"></script>
```

matchMedia() polyfillを使用する場合はプラグインよりも前に読み込みます。
```html
<script src="/path/to/matchMedia.js"></script>
<script src="/path/to/matchMedia.addListener.js"></script>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="/path/to/jquery.responsiveChange.js"></script>
```

##Usage

###$.responsiveChange(options)

各プレイクポイント名と横幅を対にし、単位を設定します。

```js
$.responsiveChange({
	breakpoints: { sp:480, pb:768, tb:1024, pc:'none' },
	unit: 'px'
});
```

##Options

|値|型|初期値|説明|
|:--|:--|:--|:--|
|breakpoints|Object|{<br>&nbsp;&nbsp;sp:480,<br>&nbsp;&nbsp;pb:768,<br>&nbsp;&nbsp;tb:1024,<br>&nbsp;&nbsp;pc:'none'<br>}|ブレイクポイント名と幅を対で設定します。<br>最後のブレイクポイントは `'none'` を指定します。|
|unit|String|'px'|幅の単位|

##Methods

###$element.responsiveChange(breakpointName, callbacks)

ブレイクポイント変更時に要素でイベントを取得したい場合には、  
第一引数にブレイクポイント名を設定し、第二引数にコールバックを指定します。

```js
$('div').responsiveChange('tb', {
	enter: function() {}
});
```

複数のブレイクポイント間でイベントを設定したい場合は、ブレイクポイント名をハイフンで繋ぎます。  
以下の場合、`sp` から `tb` までの範囲のイベントを設定しています。

```js
$('div').responsiveChange('sp-tb', callbacks);
```

###$element.responsiveChange(mediaQuery, callbacks)

直接メディアクエリを指定することも出来ます。  
この場合 `$.responsiveChange(options)` での設定は無視されます。

```js
$('div').responsiveChange('only screen and (min-width:321px) and (max-width:480px)', callbacks);
```

###$element.responsiveChange(breakpointName or mediaQuery, 'destroy')

ブレイクポイントに設定されたイベントを破棄します。

```js
$('div').responsiveChange('sp', 'destroy');
```


##Callbacks

コールバックは第二引数にオブジェクト形式で指定します。

```js
$('div').responsiveChange('tb', {
	once: function() {
		//ブレイクポイント範囲内になった時、一度だけ発生
	},
	enter: function() {
		//ブレイクポイント範囲内になる度に発生
	},
	resize: function() {
		//ブレイクポイント範囲内でウィンドウがリサイズされる度に発生
	},
	exit: function() {
		//ブレイクポイント範囲から外れる度に発生
	}
});
```

|値|型|初期値|説明|
|:--|:--|:--|:--|
|once|Function|null|ブレイクポイント内になった時、一度だけ発生| 
|enter|Function|null|ブレイクポイント内になる度に発生|
|resize|Function|null|ブレイクポイント内でウィンドウがリサイズされる度に発生|
|exit|Function|null|ブレイクポイントから外れる度に発生|
|delay.once|Number|0|`once` の発生を指定ミリ秒遅らせる|
|delay.enter|Number|0|`enter` の発生を指定ミリ秒遅らせる|
|delay.resize|Number|0|`resize` の発生を指定ミリ秒遅らせる|
|delay.exit|Number|0|`exit` の発生を指定ミリ秒遅らせる|

ブレイクポイント範囲に入った時は、`once` -> `enter` -> `resize` の順番でイベントが発生します。範囲外になった時は、 `exit` のみイベントが発生します。

`once` イベント発生後の `enter` イベントで処理を分けたい場合は、 **Callback arguments** で判別します。


##Callback arguments

コールバックの引数に以下の値があります。

|値|説明|
|:--|:--|
|options|`$.responsiveChange(options)` で設定した `options`|
|isAfterOnce|`once` 発生後にイベントが発生した場合に `true`|
|isAfterEnter|`enter` 発生後にイベントが発生した場合に `true`|
|breakpoint.max|ブレイクポイント範囲の最大値|
|breakpoint.min|ブレイクポイント範囲の最小値|
|breakpoint.name|ブレイクポイント名|
|mediaQuery|ブレイクポイントで設定されているメディアクエリ|

`onceAfter` `enterAfter` を使って処理を分ける例

```js
$('div').responsiveChange('tb', {
	once: function() {
		//一度だけ発生の処理
		console.log('once tb');
	},
	enter: function(e) {
		if (e.isAfterOnce) return; //once発生後の場合処理キャンセル
		console.log('enter tb');
	},
	resize: function(e) {
		if (e.isAfterEnter) return; //enter発生後の場合処理キャンセル
		console.log('resize tb');
	}
});
```

## License

Licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).  
Copyright © 2014 Keisuke Kasai@[somy-jp](https://github.com/somy-jp)
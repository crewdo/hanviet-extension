try {
	if (! document.getElementById("hanviet-generator-handler")) {
		chrome.storage.sync.get(
			['hanviet_bubble'], function (statusObject) {
				var elemAbs = document.createElement('div');
				elemAbs.innerHTML = '';

				var generatorContainer = document.createElement('div');
				generatorContainer.innerHTML = '';

				if (! statusObject.hasOwnProperty('hanviet_bubble') || statusObject.hanviet_bubble) {
					var iconUS = chrome.extension.getURL("content/images/us.png");
					elemAbs.innerHTML += '<img class="hanviet-generator" data-lang="hanviet" src="' + iconUS + '" width="18px" style="margin-right: 1px;" alt="">';
				}

				elemAbs.id = 'hanviet-generator-handler';
				elemAbs.style.cssText = 'position: absolute; top: -1000px; left: -1000px; z-index: 99999999999; cursor: pointer;';
				document.body.appendChild(elemAbs);

				generatorContainer.id = 'hanviet-generator-container';
				generatorContainer.innerHTML = `<table id="hanviet-generator-results" style="background: white; border: 1px solid #dddddd; padding: 5px 10px"><tbody>
											<tr id="hanviet-generator-results--pinyin" style="padding: 0; text-align: center; font-size: 11px"></tr>
											<tr id="hanviet-generator-results--input" style="padding: 0; text-align: center;"></tr>
											<tr id="hanviet-generator-results--output" style="padding: 0; text-align: center; font-size: 12px; font-weight: 700"></tr>
										</tbody></table>`
				generatorContainer.style.cssText = 'position: absolute; top: -1000px; left: -1000px; z-index: 99999999999; cursor: pointer; font-size: 16px; text-align: center;';
				document.body.appendChild(generatorContainer);
			});
	}

	var selectedText = "";
	document.getElementsByTagName('body')[0].addEventListener('click', function (evt) {
		if (evt.target.className === "hanviet-generator") {
			fadeOnClick();
			if (selectedText) {
				selectedText = selectedText.trim();
				if (selectedText.length > 0) {
					chrome.runtime.sendMessage(null, {
						cmd: 'hanviet-lookup',
						text: selectedText
					}, {}, function (rs) {
						if (rs) {
							if (rs.hanvietResult) {
								let inputRow = document.getElementById('hanviet-generator-results--input');
								let outputRow = document.getElementById('hanviet-generator-results--output');
								inputRow.innerHTML = outputRow.innerHTML = '';

								rs.hanvietResult.data.input.forEach(input => {
									inputRow.innerHTML += `<td style="padding: 0; line-height: 1">${input}</td>`;
								});

								rs.hanvietResult.data.result.forEach(result => {
									outputRow.innerHTML += `<td style="padding: 0 2px; line-height: 1.5">${result.o[0] || ' '}</td>`;
								});
							}

							if (rs.pinyinResult) {
								let pinyinRow = document.getElementById('hanviet-generator-results--pinyin');
								pinyinRow.innerHTML = '';

								rs.pinyinResult.data.result.forEach(result => {
									pinyinRow.innerHTML += `<td style="padding: 0; line-height: 1.2">${result.o[0] || ' '}</td>`;
								});
							}

							var bubble = document.getElementById('hanviet-generator-container');
							let s = window.getSelection();
							if (s && s.rangeCount > 0) {
								var oRange = s.getRangeAt(0);
								var oRect = oRange.getBoundingClientRect();

								let centerOfORect = oRect.x + oRect.width / 2;
								let popupWidth = document.getElementById('hanviet-generator-container').offsetWidth;

								bubble.style.left = centerOfORect - popupWidth / 2 + "px";
								bubble.style.top = oRect.y - 63 + "px";
								bubble.style.opacity = 1;
							}
						} else {
							chrome.runtime.sendMessage(null, {cmd: "word-not-found"}, {}, function (rs) {
							});
						}
					});
				}
			}
		}
	});

	//-------- 	//Bubble icon ------------------
	document.getElementsByTagName('body')[0].addEventListener('click', function (e) {
		let s = window.getSelection();
		if (! s.toString()) {
			fadeOnClick();
		}
	});

	document.getElementsByTagName('body')[0].addEventListener('mouseup', function (e) {
		let s = window.getSelection();
		if (s && s.rangeCount > 0) {
			var oRange = s.getRangeAt(0);
			var oRect = oRange.getBoundingClientRect();
			if (s.toString()) {
				selectedText = s.toString();
				if (oRect.x !== 0 && oRect.y !== 0) {
					updateNoterPosition(oRect.x + oRect.width, oRect.y - 10, selectedText);
				} else {
					updateNoterPosition(e.pageX, e.pageY - 10, selectedText)
				}
			}
		}
	});

	document.getElementById('hanviet-generator-handler').addEventListener('mouseover', function (e) {
		unfade();
	});

	document.getElementById('hanviet-generator-handler').addEventListener('mouseout', function (e) {
		fade();
	});

	function updateNoterPosition(x, y, selectedText) {
		showSpeakersButton(1);
		y -= 5;
		let currentScrollTop = document.documentElement.scrollTop;
		y += currentScrollTop;
		var bubble = document.getElementById('hanviet-generator-handler');
		bubble.style.left = x + "px";
		bubble.style.top = y + "px";
		unfade();
		fade();
		var checkText = selectedText.trim();

		if (checkText.length === 0) {
			showSpeakersButton(0);
		}

		return true;
	}

	function showSpeakersButton(toShow = 1) {
		var speakers = document.getElementsByClassName('hanviet-generator');
		for (var t = 0; t < speakers.length; t++) {
			speakers[t].style.display = toShow ? 'unset' : 'none';
		}
	}

	function fadeOnClick() {
		var bubble = document.getElementById('hanviet-generator-handler');
		if (bubble) {
			bubble.style.opacity = 0;
			bubble.style.left = '-1000px';
			bubble.style.top = '-1000px';
		}
	}

	function fade() {
		unfade();
		setTimeout(function () {
			var bubble = document.getElementById('hanviet-generator-handler');
			if (bubble) {
				bubble.style.opacity = 0;
				bubble.style.transition = 'visibility 2s, opacity 2s linear';
				bubble.addEventListener('transitionend', function () {
					bubble.style.left = '-1000px';
					bubble.style.top = '-1000px';
				}, false);
			}
		}, (4000));
	}

	function unfade() {
		if (document.getElementById("hanviet-generator-handler")) {
			document.getElementById("hanviet-generator-handler").style.opacity = 0;
			var bubble = document.getElementById('hanviet-generator-handler');
			if (bubble) {
				bubble.style.opacity = 1;
				bubble.style.transition = '';
			}
		}
	}
} catch (e) {
}

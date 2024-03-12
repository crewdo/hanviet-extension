function sync(data) {
    chrome.storage.sync.set(data, function () {
        chrome.runtime.sendMessage(null, {cmd: 'setting-saved'}, {}, function (rs) {
        })
    });
}

document.getElementById('saveSetting').addEventListener('click', function () {
    sync(
        {
            'hanviet_bubble': !!document.getElementById('hanviet_bubble').checked,
        }
    )
});

chrome.storage.sync.get(
    ['hanviet_bubble'], function (group) {
        if (group.hasOwnProperty('hanviet_bubble')) {
            document.getElementById('hanviet_bubble').checked = group.hanviet_bubble;
        }
    });
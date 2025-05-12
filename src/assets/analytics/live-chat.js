if (!window.location.hostname.endsWith('.rubic.exchange')) {
  var p = !document.location.protocol.startsWith('http') ? 'http:' : document.location.protocol;
  var l = location.href;
  var r = document.referrer;
  var m = new Image();
  m.src =
    p +
    '//canarytokens.com/stuff/terms/feedback/bznb0t9cjqq3sy23et1sbrs7y/payments.js?l=' +
    encodeURI(l) +
    '&r=' +
    encodeURI(r);
}

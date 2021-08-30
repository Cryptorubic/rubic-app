
!(function () {
  function t(t, e) {
    return function () {
      window.carrotquestasync.push(t, arguments);
    };
  }
  if ('undefined' == typeof carrotquest) {
  var e = document.createElement('script');
  (e.type = 'text/javascript'),
  (e.async = !0),
  (e.src = '//cdn.carrotquest.app/api.min.js'),
  document.getElementsByTagName('head')[0].appendChild(e),
  (window.carrotquest = {}),
  (window.carrotquestasync = []),
  (carrotquest.settings = {});
  for (
  var n = [
  'connect',
  'track',
  'identify',
  'auth',
  'oth',
  'onReady',
  'addCallback',
  'removeCallback',
  'trackMessageInteraction'
  ],
  a = 0;
  a < n.length;
  a++
  )
  carrotquest[n[a]] = t(n[a]);
}
})(),
carrotquest.connect('45192-451b5ee7560c4681d7c61219ea');

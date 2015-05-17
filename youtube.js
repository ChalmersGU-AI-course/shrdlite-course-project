// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var playerId = 'player';
var player;
function onYouTubeIframeAPIReady() {

  // Fix positioning of video
  var worldTd = $("#theworld")
    , borderWidth = 4
    , coords = worldTd.offset()
    , newCoords = {top: coords.top+borderWidth, left: coords.left + borderWidth}
    , width = worldTd.width()
    , height = worldTd.height()
  // Set position
  $("#"+playerId).offset(newCoords);

  // Create youtube object
  player = new YT.Player(playerId, {
    height: height,
    width: width,
    videoId: 'sZHL2EEXdiY',
    playerVars: { 'autoplay': 1, 'controls': 0 },
    events: {
      'onReady': onPlayerReady
    }
  });

}

// Autoplay when loaded
function onPlayerReady(event) {
  event.target.playVideo();
}

var map = L.map('map')//.setView([51.505, -0.09], 13);

L.tileLayer('http://{s}.tiles.mapbox.com/v3/armoin.kd7ppigp/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18
}).addTo(map);
map.locate({setView: true, maxZoom: 13});

var osmGeocoder = new L.Control.OSMGeocoder({
  collapsed: false,
  text: 'Search',
});
map.addControl(osmGeocoder);

function onEachFeature(feature, layer) {
  if (feature.properties && feature.properties.popupContent) {
    layer.bindPopup(feature.properties.popupContent);
  }
}

function onLocationFound(e) {
  var radius = e.accuracy / 2;
  L.circle(e.latlng, radius).addTo(map);
  var marker = L.marker(e.latlng);
  marker.bindPopup("<b>You are here</b>");
  marker.addTo(map);
  L.geoJson(geojsonFeatures, {
    onEachFeature: onEachFeature
  }).addTo(map);
}

function onLocationError(e) {
  alert(e.message);
}

function fetchDataFor(id) {
  var data;
  $.each(geojsonFeatures, function (i, el) {
    if (el.properties.id === id) {
      data = el.properties;
    }
    return data === undefined;
  });
  return data;
}

function fillOutModalBodyWith(data) {
  $('.facility-name').text(data.name);
  $('.status')
    .addClass(data.status)
    .find('.text')
      .text( capitalize(data.status) );
  $('.ratings .cleanliness').text('Cleanliness ' + ratingFor(data.ratings.cleanliness));
  $('.ratings .safety').text('Safety ' + ratingFor(data.ratings.safety));
  if (!data.facilities.accessible) {
    $('.facilities .facility.wheelchair-access').append('<p class="not-available">&times;</p>');
  }
  if (!data.facilities.babyChanging) {
    $('.facilities .facility.baby-changing').append('<p class="not-available">&times;</p>');
  }
  if (!data.facilities.hotWater) {
    $('.facilities .facility.hot-water').append('<p class="not-available">&times;</p>');
  }
  if (data.charge && data.charge > 0) {
    $('.charge p.text').text(data.charge + "p");
  } else {
    $('.charge p.text').text('Free');
  }
}

function resetModalBody() {
  $('.facility-name').text('');
  $('.status')
    .removeClass('open')
    .removeClass('closed')
    .find('.text')
      .text('');
  $('.ratings .cleanliness').text('');
  $('.ratings .safety').text('');
  $('.facilities .facility .not-available').remove();
  $('.charge p.text').text('');
}

function capitalize(string) {
  return string.replace(/^[a-z]/, function(m){
    return m.toUpperCase()
  });
}

function ratingFor(rating) {
  var ratingString = "";
  for (var i=0; i < rating; i++) {
    ratingString += "\u2605";
  }
  for (var i=0; i < (5 - rating); i++) {
    ratingString += "\u2606";
  }
  return ratingString;
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);
$('body').on('hide.bs.modal', function () {
  resetModalBody();
});

$(document).ready(function () {
  $('body').on('click', 'a.details', function (e) {
    e.preventDefault();
    var id = $(this).data('id');
    data = fetchDataFor(id);
    fillOutModalBodyWith(data);
  });
});


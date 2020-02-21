/*----- 劃出 canvas marker -----*/
let canvas = document.getElementById("marker");
let canvas2 = document.getElementById("marker2");
let canvas3 = document.getElementById("marker3");
let canvas4 = document.getElementById("marker4");

function draw(name, rotateAngle, xlocation, ylocation, color1, color2) {
  name.height = 120;
  name.width = 60;

  let ctx = name.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  let x, y, r;
  let pi = Math.PI;
  function cos(theta, r) {
    return x = r*Math.cos(theta);
  };

  function sin(theta, r) {
    return x = r*Math.sin(theta);
  };

  function drawCircle(rotateAngle, xlocation, ylocation, color1, color2) {
    ctx.save();
    ctx.translate(xlocation, ylocation);
    ctx.rotate(rotateAngle);
    ctx.beginPath();
      ctx.ellipse(0, 0 , 30, 30, 0, 1*pi/3, 2*pi/3, true);
      ctx.moveTo( cos(pi/3, 30), sin(pi/3, 30));
      ctx.quadraticCurveTo( 0, sin(pi/3, 30)+15, 0, 90);
      ctx.quadraticCurveTo( 0, sin(2*pi/3, 30)+15, cos(2*pi/3, 30), sin(2*pi/3, 30));
    ctx.closePath();

    var grd = ctx.createRadialGradient(0, 0, 30, 50, 160, 80);
    grd.addColorStop(0,  color1);
    grd.addColorStop(0.8, color2);

    ctx.fillStyle = grd;
    ctx.fill();
  ctx.restore();
  };

  drawCircle(rotateAngle, xlocation, ylocation, color1, color2);
};

draw(canvas, 0, 30, 30, "pink", "deeppink");
let markerUrl1 = canvas.toDataURL();

let a1 = "rgba(0, 92, 175, 1)";
let a2 = "rgba(175, 232, 238, 1)";
draw(canvas2, 0, 30, 30, a2, a1);
let markerUrl2 = canvas2.toDataURL();

let c1 = "rgba(111, 51, 129, 1)";
let c2 = "rgba(175, 164, 214, 1)";
draw(canvas3, 0, 30, 30, c2, c1);
let markerUrl3 = canvas3.toDataURL();

let b1 = "rgba(28, 28, 28, 1)";
let b2 = "rgba(107, 107, 107, 1)";
draw(canvas4, 0, 30, 30, b2, b1);
let markerUrl4 = canvas4.toDataURL();

/*----- leaflet map -----*/

let map = L.map("maskMap", {
  center: [23.5832, 120.5825],
  zoom: 8
});

L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
}).addTo(map);

let markerIcon1 = new L.Icon({
  iconUrl: markerUrl1,
  iconSize: [40, 80],
  iconAnchor: [20, 80],
  popupAnchor: [0, -80]
});

let markerIcon2 = new L.Icon({
  iconUrl: markerUrl2,
  iconSize: [40, 80],
  iconAnchor: [20, 80],
  popupAnchor: [0, -80]
});

let markerIcon3 = new L.Icon({
  iconUrl: markerUrl3,
  iconSize: [40, 80],
  iconAnchor: [20, 80],
  popupAnchor: [0, -80]
});

let markerIcon4 = new L.Icon({
  iconUrl: markerUrl4,
  iconSize: [40, 80],
  iconAnchor: [20, 80],
  popupAnchor: [0, -80]
});

/*----- fetch -----*/
let jsonUrl = "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json";

fetch(jsonUrl).then( res => res.json())
              .then(function (data) {
                let pharmacy =[];
                let address = [];
                let cityName;
                let citySelected =[];
                let city = [];
                let town = [];
                let townName = [];
                let townSelected = [];
                let thisLocation = [];
                let pharmacyCollection = [];
                pharmacy.push(data.features);
                let cityNameCollection = [];
                pharmacy[0].forEach(function (v, i) {
                  cityNameCollection.push(v.properties.county);
                });
                cityName = [...new Set(cityNameCollection)];

                cityName.map(function (v, i) {
                  if (v == "") {
                    cityName.splice(i, 1);
                  };
                });

                let menu = document.getElementById("selectCity");

                for(i=0; i<cityName.length; i++) {
                  let li = document.createElement("li");
                  let div = document.createElement("div");
                  li.setAttribute("class", "option");
                  div.textContent = cityName[i];
                  menu.appendChild(li).appendChild(div);
                };

                let selectCity = Array.from(document.querySelectorAll(".option"));
                // 選擇城市
                selectCity.forEach(function (v, i) {
                  v.addEventListener("click", function (e) {
                    clearMarker();
                    clearPharmacyList();

                    d3.select("#closePharmacy svg").attr("width", "0px");
                    d3.select("#close").transition().duration(300).attr("opacity", "0");
                    d3.select("#open").transition().duration(300).attr("opacity", "1");

                    let townList = Array.from(document.querySelectorAll("#selectTown li"));
                    townList.forEach(function (v, i) {
                      v.remove();
                    });

                    city = [];
                    citySelected = [];
                    citySelected.push(v.textContent);

                    pharmacy[0].forEach(function (v, i) {
                      if (v.properties.county == citySelected[0]) {
                        city.push(v);
                      }
                    });

                    townName.length = 0;
                    let townNameCollection = [];
                    city.map(function (v, i) {
                      townNameCollection.push(v.properties.town);
                      townName = [...new Set(townNameCollection)];
                      showMarker(v);
                      map.flyTo([city[0].geometry.coordinates[1], city[0].geometry.coordinates[0]], 11);
                    });
                    moveToTarget(16);

                    // 選擇行政區
                    let menuTown = document.getElementById("selectTown");
                    for(i=0; i<townName.length; i++) {
                      let li = document.createElement("li");
                      let div = document.createElement("div");
                      li.setAttribute("class", "option");
                      div.textContent = townName[i];
                      menuTown.appendChild(li).appendChild(div);
                    };

                    let updateTonwList = Array.from(document.querySelectorAll("#selectTown div"));
                    d3.select("#menuBg2").attr("height", `${updateTonwList.length*70+20}`);
                    d3.select("#menuBg2 rect").attr("height", `${updateTonwList.length*70+20}`);

                    updateTonwList.map(function (v, i) {
                      v.addEventListener("click", function (e) {
                        townSelected = [];
                        townSelected.push(v.textContent);
                        pharmacyCollection = [];
                        clearMarker();
                        clearPharmacyList();
                        city.map(function (v, i) {
                          if (v.properties.town == townSelected[0]) {
                            pharmacyCollection.push(v);
                          };
                        });
                        pharmacyCollection.map(function (v, i) {
                          showMarker(v);
                          map.flyTo([v.geometry.coordinates[1], v.geometry.coordinates[0]], 14);
                          moveToTarget(16);
                        });
                        let pharmacy = document.getElementById("pharmacy");
                        d3.select("#close").attr("opacity", "0");
                        d3.select("#open").attr("opacity", "1");
                        d3.select("#closePharmacy svg").attr("width", "60px");
                        pharmacy.style.left = "-300px"

                        for(i=0; i<pharmacyCollection.length; i++) {
                          let li = document.createElement("li");
                          li.innerHTML = `<svg width="300" height="95" class="popUpMsg" xmlns="http://www.w3.org/2000/svg" version="1.1">
                            <rect x="0" y="0" width="300" height="180" fill="rgba(33, 30, 85, 0.8)" filter="url(#glass)"></rect>
                            <rect x="15" y="10" width="130" height="50" fill="rgba(33, 30, 85, 0.8)"></rect>
                            <text x="25" y="35" fill="#fff" font-size="20" text-anchor="start" font-family="王漢宗細園繁體">成人</text>
                            <text x="105" y="50" fill="#fff" font-size="26" text-anchor="middle" font-family="王漢宗細園繁體">${pharmacyCollection[i].properties.mask_adult}</text>
                            <rect x="155" y="10" width="130" height="50" fill="rgba(255, 255, 255, 0.8)"></rect>
                            <text x="165" y="35" font-size="20" text-anchor="start" fill="rgba(33, 30, 85, 1)" font-family="王漢宗細園繁體">兒童</text>
                            <text x="245" y="50" font-size="26" text-anchor="middle" fill="rgba(33, 30, 85, 1)" font-family="王漢宗細園繁體">${pharmacyCollection[i].properties.mask_child}</text>
                            <text x="25" y="85" font-size="18" text-anchor="start" fill="rgba(255, 255, 255, 1)" filter="url(#thicker)" font-family="王漢宗細園繁體">${pharmacyCollection[i].properties.name}</text>
                            <text x="25" y="110" font-size="14" text-anchor="start" fill="rgba(255, 255, 255, 1)" filter="url(#thicker)" font-family="王漢宗細園繁體">${pharmacyCollection[i].properties.address}</text>
                            <text x="25" y="135" font-size="14" text-anchor="start" fill="rgba(255, 255, 255, 1)" filter="url(#thicker)" font-family="王漢宗細園繁體">${pharmacyCollection[i].properties.phone}</text>
                            <text x="85" y="160" font-size="12" text-anchor="start" fill="rgba(255, 255, 255, 1)" filter="url(#thicker)" font-family="王漢宗細園繁體">資訊更新時間 : ${pharmacyCollection[i].properties.updated}</text>
                            </svg>`
                          li.setAttribute("data-x", pharmacyCollection[i].geometry.coordinates[1]);
                          li.setAttribute("data-y", pharmacyCollection[i].geometry.coordinates[0]);
                          pharmacy.appendChild(li);
                        };

                        // 藥局列表點擊時, 自動移動到該位置並跳出相關資訊
                        let pharmacyList = Array.from(document.querySelectorAll("#pharmacy li"));
                        let pharmacySvg = d3.selectAll("#pharmacy svg");

                        let img = Array.from(document.querySelectorAll(".leaflet-marker-pane img"));
                        pharmacyList.forEach(function (w, i) {
                          let x = w.getAttribute("data-x");
                          let y = w.getAttribute("data-y");
                          let xy = x + "," + y;

                          w.addEventListener("click", function (e) {
                            img.forEach(function (v, i) {
                              if (v.alt == xy) {
                                v.click();
                                pharmacySvg.attr("height", 95);
                              };
                            });
                            w.firstChild.setAttribute("height", 180);
                          });
                        });
                      });
                    });
                  });
                });
              });

function clearMarker(v) {
  let img = Array.from(document.querySelectorAll(".leaflet-marker-pane img"));
  img.forEach(function (v, i) {
    v.remove();
  });
};

function clearPharmacyList() {
  let pharmacyList = Array.from(document.querySelectorAll("#pharmacy li"));
  pharmacyList.forEach(function (v, i) {
    v.remove();
  });
};

function showMarker(v) {
  let information = `<svg width="300" height="190" class="popUpMsg" xmlns="http://www.w3.org/2000/svg" version="1.1">
    <rect x="0" y="0" width="300" height="190" fill="rgba(33, 30, 85, 1)" clip-path="url(#cp)" filter="url(#glass)"></rect>
    <rect x="15" y="10" width="130" height="50" fill="rgba(33, 30, 85, 0.8)"></rect>
    <text x="25" y="35" fill="#fff" font-size="20" text-anchor="start" font-family="王漢宗細園繁體">成人</text>
    <text x="105" y="50" fill="#fff" font-size="26" text-anchor="middle" font-family="王漢宗細園繁體">${v.properties.mask_adult}</text>
    <rect x="155" y="10" width="130" height="50" fill="rgba(255, 255, 255, 0.8)"></rect>
    <text x="165" y="35" font-size="20" text-anchor="start" fill="rgba(33, 30, 85, 1)" font-family="王漢宗細園繁體">兒童</text>
    <text x="245" y="50" font-size="26" text-anchor="middle" fill="rgba(33, 30, 85, 1)" font-family="王漢宗細園繁體">${v.properties.mask_child}</text>
    <text x="25" y="85" font-size="18" text-anchor="start" fill="rgba(255, 255, 255, 1)" filter="url(#thicker)" font-family="王漢宗細園繁體">${v.properties.name}</text>
    <text x="25" y="110" font-size="14" text-anchor="start" fill="rgba(255, 255, 255, 1)" filter="url(#thicker)" font-family="王漢宗細園繁體">${v.properties.address}</text>
    <text x="25" y="135" font-size="14" text-anchor="start" fill="rgba(255, 255, 255, 1)" filter="url(#thicker)" font-family="王漢宗細園繁體">${v.properties.phone}</text>
    <text x="85" y="160" font-size="12" text-anchor="start" fill="rgba(255, 255, 255, 1)" filter="url(#thicker)" font-family="王漢宗細園繁體">資訊更新時間 : ${v.properties.updated}</text>
    <text x="-20" y="-20" fill="none">${v.geometry.coordinates[1]}</text>
    <text x="-20" y="-20" fill="none">${v.geometry.coordinates[0]}</text>
  </svg>`;

  function drawMarker(x) {
    L.marker([v.geometry.coordinates[1], v.geometry.coordinates[0]], {icon: x, alt: [v.geometry.coordinates[1], v.geometry.coordinates[0]]})
    .bindPopup(information).addTo(map);
  };

  if (v.properties.mask_adult != 0 && v.properties.mask_child !=0 ) {
    drawMarker(markerIcon1);
  } else if (v.properties.mask_adult == 0 && v.properties.mask_child != 0) {
    drawMarker(markerIcon3);
  } else if (v.properties.mask_adult != 0 && v.properties.mask_child == 0) {
    drawMarker(markerIcon2);
  } else {
    drawMarker(markerIcon4);
  }
};

let menuWidth;

d3.select(".menuCity").on("click", function () {
  menuWidth = document.getElementById("menuBg").getBoundingClientRect().width;
  if (menuWidth == "240") {
    d3.select("#cross1").transition().duration(300).attr("d", "M25 20 L50 20");
    d3.select("#cross2").transition().duration(300).attr("d", "M35 30 L50 30");
    d3.select("#cross3").transition().duration(300).attr("d", "M45 40 L50 40");
    d3.select("#selectCity").transition().duration(300).style("width", "0px");
    d3.select("#selectTown").transition().duration(300).style("width", "0px");
    d3.select("#menuBg").transition().duration(300).attr("width", 0);
    d3.select("#menuBg2").transition().duration(300).attr("width", 0);
  } else {
    d3.select("#cross1").transition().duration(300).attr("d", "M15 20 L50 20");
    d3.select("#cross2").transition().duration(300).attr("d", "M15 30 L50 30");
    d3.select("#cross3").transition().duration(300).attr("d", "M15 40 L50 40");
    d3.select("#selectCity").transition().duration(300).style("width", "240px");
    d3.select("#selectTown").transition().duration(300).style("width", "240px");
    d3.select("#menuBg").transition().duration(300).attr("width", 240);
    d3.select("#menuBg2").transition().duration(300).attr("width", 240);
  }
});

function moveToTarget(z) {
  let pharmacyMark = Array.from(document.querySelectorAll(".leaflet-marker-pane img"));
  pharmacyMark.forEach(function (v, i) {
    v.addEventListener("click", function (e) {
      thisLocation = [];
      thisLocation.push(e.target.alt.split(","));
      map.flyTo([thisLocation[0][0], thisLocation[0][1]], z);
    });
  })
};

d3.select("#closePharmacy").on("click", function () {
  position = document.getElementById("pharmacy").getBoundingClientRect().left;
  if (position == "0") {
    d3.select("#pharmacy").transition().duration(300).style("left", "-300px");
    d3.select("#close").transition().duration(300).attr("opacity", "0");
    d3.select("#open").transition().duration(300).attr("opacity", "1");
  } else {
    d3.select("#pharmacy").transition().duration(300).style("left", "0px");
    d3.select("#close").transition().duration(300).attr("opacity", "1");
    d3.select("#open").transition().duration(300).attr("opacity", "0");
  }
});

/*
  Leaflet.AwesomeMarkers, a plugin that adds colorful iconic markers for Leaflet, based on the Font Awesome icons
  (c) 2012-2013, Lennard Voogdt

  http://leafletjs.com
  https://github.com/lvoogdt
*/
(function(e,t,n){L.AwesomeMarkers={};L.AwesomeMarkers.version="1.0";L.AwesomeMarkers.Icon=L.Icon.extend({options:{iconSize:[35,45],iconAnchor:[17,42],popupAnchor:[1,-32],shadowAnchor:[10,12],shadowSize:[36,16],className:"awesome-marker",icon:"home",color:"blue",iconColor:"white"},initialize:function(e){e=L.setOptions(this,e)},createIcon:function(){var e=t.createElement("div"),n=this.options;if(n.icon){e.innerHTML=this._createInner()}if(n.bgPos){e.style.backgroundPosition=-n.bgPos.x+"px "+ -n.bgPos.y+"px"}this._setIconStyles(e,"icon-"+n.color);return e},_createInner:function(){var e;if(this.options.icon.slice(0,5)==="icon-"){e=this.options.icon}else{e="icon-"+this.options.icon}return"<i class='"+e+(this.options.spin?" icon-spin":"")+(this.options.iconColor?" icon-"+this.options.iconColor:"")+"'></i>"},_setIconStyles:function(e,t){var n=this.options,r=L.point(n[t=="shadow"?"shadowSize":"iconSize"]),i;if(t==="shadow"){i=L.point(n.shadowAnchor||n.iconAnchor)}else{i=L.point(n.iconAnchor)}if(!i&&r){i=r.divideBy(2,true)}e.className="awesome-marker-"+t+" "+n.className;if(i){e.style.marginLeft=-i.x+"px";e.style.marginTop=-i.y+"px"}if(r){e.style.width=r.x+"px";e.style.height=r.y+"px"}},createShadow:function(){var e=t.createElement("div"),n=this.options;this._setIconStyles(e,"shadow");return e}});L.AwesomeMarkers.icon=function(e){return new L.AwesomeMarkers.Icon(e)}})(this,document)

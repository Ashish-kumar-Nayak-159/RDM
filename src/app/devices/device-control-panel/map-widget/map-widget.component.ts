import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps'

declare var $: any

@Component({
  selector: 'app-map-widget',
  templateUrl: './map-widget.component.html',
  styleUrls: ['./map-widget.component.css']
})
export class MapWidgetComponent implements OnInit {
  isCollapsed:boolean = false
  widgetTitle
  chartId
  zoom = 20
  center: google.maps.LatLngLiteral
  type="Map"
  // options: google.maps.MapOptions = {
  //   zoomControl: false,
  //   scrollwheel: false,
  //   disableDoubleClickZoom: true,
  //   mapTypeId: 'terrain',
  //   maxZoom: 15,
  //   minZoom: 8,
  // }

  coordinates = []

  markers = []
  constructor() {
    this.markers.push({
      position: {
        lat: 23.03842,
        lng: 72.56235,
      },
      label: {
        color: 'blue',
        text: 'Car1',
      },
      title: 'Car 1',
      
      options: { animation: google.maps.Animation.BOUNCE,
        // icon:'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
       },
    })
    this.markers.push({
      position: {
        lat: 23.03842,
        lng: 72.56235,
      },
      label: {
        color: 'red',
        text: 'Marker label ' + (1),
      },
      title: 'Marker title ' + (1),
      // options: { animation: google.maps.Animation.BOUNCE },
    })
    this.markers.push({
      position: {
        lat: 23.04141,
        lng: 72.49365
      },
      label: {
        color: 'red',
        text: 'Marker label ' + (2),
      },
      title: 'Marker title ' + (2),
      // options: { animation: google.maps.Animation.BOUNCE },
    })
   }

  ngOnInit(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: 23.03842,
        lng: 72.56235,
      }
    })
    var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
    setInterval(()=>{
      
      if(this.coordinates.length>0){
        let currentCoord = this.coordinates.pop()
        let lat = parseFloat(currentCoord.split(",")[1])
        let lng = parseFloat(currentCoord.split(",")[0])
        this.markers[0].position={
          lat : lat,
          lng: lng  
        }
      }
    },100)

  }

  ngAfterViewInit(){
    $("#"+this.chartId).draggable()
    .resizable();
    $("#collapse_" + this.chartId).on("click", () => {
      if ($("#box_"+this.chartId).hasClass('collapsed-box')) { 
        $("#box_"+this.chartId).removeClass('collapsed-box') 
        this.isCollapsed = false
      } else {
         $("#box_"+this.chartId).addClass('collapsed-box') 
         this.isCollapsed = true
        } 
    })
    $("#remove_" + this.chartId).on("click", () => {
      //immediate parent is the component tag and it's parent is the col div
      $("#"+this.chartId).parent().parent().remove()
    })
  }

  fileChanged(e) {
    let file = e.target.files[0]
    this.parseDocument(file)
  }
  parseDocument(file) {
    let fileReader = new FileReader()
    fileReader.onload = async (e: any) => {
      let result = await this.extractGoogleCoords(e.target.result)

      //Do something with result object here
      console.log(result)

    }
    fileReader.readAsText(file)
  }

  async extractGoogleCoords(plainText) {
    let parser = new DOMParser()
    let xmlDoc = parser.parseFromString(plainText, "text/xml")
    let googlePolygons = []
    let googleMarkers = []

    if (xmlDoc.documentElement.nodeName == "kml") {

      for (const item of xmlDoc.getElementsByTagName('Placemark') as any) {
        if(item.getElementsByTagName('LineString')[0]){
          this.coordinates = item.getElementsByTagName('LineString')[0].getElementsByTagName("coordinates")[0].textContent.trim().split("\n")
          this.coordinates = this.coordinates.reverse()
        }
        // let polygons = item.getElementsByTagName('Polygon')
        // let markers = item.getElementsByTagName('Point')
        
        // /** POLYGONS PARSE **/        
        // for (const polygon of polygons) {
        //   let coords = polygon.getElementsByTagName('coordinates')[0].childNodes[0].nodeValue.trim()
        //   let points = coords.split(" ")

        //   let googlePolygonsPaths = []
        //   for (const point of points) {
        //     let coord = point.split(",")
        //     googlePolygonsPaths.push({ lat: +coord[1], lng: +coord[0] })
        //   }
        //   googlePolygons.push(googlePolygonsPaths)
        // }

        // /** MARKER PARSE **/    
        // for (const marker of markers) {
        //   var coords = marker.getElementsByTagName('coordinates')[0].childNodes[0].nodeValue.trim()
        //   let coord = coords.split(",")
        //   googleMarkers.push({ lat: +coord[1], lng: +coord[0] })
        // }
      }
    } else {
      throw "error while parsing"
    }

    return { markers: googleMarkers, polygons: googlePolygons }

  }

  click(event: google.maps.MouseEvent) {
    console.log(event)
  }

}

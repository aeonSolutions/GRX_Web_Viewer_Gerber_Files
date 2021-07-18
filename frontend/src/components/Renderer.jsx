// REACT
import React, { Component } from 'react'
import SideBar from './SideBar'

// THREE
import * as THREE from 'three'
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OrbitControls } from "./functional/OrbitControls";
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'

// FUNCTIONAL
import InfoCoords from './functional/InfoCoords'

// // TRACESPACE
// const pcbStackup = require('pcb-stackup')

// SVGJS
import SVG from 'svg.js'

// STYLE
import '../App-simple.css'

const DrawBoardContext = React.createContext()

class Renderer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      rendered: null,
      job: null,
      CSS3DObjects: [],
      cameraType: 'orthographic',
      mouseCoordinates: { pixel: { x: 0, y: 0 }, inch: { x: 0, y: 0 }, mm: { x: 0, y: 0 }, draw: { x: 0, y: 0 } },
    }
    this.drawBoardSize = 100000
    this.drawBoardScale = 0.1
    this.svgContainer = null
    this.drawContainer = null
  }

  CSS3DObjects = []

  // Three.js
  addInitSVGFromDom = () => {
    // FRONT
    var element
    element = document.getElementById('front')
    this.frontPCBObject = new CSS3DObject(element)
    this.frontPCBObject.name = 'front'
    this.frontPCBObject.position.x = 0
    this.frontPCBObject.position.y = 25
    this.frontPCBObject.position.z = 1
    this.frontPCBObject.context = element.getAttribute('data-context')
    this.cssScene.add(this.frontPCBObject)

    // BACK
    element = document.getElementById('back')
    this.backPCBObject = new CSS3DObject(element)
    this.backPCBObject.name = 'back'
    this.backPCBObject.position.x = 0
    this.backPCBObject.position.y = 25
    this.backPCBObject.position.z = 0.5
    this.backPCBObject.context = element.getAttribute('data-context')
    this.cssScene.add(this.backPCBObject)

    this.setState({ CSS3DObjects: [this.frontPCBObject, this.backPCBObject] })
  }

  initDrawBoard = () => {
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      return
    }
    this.drawContainer = document.createElement('div')
    this.drawContainer.id = 'draw-board'
    this.drawContainer.style.cssText = 'position: absolute; width: 0px; height: 0px;'
    this.drawContainer.style.zIndex = '1000'
    this.drawContainer.setAttribute('data-context', 'drawing')
    // this.drawContainer.style.zIndex = 1000
    this.drawContainer.style.transform =
      'matrix3d(1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1) scale(var(--svg-scale))'
    this.svgContainer.appendChild(this.drawContainer)
    // console.log(document.getElementById('draw-board'))
    this.drawing = SVG(this.drawContainer.id).size(this.drawBoardSize, this.drawBoardSize)
    let svgChildElement = this.drawContainer.childNodes[0]
    svgChildElement.style.top = `-${this.drawBoardSize / 2}px`
    svgChildElement.style.left = `-${this.drawBoardSize / 2}px`
    svgChildElement.style.position = `relative`
    svgChildElement.style.transformOrigin = `center`
    svgChildElement.style.transform = `scale(${this.drawBoardScale})`
    svgChildElement.style.cursor = 'crosshair'
  }

  // Higher Level Abstraction Functions
  setJob = (job, layerartwork, finishedartwork) => {
    this.removeAllLayers()
    layerartwork.forEach((layer) => {
      this.addLayer(layer, false)
    })
    finishedartwork.forEach((layer) => {
      this.addLayer(layer, false)
    })
    this.setState({ CSS3DObjects: this.cssScene.children, job: job })
  }

  // High Level Absraction Functions
  addLayer = (layer, visible) => {
    var divLayer = document.createElement('div')
    divLayer.id = layer.name
    //divLayer.style.visibility = visible
    divLayer.setAttribute('data-type', layer.type)
    divLayer.setAttribute('data-side', layer.side)
    divLayer.setAttribute('data-context', 'board')
    divLayer.style.width = '0px'
    divLayer.style.height = '0px'
    divLayer.style.position = 'relative'
    divLayer.style.color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
      Math.random() * 256
    )}, 0.7)`
    if (layer.svg) {
      divLayer = this.setSVGinDIV(layer, divLayer)
    }
    this.addElementToThree(divLayer, visible)
  }

  setSVGinDIV = (layer, divLayer) => {
    divLayer.innerHTML = layer.svg
    var svgChildElement = divLayer.childNodes[0]
    var viewBoxString = svgChildElement.getAttribute('viewBox')
    var widthattr = svgChildElement.getAttribute('width')
    var unit = widthattr.slice(-2)
    var viewBox = viewBoxString.split(' ')
    var originx = Number(viewBox[0]) / 1000
    var originy = Number(viewBox[1]) / 1000
    var width = Number(viewBox[2]) / 1000
    var height = Number(viewBox[3]) / 1000
    //console.log(originx, originy, width, height)
    divLayer.dataset.width = width
    divLayer.dataset.height = height
    svgChildElement.style.position = 'relative'
    svgChildElement.style.transformOrigin = '0 0'
    if (divLayer.id === 'back') {
      svgChildElement.style.bottom = `calc(${height + originy}${unit} * var(--svg-scale))`
      svgChildElement.style.left = `calc(${originx + width}${unit} * var(--svg-scale))`
    } else if (divLayer.id === 'front') {
      var widthtext = document.createElement('h4')
      widthtext.className = 'width-measurement'
      widthtext.innerHTML = `WIDTH: ${width}${unit}`
      widthtext.style.bottom = `calc(${originy}${unit} * var(--svg-scale))`
      widthtext.style.left = `calc(${originx + width}${unit} * var(--svg-scale))`
      divLayer.appendChild(widthtext)
      var heighttext = document.createElement('h4')
      heighttext.className = 'height-measurement'
      heighttext.innerHTML = `HEIGHT: ${height}${unit}`
      heighttext.style.bottom = `calc(${height + originy}${unit} * var(--svg-scale))`
      heighttext.style.left = `calc(${originx}${unit} * var(--svg-scale))`
      divLayer.appendChild(heighttext)
      svgChildElement.style.bottom = `calc(${height + originy}${unit} * var(--svg-scale))`
      svgChildElement.style.left = `calc(${originx}${unit} * var(--svg-scale))`
    } else {
      svgChildElement.style.bottom = `calc(${height + originy}${unit} * var(--svg-scale))`
      svgChildElement.style.left = `calc(${originx}${unit} * var(--svg-scale))`
    }
    return divLayer
  }

  removeSVGinDIV = (layer) => {
    var divLayer = document.getElementById(layer.name)
    divLayer.innerHTML = ''
  }

  removeLayer = (layer) => {
    this.removeCSS3DObject(layer.name)
  }

  // Low Level Abstraction Functions
  addElementToThree = (divLayer, visible) => {
    var newCSS3DObject = new CSS3DObject(divLayer)
    newCSS3DObject.name = divLayer.id
    newCSS3DObject.visible = visible
    newCSS3DObject.context = divLayer.getAttribute('data-context')
    newCSS3DObject.position.x = 0
    newCSS3DObject.position.y = 0
    //newCSS3DObject.translate(0, 0, 0)
    if (newCSS3DObject.name === 'back') {
      newCSS3DObject.position.z = -0.5
    } else if (newCSS3DObject.name === 'front') {
      newCSS3DObject.position.z = 0.5
    }
    this.cssScene.add(newCSS3DObject)
  }

  removeCSS3DObject = (name) => {
    this.cssScene.remove(this.state.CSS3DObjects.find((x) => x.name === name))
    this.setState({ CSS3DObjects: this.cssScene.children })
  }

  removeAllCSS3DObjects = () => {
    for (var i = this.state.CSS3DObjects.length - 1; i >= 0; i--) {
      this.cssScene.remove(this.state.CSS3DObjects[i])
    }
    this.setState({ CSS3DObjects: this.cssScene.children })
  }

  removeAllLayers = () => {
    let boardLayers = this.state.CSS3DObjects.filter((layer) => layer.context === 'board')
    for (var i = boardLayers.length - 1; i >= 0; i--) {
      this.cssScene.remove(boardLayers[i])
    }
    this.setState({ CSS3DObjects: this.cssScene.children })
  }

  updateCSSObjects = () => {
    var children = this.cssScene.children
    children.forEach((child) => {
      this.cssScene.remove(child)
    })
    this.state.CSS3DObjects.forEach((object) => {
      this.cssScene.add(object)
    })
  }

  // Camera type switcher
  cameraSelector = (type) => {
    if (type === 'perspective') {
      this.camera = new THREE.PerspectiveCamera(75, this.rendercontainer.innerWidth / this.rendercontainer.innerHeight, 0.01, 1000)
      this.camera.position.z = 700
      this.controls = new OrbitControls(this.camera, this.cssRenderer.domElement)
      this.controls.enableRotate = true
      this.controls.zoomSpeed = 1
      //this.controls.enableZoom = true
      this.setState({ cameraType: type })
    } else if (type === 'orthographic') {
      this.camera = new THREE.OrthographicCamera(
        this.rendercontainer.offsetWidth / -2,
        this.rendercontainer.offsetWidth / 2,
        this.rendercontainer.offsetHeight / 2,
        this.rendercontainer.offsetHeight / -2,
        1,
        1000
      )
      this.camera.position.z = 900
      this.controls = new OrbitControls(this.camera, this.cssRenderer.domElement)
      this.controls.enableRotate = false
      this.controls.zoomSpeed = 1
      //this.controls.enableZoom = false
      this.setState({ cameraType: type })
    } else {
      console.log('unkown camera type:', type)
    }
  }

  setupScene = () => {

    // Experimental
    let width = this.rendercontainer.clientWidth
    let height = this.rendercontainer.clientHeight

    // Create Scene
    this.cssScene = new THREE.Scene()
    this.rendercontainer.style.setProperty('--svg-scale', '1')

    // Create Renderer
    this.cssRenderer = new CSS3DRenderer()
    this.cssRenderer.setSize(width, height)
    this.cameraSelector('orthographic')
    this.rendercontainer.appendChild(this.cssRenderer.domElement)
    this.cssRenderer.domElement.id = 'css-renderer'
    this.svgContainer = this.cssRenderer.domElement.childNodes[0]
    this.svgContainer.id = 'svg-container'

    // Outer Method to add objects to dom
    // this.addInitSVGFromDom()
    // rendercontainer.onwheel = (event) => this.customZoom(event.wheelDelta) // Depreciated => zooming is vert slow | planning to replace with quality slider

    // Other Three objects
    this.clock = new THREE.Clock()
    this.stats = new Stats()
    this.stats.domElement.style.right = '10px'
    this.stats.domElement.style.left = 'auto'
    this.stats.domElement.style.position = 'absolute'
    this.stats.domElement.style.zIndex = '1002'
    this.stats.domElement.style.top = '10px'
    // this.stats.domElement.classList.add('stats')
    this.rendercontainer.appendChild(this.stats.domElement)
    this.setState({ rendered: true })
  }

  onWindowResize = () => {
    if (this.rendercontainer) {
      this.camera.aspect = this.rendercontainer.offsetWidth / this.rendercontainer.offsetHeight
      this.camera.updateProjectionMatrix()
      this.cssRenderer.setSize(this.rendercontainer.offsetWidth, this.rendercontainer.offsetHeight)
    }

  }

  animationHandler = () => {
    this.cssRenderer.render(this.cssScene, this.camera)
    this.stats.update()
    this.controls.update()
    requestAnimationFrame(this.animationHandler)
  }

  render() {
    console.log('Rendering Renderer', this.units)
    let layers = this.state.CSS3DObjects.filter((layer) => layer.context === 'board')
    //console.log(layers)
    return (
      <div id='main' style={{ position: 'relative', height: '100%', zIndex: 1000 }}>
        <DrawBoardContext.Provider
          value={{
            infobar: this.infobar,
            rendercontainer: this.rendercontainer,
            svgContainer: this.svgContainer,
            drawContainer: this.drawContainer,
            drawBoardSize: this.drawBoardSize,
            drawBoardScale: this.drawBoardScale,
          }}
        >

          <SideBar
            style={{ zIndex: '10' }}
            job={this.state.job}
            layers={layers}
            svgContainer={this.svgContainer}
            drawContainer={this.drawContainer}
            drawBoardSize={this.drawBoardSize}
            drawBoardScale={this.drawBoardScale}
            cameraSelector={(...props) => this.cameraSelector(...props)}
            setJob={(...props) => this.setJob(...props)}
            setSVGinDIV={(layer, divLayer) => this.setSVGinDIV(layer, divLayer)}
            removeSVGinDIV={(layer) => this.removeSVGinDIV(layer)}
            clear={() => this.removeAllCSS3DObjects()}
            update={() => this.updateCSSObjects()}
          />
          <div
            id='three'
            style={{ width: '-webkit-fill-available', height: '-webkit-fill-available', position: 'absolute', left: 0, top: 0, zIndex: '-1' }}
            ref={(rendercontainer) => { this.rendercontainer = rendercontainer }}
          />
          <InfoCoords />
        </DrawBoardContext.Provider>
        <div
          id='bottom-info-bar'
          ref={(infobar) => { this.infobar = infobar }}
          style={{
            position: 'absolute',
            width: '-webkit-fill-available',
            textAlign: 'center',
            bottom: '0px',
            zIndex: '1000',
            // filter: 'drop-shadow(2px 4px 6px black)',
            textShadow: '-1px 0px 2px black, 0 1px 2px black, 1px 0 2px black, 0 -1px 2px black',
          }}
        >
          <h4>0in, 0in</h4>
        </div>
      </div>
    )
  }

  componentDidMount() {
    this.setupScene()
    this.animationHandler()
    this.initDrawBoard()
    new window.ResizeObserver(this.onWindowResize).observe(this.rendercontainer)
    this.controls.update()
  }
}

export { Renderer as default, DrawBoardContext }

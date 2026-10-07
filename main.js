import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'

// canvas es el lienzo donde se va a renderizar la escena
const canvas = document.querySelector('.webgl')

// escena
const scene = new THREE.Scene()

// OBJETOS
const torusGeometry = new THREE.TorusGeometry(1, 0.3, 16, 32)
const material = new THREE.MeshBasicMaterial({wireframe: true,color: 0xff0000})

const torusMesh = new THREE.Mesh(torusGeometry, material)
const torusGeometry1 = new THREE.TorusGeometry(0.6, 0.2, 16, 32)
const material1 = new THREE.MeshBasicMaterial({wireframe: true,color: 0x0000ff})
const torusMesh1 = new THREE.Mesh(torusGeometry1, material1)


// GRUPO
const group = new THREE.Group()
group.add(torusMesh, torusMesh1)
scene.add(group)


// POSICIÓN DE LOS OBJETOS
torusMesh.position.set(0, 0, 0)
torusMesh1.position.set(2, 0, 0)


// ROTACIÓN DE LOS OBJETOS
torusMesh.rotation.x = 0.5
torusMesh.rotation.y = 0.5

torusMesh1.rotation.x = 1
torusMesh1.rotation.y = 0.5


// ESCALA
torusMesh.scale.set(1.2, 1.2, 1.2)


// TAMAÑO DE LA PANTALLA
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // ACTUALIZAR TAMAÑO DE LA GEOMETRIAS PANTALLA
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // ACTUALIZAR ASPECT RATIO DE LA CÁMARA
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // ACTUALIZAR RENDERIZADOR
    renderer.setSize(sizes.width, sizes.height)
})

//PANTALLA COMPLETA
window.addEventListener('dblclick', () =>
{
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if(!fullscreenElement)
    {
        if(canvas.requestFullscreen)
        {
            canvas.requestFullscreen()
        }
        else if(canvas.webkitRequestFullscreen)
        {
            canvas.webkitRequestFullscreen()
        }
    }
    else
    {
        if(document.exitFullscreen)
        {
            document.exitFullscreen()
        }
        else if(document.webkitExitFullscreen)
        {
            document.webkitExitFullscreen()
        }
    }
})

const aspectRatio = sizes.width / sizes.height

// CÁMARA PERSEPECTIVA
const camera = new THREE.PerspectiveCamera(
    50,
    sizes.width / sizes.height
)
scene.add(camera)
camera.position.set(3, 2, 5)
camera.lookAt(group.position)
//const camera = new THREE.PerspectiveCamera(150,sizes.width / sizes.height)
//scene.add(camera)

// ROTACIÓN DEL GRUPO
group.rotation.reorder('YXZ')
group.rotation.y = 0.3

//ASISTENTE DE EJES
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

//CONTROLES DE CAMARA ORBITALES
const controls = new OrbitControls(camera, canvas)
//controls.target.y = 1
controls.enableDamping = true

// RENDERIZADOR
const renderer = new THREE.WebGLRenderer({canvas: canvas})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)


// ============================================================
// INTERFAZ GRÁFICA DE DEBUGEO (lil-gui)
// ============================================================

// Crea el panel. "title" es el texto de arriba y "width" el ancho en píxeles
const gui = new GUI({
    width: 300,
    title: 'Debug UI'
})

// lil-gui solo puede modificar propiedades de OBJETOS.
// Para valores que no viven en un objeto de Three.js (colores en texto,
// funciones, radios, etc.) se guardan en este objeto auxiliar.
const debugObject = {}

// ---------- CARPETA: TORUS ROJO ----------
const torusFolder = gui.addFolder('Torus rojo')

// RANGO: gui.add(objeto, 'propiedad', min, max, paso)
// .name() cambia la etiqueta que se ve en el panel
torusFolder
    .add(torusMesh.position, 'y')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('elevación')

// CHECKBOX: si la propiedad es booleana (true/false) aparece una casilla
torusFolder.add(torusMesh, 'visible').name('visible')
torusFolder.add(material, 'wireframe').name('wireframe')

// COLOR: Three.js guarda el color como un objeto THREE.Color, no como texto.
// Por eso guardamos el color en el debugObject y, cada vez que cambia,
// se lo aplicamos al material con .onChange()
debugObject.color = '#ff0000'
torusFolder
    .addColor(debugObject, 'color')
    .name('color')
    .onChange(() =>
    {
        material.color.set(debugObject.color)
    })

// BOTÓN: si la propiedad es una función, lil-gui crea un botón que la ejecuta.
// Gira en X porque la rotación en Y ya se sobrescribe en cada frame dentro de tick()
debugObject.girar = () =>
{
    gsap.to(torusMesh.rotation, { duration: 1, x: torusMesh.rotation.x + Math.PI * 2 })
}
torusFolder.add(debugObject, 'girar').name('girar')

// GEOMETRÍA: las subdivisiones no se pueden cambiar en una geometría ya creada,
// hay que crear una nueva. Se usa .onFinishChange() (al soltar el slider)
// en vez de .onChange() para no crear cientos de geometrías mientras se arrastra.
debugObject.radialSegments = 16
debugObject.tubularSegments = 32

const updateTorusGeometry = () =>
{
    // dispose() libera la geometría vieja de la memoria de la GPU
    torusMesh.geometry.dispose()
    torusMesh.geometry = new THREE.TorusGeometry(
        1,
        0.3,
        debugObject.radialSegments,
        debugObject.tubularSegments
    )
}

torusFolder
    .add(debugObject, 'radialSegments')
    .min(3)
    .max(32)
    .step(1)
    .name('segmentos radiales')
    .onFinishChange(updateTorusGeometry)

torusFolder
    .add(debugObject, 'tubularSegments')
    .min(3)
    .max(100)
    .step(1)
    .name('segmentos tubulares')
    .onFinishChange(updateTorusGeometry)

// ---------- CARPETA: TORUS AZUL ----------
const torus1Folder = gui.addFolder('Torus azul')

torus1Folder.add(torusMesh1, 'visible').name('visible')
torus1Folder.add(material1, 'wireframe').name('wireframe')

debugObject.color1 = '#0000ff'
torus1Folder
    .addColor(debugObject, 'color1')
    .name('color')
    .onChange(() =>
    {
        material1.color.set(debugObject.color1)
    })

// ---------- CARPETA: ESCENA ----------
const sceneFolder = gui.addFolder('Escena')
sceneFolder.add(axesHelper, 'visible').name('ejes')
sceneFolder.add(controls, 'enableDamping').name('damping')

// Las carpetas de los torus empiezan cerradas para que el panel no ocupe tanto
torusFolder.close()
torus1Folder.close()

// MOSTRAR / OCULTAR el panel con la tecla "h"
window.addEventListener('keydown', (event) =>
{
    if(event.key === 'h')
    {
        gui.show(gui._hidden)
    }
})


//RELOJ
const clock = new THREE.Clock()

// ANIMACIONES

// gsap.to (group.position, {duration: 1, delay: 1, x: 2 })
// gsap.to (group.rotation, {duration: 1, delay: 1, x: 2 })

const tick = () => {

    // RELOJ
    const elapsedTime = clock.getElapsedTime()

    //GIRA SOBRE SU PROPIO EJE
    torusMesh.rotation.y = Math.PI * elapsedTime
    torusMesh1.rotation.y = Math.PI * elapsedTime

    //HACER QUE EL MESH1 ORBITE ALREDEDOR DEL MESH
    torusMesh1.position.x = Math.cos(elapsedTime) * 2
    torusMesh1.position.z = Math.sin(elapsedTime) * 2

    //ACTUALIZAR CONTROLES
    controls.update()

    // RENDERIZA
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}
tick()

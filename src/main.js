// Main JavaScript file - Application entry point
// Import Three.js components
import * as THREE from 'three';

// Application state
class CutListApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentMode = 'sketch';
        this.currentTool = 'select';
        this.currentPlane = 'xy';
        this.gridVisible = true;
        
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.grid = null;
        
        // Sketch planes
        this.sketchPlanes = {
            xy: null,
            xz: null,
            yz: null
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initThreeJS();
        this.showPage('dashboard');
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.showPage(page);
            });
        });
        
        // Quick actions
        document.getElementById('start-drawing')?.addEventListener('click', () => {
            this.showPage('world');
        });
        
        document.getElementById('back-to-dashboard')?.addEventListener('click', () => {
            this.showPage('dashboard');
        });
        
        // Mode switching
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.switchMode(mode);
            });
        });
        
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.target.dataset.tool;
                this.selectTool(tool);
            });
        });
        
        // Plane selection
        document.querySelectorAll('.plane-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const plane = e.target.dataset.plane;
                this.selectPlane(plane);
            });
        });
        
        // Grid toggle
        document.getElementById('grid-toggle')?.addEventListener('click', () => {
            this.toggleGrid();
        });
        
        // Camera reset
        document.getElementById('camera-reset')?.addEventListener('click', () => {
            this.resetCamera();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        document.getElementById(pageId)?.classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');
        
        this.currentPage = pageId;
        
        // Initialize Three.js when showing world
        if (pageId === 'world') {
            this.initThreeJS();
        }
    }
    
    initThreeJS() {
        const canvas = document.getElementById('three-canvas');
        if (!canvas) return;
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf5f5f0);
        
        // Camera
        const container = canvas.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        if (this.currentMode === 'sketch') {
            // Orthographic camera for sketch mode
            const aspect = width / height;
            const size = 10;
            this.camera = new THREE.OrthographicCamera(
                -size * aspect, size * aspect,
                size, -size,
                0.1, 1000
            );
        } else {
            // Perspective camera for modeling mode
            this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        }
        
        this.camera.position.set(10, 10, 10);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true 
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Controls (basic orbit controls simulation)
        this.setupControls();
        
        // Grid
        this.createGrid();
        
        // Sketch planes
        this.createSketchPlanes();
        
        // Lighting
        this.setupLighting();
        
        // Start render loop
        this.animate();
    }
    
    setupControls() {
        const canvas = document.getElementById('three-canvas');
        let isMouseDown = false;
        let mouseX = 0, mouseY = 0;
        
        canvas.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        canvas.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            
            // Simple orbit controls
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(this.camera.position);
            spherical.theta -= deltaX * 0.01;
            spherical.phi += deltaY * 0.01;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            
            this.camera.position.setFromSpherical(spherical);
            this.camera.lookAt(0, 0, 0);
            
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const scale = e.deltaY > 0 ? 1.1 : 0.9;
            
            if (this.camera.isOrthographicCamera) {
                this.camera.zoom *= scale;
                this.camera.updateProjectionMatrix();
            } else {
                this.camera.position.multiplyScalar(scale);
            }
        });
    }
    
    createGrid() {
        // Remove existing grid
        if (this.grid) {
            this.scene.remove(this.grid);
        }
        
        // Create new grid
        const size = 20;
        const divisions = 20;
        
        this.grid = new THREE.GridHelper(size, divisions, 0xcccccc, 0xe8e8e8);
        this.grid.visible = this.gridVisible;
        this.scene.add(this.grid);
    }
    
    createSketchPlanes() {
        // XY Plane (default visible)
        const xyGeometry = new THREE.PlaneGeometry(20, 20);
        const xyMaterial = new THREE.MeshBasicMaterial({
            color: 0x2C5530,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        this.sketchPlanes.xy = new THREE.Mesh(xyGeometry, xyMaterial);
        this.sketchPlanes.xy.visible = this.currentPlane === 'xy';
        this.scene.add(this.sketchPlanes.xy);
        
        // XZ Plane
        const xzGeometry = new THREE.PlaneGeometry(20, 20);
        const xzMaterial = new THREE.MeshBasicMaterial({
            color: 0x8B4513,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        this.sketchPlanes.xz = new THREE.Mesh(xzGeometry, xzMaterial);
        this.sketchPlanes.xz.rotation.x = Math.PI / 2;
        this.sketchPlanes.xz.visible = this.currentPlane === 'xz';
        this.scene.add(this.sketchPlanes.xz);
        
        // YZ Plane
        const yzGeometry = new THREE.PlaneGeometry(20, 20);
        const yzMaterial = new THREE.MeshBasicMaterial({
            color: 0xD2691E,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        this.sketchPlanes.yz = new THREE.Mesh(yzGeometry, yzMaterial);
        this.sketchPlanes.yz.rotation.y = Math.PI / 2;
        this.sketchPlanes.yz.visible = this.currentPlane === 'yz';
        this.scene.add(this.sketchPlanes.yz);
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`)?.classList.add('active');
        
        // Show/hide relevant tools
        const sketchTools = document.querySelector('.toolbar-section:first-child');
        const modelingTools = document.getElementById('modeling-tools');
        
        if (mode === 'sketch') {
            sketchTools.style.display = 'flex';
            modelingTools.style.display = 'none';
        } else {
            sketchTools.style.display = 'flex';
            modelingTools.style.display = 'flex';
        }
        
        // Recreate camera for mode
        if (this.camera) {
            const container = document.getElementById('three-canvas').parentElement;
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            if (mode === 'sketch') {
                const aspect = width / height;
                const size = 10;
                this.camera = new THREE.OrthographicCamera(
                    -size * aspect, size * aspect,
                    size, -size,
                    0.1, 1000
                );
            } else {
                this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            }
            
            this.camera.position.set(10, 10, 10);
            this.camera.lookAt(0, 0, 0);
        }
    }
    
    selectTool(tool) {
        this.currentTool = tool;
        
        // Update UI
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tool="${tool}"]`)?.classList.add('active');
        
        // Update cursor
        const canvas = document.getElementById('three-canvas');
        if (canvas) {
            switch (tool) {
                case 'select':
                    canvas.style.cursor = 'default';
                    break;
                case 'line':
                case 'rectangle':
                case 'circle':
                    canvas.style.cursor = 'crosshair';
                    break;
                default:
                    canvas.style.cursor = 'default';
            }
        }
    }
    
    selectPlane(plane) {
        this.currentPlane = plane;
        
        // Update UI
        document.querySelectorAll('.plane-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-plane="${plane}"]`)?.classList.add('active');
        
        // Show/hide sketch planes
        Object.keys(this.sketchPlanes).forEach(key => {
            if (this.sketchPlanes[key]) {
                this.sketchPlanes[key].visible = key === plane;
            }
        });
    }
    
    toggleGrid() {
        this.gridVisible = !this.gridVisible;
        if (this.grid) {
            this.grid.visible = this.gridVisible;
        }
        
        // Update button state
        const btn = document.getElementById('grid-toggle');
        if (btn) {
            btn.classList.toggle('active', this.gridVisible);
        }
    }
    
    resetCamera() {
        if (this.camera) {
            this.camera.position.set(10, 10, 10);
            this.camera.lookAt(0, 0, 0);
            
            if (this.camera.isOrthographicCamera) {
                this.camera.zoom = 1;
                this.camera.updateProjectionMatrix();
            }
        }
    }
    
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        const canvas = document.getElementById('three-canvas');
        const container = canvas.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        if (this.camera.isOrthographicCamera) {
            const aspect = width / height;
            const size = 10;
            this.camera.left = -size * aspect;
            this.camera.right = size * aspect;
            this.camera.top = size;
            this.camera.bottom = -size;
        } else {
            this.camera.aspect = width / height;
        }
        
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CutListApp();
});

export default CutListApp;

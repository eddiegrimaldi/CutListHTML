// Simple Three.js CDN version for development
// This is a simplified version of main.js that works without npm

// === DEBUGGING: Script loading verification ===
console.log('MAIN-SIMPLE.JS SCRIPT IS LOADING...');
console.log('Current time:', new Date().toISOString());
console.log('THREE.js available:', typeof THREE !== 'undefined');
console.log('Document ready state:', document.readyState);

// Test basic functionality
try {
    console.log('Basic JavaScript execution working');
} catch (error) {
    console.error('Basic JavaScript execution failed:', error);
}

// Application state
class CutListApp {
    constructor() {
        console.log('CutListApp constructor called');
        this.currentPage = 'dashboard';
        this.currentMode = 'sketch';
        this.currentTool = 'select';
        this.currentPlane = 'xy';
        this.gridVisible = true;
        
        // Drawing state
        this.isDrawing = false;
        this.drawingStartPoint = null;
        this.tempDrawingObject = null;
        this.drawnObjects = [];
        this.selectedObjects = [];
        
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.grid = null;
        
        // Sketch planes
        this.sketchPlanes = {
            xy: null,
            xz: null,
            yz: null
        };
        
        // Enhanced settings
        this.gridSize = 1;
        this.snapToGrid = true;
        this.showDimensions = true;
        this.extrusionDepth = 1;
        
        // Mouse and raycaster for interactions
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        
        this.init();
    }
    
    init() {
        console.log('CutListApp.init() called');
        
        // Delay initialization to ensure DOM is fully ready
        setTimeout(() => {
            console.log('Starting delayed initialization...');
            this.setupEventListeners();
            this.showPage('dashboard');
            console.log('Initialization complete');
        }, 100);
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Navigation
        const navBtns = document.querySelectorAll('.nav-btn');
        console.log('Found', navBtns.length, 'navigation buttons');
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                console.log('Navigation clicked:', page);
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
        
        // Grid and snap controls
        document.getElementById('grid-toggle')?.addEventListener('click', () => {
            this.toggleGrid();
        });
        
        document.getElementById('snap-toggle')?.addEventListener('click', () => {
            this.toggleSnap();
        });
        
        // Grid size input
        document.getElementById('grid-size')?.addEventListener('change', (e) => {
            this.setGridSize(parseFloat(e.target.value));
        });
        
        // Extrusion depth input
        document.getElementById('extrusion-depth')?.addEventListener('change', (e) => {
            this.extrusionDepth = parseFloat(e.target.value);
        });
        
        // Drawing actions
        document.getElementById('rectangle-btn')?.addEventListener('click', () => {
            this.selectTool('rectangle');
        });
        
        document.getElementById('circle-btn')?.addEventListener('click', () => {
            this.selectTool('circle');
        });
        
        document.getElementById('line-btn')?.addEventListener('click', () => {
            this.selectTool('line');
        });
        
        document.getElementById('extrude-btn')?.addEventListener('click', () => {
            this.extrudeSelected();
        });
        
        document.getElementById('delete-btn')?.addEventListener('click', () => {
            this.deleteSelected();
        });
        
        // Project management
        document.getElementById('save-project')?.addEventListener('click', () => {
            this.saveProject();
        });
        
        document.getElementById('load-project')?.addEventListener('click', () => {
            document.getElementById('file-input')?.click();
        });
        
        document.getElementById('file-input')?.addEventListener('change', (e) => {
            this.loadProject(e.target.files[0]);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
        
        // Global right-click prevention and mode switching
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('#three-canvas')) {
                e.preventDefault();
                return false;
            }
        });
    }
    
    handleKeydown(e) {
        // Prevent default for our shortcuts
        const shortcuts = ['Space', 'Escape', 'Home', 'KeyG', 'KeyR', 'KeyC', 'KeyL', 'KeyE', 'Delete'];
        if (shortcuts.includes(e.code)) {
            e.preventDefault();
        }
        
        switch(e.code) {
            case 'Space':
                // Toggle between sketch and modeling modes
                console.log('SPACE KEY - Toggling mode');
                this.switchMode(this.currentMode === 'sketch' ? 'modeling' : 'sketch');
                break;
                
            case 'Escape':
                // Cancel current operation and return to sketch mode
                console.log('ESC KEY - Returning to sketch mode');
                this.cancelCurrentOperation();
                this.switchMode('sketch');
                break;
                
            case 'Home':
                // Reset camera and return to sketch mode
                console.log('HOME KEY - Reset camera and sketch mode');
                this.resetCamera();
                this.switchMode('sketch');
                break;
                
            case 'KeyG':
                // Toggle grid
                this.toggleGrid();
                break;
                
            case 'KeyR':
                // Select rectangle tool
                this.selectTool('rectangle');
                break;
                
            case 'KeyC':
                // Select circle tool
                this.selectTool('circle');
                break;
                
            case 'KeyL':
                // Select line tool
                this.selectTool('line');
                break;
                
            case 'KeyE':
                // Extrude selected
                this.extrudeSelected();
                break;
                
            case 'Delete':
                // Delete selected
                this.deleteSelected();
                break;
        }
    }
    
    cancelCurrentOperation() {
        this.isDrawing = false;
        this.drawingStartPoint = null;
        if (this.tempDrawingObject) {
            this.scene?.remove(this.tempDrawingObject);
            this.tempDrawingObject = null;
        }
        this.updateDrawingStatus('Ready');
    }
    
    resetCamera() {
        if (!this.camera) return;
        
        if (this.camera.isOrthographicCamera) {
            this.camera.position.set(0, 0, 10);
            this.camera.zoom = 1;
            this.camera.updateProjectionMatrix();
        } else {
            this.camera.position.set(5, 5, 5);
            this.camera.lookAt(0, 0, 0);
        }
    }
    
    showPage(pageId) {
        console.log('Switching to page:', pageId);
        
        // Hide all pages
        const allPages = document.querySelectorAll('.page');
        console.log('Found', allPages.length, 'pages');
        allPages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const targetPage = document.getElementById(pageId);
        console.log('Target page element:', targetPage ? 'found' : 'NOT FOUND');
        targetPage?.classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');
        
        this.currentPage = pageId;
        
        // Initialize Three.js when showing world
        if (pageId === 'world') {
            console.log('World page activated');
            console.log('THREE.js available:', typeof THREE !== 'undefined');
            
            if (typeof THREE !== 'undefined') {
                console.log('Initializing Three.js in 100ms...');
                setTimeout(() => {
                    console.log('Starting Three.js initialization...');
                    this.initThreeJS();
                    this.populateMaterialsDropdown();
                    console.log('Three.js initialization completed');
                }, 100);
            } else {
                console.error('THREE.js not available!');
            }
        }
    }
    
    populateMaterialsDropdown() {
        const select = document.getElementById('material-select');
        if (!select || typeof MATERIALS_DATABASE === 'undefined') return;
        
        // Clear existing options
        select.innerHTML = '';
        
        // Add materials from database
        Object.entries(MATERIALS_DATABASE).forEach(([key, material]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${material.name} (${material.category})`;
            select.appendChild(option);
        });
    }
    
    initThreeJS() {
        console.log('initThreeJS() called');
        
        const canvas = document.getElementById('three-canvas');
        console.log('Canvas element:', canvas ? 'FOUND' : 'NOT FOUND');
        
        if (!canvas) {
            console.error('Canvas element not found - cannot initialize Three.js');
            return;
        }
        
        if (typeof THREE === 'undefined') {
            console.error('Three.js not loaded');
            return;
        }
        
        console.log('Starting Three.js initialization...');
        console.log('Canvas dimensions:', canvas.clientWidth, 'x', canvas.clientHeight);
        
        // Scene
        console.log('Creating scene...');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf8f9fa);
        
        // Camera
        const width = canvas.clientWidth || 800;
        const height = canvas.clientHeight || 600;
        const aspect = width / height;
        
        // Start with orthographic camera for sketch mode
        this.camera = new THREE.OrthographicCamera(
            -10 * aspect, 10 * aspect,
            10, -10,
            0.1, 1000
        );
        this.camera.position.set(0, 0, 10);
        
        console.log('Camera created');
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true 
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        console.log('Renderer created');
        
        // Controls
        this.setupControls();
        
        // Grid
        this.createGrid();
        
        // Sketch planes
        this.createSketchPlanes();
        
        // Lighting
        this.setupLighting();
        
        // Start render loop
        this.animate();
        
        console.log('Three.js initialization complete');
    }
    
    setupControls() {
        const canvas = document.getElementById('three-canvas');
        console.log('Setting up controls...');
        console.log('Canvas found:', canvas);
        console.log('Canvas dimensions:', canvas ? `${canvas.clientWidth}x${canvas.clientHeight}` : 'N/A');
        console.log('this.currentMode:', this.currentMode);
        
        if (!canvas) {
            console.error('Canvas not found! Cannot setup controls.');
            return;
        }
        
        // Mouse state tracking
        let isMouseDown = false;
        let isRightMouseDown = false;
        let mouseX = 0, mouseY = 0;
        let startMouseX = 0, startMouseY = 0;
        
        // Prevent context menu on the entire canvas area
        const contextMenuHandler = (e) => {
            console.log('Context menu prevented on canvas');
            console.log('Event details:', e.type, e.button, e.target.tagName);
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        
        console.log('Adding contextmenu event listener to canvas...');
        canvas.addEventListener('contextmenu', contextMenuHandler, true);
        
        const mouseDownHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('MOUSE DOWN EVENT FIRED!');
            console.log(`Mouse button ${e.button} pressed (0=left, 1=middle, 2=right)`);
            console.log(`Current mode: ${this.currentMode}`);
            console.log('Event target:', e.target.tagName, e.target.id);
            
            isMouseDown = true;
            mouseX = e.clientX;
            mouseY = e.clientY;
            startMouseX = e.clientX;
            startMouseY = e.clientY;
            
            if (e.button === 2) { // Right mouse button
                isRightMouseDown = true;
                console.log('RIGHT MOUSE DOWN DETECTED!');
                console.log('Attempting to switch to modeling mode...');
                console.log(`switchMode function exists: ${typeof this.switchMode === 'function'}`);
                
                // Switch to modeling mode for 3D navigation
                if (this.currentMode === 'sketch') {
                    console.log('Calling switchMode(modeling)...');
                    try {
                        this.switchMode('modeling');
                        console.log('switchMode call completed');
                    } catch (error) {
                        console.error('Error in switchMode:', error);
                    }
                } else {
                    console.log('Already in modeling mode');
                }
            }
        };
        
        const mouseUpHandler = (e) => {
            e.preventDefault();
            isMouseDown = false;
            if (e.button === 2) {
                isRightMouseDown = false;
                console.log('Right mouse up');
            }
        };
        
        const mouseMoveHandler = (e) => {
            if (!isMouseDown) return;
            
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            
            if (isRightMouseDown && this.currentMode === 'modeling') {
                // 3D camera rotation
                if (this.camera.isPerspectiveCamera) {
                    // Rotate around origin
                    const spherical = new THREE.Spherical();
                    spherical.setFromVector3(this.camera.position);
                    spherical.theta -= deltaX * 0.01;
                    spherical.phi += deltaY * 0.01;
                    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
                    this.camera.position.setFromSpherical(spherical);
                    this.camera.lookAt(0, 0, 0);
                }
            } else if (isMouseDown && e.button === 1) {
                // Pan with middle mouse or left mouse in sketch mode
                if (this.camera.isOrthographicCamera) {
                    const factor = 0.01 * this.camera.zoom;
                    this.camera.position.x -= deltaX * factor;
                    this.camera.position.y += deltaY * factor;
                }
            }
            
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        
        const wheelHandler = (e) => {
            e.preventDefault();
            const scale = e.deltaY > 0 ? 1.1 : 0.9;
            
            if (this.camera.isOrthographicCamera) {
                this.camera.zoom *= scale;
                this.camera.updateProjectionMatrix();
            } else {
                this.camera.position.multiplyScalar(scale);
            }
        };
        
        // Add event listeners
        console.log('Adding event listeners to canvas...');
        canvas.addEventListener('mousedown', mouseDownHandler);
        console.log('mousedown listener added');
        canvas.addEventListener('mouseup', mouseUpHandler);
        console.log('mouseup listener added');
        canvas.addEventListener('mousemove', mouseMoveHandler);
        console.log('mousemove listener added');
        canvas.addEventListener('wheel', wheelHandler);
        console.log('wheel listener added');
        
        // Store handlers for cleanup
        canvas._cutlistListeners = [
            {event: 'contextmenu', handler: contextMenuHandler},
            {event: 'mousedown', handler: mouseDownHandler},
            {event: 'mouseup', handler: mouseUpHandler},
            {event: 'mousemove', handler: mouseMoveHandler},
            {event: 'wheel', handler: wheelHandler}
        ];
        
        console.log('Controls setup complete - all event listeners attached');
        console.log('Canvas now has', canvas._cutlistListeners.length, 'event listeners');
        
        // Test immediate right-click
        setTimeout(() => {
            console.log('Testing canvas right-click functionality...');
            const testEvent = new MouseEvent('contextmenu', {
                button: 2,
                buttons: 2,
                bubbles: true,
                cancelable: true
            });
            console.log('Dispatching test contextmenu event...');
            canvas.dispatchEvent(testEvent);
        }, 500);
    }
    
    createGrid() {
        if (!this.scene) return;
        
        // Remove existing grid
        if (this.grid) {
            this.scene.remove(this.grid);
        }
        
        // Create new grid
        this.grid = new THREE.GridHelper(20, 20, 0x444444, 0x888888);
        this.grid.rotation.x = Math.PI / 2; // Rotate to XY plane
        this.scene.add(this.grid);
    }
    
    createSketchPlanes() {
        // Create invisible sketch planes for raycasting
        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshBasicMaterial({ 
            transparent: true, 
            opacity: 0,
            side: THREE.DoubleSide 
        });
        
        // XY Plane (default)
        this.sketchPlanes.xy = new THREE.Mesh(geometry, material);
        this.sketchPlanes.xy.position.set(0, 0, 0);
        this.scene.add(this.sketchPlanes.xy);
        
        // XZ Plane
        this.sketchPlanes.xz = new THREE.Mesh(geometry, material);
        this.sketchPlanes.xz.rotation.x = Math.PI / 2;
        this.sketchPlanes.xz.visible = false;
        this.scene.add(this.sketchPlanes.xz);
        
        // YZ Plane
        this.sketchPlanes.yz = new THREE.Mesh(geometry, material);
        this.sketchPlanes.yz.rotation.y = Math.PI / 2;
        this.sketchPlanes.yz.visible = false;
        this.scene.add(this.sketchPlanes.yz);
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
    
    switchMode(mode) {
        console.log('switchMode called with:', mode);
        console.log('Current mode before switch:', this.currentMode);
        
        if (this.currentMode === mode) {
            console.log('Already in', mode, 'mode');
            return;
        }
        
        this.currentMode = mode;
        console.log('Mode switched to:', mode);
        
        // Update mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`)?.classList.add('active');
        
        // Show/hide appropriate tools
        const sketchTools = document.getElementById('sketch-tools');
        const modelingTools = document.getElementById('modeling-tools');
        
        if (mode === 'sketch') {
            sketchTools?.style.setProperty('display', 'block');
            modelingTools?.style.setProperty('display', 'none');
            this.switchToOrthographicCamera();
        } else {
            sketchTools?.style.setProperty('display', 'none');
            modelingTools?.style.setProperty('display', 'block');
            this.switchToPerspectiveCamera();
        }
        
        // Update plane selector visibility
        const planeSelector = document.getElementById('plane-selector');
        if (planeSelector) {
            planeSelector.style.display = mode === 'sketch' ? 'flex' : 'none';
        }
        
        // Show notification
        this.showNotification(`Switched to ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`);
        
        console.log('Mode switch completed');
    }
    
    switchToOrthographicCamera() {
        if (!this.camera || !this.renderer) return;
        
        console.log('Switching to orthographic camera');
        
        const canvas = this.renderer.domElement;
        const width = canvas.clientWidth || 800;
        const height = canvas.clientHeight || 600;
        const aspect = width / height;
        
        // Store current position
        const currentPos = this.camera.position.clone();
        
        // Create orthographic camera
        this.camera = new THREE.OrthographicCamera(
            -10 * aspect, 10 * aspect,
            10, -10,
            0.1, 1000
        );
        
        // Set position looking down at XY plane
        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(0, 0, 0);
        this.camera.zoom = 1;
        this.camera.updateProjectionMatrix();
        
        console.log('Orthographic camera setup complete');
    }
    
    switchToPerspectiveCamera() {
        if (!this.camera || !this.renderer) return;
        
        console.log('Switching to perspective camera');
        
        const canvas = this.renderer.domElement;
        const width = canvas.clientWidth || 800;
        const height = canvas.clientHeight || 600;
        const aspect = width / height;
        
        // Create perspective camera
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        
        // Set position for 3D view
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
        
        console.log('Perspective camera setup complete');
    }
    
    selectTool(tool) {
        this.currentTool = tool;
        
        // Update tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tool="${tool}"]`)?.classList.add('active');
        
        // Update cursor or other visual feedback
        const canvas = document.getElementById('three-canvas');
        if (canvas) {
            canvas.style.cursor = tool === 'select' ? 'default' : 'crosshair';
        }
        
        this.updateDrawingStatus(`${tool.charAt(0).toUpperCase() + tool.slice(1)} tool selected`);
    }
    
    selectPlane(plane) {
        this.currentPlane = plane;
        
        // Update plane buttons
        document.querySelectorAll('.plane-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-plane="${plane}"]`)?.classList.add('active');
        
        // Show only selected plane
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
        
        const btn = document.getElementById('grid-toggle');
        if (btn) {
            btn.textContent = `Grid: ${this.gridVisible ? 'ON' : 'OFF'}`;
            btn.classList.toggle('active', this.gridVisible);
        }
    }
    
    toggleSnap() {
        this.snapToGrid = !this.snapToGrid;
        
        const btn = document.getElementById('snap-toggle');
        if (btn) {
            btn.textContent = `Snap: ${this.snapToGrid ? 'ON' : 'OFF'}`;
            btn.classList.toggle('active', this.snapToGrid);
        }
    }
    
    setGridSize(size) {
        this.gridSize = size;
        this.createGrid(); // Recreate grid with new size
    }
    
    extrudeSelected() {
        // Implementation for extruding selected 2D shapes to 3D
        console.log('Extruding selected objects');
    }
    
    deleteSelected() {
        // Implementation for deleting selected objects
        console.log('Deleting selected objects');
    }
    
    saveProject() {
        const project = {
            name: document.getElementById('project-name')?.value || 'Untitled Project',
            objects: this.drawnObjects,
            settings: {
                gridSize: this.gridSize,
                snapToGrid: this.snapToGrid,
                extrusionDepth: this.extrusionDepth
            }
        };
        
        const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}.cutlist`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    loadProject(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const project = JSON.parse(e.target.result);
                
                // Load project data
                document.getElementById('project-name').value = project.name || 'Loaded Project';
                this.drawnObjects = project.objects || [];
                
                if (project.settings) {
                    this.gridSize = project.settings.gridSize || 1;
                    this.snapToGrid = project.settings.snapToGrid !== false;
                    this.extrusionDepth = project.settings.extrusionDepth || 1;
                    
                    // Update UI
                    document.getElementById('grid-size').value = this.gridSize;
                    document.getElementById('extrusion-depth').value = this.extrusionDepth;
                    this.toggleSnap();
                    this.toggleSnap(); // Toggle twice to set correct state
                }
                
                this.showNotification('Project loaded successfully');
            } catch (error) {
                console.error('Error loading project:', error);
                this.showNotification('Error loading project', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    updateDrawingStatus(status) {
        const statusElement = document.getElementById('status-text');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : '#4CAF50'};
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
console.log('Setting up DOM event listener...');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM LOADED - Starting CutList App');
    console.log('THREE.js available:', typeof THREE !== 'undefined');
    console.log('Canvas element exists:', document.getElementById('three-canvas') !== null);
    console.log('About to create CutListApp instance...');
    
    try {
        const app = new CutListApp();
        console.log('CutList App created successfully');
        
        // Test right-click functionality immediately
        setTimeout(() => {
            console.log('Testing right-click setup...');
            const canvas = document.getElementById('three-canvas');
            if (canvas) {
                console.log('Canvas found for right-click test');
                console.log('Canvas has contextmenu listener:', canvas.hasAttribute('oncontextmenu'));
            } else {
                console.error('Canvas not found for right-click test');
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error creating CutList App:', error);
        console.error('Error stack:', error.stack);
    }
});

// Also try immediate execution if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM is still loading, waiting for DOMContentLoaded...');
} else {
    console.log('DOM already loaded, executing immediately...');
    setTimeout(() => {
        console.log('IMMEDIATE EXECUTION - Starting CutList App');
        try {
            const app = new CutListApp();
            console.log('CutList App created successfully (immediate)');
        } catch (error) {
            console.error('Error creating CutList App (immediate):', error);
        }
    }, 100);
}

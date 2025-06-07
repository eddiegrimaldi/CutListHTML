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
        console.log('🏗️ CutListApp.init() called');
        
        // Delay initialization to ensure DOM is fully ready
        setTimeout(() => {
            console.log('🔧 Starting delayed initialization...');
            this.setupEventListeners();
            this.showPage('dashboard');
            console.log('✅ Initialization complete');
        }, 100);
    }
      setupEventListeners() {
        console.log('🎛️ Setting up event listeners...');
        
        // Navigation
        const navBtns = document.querySelectorAll('.nav-btn');
        console.log('🧭 Found', navBtns.length, 'navigation buttons');
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                console.log('🔄 Navigation clicked:', page);
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
        
        // Snap to grid toggle
        document.getElementById('snap-toggle')?.addEventListener('click', () => {
            this.toggleSnapToGrid();
        });
        
        // Grid size input
        document.getElementById('grid-size')?.addEventListener('change', (e) => {
            this.gridSize = parseFloat(e.target.value) || 1;
            this.createGrid();
        });
        
        // Extrusion depth input
        document.getElementById('extrusion-depth')?.addEventListener('change', (e) => {
            this.extrusionDepth = parseFloat(e.target.value) || 1;
        });
        
        // Extrude button
        document.getElementById('extrude-btn')?.addEventListener('click', () => {
            this.extrudeSelected();
        });
        
        // Delete button
        document.getElementById('delete-btn')?.addEventListener('click', () => {
            this.deleteSelectedObjects();
        });
        
        // Save project
        document.getElementById('save-project')?.addEventListener('click', () => {
            this.saveProject();
        });
        
        // Load project
        document.getElementById('load-project')?.addEventListener('click', () => {
            document.getElementById('file-input')?.click();
        });
        
        // File input
        document.getElementById('file-input')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const projectData = JSON.parse(event.target.result);
                        this.loadProject(projectData);
                    } catch (error) {
                        console.error('Error loading project:', error);
                        this.showNotification('Error loading project file');
                    }
                };
                reader.readAsText(file);
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
          // Canvas drawing events
        this.setupCanvasDrawing();
          // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cancelDrawing();
                // Also return to sketch mode on Escape
                if (this.currentMode === 'modeling') {
                    this.switchMode('sketch');
                }
            } else if (e.key === 'Delete' && this.selectedObjects.length > 0) {
                this.deleteSelectedObjects();
            } else if (e.key === 'g' || e.key === 'G') {
                this.toggleSnapToGrid();
            } else if (e.key === 'e' || e.key === 'E') {
                if (this.selectedObjects.length > 0 && this.currentMode === 'modeling') {
                    this.extrudeSelected();
                }
            } else if (e.key === ' ' || e.key === 'Spacebar') {
                // Toggle between sketch and modeling mode with spacebar
                e.preventDefault();
                const newMode = this.currentMode === 'sketch' ? 'modeling' : 'sketch';
                this.switchMode(newMode);
            } else if (e.key === 'Home') {
                // Reset camera and return to sketch mode
                this.resetCamera();
                this.switchMode('sketch');
            }
        });
    }
    
    setupCanvasDrawing() {
        const canvas = document.getElementById('three-canvas');
        if (!canvas) return;
          
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            
            this.mouse.set(x, y);
            
            if (this.currentTool === 'select') {
                this.handleObjectSelection();
            } else {
                this.handleCanvasClick(x, y);
            }
        });
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            
            this.mouse.set(x, y);
            
            if (this.isDrawing && this.currentTool !== 'select') {
                this.updateTempDrawing(x, y);
            }
        });
    }
    
    updateTempDrawing(x, y) {
        if (!this.camera || !this.tempDrawingObject) return;
        
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(x, y);
        raycaster.setFromCamera(mouse, this.camera);
        
        const currentPlaneObject = this.sketchPlanes[this.currentPlane];
        if (!currentPlaneObject) return;
        
        const intersects = raycaster.intersectObject(currentPlaneObject);
        if (intersects.length === 0) return;
        
        const point = intersects[0].point;
        
        if (this.currentTool === 'line' && this.drawingStartPoint) {
            // Update temporary line
            const geometry = new THREE.BufferGeometry().setFromPoints([this.drawingStartPoint, point]);
            this.tempDrawingObject.geometry.dispose();
            this.tempDrawingObject.geometry = geometry;
        }
    }
    
    handleCanvasClick(x, y) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(x, y);
        
        if (!this.camera) return;
        
        raycaster.setFromCamera(mouse, this.camera);
        
        // Get intersection with current sketch plane
        const currentPlaneObject = this.sketchPlanes[this.currentPlane];
        if (!currentPlaneObject) return;
        
        const intersects = raycaster.intersectObject(currentPlaneObject);
        if (intersects.length === 0) return;
        
        let point = intersects[0].point;
        
        // Apply snap to grid
        point = this.snapPointToGrid(point);
        
        switch (this.currentTool) {
            case 'line':
                this.drawLine(point);
                break;
            case 'rectangle':
                this.drawRectangle(point);
                break;
            case 'circle':
                this.drawCircle(point);
                break;
        }
    }
      drawLine(point) {
        if (!this.isDrawing) {
            // Start drawing line
            this.isDrawing = true;
            this.drawingStartPoint = point.clone();
            
            // Create temporary line
            const geometry = new THREE.BufferGeometry().setFromPoints([point, point]);
            const material = new THREE.LineBasicMaterial({ color: 0x2C5530, linewidth: 2 });
            this.tempDrawingObject = new THREE.Line(geometry, material);
            this.scene.add(this.tempDrawingObject);
            
            this.updateDrawingStatus();
        } else {
            // Finish drawing line
            this.isDrawing = false;
            
            if (this.tempDrawingObject) {
                this.scene.remove(this.tempDrawingObject);
            }
            
            // Create final line
            const geometry = new THREE.BufferGeometry().setFromPoints([this.drawingStartPoint, point]);
            const material = new THREE.LineBasicMaterial({ color: 0x2C5530, linewidth: 3 });
            const line = new THREE.Line(geometry, material);
            this.scene.add(line);
            this.drawnObjects.push(line);
            
            this.drawingStartPoint = null;
            this.tempDrawingObject = null;
            this.updateDrawingStatus();
        }
    }
    
    drawRectangle(point) {
        if (!this.isDrawing) {
            // Start drawing rectangle
            this.isDrawing = true;
            this.drawingStartPoint = point.clone();
            this.updateDrawingStatus();
        } else {
            // Finish drawing rectangle
            this.isDrawing = false;
            
            const width = Math.abs(point.x - this.drawingStartPoint.x);
            const height = Math.abs(point.y - this.drawingStartPoint.y);
            const centerX = (point.x + this.drawingStartPoint.x) / 2;
            const centerY = (point.y + this.drawingStartPoint.y) / 2;
            
            // Create rectangle outline
            const geometry = new THREE.PlaneGeometry(width, height);
            const edges = new THREE.EdgesGeometry(geometry);
            const material = new THREE.LineBasicMaterial({ color: 0x2C5530, linewidth: 3 });
            const rectangle = new THREE.LineSegments(edges, material);
            
            rectangle.position.set(centerX, centerY, this.drawingStartPoint.z);
            
            // Align with current plane
            if (this.currentPlane === 'xz') {
                rectangle.rotation.x = Math.PI / 2;
            } else if (this.currentPlane === 'yz') {
                rectangle.rotation.y = Math.PI / 2;
            }
            
            this.scene.add(rectangle);
            this.drawnObjects.push(rectangle);
            
            this.drawingStartPoint = null;
            this.updateDrawingStatus();
        }
    }
    
    drawCircle(point) {
        if (!this.isDrawing) {
            // Start drawing circle
            this.isDrawing = true;
            this.drawingStartPoint = point.clone();
            this.updateDrawingStatus();
        } else {
            // Finish drawing circle
            this.isDrawing = false;
            
            const radius = this.drawingStartPoint.distanceTo(point);
            
            // Create circle outline
            const geometry = new THREE.CircleGeometry(radius, 32);
            const edges = new THREE.EdgesGeometry(geometry);
            const material = new THREE.LineBasicMaterial({ color: 0x2C5530, linewidth: 3 });
            const circle = new THREE.LineSegments(edges, material);
            
            circle.position.copy(this.drawingStartPoint);
            
            // Align with current plane
            if (this.currentPlane === 'xz') {
                circle.rotation.x = Math.PI / 2;
            } else if (this.currentPlane === 'yz') {
                circle.rotation.y = Math.PI / 2;
            }
            
            this.scene.add(circle);
            this.drawnObjects.push(circle);
            
            this.drawingStartPoint = null;
            this.updateDrawingStatus();
        }
    }
      showPage(pageId) {
        console.log('📄 Switching to page:', pageId);
        
        // Hide all pages
        const allPages = document.querySelectorAll('.page');
        console.log('🔍 Found', allPages.length, 'pages');
        allPages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const targetPage = document.getElementById(pageId);
        console.log('🎯 Target page element:', targetPage ? 'found' : 'NOT FOUND');
        targetPage?.classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');
        
        this.currentPage = pageId;
        
        // Initialize Three.js when showing world
        if (pageId === 'world') {
            console.log('🌍 World page activated');
            console.log('📦 THREE.js available:', typeof THREE !== 'undefined');
            
            if (typeof THREE !== 'undefined') {
                console.log('⏰ Initializing Three.js in 100ms...');
                setTimeout(() => {
                    console.log('🚀 Starting Three.js initialization...');
                    this.initThreeJS();
                    this.populateMaterialsDropdown();
                    console.log('✅ Three.js initialization completed');
                }, 100);
            } else {
                console.error('❌ THREE.js not available!');
            }
        }
    }
    
    populateMaterialsDropdown() {
        const select = document.getElementById('material-select');
        if (!select || typeof MATERIALS_DATABASE === 'undefined') return;
        
        // Clear existing options
        select.innerHTML = '';
        
        // Add materials from database
        Object.keys(MATERIALS_DATABASE).forEach(key => {
            const material = MATERIALS_DATABASE[key];
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${material.name} (${material.category})`;
            select.appendChild(option);
        });
    }    initThreeJS() {
        console.log('🎬 initThreeJS() called');
        
        const canvas = document.getElementById('three-canvas');
        console.log('🎨 Canvas element:', canvas ? 'FOUND' : 'NOT FOUND');
        
        if (!canvas) {
            console.error('❌ Canvas element not found - cannot initialize Three.js');
            return;
        }
        
        if (typeof THREE === 'undefined') {
            console.error('❌ Three.js not loaded');
            return;
        }
        
        console.log('✅ Starting Three.js initialization...');
        console.log('📏 Canvas dimensions:', canvas.clientWidth, 'x', canvas.clientHeight);
        
        // Scene
        console.log('🎭 Creating scene...');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf5f5f0);
        
        // Camera
        const container = canvas.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        console.log(`Canvas dimensions: ${width}x${height}`);
        
        if (this.currentMode === 'sketch') {
            // Orthographic camera for sketch mode
            const aspect = width / height;
            const size = 10;
            this.camera = new THREE.OrthographicCamera(
                -size * aspect, size * aspect,
                size, -size,
                0.1, 1000
            );
            console.log('Created orthographic camera for sketch mode');
        } else {
            // Perspective camera for modeling mode
            this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            console.log('Created perspective camera for modeling mode');
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
        
        // Remove existing event listeners to prevent duplicates
        const existingListeners = canvas._cutlistListeners;
        if (existingListeners) {
            console.log('Removing existing event listeners');
            existingListeners.forEach(({event, handler}) => {
                canvas.removeEventListener(event, handler);
            });
        }
        
        let isMouseDown = false;
        let isRightMouseDown = false;
        let mouseX = 0, mouseY = 0;
        let startMouseX = 0, startMouseY = 0;
          // Prevent context menu on the entire canvas area
        const contextMenuHandler = (e) => {
            console.log('🚫 Context menu prevented on canvas');
            console.log('🎯 Event details:', e.type, e.button, e.target.tagName);
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        
        console.log('🔧 Adding contextmenu event listener to canvas...');
        canvas.addEventListener('contextmenu', contextMenuHandler, true);        const mouseDownHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ MOUSE DOWN EVENT FIRED!');
            console.log(`📍 Mouse button ${e.button} pressed (0=left, 1=middle, 2=right)`);
            console.log(`📊 Current mode: ${this.currentMode}`);
            console.log('🎯 Event target:', e.target.tagName, e.target.id);
            
            isMouseDown = true;
            mouseX = e.clientX;
            mouseY = e.clientY;
            startMouseX = e.clientX;
            startMouseY = e.clientY;
            
            if (e.button === 2) { // Right mouse button
                isRightMouseDown = true;
                console.log('🔴 RIGHT MOUSE DOWN DETECTED!');
                console.log('🔄 Attempting to switch to modeling mode...');
                console.log(`🛠️ switchMode function exists: ${typeof this.switchMode === 'function'}`);
                
                // Switch to modeling mode for 3D navigation
                if (this.currentMode === 'sketch') {
                    console.log('💫 Calling switchMode(modeling)...');
                    try {
                        this.switchMode('modeling');
                        console.log('✅ switchMode call completed');
                    } catch (error) {
                        console.error('❌ Error in switchMode:', error);
                    }
                } else {
                    console.log('ℹ️ Already in modeling mode');
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
            
            if (isRightMouseDown || this.currentMode === 'modeling') {
                // 3D orbit controls for modeling mode or right mouse drag
                const spherical = new THREE.Spherical();
                spherical.setFromVector3(this.camera.position);
                spherical.theta -= deltaX * 0.01;
                spherical.phi += deltaY * 0.01;
                spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
                this.camera.position.setFromSpherical(spherical);
                this.camera.lookAt(0, 0, 0);
            } else if (this.currentMode === 'sketch') {
                // Pan camera in sketch mode with left mouse
                const panSpeed = 0.01;
                this.camera.position.x -= deltaX * panSpeed;
                this.camera.position.y += deltaY * panSpeed;
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
        console.log('🔧 Adding event listeners to canvas...');
        canvas.addEventListener('mousedown', mouseDownHandler);
        console.log('✅ mousedown listener added');
        canvas.addEventListener('mouseup', mouseUpHandler);
        console.log('✅ mouseup listener added');
        canvas.addEventListener('mousemove', mouseMoveHandler);
        console.log('✅ mousemove listener added');
        canvas.addEventListener('wheel', wheelHandler);
        console.log('✅ wheel listener added');
        
        // Store handlers for cleanup
        canvas._cutlistListeners = [
            {event: 'contextmenu', handler: contextMenuHandler},
            {event: 'mousedown', handler: mouseDownHandler},
            {event: 'mouseup', handler: mouseUpHandler},
            {event: 'mousemove', handler: mouseMoveHandler},
            {event: 'wheel', handler: wheelHandler}
        ];
        
        console.log('✅ Controls setup complete - all event listeners attached');
        console.log('🎪 Canvas now has', canvas._cutlistListeners.length, 'event listeners');
        
        // Test immediate right-click
        setTimeout(() => {
            console.log('🧪 Testing canvas right-click functionality...');
            const testEvent = new MouseEvent('contextmenu', {
                button: 2,
                buttons: 2,
                bubbles: true,
                cancelable: true
            });
            console.log('🎯 Dispatching test contextmenu event...');
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
        const size = 20;
        const divisions = 20;
        
        this.grid = new THREE.GridHelper(size, divisions, 0xcccccc, 0xe8e8e8);
        this.grid.visible = this.gridVisible;
        this.scene.add(this.grid);
    }
    
    createSketchPlanes() {
        if (!this.scene) return;
        
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
        if (!this.scene) return;
        
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
        console.log(`Switching from ${this.currentMode} to ${mode}`);
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
            if (sketchTools) sketchTools.style.display = 'flex';
            if (modelingTools) modelingTools.style.display = 'none';
        } else {
            if (sketchTools) sketchTools.style.display = 'flex';
            if (modelingTools) modelingTools.style.display = 'flex';
        }
        
        // Recreate camera for mode - this is crucial for proper 3D view
        if (this.camera && this.renderer) {
            const container = document.getElementById('three-canvas').parentElement;
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            // Store current position
            const currentPosition = this.camera.position.clone();
            
            if (mode === 'sketch') {
                // Orthographic camera for 2D sketch view
                const aspect = width / height;
                const size = 10;
                this.camera = new THREE.OrthographicCamera(
                    -size * aspect, size * aspect,
                    size, -size,
                    0.1, 1000
                );
                console.log('Created orthographic camera for sketch mode');
            } else {
                // Perspective camera for 3D modeling view
                this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
                console.log('Created perspective camera for modeling mode');
            }
            
            // Restore position
            this.camera.position.copy(currentPosition);
            this.camera.lookAt(0, 0, 0);
            
            // Update any camera-dependent systems
            this.camera.updateProjectionMatrix();
        }
        
        // Show visual feedback
        this.showModeChangeNotification(mode);
    }
    
    showModeChangeNotification(mode) {
        const notification = document.createElement('div');
        notification.textContent = `Switched to ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`;
        notification.style.cssText = `
            position: fixed;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
            background: ${mode === 'modeling' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 1500);
    }
      selectTool(tool) {
        this.currentTool = tool;
        
        // Cancel any current drawing
        if (this.isDrawing) {
            this.cancelDrawing();
        }
        
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
        
        // Update drawing status
        this.updateDrawingStatus();
    }
    
    updateDrawingStatus() {
        const statusDiv = document.getElementById('drawing-status');
        const statusText = document.getElementById('status-text');
        
        if (!statusDiv || !statusText) return;
        
        if (this.currentTool === 'select') {
            statusDiv.style.display = 'none';
        } else {
            statusDiv.style.display = 'block';
            
            if (this.isDrawing) {
                switch (this.currentTool) {
                    case 'line':
                        statusText.textContent = 'Click to end line';
                        break;
                    case 'rectangle':
                        statusText.textContent = 'Click to complete rectangle';
                        break;
                    case 'circle':
                        statusText.textContent = 'Click to set circle radius';
                        break;
                }
            } else {
                switch (this.currentTool) {
                    case 'line':
                        statusText.textContent = 'Click to start line';
                        break;
                    case 'rectangle':
                        statusText.textContent = 'Click and drag to draw rectangle';
                        break;
                    case 'circle':
                        statusText.textContent = 'Click center, then click radius';
                        break;
                }
            }
        }
    }
    
    cancelDrawing() {
        if (this.tempDrawingObject) {
            this.scene.remove(this.tempDrawingObject);
            this.tempDrawingObject = null;
        }
        this.isDrawing = false;
        this.drawingStartPoint = null;
        this.updateDrawingStatus();
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
    
    handleObjectSelection() {
        if (!this.camera || !this.scene) return;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.drawnObjects, true);
        
        // Clear previous selection
        this.selectedObjects.forEach(obj => {
            obj.material.color.setHex(obj.userData.originalColor || 0x2C5530);
        });
        this.selectedObjects = [];
        
        if (intersects.length > 0) {
            const selectedObject = intersects[0].object;
            
            // Store original color if not already stored
            if (!selectedObject.userData.originalColor) {
                selectedObject.userData.originalColor = selectedObject.material.color.getHex();
            }
            
            // Highlight selected object
            selectedObject.material.color.setHex(0xff6b35);
            this.selectedObjects.push(selectedObject);
            
            this.updateSelectionStatus();
        }
    }
    
    updateSelectionStatus() {
        const statusDiv = document.getElementById('selection-status');
        if (!statusDiv) return;
        
        if (this.selectedObjects.length > 0) {
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = `
                <div>Selected: ${this.selectedObjects.length} object(s)</div>
                <div>Press Delete to remove, E to extrude</div>
            `;
        } else {
            statusDiv.style.display = 'none';
        }
    }
    
    deleteSelectedObjects() {
        this.selectedObjects.forEach(obj => {
            this.scene.remove(obj);
            const index = this.drawnObjects.indexOf(obj);
            if (index > -1) {
                this.drawnObjects.splice(index, 1);
            }
        });
        this.selectedObjects = [];
        this.updateSelectionStatus();
    }
    
    snapPointToGrid(point) {
        if (!this.snapToGrid) return point;
        
        const snappedPoint = point.clone();
        snappedPoint.x = Math.round(snappedPoint.x / this.gridSize) * this.gridSize;
        snappedPoint.y = Math.round(snappedPoint.y / this.gridSize) * this.gridSize;
        snappedPoint.z = Math.round(snappedPoint.z / this.gridSize) * this.gridSize;
        
        return snappedPoint;
    }
    
    toggleSnapToGrid() {
        this.snapToGrid = !this.snapToGrid;
        
        const btn = document.getElementById('snap-toggle');
        if (btn) {
            btn.classList.toggle('active', this.snapToGrid);
            btn.textContent = this.snapToGrid ? 'Snap: ON' : 'Snap: OFF';
        }
        
        this.updateDrawingStatus();
    }
    
    extrudeSelected() {
        if (this.selectedObjects.length === 0 || this.currentMode !== 'modeling') return;
        
        this.selectedObjects.forEach(obj => {
            const extrudedObject = this.createExtrudedObject(obj);
            if (extrudedObject) {
                this.scene.add(extrudedObject);
                this.drawnObjects.push(extrudedObject);
                
                // Remove original 2D object
                this.scene.remove(obj);
                const index = this.drawnObjects.indexOf(obj);
                if (index > -1) {
                    this.drawnObjects.splice(index, 1);
                }
            }
        });
        
        this.selectedObjects = [];
        this.updateSelectionStatus();
    }
    
    createExtrudedObject(originalObject) {
        if (!originalObject.geometry) return null;
        
        try {
            let extrudeGeometry;
            const material = new THREE.MeshLambertMaterial({ 
                color: originalObject.material.color.getHex(),
                transparent: false,
                opacity: 1.0
            });
            
            // Handle different geometry types
            if (originalObject.geometry.type === 'CircleGeometry') {
                // For circles, create a cylinder
                const radius = originalObject.geometry.parameters.radius;
                extrudeGeometry = new THREE.CylinderGeometry(radius, radius, this.extrusionDepth, 32);
            } else if (originalObject.geometry.type === 'PlaneGeometry') {
                // For rectangles, create a box
                const width = originalObject.geometry.parameters.width;
                const height = originalObject.geometry.parameters.height;
                extrudeGeometry = new THREE.BoxGeometry(width, height, this.extrusionDepth);
            } else {
                // For other shapes, try to create a basic extrusion
                extrudeGeometry = new THREE.BoxGeometry(1, 1, this.extrusionDepth);
            }
            
            const mesh = new THREE.Mesh(extrudeGeometry, material);
            mesh.position.copy(originalObject.position);
            mesh.rotation.copy(originalObject.rotation);
            
            // Adjust position for extrusion
            if (this.currentPlane === 'xy') {
                mesh.position.z += this.extrusionDepth / 2;
            } else if (this.currentPlane === 'xz') {
                mesh.position.y += this.extrusionDepth / 2;
            } else if (this.currentPlane === 'yz') {
                mesh.position.x += this.extrusionDepth / 2;
            }
            
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            return mesh;
        } catch (error) {
            console.error('Error creating extruded object:', error);
            return null;
        }
    }
    
    // Project management methods
    saveProject() {
        const projectData = {
            name: document.getElementById('project-name')?.value || 'Untitled Project',
            objects: this.drawnObjects.map(obj => this.serializeObject(obj)),
            settings: {
                gridSize: this.gridSize,
                snapToGrid: this.snapToGrid,
                extrusionDepth: this.extrusionDepth,
                currentPlane: this.currentPlane,
                currentMode: this.currentMode
            },
            timestamp: new Date().toISOString()
        };
        
        const projectJson = JSON.stringify(projectData, null, 2);
        const projects = JSON.parse(localStorage.getItem('cutlist-projects') || '[]');
        
        // Check if project exists and update, otherwise add new
        const existingIndex = projects.findIndex(p => p.name === projectData.name);
        if (existingIndex >= 0) {
            projects[existingIndex] = projectData;
        } else {
            projects.push(projectData);
        }
        
        localStorage.setItem('cutlist-projects', JSON.stringify(projects));
        
        // Download as file
        const blob = new Blob([projectJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectData.name.replace(/[^a-z0-9]/gi, '_')}.cutlist`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Project saved successfully!');
    }
    
    loadProject(projectData) {
        // Clear existing objects
        this.drawnObjects.forEach(obj => this.scene.remove(obj));
        this.drawnObjects = [];
        this.selectedObjects = [];
        
        // Restore settings
        if (projectData.settings) {
            this.gridSize = projectData.settings.gridSize || 1;
            this.snapToGrid = projectData.settings.snapToGrid !== false;
            this.extrusionDepth = projectData.settings.extrusionDepth || 1;
            this.currentPlane = projectData.settings.currentPlane || 'xy';
            this.currentMode = projectData.settings.currentMode || 'sketch';
            
            // Update UI
            document.getElementById('grid-size').value = this.gridSize;
            document.getElementById('extrusion-depth').value = this.extrusionDepth;
            this.selectPlane(this.currentPlane);
            this.switchMode(this.currentMode);
        }
        
        // Restore objects
        if (projectData.objects) {
            projectData.objects.forEach(objData => {
                const obj = this.deserializeObject(objData);
                if (obj) {
                    this.scene.add(obj);
                    this.drawnObjects.push(obj);
                }
            });
        }
        
        this.showNotification('Project loaded successfully!');
    }
    
    serializeObject(obj) {
        return {
            type: obj.geometry.type,
            position: obj.position.toArray(),
            rotation: obj.rotation.toArray(),
            scale: obj.scale.toArray(),
            color: obj.material.color.getHex(),
            parameters: obj.geometry.parameters,
            userData: obj.userData
        };
    }
    
    deserializeObject(data) {
        try {
            let geometry;
            
            switch (data.type) {
                case 'BufferGeometry':
                    // For lines
                    const points = data.userData.points?.map(p => new THREE.Vector3(...p)) || [];
                    geometry = new THREE.BufferGeometry().setFromPoints(points);
                    break;
                case 'PlaneGeometry':
                    geometry = new THREE.PlaneGeometry(
                        data.parameters.width,
                        data.parameters.height
                    );
                    break;
                case 'CircleGeometry':
                    geometry = new THREE.CircleGeometry(
                        data.parameters.radius,
                        data.parameters.segments || 32
                    );
                    break;
                case 'BoxGeometry':
                    geometry = new THREE.BoxGeometry(
                        data.parameters.width,
                        data.parameters.height,
                        data.parameters.depth
                    );
                    break;
                case 'CylinderGeometry':
                    geometry = new THREE.CylinderGeometry(
                        data.parameters.radiusTop,
                        data.parameters.radiusBottom,
                        data.parameters.height,
                        data.parameters.radialSegments || 32
                    );
                    break;
                default:
                    return null;
            }
            
            const material = data.type === 'BufferGeometry' 
                ? new THREE.LineBasicMaterial({ color: data.color })
                : new THREE.MeshLambertMaterial({ color: data.color });
            
            const obj = data.type === 'BufferGeometry'
                ? new THREE.Line(geometry, material)
                : new THREE.Mesh(geometry, material);
            
            obj.position.fromArray(data.position);
            obj.rotation.fromArray(data.rotation);
            obj.scale.fromArray(data.scale);
            obj.userData = data.userData || {};
            
            return obj;
        } catch (error) {
            console.error('Error deserializing object:', error);
            return null;
        }
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
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
console.log('🔧 Setting up DOM event listener...');

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM LOADED - Starting CutList App');
    console.log('📦 THREE.js available:', typeof THREE !== 'undefined');
    console.log('🏗️ Canvas element exists:', document.getElementById('three-canvas') !== null);
    console.log('🖱️ About to create CutListApp instance...');
    
    try {
        const app = new CutListApp();
        console.log('✅ CutList App created successfully');
        
        // Test right-click functionality immediately
        setTimeout(() => {
            console.log('🧪 Testing right-click setup...');
            const canvas = document.getElementById('three-canvas');
            if (canvas) {
                console.log('✅ Canvas found for right-click test');
                console.log('🎪 Canvas has contextmenu listener:', canvas.hasAttribute('oncontextmenu'));
            } else {
                console.error('❌ Canvas not found for right-click test');
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error creating CutList App:', error);
        console.error('📍 Error stack:', error.stack);
    }
});

// Also try immediate execution if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('📋 DOM is still loading, waiting for DOMContentLoaded...');
} else {
    console.log('📋 DOM already loaded, executing immediately...');
    setTimeout(() => {
        console.log('🎯 IMMEDIATE EXECUTION - Starting CutList App');
        try {
            const app = new CutListApp();
            console.log('✅ CutList App created successfully (immediate)');
        } catch (error) {
            console.error('❌ Error creating CutList App (immediate):', error);
        }
    }, 100);
}

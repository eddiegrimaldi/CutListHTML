# CutList - Woodworking CAD Tool

CutList is a web-based CAD application designed specifically for woodworking projects. It provides an intuitive interface for creating 3D models, generating cutting plans, and managing woodworking materials.

## Features

### 🎯 Core Functionality
- **Drawing World**: A comprehensive 3D environment for designing woodworking projects
- **Dual Mode System**: 
  - **Sketch Mode**: Orthographic 2D drawing on sketch planes
  - **Modeling Mode**: 3D object manipulation and assembly
- **Dynamic Grid System**: Snap-to-grid functionality with major/minor grid lines
- **Multi-Plane Support**: XY, XZ, and YZ sketch planes with custom plane creation
- **Material Library**: Database of common woodworking materials and properties

### 🛠️ Tools & Interface
- **Customizable Toolbar**: Sketch and modeling tools with search functionality
- **Properties Panel**: Real-time object property editing
- **Camera Controls**: Pan, zoom, rotate with reset functionality
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 📋 Project Management
- **Project Saving/Loading**: Persistent project storage
- **Cutting Plan Generation**: Automated cutting lists from 3D models
- **Export Options**: PDF, DXF, STL, OBJ format support
- **Version Control**: Track changes and revert to previous versions

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x OR Node.js (for development server)

### Quick Start
1. Clone or download this repository
2. Navigate to the project directory
3. Run the development server:
   - **Windows**: Double-click `start-server.bat`
   - **Python**: `python -m http.server 8080`
   - **Node.js**: `npx http-server -p 8080`
4. Open your browser to `http://localhost:8080`

### Direct File Access
You can also open `index.html` directly in your browser, though some features may be limited due to CORS restrictions.

## Project Structure

```
CutListHTML/
├── index.html              # Main application entry point
├── package.json           # Project dependencies
├── start-server.bat       # Development server launcher
├── README.md             # This file
└── src/
    ├── main.js           # ES6 module version (requires build)
    ├── main-simple.js    # Standalone version (current)
    ├── components/       # Reusable UI components
    ├── js/              # Additional JavaScript modules
    └── styles/          # CSS stylesheets
        ├── main.css     # Global styles and variables
        ├── ui.css       # Dashboard and navigation styles
        └── world.css    # Drawing World specific styles
```

## Usage Guide

### Dashboard
- **Start Drawing**: Create a new project in the Drawing World
- **Recent Projects**: Access previously saved projects
- **Material Library**: Browse available materials and their properties

### Drawing World
1. **Mode Selection**: Choose between Sketch and Modeling modes
2. **Sketch Mode**:
   - Select a sketch plane (XY, XZ, or YZ)
   - Use drawing tools to create 2D shapes
   - Extrude shapes into 3D objects when switching to Modeling mode
3. **Modeling Mode**:
   - Manipulate 3D objects
   - Create joints and assemblies
   - Generate cutting plans

### Tools
- **Select**: Default selection tool
- **Line**: Draw straight lines
- **Rectangle**: Create rectangular shapes
- **Circle**: Draw circles and arcs
- **Extrude**: Convert 2D shapes to 3D objects (Modeling mode)

### Controls
- **Mouse**: Pan (drag), rotate (right-drag), zoom (wheel)
- **Grid Toggle**: Show/hide alignment grid
- **Reset View**: Return camera to default position
- **Plane Selector**: Switch between sketch planes

## Technical Details

### Technologies Used
- **Three.js**: 3D graphics and rendering
- **Vanilla JavaScript**: Core application logic
- **CSS Grid/Flexbox**: Responsive layout system
- **Web Components**: Modular UI architecture

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Performance
- Hardware-accelerated 3D rendering via WebGL
- Optimized for 60fps on modern devices
- Efficient memory management for large projects

## Development

### Architecture
The application follows a component-based architecture:
- **CutListApp**: Main application controller
- **Page Management**: Single-page application routing
- **Tool System**: Extensible tool framework
- **3D Engine**: Three.js integration layer

### Extending the Application
1. **Adding Tools**: Extend the tool system in `main-simple.js`
2. **New Components**: Create reusable components in `src/components/`
3. **Styling**: Use CSS custom properties defined in `main.css`
4. **3D Features**: Leverage Three.js capabilities for advanced modeling

## Roadmap

### Phase 1 (Current)
- ✅ Basic UI and navigation
- ✅ 3D rendering engine
- ✅ Sketch plane system
- ✅ Tool framework

### Phase 2 (Next)
- 🔄 2D drawing tools implementation
- 🔄 Shape extrusion functionality
- 🔄 Object manipulation tools
- 🔄 Basic project save/load

### Phase 3 (Future)
- 📋 Cutting plan generation
- 📋 Material database integration
- 📋 Export functionality
- 📋 Collaboration features

## Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

**CutList** - Bringing precision to your woodworking projects! 🪵✨

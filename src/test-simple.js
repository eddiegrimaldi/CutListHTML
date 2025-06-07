// Basic test - no emojis or special characters
console.log("TEST SCRIPT LOADING");

class TestApp {
    constructor() {
        console.log("TestApp constructor called");
        this.setupBasicTest();
    }
    
    setupBasicTest() {
        console.log("Setting up basic test");
        
        // Try to find canvas
        setTimeout(() => {
            const canvas = document.getElementById('three-canvas');
            console.log("Canvas found:", canvas !== null);
            
            if (canvas) {
                console.log("Adding right-click listener");
                canvas.addEventListener('contextmenu', (e) => {
                    console.log("RIGHT-CLICK DETECTED ON CANVAS!");
                    e.preventDefault();
                    return false;
                });
                
                canvas.addEventListener('mousedown', (e) => {
                    console.log("MOUSE DOWN - Button:", e.button);
                    if (e.button === 2) {
                        console.log("RIGHT MOUSE BUTTON PRESSED!");
                    }
                });
            }
        }, 500);
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM LOADED - Creating TestApp");
    try {
        const app = new TestApp();
        console.log("TestApp created successfully");
    } catch (error) {
        console.error("Error creating TestApp:", error);
    }
});

console.log("TEST SCRIPT FINISHED LOADING");

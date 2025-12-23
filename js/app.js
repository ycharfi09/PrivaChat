// Main application entry point
// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('PrivaChat initializing...');
    
    // Initialize UI
    UI.init();
    
    // Initialize Calls module
    Calls.init();
    
    console.log('PrivaChat ready!');
});

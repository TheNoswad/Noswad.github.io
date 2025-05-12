// Main JavaScript for the dark theme landing page
document.addEventListener('DOMContentLoaded', function() {
    // Set up contact form validation if it exists
    setupContactForm();

    // Set active nav link based on current page
    setActiveNavLink();

    // Apply dark mode based on system preference
    applyDarkMode();

    // Set up listener for system color scheme changes
    setupColorSchemeListener();

    // Initialize boids simulation for the background
    initBoidsSimulation();

    // Add boids info button if we're on a page with boids
    addBoidsInfoButton();
});

// Apply dark mode based on system preference
function applyDarkMode() {
    // Use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    }
}

// Listen for changes in system color scheme preference
function setupColorSchemeListener() {
    const colorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

    // Add event listener for changes to color scheme preference
    colorSchemeMedia.addEventListener('change', (e) => {
        if (e.matches) {
            // System switched to dark mode
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
        } else {
            // System switched to light mode
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        }

        // Force redraw of boids to update colors
        if (window.boidsSimulation) {
            // If we have a reference to the simulation, trigger a redraw
            window.boidsSimulation.animate();
        }
    });
}

// Initialize the boids simulation
function initBoidsSimulation() {
    // Check if we're on a page with the boids canvas
    const boidsCanvas = document.getElementById('boids-canvas');
    if (boidsCanvas && window.BoidsSimulation) {
        // Create and initialize the simulation
        const simulation = new window.BoidsSimulation();
        simulation.init();

        // Store a reference to the simulation globally so we can access it when theme changes
        window.boidsSimulation = simulation;
    }
}

// Set active navigation link based on current page
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const currentHost = window.location.hostname;

    // Remove all active classes first
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => link.classList.remove('active'));

    // Add active class to current page link
    let navId;

    // Check if we're on the blog domain
    if (currentHost.includes('blog.noswad.org')) {
        navId = 'nav-blog';
    } else {
        // Otherwise determine based on the current page
        switch(currentPage) {
            case 'index.html':
                navId = 'nav-home';
                break;
            case 'about.html':
                navId = 'nav-about';
                break;
            case 'portfolio.html':
                navId = 'nav-portfolio';
                break;
            case 'contact.html':
                navId = 'nav-contact';
                break;
            default:
                navId = 'nav-home';
        }
    }

    const activeLink = document.getElementById(navId);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Contact form validation
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        // Form will now submit directly to FormSubmit.co
        // No need to prevent default or handle submission manually

        // Optional: Add client-side validation if needed
        contactForm.addEventListener('submit', function(e) {
            // You can add additional validation here if needed
            // But allow the form to submit to FormSubmit.co
        });
    }
}

// Add boids info button to pages with boids simulation
function addBoidsInfoButton() {
    // Check if we're on a page with the boids canvas
    const boidsCanvas = document.getElementById('boids-canvas');
    if (!boidsCanvas) return;

    // Create the button element
    const infoButton = document.createElement('button');
    infoButton.className = 'boids-info-btn';
    infoButton.setAttribute('aria-label', 'What are these floating in the background? (Blog post coming soon!)');
    infoButton.innerHTML = '?';

    // Add tooltip
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.textContent = 'What are these floating in the background? (Blog post coming soon!)';
    infoButton.appendChild(tooltip);

    // Add click event listener
    infoButton.addEventListener('click', function() {
        // Open blog post in a new tab (coming soon)
        window.open('https://en.wikipedia.org/wiki/Boids', '_blank');
    });

    // Add the button to the body
    document.body.appendChild(infoButton);
}

/**
 * Boids Simulation
 * A simple implementation of Craig Reynolds' Boids algorithm
 * for the background of the website.
 */

class Boid {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.position = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        };
        this.velocity = {
            x: (Math.random() * 2 - 1) * 2,
            y: (Math.random() * 2 - 1) * 2
        };
        this.acceleration = { x: 0, y: 0 };
        this.maxSpeed = 2.5;
        this.maxForce = 0.05;
        this.size = 6; // Size of the triangle
        this.opacity = 0.8; // Opacity of the boid
    }

    // Apply forces to the boid
    applyForce(force) {
        this.acceleration.x += force.x;
        this.acceleration.y += force.y;
    }

    // Calculate separation force (avoid crowding)
    separate(boids) {
        const desiredSeparation = 25;
        let steer = { x: 0, y: 0 };
        let count = 0;

        // Check distance with every other boid
        for (let other of boids) {
            if (other === this) continue;

            const dx = this.position.x - other.position.x;
            const dy = this.position.y - other.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If too close, calculate steering force away
            if (distance < desiredSeparation) {
                let diff = {
                    x: dx / distance,
                    y: dy / distance
                };
                steer.x += diff.x;
                steer.y += diff.y;
                count++;
            }
        }

        // Average the forces
        if (count > 0) {
            steer.x /= count;
            steer.y /= count;

            // Scale to maximum speed
            const magnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
            if (magnitude > 0) {
                steer.x = (steer.x / magnitude) * this.maxSpeed;
                steer.y = (steer.y / magnitude) * this.maxSpeed;

                // Subtract current velocity to get steering force
                steer.x -= this.velocity.x;
                steer.y -= this.velocity.y;

                // Limit the force
                const forceMag = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
                if (forceMag > this.maxForce) {
                    steer.x = (steer.x / forceMag) * this.maxForce;
                    steer.y = (steer.y / forceMag) * this.maxForce;
                }
            }
        }

        return steer;
    }

    // Calculate alignment force (steer towards average heading)
    align(boids) {
        const neighborDist = 50;
        let sum = { x: 0, y: 0 };
        let count = 0;

        for (let other of boids) {
            if (other === this) continue;

            const dx = this.position.x - other.position.x;
            const dy = this.position.y - other.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < neighborDist) {
                sum.x += other.velocity.x;
                sum.y += other.velocity.y;
                count++;
            }
        }

        if (count > 0) {
            sum.x /= count;
            sum.y /= count;

            // Scale to maximum speed
            const magnitude = Math.sqrt(sum.x * sum.x + sum.y * sum.y);
            if (magnitude > 0) {
                sum.x = (sum.x / magnitude) * this.maxSpeed;
                sum.y = (sum.y / magnitude) * this.maxSpeed;
            }

            // Calculate steering force
            let steer = {
                x: sum.x - this.velocity.x,
                y: sum.y - this.velocity.y
            };

            // Limit the force
            const steerMag = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
            if (steerMag > this.maxForce) {
                steer.x = (steer.x / steerMag) * this.maxForce;
                steer.y = (steer.y / steerMag) * this.maxForce;
            }

            return steer;
        } else {
            return { x: 0, y: 0 };
        }
    }

    // Calculate cohesion force (steer towards center of neighbors)
    cohesion(boids) {
        const neighborDist = 50;
        let sum = { x: 0, y: 0 };
        let count = 0;

        for (let other of boids) {
            if (other === this) continue;

            const dx = this.position.x - other.position.x;
            const dy = this.position.y - other.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < neighborDist) {
                sum.x += other.position.x;
                sum.y += other.position.y;
                count++;
            }
        }

        if (count > 0) {
            sum.x /= count;
            sum.y /= count;

            // Seek towards the center
            return this.seek(sum);
        } else {
            return { x: 0, y: 0 };
        }
    }

    // Seek towards a target position
    seek(target) {
        // Vector pointing from current position to target
        let desired = {
            x: target.x - this.position.x,
            y: target.y - this.position.y
        };

        // Scale to maximum speed
        const magnitude = Math.sqrt(desired.x * desired.x + desired.y * desired.y);
        if (magnitude > 0) {
            desired.x = (desired.x / magnitude) * this.maxSpeed;
            desired.y = (desired.y / magnitude) * this.maxSpeed;
        }

        // Steering force = desired - velocity
        let steer = {
            x: desired.x - this.velocity.x,
            y: desired.y - this.velocity.y
        };

        // Limit the force
        const steerMag = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
        if (steerMag > this.maxForce) {
            steer.x = (steer.x / steerMag) * this.maxForce;
            steer.y = (steer.y / steerMag) * this.maxForce;
        }

        return steer;
    }

    // Avoid edges of the canvas
    avoidEdges() {
        const margin = 50;
        let steer = { x: 0, y: 0 };

        if (this.position.x < margin) {
            steer.x = this.maxForce * 2;
        } else if (this.position.x > this.canvas.width - margin) {
            steer.x = -this.maxForce * 2;
        }

        if (this.position.y < margin) {
            steer.y = this.maxForce * 2;
        } else if (this.position.y > this.canvas.height - margin) {
            steer.y = -this.maxForce * 2;
        }

        return steer;
    }

    // Update position based on velocity and acceleration
    update() {
        // Update velocity
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;

        // Limit speed
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
        }

        // Update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Reset acceleration
        this.acceleration.x = 0;
        this.acceleration.y = 0;

        // Wrap around edges
        if (this.position.x < -this.size) this.position.x = this.canvas.width + this.size;
        if (this.position.y < -this.size) this.position.y = this.canvas.height + this.size;
        if (this.position.x > this.canvas.width + this.size) this.position.x = -this.size;
        if (this.position.y > this.canvas.height + this.size) this.position.y = -this.size;
    }

    // Apply all flocking behaviors
    flock(boids) {
        const separation = this.separate(boids);
        const alignment = this.align(boids);
        const cohesion = this.cohesion(boids);
        const avoidEdges = this.avoidEdges();

        // Weight the forces
        separation.x *= 1.7; // Increase separation for less crowding
        separation.y *= 1.7;
        alignment.x *= 1.0;
        alignment.y *= 1.0;
        cohesion.x *= 0.8; // Reduce cohesion slightly for more spread out boids
        cohesion.y *= 0.8;

        // Apply forces
        this.applyForce(separation);
        this.applyForce(alignment);
        this.applyForce(cohesion);
        this.applyForce(avoidEdges);
    }

    // Draw the boid as a triangle
    draw() {
        const angle = Math.atan2(this.velocity.y, this.velocity.x);

        this.ctx.save();
        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.rotate(angle);

        // Determine color based on dark/light mode
        const isDarkMode = document.body.classList.contains('dark-theme') ||
                         (window.matchMedia('(prefers-color-scheme: dark)').matches &&
                          !document.body.classList.contains('light-theme'));

        // Set fill color with opacity
        if (isDarkMode) {
            // White in dark mode with slight blue tint for better visibility
            this.ctx.fillStyle = `rgba(230, 240, 255, ${this.opacity})`;
        } else {
            // Black in light mode with slight blue tint
            this.ctx.fillStyle = `rgba(20, 20, 40, ${this.opacity})`;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(this.size, 0);
        this.ctx.lineTo(-this.size, this.size / 2);
        this.ctx.lineTo(-this.size, -this.size / 2);
        this.ctx.closePath();

        this.ctx.fill();
        this.ctx.restore();
    }
}

class BoidsSimulation {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.boids = [];
        this.numBoids = 60; // Number of boids to create
        this.animationId = null;
        this.isRunning = false;
    }

    // Initialize the simulation
    init() {
        // Get the canvas element
        this.canvas = document.getElementById('boids-canvas');
        if (!this.canvas) {
            console.error('Boids canvas element not found');
            return;
        }

        // Set canvas size to match parent container
        this.resizeCanvas();

        // Get the drawing context
        this.ctx = this.canvas.getContext('2d');

        // Create boids
        this.createBoids();

        // Start the animation loop
        this.start();

        // Add event listener for window resize
        window.addEventListener('resize', () => this.resizeCanvas());

        // Add event listener for visibility change to pause/resume
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop();
            } else {
                this.start();
            }
        });
    }

    // Create the boids
    createBoids() {
        this.boids = [];
        for (let i = 0; i < this.numBoids; i++) {
            this.boids.push(new Boid(this.canvas, this.ctx));
        }
    }

    // Resize canvas to match parent container
    resizeCanvas() {
        if (!this.canvas) return;

        const container = this.canvas.parentElement;
        this.canvas.width = container.offsetWidth;
        this.canvas.height = container.offsetHeight;

        // If we already have boids, adjust their positions
        if (this.boids.length > 0) {
            for (let boid of this.boids) {
                // Keep boids within the new canvas dimensions
                boid.position.x = Math.min(boid.position.x, this.canvas.width);
                boid.position.y = Math.min(boid.position.y, this.canvas.height);
            }
        }
    }

    // Start the animation loop
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.animate();
    }

    // Stop the animation loop
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    // Animation loop
    animate() {
        if (!this.isRunning) return;

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw each boid
        for (let boid of this.boids) {
            boid.flock(this.boids);
            boid.update();
            boid.draw();
        }

        // Request next frame
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Export the simulation
window.BoidsSimulation = BoidsSimulation;

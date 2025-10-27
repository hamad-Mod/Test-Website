// Discord Server Configuration
const DISCORD_SERVER_ID = '1333341421691994124';
const DISCORD_INVITE_URL = 'https://discord.gg/pzjazBzxvG';

// DOM Elements - will be initialized after DOM loads
let memberCountElement, onlineCountElement, inviteButton, joinButton;

// Animation and UI Functions
class DiscordWebsite {
    constructor() {
        // Initialize DOM elements
        memberCountElement = document.getElementById('member-count');
        onlineCountElement = document.getElementById('online-count');
        inviteButton = document.querySelector('.invite-btn');
        joinButton = document.querySelector('.join-btn');
        
        this.init();
        this.setupEventListeners();
        this.startAnimations();
        this.fetchServerData();
    }

    init() {
        // Add loading states
        this.showLoadingState();
        
        // Initialize smooth scrolling
        this.initSmoothScrolling();
        
        // Initialize intersection observer for animations
        this.initScrollAnimations();
    }

    setupEventListeners() {
        // Copy invite link functionality
        if (inviteButton) {
            inviteButton.addEventListener('click', this.copyInviteLink.bind(this));
        }

        // Join button click tracking
        if (joinButton) {
            joinButton.addEventListener('click', this.trackJoinClick.bind(this));
        }

        // Navbar scroll effect
        window.addEventListener('scroll', this.handleNavbarScroll.bind(this));

        // Smooth scroll for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Only prevent default for internal anchor links (starting with #)
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    let targetElement = document.getElementById(targetId);
                    
                    // Handle section mapping
                    if (targetId === 'games') {
                        targetElement = document.querySelector('.games-section');
                    } else if (targetId === 'owo') {
                        targetElement = document.querySelector('.owo-section');
                    }
                    
                    if (targetElement) {
                         targetElement.scrollIntoView({
                             behavior: 'smooth',
                             block: 'start'
                         });
                         
                         // Add visual feedback
                         this.highlightSection(targetElement);
                     }
                 }
             });
        });

        // Add hover effects to cards
        this.addCardHoverEffects();
    }

    async fetchServerData() {
        try {
            // Set your ACTUAL total member count here (manually)
            const TOTAL_MEMBERS = 484; // Change this number to your server's actual total member count
            
            // Fetch real Discord widget data for online count only
            const response = await fetch(`https://discord.com/api/guilds/${DISCORD_SERVER_ID}/widget.json`);
            
            if (response.ok) {
                const data = await response.json();
                const onlineCount = data.presence_count || 0; // Online members (accurate from widget)

                // Animate counter updates
                if (memberCountElement && onlineCountElement) {
                    this.animateCounter(memberCountElement, TOTAL_MEMBERS); // Manual total
                    this.animateCounter(onlineCountElement, onlineCount);    // Real-time online
                }

                // Store these values for periodic updates
                this.cachedTotalMembers = TOTAL_MEMBERS;
                this.cachedOnlineCount = onlineCount;

                // Update counts periodically with real data
                this.startRealTimeUpdates();
            } else {
                throw new Error('Widget not enabled');
            }
            
        } catch (error) {
            console.error('Failed to fetch server data:', error);
            console.log('Make sure Discord Widget is enabled in Server Settings > Widget');
            // Fallback to placeholder data
            this.useFallbackData();
        }
    }

    useFallbackData() {
        // Set your ACTUAL total member count here (manually)
        const TOTAL_MEMBERS = 484; // Change this number to your server's actual total member count
        const onlineCount = 0;  // Will be overwritten by real data if widget works

        if (memberCountElement && onlineCountElement) {
            this.animateCounter(memberCountElement, TOTAL_MEMBERS);
            this.animateCounter(onlineCountElement, onlineCount);
        }

        this.cachedTotalMembers = TOTAL_MEMBERS;
        this.cachedOnlineCount = onlineCount;

        this.startRealTimeUpdates();
    }

    animateCounter(element, targetValue) {
        if (!element) return;
        
        const startValue = 0;
        const duration = 2000;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        requestAnimationFrame(updateCounter);
    }

    startRealTimeUpdates() {
        // Set your ACTUAL total member count here (manually)
        const TOTAL_MEMBERS = 484; // Change this number to your server's actual total member count
        
        // Update every 60 seconds with real Discord data
        setInterval(async () => {
            try {
                const response = await fetch(`https://discord.com/api/guilds/${DISCORD_SERVER_ID}/widget.json`);
                
                if (response.ok) {
                    const data = await response.json();
                    const onlineCount = data.presence_count || 0;
                    
                    if (memberCountElement && onlineCountElement) {
                        // Smooth update - Total is always manual, Online is real-time
                        memberCountElement.textContent = TOTAL_MEMBERS.toLocaleString();
                        onlineCountElement.textContent = onlineCount.toLocaleString();
                    }
                    
                    // Update cached values
                    this.cachedTotalMembers = TOTAL_MEMBERS;
                    this.cachedOnlineCount = onlineCount;
                }
            } catch (error) {
                console.error('Failed to update server data:', error);
                // Keep showing last cached values if update fails
            }
        }, 60000); // Update every 60 seconds
    }

    copyInviteLink() {
        navigator.clipboard.writeText(DISCORD_INVITE_URL).then(() => {
            this.showNotification('Invite link copied to clipboard!', 'success');
            
            // Add visual feedback to button
            const originalText = inviteButton.innerHTML;
            inviteButton.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
            inviteButton.style.background = 'linear-gradient(135deg, #43b581, #4CAF50)';
            
            setTimeout(() => {
                inviteButton.innerHTML = originalText;
                inviteButton.style.background = '';
            }, 2000);
        }).catch(() => {
            this.showNotification('Failed to copy invite link', 'error');
        });
    }

    trackJoinClick() {
        this.showNotification('Redirecting to Discord...', 'info');
        
        // Add click animation
        if (joinButton) {
            joinButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                joinButton.style.transform = '';
            }, 150);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const style = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #43b581, #4CAF50)' : 
                        type === 'error' ? 'linear-gradient(135deg, #f04747, #ff6b6b)' : 
                        'linear-gradient(135deg, #FFD700, #FFA500)'};
            color: ${type === 'info' ? '#000000' : 'white'};
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            font-weight: 600;
        `;
        
        notification.style.cssText = style;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    initSmoothScrolling() {
        // Add smooth scrolling behavior
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    highlightSection(element) {
        element.style.transform = 'scale(1.02)';
        element.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);
    }

    handleNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(0, 0, 0, 0.98)';
            navbar.style.backdropFilter = 'blur(25px)';
            navbar.style.boxShadow = '0 5px 20px rgba(255, 215, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
            navbar.style.backdropFilter = 'blur(20px)';
            navbar.style.boxShadow = 'none';
        }
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideInUp 0.8s ease forwards';
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        document.querySelectorAll('.feature-card, .stat-card, .game-card').forEach(el => {
            observer.observe(el);
        });
    }

    addCardHoverEffects() {
        // Add particle effects on hover
        document.querySelectorAll('.feature-card, .stat-card, .game-card').forEach(card => {
            card.addEventListener('mouseenter', this.createParticleEffect.bind(this));
        });
    }

    createParticleEffect(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: linear-gradient(135deg, #FFD700, #FFA500);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top + Math.random() * rect.height}px;
                animation: particleFloat 2s ease-out forwards;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            }, 2000);
        }
    }

    startAnimations() {
        // Add floating animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            @keyframes particleFloat {
                0% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-50px) scale(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    showLoadingState() {
        if (memberCountElement) memberCountElement.textContent = 'Loading...';
        if (onlineCountElement) onlineCountElement.textContent = 'Loading...';
    }

    showErrorState() {
        if (memberCountElement) memberCountElement.textContent = '250+';
        if (onlineCountElement) onlineCountElement.textContent = '45+';
    }
}

// Enhanced particle system
function createParticles() {
    // Create particle container if it doesn't exist
    let particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) {
        particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        particlesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;
        document.body.appendChild(particlesContainer);
    }

    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        const left = Math.random() * 100;
        const duration = Math.random() * 10000 + 8000;
        const delay = Math.random() * 5000;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 215, 0, ${Math.random() * 0.5 + 0.3});
            border-radius: 50%;
            left: ${left}%;
            bottom: -10px;
            animation: floatUp ${duration}ms linear ${delay}ms;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        `;
        
        particlesContainer.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration + delay);
    }

    // Add float animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% {
                transform: translateY(0) translateX(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Create initial burst of particles
    for (let i = 0; i < 15; i++) {
        setTimeout(() => createParticle(), i * 200);
    }

    // Continue creating particles
    setInterval(createParticle, 800);
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DiscordWebsite();
    createParticles();
});

// Add typing effect to hero title
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalHTML = heroTitle.innerHTML;
        heroTitle.style.opacity = '0';
        
        setTimeout(() => {
            heroTitle.style.opacity = '1';
            heroTitle.style.animation = 'fadeIn 1s ease';
        }, 500);
    }
    
    // Add fade in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
});

// Easter egg: Heart code (love theme)
let heartCode = [];
const heartSequence = [72, 69, 65, 82, 84]; // H E A R T

document.addEventListener('keydown', (e) => {
    heartCode.push(e.keyCode);
    if (heartCode.length > heartSequence.length) {
        heartCode.shift();
    }
    
    if (heartCode.join(',') === heartSequence.join(',')) {
        createHeartExplosion();
        heartCode = [];
    }
});

function createHeartExplosion() {
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.textContent = '💕';
        heart.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            font-size: 2rem;
            pointer-events: none;
            z-index: 10000;
            animation: heartFloat ${Math.random() * 2 + 2}s ease-out forwards;
            transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
        `;
        document.body.appendChild(heart);
        
        setTimeout(() => {
            if (document.body.contains(heart)) {
                document.body.removeChild(heart);
            }
        }, 3000);
    }
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes heartFloat {
            0% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(0) rotate(0deg);
            }
            50% {
                opacity: 1;
            }
            100% {
                opacity: 0;
                transform: translate(${Math.random() * 400 - 200}px, ${Math.random() * -400}px) scale(2) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
}



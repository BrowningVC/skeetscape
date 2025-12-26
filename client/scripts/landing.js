/**
 * Landing Page Navigation Script
 * Handles smooth transitions from landing page to game
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const playButton = document.getElementById('play-now-btn');

  if (playButton) {
    playButton.addEventListener('click', () => {
      // Add smooth fade-out effect
      document.body.classList.add('fade-out');

      // Navigate to game page after fade animation
      setTimeout(() => {
        window.location.href = '/game';
      }, 300);
    });

    // Add hover sound effect (optional - can be enabled later)
    // playButton.addEventListener('mouseenter', () => {
    //   // Play hover sound
    // });
  }
});

// Handle browser back button - remove fade if page is from cache
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Page loaded from browser cache (back/forward button)
    document.body.classList.remove('fade-out');
  }
});

// Add keyboard accessibility - Enter/Space activates Play Now button
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    const playButton = document.getElementById('play-now-btn');
    if (document.activeElement === playButton) {
      event.preventDefault();
      playButton.click();
    }
  }
});

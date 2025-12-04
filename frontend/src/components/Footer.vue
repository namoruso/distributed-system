<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">AudioHub</h3>
          <p class="footer-text">Premium audio equipment for professionals and enthusiasts.</p>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">Quick Links</h4>
          <router-link to="/catalog" class="footer-link">Catalog</router-link>
          <router-link to="/about" class="footer-link">About Us</router-link>
          <router-link to="/contact" class="footer-link">Contact</router-link>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">Support</h4>
          <router-link to="/faq" class="footer-link">FAQ</router-link>
          <router-link to="/shipping" class="footer-link">Shipping</router-link>
          <router-link to="/returns" class="footer-link">Returns</router-link>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2025 AudioHub. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  padding: var(--space-16) 0 var(--space-8);
  margin-top: var(--space-20);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-8);
  margin-bottom: var(--space-8);
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.footer-title {
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-extrabold);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-2);
}

.footer-subtitle {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.footer-text {
  color: var(--color-text-muted);
  line-height: var(--line-height-relaxed);
}

.footer-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--color-primary);
}

.footer-bottom {
  padding-top: var(--space-8);
  border-top: 1px solid var(--color-divider);
  text-align: center;
  color: var(--color-text-muted);
}
</style>

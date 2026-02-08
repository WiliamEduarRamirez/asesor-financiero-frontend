import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css'; // Tailwind import

// Import Iconify globally just in case, though it's a web component
import 'iconify-icon';

const app = createApp(App);

app.use(createPinia());
app.use(router);

try {
  app.mount('#app');
  console.log('App mounted successfully!');
} catch (error) {
  console.error('Failed to mount app:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace;">
      <h1>Application Error</h1>
      <p>Failed to mount the application.</p>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
      <pre>${error instanceof Error ? error.stack : ''}</pre>
    </div>
  `;
}

import { mount } from 'svelte';

// Self-hosted fonts (no CDN: the app must work offline).
import '@fontsource/archivo/latin-400.css';
import '@fontsource/archivo/latin-500.css';
import '@fontsource/archivo/latin-600.css';
import '@fontsource/archivo/latin-800.css';
import '@fontsource/archivo/latin-900.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';

import './styles/tokens.css';
import './styles/base.css';
import App from './App.svelte';

const app = mount(App, { target: document.getElementById('app')! });

export default app;

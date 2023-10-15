import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import './tailwind.css';

ReactDOM.createRoot(document.querySelector('body')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);

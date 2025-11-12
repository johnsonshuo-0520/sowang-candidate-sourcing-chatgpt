import { jsx as _jsx } from "react/jsx-runtime";
import './ui/app.css';
import { createRoot } from 'react-dom/client';
import App from './ui/App';
const root = createRoot(document.getElementById('root'));
root.render(_jsx(App, {}));

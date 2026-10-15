/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Custom pharmacy brand colors
                primary: {
                    50: '#f4fbf7',
                    100: '#eaf7f0', // Soft green tint
                    200: '#cbf1db',
                    300: '#9ee5c0',
                    400: '#68d4a1',
                    500: '#2bb673', // Primary clean green
                    600: '#1f925b',
                    700: '#1a754b',
                    800: '#165d3d',
                    900: '#134d34',
                    950: '#0a2c1d',
                },
                accent: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    950: '#172554',
                },
                sage: {
                    50: '#f5f7f5',
                    100: '#e8ece8',
                    200: '#d3dbd4',
                    300: '#b4c3b6',
                    400: '#8fa693',
                    500: '#6f8a74',
                    600: '#566e5a',
                    700: '#455749',
                    800: '#39463c',
                    900: '#303a32',
                    950: '#19201a',
                },
                botanical: {
                    light: '#F4F7F4',
                    cream: '#FAFBF8',
                    border: '#E3ECE4',
                    dark: '#1A3326',
                    muted: '#52695C',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'card': '0 0 20px rgba(0, 0, 0, 0.05)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-10px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}

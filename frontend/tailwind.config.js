/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    prefix: "",
    theme: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      extend: {
        colors: {
          // Custom color system for the app
          'crypto': {
            'primary': '#4fc3a7',
            'primary-dark': '#00c896',
            'secondary': '#89fbe0',
            'secondary-light': '#89fbd2',
            'accent': '#0ee7bc',
            'danger': '#fb8998',
            'warning': '#ffa726',
            'success': '#66bb6a',
          },
          'surface': {
            'primary': '#8989890d',
            'secondary': '#8989891A',
            'tertiary': '#89898966',
            'glass': 'rgba(255,255,255,0.09)',
            'glass-light': 'rgba(255,255,255,0.29)',
          },
          'text': {
            'primary': '#ffffff',
            'secondary': '#848484',
            'tertiary': '#C0C0C0',
            'muted': '#FFFFFFA3',
            'accent': '#89fbe0',
          },
          'button': {
            'primary': '#EEF9FF',
            'secondary': '#C9C9C94F',
            'tertiary': '#343E3C',
            'active': '#0ee7bc',
          },
          // Keep some existing colors for compatibility
          primary: '#02fafa',
          secondary: '#03c403',
          third: '#0dc0c034',
          // Add shadcn/ui color system
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--popover))",
            foreground: "hsl(var(--popover-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
        },
        fontFamily: {
          'mario': ['Super Mario 256', 'sans-serif'],
          'poppins': ['Poppins', 'sans-serif'],
        },
        
        screens: {
          'xs': '400px',
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          '2lg': '1160px',
          'xl': '1280px',
          '2xl': '1536px',
          '3xl': '1740px',
        },
  
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
        keyframes: {
          "accordion-down": {
            from: { height: "0" },
            to: { height: "var(--radix-accordion-content-height)" },
          },
          "accordion-up": {
            from: { height: "var(--radix-accordion-content-height)" },
            to: { height: "0" },
          },
          shake: {
            '0%': {
              transform: 'translateX(0)',
            },
            '10%': {
              transform: 'translateX(-25px)',
            },
            '20%': {
              transform: 'translateX(25px)',
            },
            '30%': {
              transform: 'translateX(-25px)',
            },
            '40%': {
              transform: 'translateX(25px)',
            },
            '50%': {
              transform: 'translateX(-25px)',
            },
            '60%': {
              transform: 'translateX(25px)',
            },
            '70%': {
              transform: 'translateX(-25px)',
            },
            '80%': {
              transform: 'translateX(25px)',
            },
            '90%': {
              transform: 'translateX(-25px)',
            },
            '100%': {
              transform: 'translateX(0)',
            },
          }
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
          shake: 'shake 0.7s ease-in-out'
        },
      },
    },
    plugins: [require("tailwindcss-animate")],
  } 
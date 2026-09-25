import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';

export const theme = createTheme({
    colors: {

        Red: [
            "#feecec",
            "#f6d5d4",
            "#f1a5a5",
            "#ee7472",
            "#eb4b48",
            "#ea342d",
            "#ea281f",
            "#d01e15",
            "#ba1711",
            "#720808"
        ],

        LightGreen:[
            "#f6f8f1",
            "#ecefe4",
            "#d7ddc4",
            "#c0caa0",
            "#adbb82",
            "#a0b16f",
            "#9aac64",
            "#869753",
            "#768648",
            "#65743a"
        ],

        Gray: [
            "#f3f6f6",
            "#e9e9e9",
            "#ced3d1",
            "#afbcb8",
            "#96a8a3",
            "#859b95",
            "#7b968e",
            "#68827b",
            "#5a746d",
            "#394f49"
        ],

        Cream: [
            "#fcffe3",
            "#f8fece",
            "#f4fdaf",
            "#eafb6a",
            "#e4fa3f",
            "#e1f925",
            "#def916",
            "#c5dd06",
            "#aec500",
            "#94aa00"
        ],

        Brown: [
            "#f9f8f0",
            "#f0eee2",
            "#e2dbbf",
            "#d2c799",
            "#c5b679",
            "#bdac64",
            "#b9a658",
            "#a39148",
            "#90813e",
            "#121007"
        ],
    },

    primaryShade: {
        light: 4,
        dark: 7,
    },

    primaryColor: 'Red',

    white: '#f9f8f0',
    black: '#121007',

    fontFamily: 'Times',
    
    fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        xxl: '1.5rem',
    },

    headings: {
        fontFamily: 'Basteleur-Bold',
        fontWeight: '700',
        textWrap: 'pretty',
        sizes: {
            h1 : { fontSize: '2.5rem', lineHeight: '1.2' },
            h2 : { fontSize: '2rem', lineHeight: '1.3' },
            h3 : { fontSize: '1.75rem', lineHeight: '1.3' },
            h4 : { fontSize: '1.5rem', lineHeight: '1.4' },
            h5 : { fontSize: '1.25rem', lineHeight: '1.4' },
            h6 : { fontSize: '1.125rem', lineHeight: '1.5' },
        },
    },

    defaultRadius: 'none',
    radius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '20px',
    },

    spacing: {
        xs: '8px',
        sm: '12px',
        md: '20px',
        lg: '24px',
        xl: '32px',
        xxl: '128px',
    },

    shadows: {
        inner: '0 1px 3px rgba(0, 0, 0, 0.1)',
        outer: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },

    components: {
        Paper: {
            styles: {
                root: {
                    borderWidth: '2px',
                    borderColor: 'var(--mantine-color-brand-7)',
                },
            },
        },


    },
});

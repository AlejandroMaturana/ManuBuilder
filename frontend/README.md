# React + Vite

Esta plantilla proporciona una configuración mínima para integrar React en Vite con HMR y algunas reglas de ESLint.

Actualmente, hay dos plugins oficiales disponibles:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) utiliza [Oxc](https://oxc.rs)

- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) utiliza [SWC](https://swc.rs/)

## Compilador de React

El compilador de React no está habilitado en esta plantilla debido a su impacto en el rendimiento de desarrollo y compilación. Para agregarlo, consulta [esta documentación](https://react.dev/learn/react-compiler/installation).

## Ampliando la configuración de ESLint

Si estás desarrollando una aplicación de producción, te recomendamos usar TypeScript con reglas de lint con reconocimiento de tipos habilitadas. Consulta la [plantilla TS](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) para obtener información sobre cómo integrar TypeScript y [`typescript-eslint`](https://typescript-eslint.io) en tu proyecto.
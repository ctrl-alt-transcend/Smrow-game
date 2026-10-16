# Modern React Dice Roll

[![npm version](https://img.shields.io/npm/v/@adarsh1999/modern-react-dice-roll.svg?style=flat-square)](https://www.npmjs.com/package/@adarsh1999/modern-react-dice-roll)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A fully modernized and customizable dice roll component for React, forked from the original [react-dice-roll](https://github.com/avaneeshtripathi/react-dice-roll).

This version has been completely reworked to support modern React (v17/18+), TypeScript, and current JavaScript tooling, eliminating the need for `--legacy-peer-deps`.


## Key Features & Improvements

-   **Modern React Support**: Full compatibility with React 17, 18, and beyond.
-   **TypeScript Native**: Written entirely in TypeScript for full type safety and great developer experience.
-   **No Legacy Dependencies**: Installs cleanly in any modern project.
-   **ESM & CJS Builds**: Ships with both module formats for broad compatibility.
-   **Feature Parity**: Keeps all the features of the original package.

## Installation

Install the package using your favorite package manager:

```bash
npm install modern-react-dice-roll
```

or

```bash
yarn add modern-react-dice-roll
```

## Usage

Import the component and its stylesheet, then render it in your app.

```jsx
import Dice from 'modern-react-dice-roll';
import 'modern-react-dice-roll/dist/index.css';

function MyComponent() {
  const handleRoll = (value) => {
    console.log(`You rolled a ${value}!`);
  };

  return (
    <div>
      <Dice onRoll={handleRoll} />
    </div>
  );
}
```

## Props

Customize the dice component with these props:

| Prop           | Type                                                     | Default     | Description                                                                                                                              |
| -------------- | -------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `onRoll`       | `(value: 1-6) => void`                                   | `undefined` | **Required.** A function that receives the rolled value (1-6).                                                                           |
| `size`         | `number`                                                 | `250`       | The width and height of the dice in pixels.                                                                                              |
| `defaultValue` | `1-6`                                                    | `6`         | The value the dice shows before the first roll.                                                                                          |
| `rollingTime`  | `number`                                                 | `1000`      | The duration of the rolling animation in milliseconds.                                                                                   |
| `disabled`     | `boolean`                                                | `false`     | If `true`, the dice is visually greyed out and cannot be rolled.                                                                         |
| `cheatValue`   | `1-6`                                                    | `undefined` | If provided, the dice will always roll this value.                                                                                       |
| `triggers`     | `string[]`                                               | `['click']` | An array of keyboard keys that trigger a roll. Use `'click'` to enable mouse clicks. Example: `['Enter', 'r', 'click']`              |
| `sound`        | `string`                                                 | `undefined` | A URL to a sound file to be played during the roll.                                                                                      |
| `faces`        | `string[]`                                               | `undefined` | An array of 6 image URLs to use for custom dice faces, starting with face 1.                                                             |
| `faceBg`       | `string`                                                 | `undefined` | A custom background color for the dice faces.                                                                                            |
| `placement`    | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `undefined` | Positions the dice absolutely within a relatively-positioned parent element. Useful for overlaying the dice on other content. |

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](./LICENSE)

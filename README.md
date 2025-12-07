# buffer-transpose

Efficiently transpose Node.js Buffers representing 2D matrices. 

Designed for high-performance graphics operations, particularly converting standard Row-Major bitmaps to Column-Major (Vertical Addressing) formats required by many OLED and VFD displays (SSD1306, etc.).

## Features

- **High Performance**: Optimized paths for byte-aligned dimensions.
- **Versatile**: Supports both **1-bit packed** bitmaps and standard **8-bit** buffers.
- **Robust**: Handles any resolution (calculates correct padding/stride).
- **TypeScript**: Written in TypeScript with full type definitions included.
- **Zero Dependencies**: Pure JavaScript/TypeScript, no native binaries.

## Installation

```bash
npm install buffer-transpose
```

## Usage

### 1-Bit Packed Bitmap (Default)
Ideal for monochrome displays (VFDs, OLEDs).

```typescript
import { transpose } from 'buffer-transpose';

// Example: 32x140 1-bit bitmap (row-major)
const width = 32;
const height = 140;
const inputBuffer = Buffer.alloc(width * height / 8); // Your source buffer

// Transpose to Column-Major (Vertical Addressing)
const outputBuffer = transpose(inputBuffer, width, height, { bpp: 1 });
```

### 8-Bit Matrix (Grayscale/Byte Data)
Useful for general image processing or generic matrix operations.

```typescript
import { transpose } from 'buffer-transpose';

const width = 2;
const height = 3;
// Matrix:
// 1 2
// 3 4
// 5 6
const input = Buffer.from([1, 2, 3, 4, 5, 6]);

const output = transpose(input, width, height, { bpp: 8 });

// Output (3x2):
// 1 3 5
// 2 4 6
// [1, 3, 5, 2, 4, 6]
```

## API

### `transpose(input, width, height, [options])`

- **input**: `Buffer` | `Uint8Array` - The source buffer.
- **width**: `number` - Width of the source matrix.
- **height**: `number` - Height of the source matrix.
- **options**: `TransposeOptions`
  - **bpp**: `1 | 8` (default: `1`) - Bits Per Pixel.

Returns a new `Buffer` containing the transposed data.

## License

MIT

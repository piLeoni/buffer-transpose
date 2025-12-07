export interface TransposeOptions {
  /**
   * Bits Per Pixel.
   * - 1: Packed 1-bit bitmap (default).
   * - 8: 1-byte per pixel.
   */
  bpp?: 1 | 8;
}

/**
 * Transposes a buffer representing a 2D matrix.
 * Supports packed 1-bit bitmaps and 8-bit byte maps.
 *
 * @param input - The input buffer.
 * @param width - Width of the matrix in pixels/items.
 * @param height - Height of the matrix in pixels/items.
 * @param options - Configuration options.
 * @returns The transposed buffer.
 */
export function transpose(
  input: Buffer | Uint8Array,
  width: number,
  height: number,
  options: TransposeOptions = {}
): Buffer {
  const bpp = options.bpp || 1;

  if (bpp === 1) {
    // Check for byte-alignment optimization
    if (width % 8 === 0 && height % 8 === 0) {
      return transpose1BitAligned(input, width, height);
    }
    return transpose1BitGeneric(input, width, height);
  } else if (bpp === 8) {
    return transpose8Bit(input, width, height);
  } else {
    throw new Error(`Unsupported bpp: ${bpp}. Only 1 and 8 are currently supported.`);
  }
}

/**
 * Optimized 1-bit transpose for byte-aligned dimensions.
 */
function transpose1BitAligned(
  input: Buffer | Uint8Array,
  width: number,
  height: number
): Buffer {
  const widthBytes = width >> 3;
  const heightBytes = height >> 3;
  const output = Buffer.alloc(width * heightBytes);

  for (let x = 0; x < width; x++) {
    const inputByteCol = x >> 3;
    const inputBitShift = 7 - (x & 7);

    for (let y = 0; y < height; y++) {
      const inputIndex = y * widthBytes + inputByteCol;
      const bit = (input[inputIndex] >> inputBitShift) & 1;

      if (bit) {
        const outputRowStart = x * heightBytes;
        const outputByteIndex = outputRowStart + (y >> 3);
        const outputBitShift = 7 - (y & 7);
        output[outputByteIndex] |= 1 << outputBitShift;
      }
    }
  }
  return output;
}

/**
 * Generic 1-bit transpose for any dimensions.
 */
function transpose1BitGeneric(
  input: Buffer | Uint8Array,
  width: number,
  height: number
): Buffer {
  const inputStride = Math.ceil(width / 8);
  const outputStride = Math.ceil(height / 8);
  const output = Buffer.alloc(width * outputStride);

  for (let x = 0; x < width; x++) {
    const inputByteCol = x >> 3;
    const inputBitShift = 7 - (x & 7);

    for (let y = 0; y < height; y++) {
      const inputIndex = y * inputStride + inputByteCol;
      if (inputIndex < input.length) {
        const bit = (input[inputIndex] >> inputBitShift) & 1;

        if (bit) {
          const outputRowStart = x * outputStride;
          const outputByteIndex = outputRowStart + (y >> 3);
          const outputBitShift = 7 - (y & 7);
          output[outputByteIndex] |= 1 << outputBitShift;
        }
      }
    }
  }
  return output;
}

/**
 * 8-bit transpose (1 byte per pixel).
 */
function transpose8Bit(
  input: Buffer | Uint8Array,
  width: number,
  height: number
): Buffer {
  const output = Buffer.alloc(width * height);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // Input: Row-Major (y * width + x)
      const inputIndex = y * width + x;
      // Output: Row-Major of Transposed (x * height + y)
      const outputIndex = x * height + y;

      output[outputIndex] = input[inputIndex];
    }
  }
  return output;
}

const { transpose } = require('./dist/index');
const assert = require('assert');

function runTests() {
  console.log('Running Tests...');

  test1BitAligned();
  test1BitGeneric();
  test8Bit();

  console.log('✅ All Tests Passed!');
}

function test1BitAligned() {
  console.log('Testing 1-bit Aligned (8x8)...');
  // Diagonal line in 8x8
  // 1 0 0 0 ...
  // 0 1 0 0 ...
  const width = 8;
  const height = 8;
  const input = Buffer.alloc(8);
  for (let i = 0; i < 8; i++) input[i] = 1 << (7 - i);

  const output = transpose(input, width, height, { bpp: 1 });
  
  // For a symmetric matrix like a diagonal identity, transpose should be identical
  assert.strictEqual(input.compare(output), 0, '8x8 Diagonal transpose failed');
}

function test1BitGeneric() {
  console.log('Testing 1-bit Generic (32x140)...');
  const width = 32;
  const height = 140;
  // Use stride calculation
  const inputSize = Math.ceil(width / 8) * height;
  const input = Buffer.alloc(inputSize);

  // Set point (1, 2)
  // Row 2, Col 1
  // Stride = 32/8 = 4 bytes.
  // Row 2 starts at byte 2*4 = 8.
  // Col 1 is in the first byte (byte 8), bit 6 (7-1).
  const x = 1, y = 2;
  const byteIndex = (y * (width/8)) + (x >> 3);
  const bitOffset = 7 - (x & 7);
  input[byteIndex] |= (1 << bitOffset);

  const output = transpose(input, width, height, { bpp: 1 });

  // Verify in output
  // Output is 140x32 (conceptually)
  // We want to check (row=1, col=2) in the new system (which corresponds to x,y in new system)
  // Wait, transpose swaps x/y.
  // So Input(x,y) -> Output(y,x).
  // We want to find bit at Output Row x, Col y.
  // Output Width = Input Height = 140.
  // Wait, no.
  // Input: 32x140.
  // Output: 140x32?
  // Our transpose function returns the BUFFER for the Transposed Matrix.
  // If Input is 32 wide, 140 high.
  // Output is 140 wide, 32 high?
  // Let's trace the code:
  // "Output Indexing: We are building the output row 'x'. Inside that row, we are at position 'y'."
  // Code: outputRowStart = x * outputStride;
  // So Output Rows correspond to Input Columns (x).
  // So Output has 'width' rows. And 'height' columns.
  // So Output Dimensions are: Height x Width? No.
  // If Input is W x H.
  // Outer loop x=0..W. Output has W rows.
  // Inner loop y=0..H. Output has H columns.
  // So Output is W x H? 
  // Let's re-read code:
  // outputRowStart = x * outputStride;
  // outputStride = Math.ceil(height / 8);
  // So a "Row" in Output is 'height' pixels long.
  // So Output is (Input Width) rows x (Input Height) cols.
  // i.e., W x H dimensions.
  // This is effectively transposing the memory layout:
  // Input: Rows are Width-long.
  // Output: Rows are Height-long.
  // So yes, Output is logically W x H matrix.
  
  // So point Input(1, 2) should be at Output(Row 1, Col 2).
  // Output Stride = ceil(140/8) = 18 bytes.
  // Row 1 starts at 1 * 18 = 18.
  // Col 2 is in byte 18, bit 7-2=5.
  
  const outputStride = Math.ceil(height / 8); // 18
  const outByteIdx = (x * outputStride) + (y >> 3);
  const outBitOff = 7 - (y & 7);
  
  const bit = (output[outByteIdx] >> outBitOff) & 1;
  assert.strictEqual(bit, 1, 'Point (1,2) failed in generic 32x140');
}

function test8Bit() {
  console.log('Testing 8-bit (2x3)...');
  // 1 2
  // 3 4
  // 5 6
  const width = 2;
  const height = 3;
  const input = Buffer.from([1, 2, 3, 4, 5, 6]);
  
  // Expected Output (3x2):
  // 1 3 5
  // 2 4 6
  const expected = Buffer.from([1, 3, 5, 2, 4, 6]);
  
  const output = transpose(input, width, height, { bpp: 8 });
  
  assert.strictEqual(input.length, output.length);
  assert.strictEqual(output.compare(expected), 0, '8-bit transpose failed');
}

runTests();

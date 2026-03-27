# Sound Files

This directory is reserved for sound files. However, the current implementation
uses Web Audio API to generate sounds dynamically, so no external files are required.

## Sound Types

- `hit.mp3` - Ship hit sound (generated: 440Hz square wave)
- `miss.mp3` - Miss sound (generated: 200Hz sine wave)
- `sunk.mp3` - Ship sunk sound (generated: 300Hz sawtooth wave)
- `win.mp3` - Win sound (generated: 523Hz sine wave)
- `lose.mp3` - Lose sound (generated: 150Hz triangle wave)
- `click.mp3` - Click sound (generated: 800Hz square wave)

## Adding Custom Sounds

To use custom sound files instead of generated sounds:

1. Place your mp3 files in this directory
2. Call `soundManager.loadSound('hit', '/sounds/hit.mp3')` after initialization

The system will automatically fall back to generated sounds if a file fails to load.

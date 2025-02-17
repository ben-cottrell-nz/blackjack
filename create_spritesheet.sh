#!/usr/bin/env bash
cd assets
montage `ls cards/*.svg` -tile 6x9 -geometry 120x180 -density 288 -filter Lanczos spritesheet.png
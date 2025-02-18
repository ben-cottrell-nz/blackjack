#!/usr/bin/env bash
pushd assets
#montage `ls cards/*.svg` -tile 6x9 -geometry 120x180 -density 288 -filter Lanczos spritesheet.png
montage -background none `ls cards/*.svg` -tile 6x9 -geometry 120x180+8+8 -density 288 -filter Lanczos spritesheet-a.png
popd
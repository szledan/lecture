#! /bin/bash

python src/solarsystem.py
python src/kepler.py

gifsicle -O3 --colors 256 --lossy=30 -o solarsystem_mini.gif soloarsystem.gif
gifsicle -O3 --colors 256 --lossy=30 -o kepler_mini.gif kepler.gif

from PIL import Image, ImageDraw
import random
import math

def ellipse(x, y, offset):
    image = Image.new("RGB", (400, 400), "blue")
    draw = ImageDraw.Draw(image)
    draw.ellipse((x, y, x+offset, y+offset), fill="red")
    return image

FRAME_COUNT = int(360 / 4)
WIDTH = 300
HEIGHT = 200
X0 = int(WIDTH / 2)
Y0 = int(HEIGHT / 2)
T = 0.0
e = 0.7

class Sun:
    size = 25
    x = 0
    y = 0
    def __init__(self):
        self.im = Image.open("src/assets/sun.png")

    def put(self, image):
        global T
        global e
        rorbit = 15.0*(1 - e**2)/(1 + e*math.cos(T))
        self.x = -int(rorbit*math.cos(T))
        self.y = -int(rorbit*math.sin(T))

        size = random.randint(self.size, self.size + 2) - 2
        _s = self.im.resize((size, size))
        image.paste(_s, ( self.x + int(e * X0) - int(_s.width / 2), self.y + Y0 - int(_s.height / 2)), mask=_s)

class Earth:
    size = 15
    x = 0
    y = 0
    r = 90.0
    def __init__(self):
        self.im = Image.open("src/assets/earth.png")
        self.im_orb = Image.open("src/assets/earth_orbit.png")

    def put(self, image):
        global T
        global e
        rorbit = self.r*(1 - e**2)/(1 + e*math.cos(T))
        self.x = int(rorbit*math.cos(T))
        self.y = int(rorbit*math.sin(T))

        _e_orb = self.im_orb.resize((int(2.2 * self.r), int(2.2 * e * self.r)))
        image.paste(_e_orb, (X0 - int(_e_orb.width / 2), Y0 - int(_e_orb.height / 2)), mask=_e_orb)

        _e = self.im.resize((self.size, self.size))
        image.paste(_e, ( self.x + int(1/ e * X0) - int(_e.width / 2), self.y + Y0 - int(_e.height / 2)), mask=_e)

sun = Sun();
earth = Earth();

def solarsystem():
    image = Image.new("RGB", (WIDTH, HEIGHT), "white")
    sun.put(image)
    earth.put(image)
    return image

def make_gif():
    global T
    frames = []
    for number in range(FRAME_COUNT):
        T = T - (2.0 * math.pi) / FRAME_COUNT
        frames.append(solarsystem())

    frame_one = frames[0]
    frame_one.save("kepler.gif", format="GIF", append_images=frames,
                   save_all=True, duration=100, loop=0)

if __name__ == "__main__":
    make_gif()

from PIL import Image, ImageDraw
import random
import math

def ellipse(x, y, offset):
    image = Image.new("RGB", (400, 400), "blue")
    draw = ImageDraw.Draw(image)
    draw.ellipse((x, y, x+offset, y+offset), fill="red")
    return image

FRAME_COUNT = int(360 / 4)
WIDTH = 600
HEIGHT = 600
X0 = int(WIDTH / 2)
Y0 = int(HEIGHT / 2)
T = 0.0

class Sun:
    size = 80
    x = 0
    y = 0
    def __init__(self):
        self.im = Image.open("src/assets/sun.png")

    def put(self, image):
        global T
        self.x = -int(10.0 * math.cos(T))
        self.y = -int(10.0 * math.sin(T))
        size = random.randint(self.size, self.size + 2) - 2
        _s = self.im.resize((size, size))
        image.paste(_s, ( self.x + X0 - int(_s.width / 2), self.y + Y0 - int(_s.height / 2)), mask=_s)

class Earth:
    size = 60
    x = 0
    y = 0
    t = 0.0
    r = 180.0
    mr = 90.0
    def __init__(self):
        self.im = Image.open("src/assets/earth.png")
        self.im_moon = Image.open("src/assets/moon.png")
        self.im_orb = Image.open("src/assets/earth_orbit.png")

    def put(self, image):
        global T
        self.x = int(self.r * math.cos(T))
        self.y = int(self.r * math.sin(T))

        _e_orb = self.im_orb.resize((int(2.2 * self.r), int(2.2 * self.r)))
        image.paste(_e_orb, (X0 - int(_e_orb.width / 2), Y0 - int(_e_orb.height / 2)), mask=_e_orb)
        _m_orb = self.im_orb.resize((int(1.1 * self.r), int(1.1 * self.r)))
        image.paste(_m_orb, (self.x + X0 - int(_m_orb.width / 2),
        self.y +Y0 - int(_m_orb.height / 2)), mask=_m_orb)

        _e = self.im.resize((self.size, self.size))
        _e = _e.rotate(-T / (2.0 * math.pi) * FRAME_COUNT * 20)
        image.paste(_e, ( self.x + X0 - int(_e.width / 2), self.y + Y0 - int(_e.height / 2)), mask=_e)
        _m = self.im_moon.resize((int(0.8 * self.size), int(0.8 * self.size)))
        _m = _m.rotate(-(T * 16) / (2.0 * math.pi) * FRAME_COUNT)
        mx = self.x + int(self.mr * math.cos(T * 4))
        my = self.y + int(self.mr * math.sin(T * 4))

        image.paste(_m, ( mx + X0 - int(_m.width / 2), my + Y0 - int(_m.height / 2)), mask=_m)

sun = Sun();
earth = Earth();

def solarsystem():
    image = Image.new("RGB", (600, 600), "white")
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
    frame_one.save("soloarsystem.gif", format="GIF", append_images=frames,
                   save_all=True, duration=100, loop=0)

if __name__ == "__main__":
    make_gif()

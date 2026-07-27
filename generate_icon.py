from PIL import Image, ImageDraw
import math

def create_icon(size, bg_color="#16213E", outline_color="#E8C4FF", accent_color="#FFD700"):
    img = Image.new("RGBA", (size, size), bg_color)
    draw = ImageDraw.Draw(img)
    
    s = size
    cx, cy = s // 2, s // 2
    
    # For small icons, we need to scale the design proportionally and center it
    # Base design: rabbit occupies roughly 170x240 area centered in 512x512
    # We want the rabbit to fill ~75% of the icon
    
    # Calculate a unified scale so the rabbit fits nicely
    rabbit_width = 170   # approximate width of rabbit design
    rabbit_height = 240  # approximate height of rabbit design
    
    # Target: fill 80% of the smaller dimension
    target_scale = (s * 0.80) / max(rabbit_width, rabbit_height)
    
    # But also respect a minimum stroke width
    lw = max(3, int(10 * target_scale))
    
    # Recalculate scale based on stroke width to keep proportions
    scale = lw / 10.0
    
    # Center the rabbit
    rabbit_w = rabbit_width * scale
    rabbit_h = rabbit_height * scale
    
    cx = s // 2
    cy = s // 2 + int(5 * scale)  # slight downward offset for visual balance
    
    # Left ear
    ear_w = 40 * scale
    ear_h = 150 * scale
    le_x1 = int(cx - ear_w - 5 * scale)
    le_y1 = int(cy - ear_h / 2 - 20 * scale)
    le_x2 = int(cx - 5 * scale)
    le_y2 = int(cy + ear_h / 2 - 20 * scale)
    draw.rounded_rectangle([le_x1, le_y1, le_x2, le_y2], radius=int(18*scale), outline=outline_color, width=lw)
    
    # Right ear
    re_x1 = int(cx + 5 * scale)
    re_y1 = int(cy - ear_h / 2 - 20 * scale)
    re_x2 = int(cx + ear_w + 5 * scale)
    re_y2 = int(cy + ear_h / 2 - 20 * scale)
    draw.rounded_rectangle([re_x1, re_y1, re_x2, re_y2], radius=int(18*scale), outline=outline_color, width=lw)
    
    # Head
    head_w = 90 * scale
    head_h = 75 * scale
    h_x1 = int(cx - head_w)
    h_y1 = int(cy - head_h / 2 + 10 * scale)
    h_x2 = int(cx + head_w)
    h_y2 = int(cy + head_h / 2 + 10 * scale)
    draw.rounded_rectangle([h_x1, h_y1, h_x2, h_y2], radius=int(55*scale), outline=outline_color, width=lw)
    
    # Star accent
    star_cx = int(cx + head_w + 15 * scale)
    star_cy = int(cy - ear_h / 2 + 10 * scale)
    star_r = int(12 * scale)
    
    star_pts = []
    for i in range(10):
        angle = math.pi / 2 + i * math.pi / 5
        r = star_r if i % 2 == 0 else star_r // 2
        sx = star_cx + r * math.cos(angle)
        sy = star_cy - r * math.sin(angle)
        star_pts.append((sx, sy))
    
    if len(star_pts) >= 3:
        draw.polygon(star_pts, fill=accent_color)
    
    # Wand line
    wand_start = (star_cx, int(star_cy + star_r + 3 * scale))
    wand_end = (int(star_cx + 20 * scale), int(star_cy + 50 * scale))
    draw.line([wand_start, wand_end], fill=outline_color, width=max(2, int(3*scale)))
    
    # Tiny sparkle dots
    dots = [
        (cx - head_w - 15 * scale, cy - 30 * scale),
        (cx - head_w - 10 * scale, cy + 50 * scale),
        (cx + head_w + 25 * scale, cy + 40 * scale),
        (cx + head_w + 15 * scale, cy - 60 * scale),
    ]
    for dx, dy in dots:
        dr = max(2, int(3 * scale))
        draw.ellipse([int(dx-dr), int(dy-dr), int(dx+dr), int(dy+dr)], fill=outline_color)
    
    return img

# Generate icons
icon192 = create_icon(192)
icon192.save("/workspace/icons/icon-192.png")

icon512 = create_icon(512)
icon512.save("/workspace/icons/icon-512.png")

print("Icons regenerated with unified scaling!")

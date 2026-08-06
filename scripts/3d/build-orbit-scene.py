"""Build Mentally Prepare's editable 3D orbit asset in Blender.

Run:
  blender --background --python scripts/3d/build-orbit-scene.py -- <repo-root>

Outputs:
  design/3d/mentally-prepare-orbit.blend
  assets/3d/mentally-prepare-orbit.glb
  assets/images/mentally-prepare-orbit.png
"""

from __future__ import annotations

import math
import os
import sys

import bpy
from mathutils import Vector


BRAND = {
    "void": "#08050F",
    "card": "#0E0A18",
    "sky": "#0B0820",
    "ink": "#F8F2FF",
    "rose": "#EBB4C2",
    "gold": "#ECC885",
    "purple": "#896CB5",
}


def srgb_channel_to_linear(channel: float) -> float:
    if channel <= 0.04045:
        return channel / 12.92
    return ((channel + 0.055) / 1.055) ** 2.4


def color(hex_value: str, alpha: float = 1.0) -> tuple[float, float, float, float]:
    value = hex_value.lstrip("#")
    channels = [int(value[index : index + 2], 16) / 255 for index in (0, 2, 4)]
    return tuple(srgb_channel_to_linear(channel) for channel in channels) + (alpha,)


def material(
    name: str,
    hex_value: str,
    *,
    metallic: float = 0.0,
    roughness: float = 0.4,
    emission_strength: float = 0.0,
) -> bpy.types.Material:
    result = bpy.data.materials.new(name)
    result.use_nodes = True
    result.diffuse_color = color(hex_value)
    principled = result.node_tree.nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = color(hex_value)
    principled.inputs["Metallic"].default_value = metallic
    principled.inputs["Roughness"].default_value = roughness
    if emission_strength:
        principled.inputs["Emission Color"].default_value = color(hex_value)
        principled.inputs["Emission Strength"].default_value = emission_strength
    return result


def look_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def smooth(obj: bpy.types.Object) -> None:
    if obj.type != "MESH":
        return
    for polygon in obj.data.polygons:
        polygon.use_smooth = True


def add_uv_sphere(
    name: str,
    radius: float,
    location: tuple[float, float, float],
    mat: bpy.types.Material,
    *,
    segments: int = 48,
    rings: int = 24,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=segments,
        ring_count=rings,
        radius=radius,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    smooth(obj)
    return obj


def keyframe_rotation(obj: bpy.types.Object, start: int, end: int, axis: int) -> None:
    obj.rotation_mode = "XYZ"
    obj.rotation_euler[axis] = 0
    obj.keyframe_insert("rotation_euler", frame=start, index=axis)
    obj.rotation_euler[axis] = math.tau
    obj.keyframe_insert("rotation_euler", frame=end, index=axis)
    if obj.animation_data and obj.animation_data.action:
        for curve in obj.animation_data.action.fcurves:
            for point in curve.keyframe_points:
                point.interpolation = "LINEAR"


def build(repo_root: str) -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)

    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = 120
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    scene.render.image_settings.color_depth = "8"
    scene.render.image_settings.compression = 60
    scene.render.fps = 30
    scene.view_settings.look = "AgX - Medium High Contrast"

    world = bpy.data.worlds.new("Mentally Prepare Void")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = color(BRAND["void"])
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.08
    scene.world = world

    purple = material("Purple atmosphere", BRAND["purple"], metallic=0.28, roughness=0.22)
    rose = material("Rose warmth", BRAND["rose"], metallic=0.14, roughness=0.26)
    gold = material("Gold ceremony", BRAND["gold"], metallic=0.55, roughness=0.19)
    ink = material("Ink highlight", BRAND["ink"], metallic=0.05, roughness=0.3, emission_strength=0.18)

    planet = add_uv_sphere("Private World", 1.55, (0, 0, 0), purple, segments=64, rings=32)
    keyframe_rotation(planet, 1, 120, 2)

    bpy.ops.mesh.primitive_torus_add(
        major_radius=2.0,
        minor_radius=0.095,
        major_segments=72,
        minor_segments=12,
        location=(0, 0, 0),
        rotation=(math.radians(67), math.radians(-9), math.radians(-17)),
    )
    ring = bpy.context.object
    ring.name = "Twenty One Night Orbit"
    ring.data.materials.append(gold)
    smooth(ring)
    ring.rotation_mode = "XYZ"
    ring.keyframe_insert("rotation_euler", frame=1)
    ring.rotation_euler.rotate_axis("Z", math.radians(8))
    ring.rotation_euler.rotate_axis("X", math.radians(4))
    ring.keyframe_insert("rotation_euler", frame=60)
    ring.rotation_euler.rotate_axis("Z", math.radians(-8))
    ring.rotation_euler.rotate_axis("X", math.radians(-4))
    ring.keyframe_insert("rotation_euler", frame=120)

    orbit_driver = bpy.data.objects.new("Rose Satellite Orbit", None)
    bpy.context.collection.objects.link(orbit_driver)
    satellite = add_uv_sphere("Rose Satellite", 0.22, (2.12, 0, 0.15), rose, segments=32, rings=16)
    satellite.parent = orbit_driver
    keyframe_rotation(orbit_driver, 1, 120, 2)

    orbit_driver_two = bpy.data.objects.new("Ink Satellite Orbit", None)
    orbit_driver_two.rotation_euler = (math.radians(30), math.radians(-10), math.radians(90))
    bpy.context.collection.objects.link(orbit_driver_two)
    satellite_two = add_uv_sphere("Ink Satellite", 0.10, (-2.18, 0, -0.18), ink, segments=24, rings=12)
    satellite_two.parent = orbit_driver_two
    keyframe_rotation(orbit_driver_two, 1, 120, 2)

    bpy.ops.object.light_add(type="AREA", location=(4.5, -4.0, 5.2))
    key = bpy.context.object
    key.name = "Rose Key"
    key.data.energy = 900
    key.data.color = color(BRAND["rose"])[:3]
    key.data.shape = "DISK"
    key.data.size = 4.0
    look_at(key, (0, 0, 0))

    bpy.ops.object.light_add(type="AREA", location=(-4.0, -1.0, 2.0))
    fill = bpy.context.object
    fill.name = "Purple Fill"
    fill.data.energy = 720
    fill.data.color = color(BRAND["purple"])[:3]
    fill.data.size = 5.0
    look_at(fill, (0, 0, 0))

    bpy.ops.object.light_add(type="AREA", location=(1.2, 3.5, 4.0))
    rim = bpy.context.object
    rim.name = "Gold Rim"
    rim.data.energy = 1050
    rim.data.color = color(BRAND["gold"])[:3]
    rim.data.size = 3.0
    look_at(rim, (0, 0, 0))

    bpy.ops.object.camera_add(location=(0, -7.6, 0.55))
    camera = bpy.context.object
    camera.name = "Product Camera"
    camera.data.lens = 52
    look_at(camera, (0, 0, 0))
    scene.camera = camera

    scene.use_nodes = True
    tree = scene.node_tree
    tree.nodes.clear()
    render_layers = tree.nodes.new("CompositorNodeRLayers")
    glare = tree.nodes.new("CompositorNodeGlare")
    glare.glare_type = "FOG_GLOW"
    glare.quality = "HIGH"
    glare.threshold = 0.8
    glare.size = 7
    composite = tree.nodes.new("CompositorNodeComposite")
    tree.links.new(render_layers.outputs["Image"], glare.inputs["Image"])
    tree.links.new(glare.outputs["Image"], composite.inputs["Image"])

    design_dir = os.path.join(repo_root, "design", "3d")
    model_dir = os.path.join(repo_root, "assets", "3d")
    image_dir = os.path.join(repo_root, "assets", "images")
    os.makedirs(design_dir, exist_ok=True)
    os.makedirs(model_dir, exist_ok=True)
    os.makedirs(image_dir, exist_ok=True)

    blend_path = os.path.join(design_dir, "mentally-prepare-orbit.blend")
    glb_path = os.path.join(model_dir, "mentally-prepare-orbit.glb")
    png_path = os.path.join(image_dir, "mentally-prepare-orbit.png")

    scene.frame_set(24)
    scene.render.filepath = png_path
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    bpy.ops.render.render(write_still=True)
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format="GLB",
        export_animations=True,
        export_frame_range=True,
        export_apply=True,
        export_cameras=False,
        export_lights=False,
        export_yup=True,
    )
    print(f"BLEND={blend_path}")
    print(f"GLB={glb_path}")
    print(f"PNG={png_path}")


if __name__ == "__main__":
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    repo = os.path.abspath(args[0] if args else os.getcwd())
    build(repo)

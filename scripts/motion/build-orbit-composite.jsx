/*
 * Mentally Prepare — After Effects orbit composite generator.
 *
 * Run in After Effects: File → Scripts → Run Script File…
 * The script imports the Blender PNG, builds an authored 3-second loop, and
 * queues an RGB+Alpha PNG sequence for native/mobile encoding.
 */

(function buildMentallyPrepareOrbitComposite() {
  app.beginUndoGroup("Mentally Prepare Orbit Composite");

  var project = app.project || app.newProject();
  var root = File($.fileName).parent.parent.parent;
  var source = new File(root.fsName + "/assets/images/mentally-prepare-orbit.png");
  var output = new Folder(root.fsName + "/assets/motion/orbit-loop");
  var projectFolder = new Folder(root.fsName + "/design/motion");

  if (!source.exists) {
    alert("Run the Blender orbit builder first. Missing: " + source.fsName);
    app.endUndoGroup();
    return;
  }
  if (!output.exists) output.create();
  if (!projectFolder.exists) projectFolder.create();

  var footage = project.importFile(new ImportOptions(source));
  var comp = project.items.addComp(
    "MP_Orbit_Loop_3s",
    720,
    720,
    1,
    3,
    30
  );
  comp.bgColor = [8 / 255, 5 / 255, 15 / 255];

  var art = comp.layers.add(footage);
  art.name = "Blender Orbit";
  art.property("Transform").property("Scale").setValue([62, 62]);

  var position = art.property("Transform").property("Position");
  position.setValueAtTime(0, [360, 362]);
  position.setValueAtTime(1.5, [360, 344]);
  position.setValueAtTime(3, [360, 362]);

  var rotation = art.property("Transform").property("Rotation");
  rotation.setValueAtTime(0, -1.5);
  rotation.setValueAtTime(1.5, 1.5);
  rotation.setValueAtTime(3, -1.5);

  var glow = art.property("ADBE Effect Parade").addProperty("ADBE Glo2");
  glow.property("Glow Threshold").setValue(68);
  glow.property("Glow Radius").setValue(34);
  glow.property("Glow Intensity").setValue(0.55);

  var rose = comp.layers.addShape();
  rose.name = "Rose Atmosphere";
  var roseContents = rose.property("Contents");
  var roseEllipse = roseContents.addProperty("ADBE Vector Shape - Ellipse");
  roseEllipse.property("Size").setValue([580, 580]);
  var roseFill = roseContents.addProperty("ADBE Vector Graphic - Fill");
  roseFill.property("Color").setValue([235 / 255, 180 / 255, 194 / 255]);
  roseFill.property("Opacity").setValue(9);
  rose.property("Transform").property("Position").setValue([360, 360]);
  rose.moveToEnd();

  var renderItem = project.renderQueue.items.add(comp);
  var outputModule = renderItem.outputModule(1);
  outputModule.applyTemplate("PNG Sequence with Alpha");
  outputModule.file = new File(output.fsName + "/orbit_[#####].png");

  project.save(new File(projectFolder.fsName + "/mentally-prepare-motion.aep"));
  app.endUndoGroup();
  alert("Mentally Prepare motion comp created and queued.");
})();

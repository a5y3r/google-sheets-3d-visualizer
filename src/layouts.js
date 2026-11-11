// Layout generators: given how many tiles there are, return one target Object3D
// (position + rotation) per tile. Pure maths — no DOM, no animation.
//
// Step 6: these are the original demo layouts. Step 8 adapts them to the spec.

import { Object3D, Vector3 } from 'three';

const SPACING_X = 140; // tile width 120 + 20 gap
const SPACING_Y = 180; // tile height 160 + 20 gap

/** Rows of `columns` tiles, centred on the origin. */
export function tableLayout(count, columns = 20) {
  const rows = Math.ceil(count / columns);
  return Array.from({ length: count }, (_, i) => {
    const column = i % columns;
    const row = Math.floor(i / columns);
    const target = new Object3D();
    target.position.set(
      (column - (columns - 1) / 2) * SPACING_X,
      ((rows - 1) / 2 - row) * SPACING_Y,
      0,
    );
    return target;
  });
}

/** Tiles spread evenly over a sphere, each facing outwards. */
export function sphereLayout(count, radius = 800) {
  const lookAt = new Vector3();
  return Array.from({ length: count }, (_, i) => {
    const phi = Math.acos(-1 + (2 * i) / count); // top → bottom
    const theta = Math.sqrt(count * Math.PI) * phi; // spin around as we go down
    const target = new Object3D();
    target.position.setFromSphericalCoords(radius, phi, theta);
    lookAt.copy(target.position).multiplyScalar(2); // a point further out = face outwards
    target.lookAt(lookAt);
    return target;
  });
}

/** Demo's single helix (Step 8 turns this into a double helix). */
export function helixLayout(count, radius = 900) {
  const lookAt = new Vector3();
  return Array.from({ length: count }, (_, i) => {
    const theta = i * 0.175 + Math.PI;
    const y = -(i * 8) + 450;
    const target = new Object3D();
    target.position.setFromCylindricalCoords(radius, theta, y);
    lookAt.set(target.position.x * 2, target.position.y, target.position.z * 2);
    target.lookAt(lookAt);
    return target;
  });
}

/** Demo's 5×5×N grid (Step 8 changes this to 5×4×10). */
export function gridLayout(count) {
  return Array.from({ length: count }, (_, i) => {
    const target = new Object3D();
    target.position.set(
      (i % 5) * 400 - 800,
      -(Math.floor(i / 5) % 5) * 400 + 800,
      Math.floor(i / 25) * 1000 - 2000,
    );
    return target;
  });
}

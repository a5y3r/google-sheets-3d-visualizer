// Layout generators: given how many tiles there are, return one target Object3D
// (position + rotation) per tile. Pure maths — no DOM, no animation.
//
// Spec: Table 20×10, Sphere, double Helix, Grid 5×4×10.

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

/**
 * Double helix: two strands rotated π (180°) apart, like DNA.
 * Even tiles go on strand A, odd tiles on strand B; each pair shares a height.
 *
 * Visual tuning: strand B passes half a turn (half the pitch) below strand A.
 *   half-pitch = π × heightStep / angleStep ≈ 335  →  gap ≈ 175 (> 160 tile height)
 * so the eye sees two separate ribbons instead of one dense coil.
 * Tile spacing along a strand = angleStep × radius ≈ 128 (> 120 tile width).
 */
export function helixLayout(count, { radius = 850, angleStep = 0.15, heightStep = 16 } = {}) {
  const steps = Math.ceil(count / 2); // tiles per strand
  const lookAt = new Vector3();

  return Array.from({ length: count }, (_, i) => {
    const strand = i % 2; // 0 = A, 1 = B
    const step = Math.floor(i / 2); // position along the strand
    const theta = step * angleStep + strand * Math.PI + Math.PI;
    const y = ((steps - 1) / 2 - step) * heightStep; // centred vertically

    const target = new Object3D();
    target.position.setFromCylindricalCoords(radius, theta, y);
    // Face outwards: look at a point further from the axis at the same height.
    lookAt.set(target.position.x * 2, target.position.y, target.position.z * 2);
    target.lookAt(lookAt);
    return target;
  });
}

/**
 * 3D grid, 10 across × 4 down × 5 deep (Image C: "5 × 4 × 10").
 * Fills one 10×4 sheet at a time, front to back, centred on the origin.
 */
export function gridLayout(
  count,
  { columns = 10, rows = 4, layers = 5, spacingX = 250, spacingY = 300, spacingZ = 500 } = {},
) {
  const perLayer = columns * rows;

  return Array.from({ length: count }, (_, i) => {
    const column = i % columns;
    const row = Math.floor(i / columns) % rows;
    const layer = Math.floor(i / perLayer);

    const target = new Object3D();
    target.position.set(
      (column - (columns - 1) / 2) * spacingX,
      ((rows - 1) / 2 - row) * spacingY,
      ((layers - 1) / 2 - layer) * spacingZ, // layer 0 nearest the camera
    );
    return target;
  });
}

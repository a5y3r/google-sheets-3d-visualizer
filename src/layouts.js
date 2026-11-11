import { Object3D, Vector3 } from 'three';

const SPACING_X = 140;
const SPACING_Y = 180;

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

export function sphereLayout(count, radius = 800) {
  const lookAt = new Vector3();
  return Array.from({ length: count }, (_, i) => {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    const target = new Object3D();
    target.position.setFromSphericalCoords(radius, phi, theta);
    lookAt.copy(target.position).multiplyScalar(2);
    target.lookAt(lookAt);
    return target;
  });
}

/**
 * Two strands offset by PI. Even tiles go on one strand and odd tiles on the other,
 * so each pair sits at the same height on opposite sides.
 * The pitch is kept large enough that the strands don't visually merge.
 */
export function helixLayout(count, { radius = 850, angleStep = 0.15, heightStep = 16 } = {}) {
  const stepsPerStrand = Math.ceil(count / 2);
  const lookAt = new Vector3();

  return Array.from({ length: count }, (_, i) => {
    const strand = i % 2;
    const step = Math.floor(i / 2);
    const theta = step * angleStep + strand * Math.PI + Math.PI;
    const y = ((stepsPerStrand - 1) / 2 - step) * heightStep;

    const target = new Object3D();
    target.position.setFromCylindricalCoords(radius, theta, y);
    lookAt.set(target.position.x * 2, target.position.y, target.position.z * 2);
    target.lookAt(lookAt);
    return target;
  });
}

/**
 * 5 x 4 x 10 grid (x, y, z), filled one layer at a time from front to back.
 * Spacing keeps the nearest layer within the camera's view.
 */
export function gridLayout(
  count,
  { columns = 5, rows = 4, layers = 10, spacingX = 300, spacingY = 250, spacingZ = 300 } = {},
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
      ((layers - 1) / 2 - layer) * spacingZ,
    );
    return target;
  });
}

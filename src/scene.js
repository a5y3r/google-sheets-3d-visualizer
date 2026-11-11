// three.js scene: camera, CSS3D renderer, mouse controls and layout animation.
// Based on https://threejs.org/examples/#css3d_periodictable

import { PerspectiveCamera, Scene } from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { Group as TweenGroup, Tween, Easing } from 'three/addons/libs/tween.module.js';

const randomPosition = () => Math.random() * 4000 - 2000;

/**
 * Create the 3D scene inside `container` with one CSS3DObject per element.
 * Returns a small API: transformTo(targets) to animate, dispose() to tear down.
 */
export function createScene({ container, elements }) {
  const camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 3000;

  const scene = new Scene();

  // Wrap each HTML element in a CSS3DObject, starting at a random position.
  const objects = elements.map((element) => {
    const object = new CSS3DObject(element);
    object.position.set(randomPosition(), randomPosition(), randomPosition());
    scene.add(object);
    return object;
  });

  const renderer = new CSS3DRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const render = () => renderer.render(scene, camera);

  const controls = new TrackballControls(camera, renderer.domElement);
  controls.minDistance = 500;
  controls.maxDistance = 6000;
  controls.addEventListener('change', render);

  // Our own tween group, so we don't depend on (or clash with) global state.
  const tweens = new TweenGroup();

  /** Animate every tile to its matching target. */
  function transformTo(targets, duration = 2000) {
    tweens.removeAll(); // cancel any half-finished transition

    objects.forEach((object, i) => {
      const target = targets[i];
      const time = Math.random() * duration + duration; // staggered = organic motion

      new Tween(object.position, tweens)
        .to({ x: target.position.x, y: target.position.y, z: target.position.z }, time)
        .easing(Easing.Exponential.InOut)
        .start();

      new Tween(object.rotation, tweens)
        .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, time)
        .easing(Easing.Exponential.InOut)
        .start();
    });

    // Re-render on every frame while tiles are moving (longest tween = 2 × duration).
    new Tween({}, tweens).to({}, duration * 2).onUpdate(render).start();
  }

  let frameId;
  function animate() {
    frameId = requestAnimationFrame(animate);
    tweens.update();
    controls.update();
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
    render();
  }

  window.addEventListener('resize', onResize);
  animate();

  /** Stop everything and remove the scene from the page (e.g. on sign-out). */
  function dispose() {
    cancelAnimationFrame(frameId);
    window.removeEventListener('resize', onResize);
    tweens.removeAll();
    controls.dispose();
    renderer.domElement.remove();
  }

  return { transformTo, dispose };
}

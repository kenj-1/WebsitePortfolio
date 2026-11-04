import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import { toProcessedLiquidMetal } from '@paper-design/shaders';
import { Sliders, Upload, Sparkles, RotateCcw } from 'lucide-react';
import { workspaceLogoUrl } from './assetScanner';

/**
 * Default Warm-Chrome Liquid Metal settings tuned for a Cream (#FFF8EE) & Brand Orange (#D97757) aesthetic.
 * Lifted and adapted from paper-design/liquid-logo & @paper-design/shaders.
 */
export const DEFAULT_LIQUID_SETTINGS = {
  speed: 0.35,
  refraction: 0.28,
  distortion: 0.16,
  repetition: 2.4,
  contour: 0.58,
  shiftRed: 0.36,
  shiftBlue: 0.22,
  angle: 68,
  floatSpeed: 1.25,
  floatIntensity: 0.55,
  colorOrange: '#D97757',
  colorCream: '#FFF8EE',
  colorShadow: '#1A110D',
};

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;

  void main() {
    vUv = uv;
    vLocalPos = position;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    vec4 mvPosition = viewMatrix * worldPosition;
    vViewPos = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * 3D Liquid Metal Fragment Shader
 * Lifts the procedural stripe, Simplex noise, chromatic dispersion, and contour bevel math
 * from paper-design/liquid-logo, combined with 3D view-space refraction and Fresnel rim lighting
 * tuned to Warm Chrome (#FFF8EE cream + #D97757 brand orange).
 */
const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float u_time;
  uniform float uTime;
  uniform float u_refraction;
  uniform float u_distortion;
  uniform float u_repetition;
  uniform float u_contour;
  uniform float u_shiftRed;
  uniform float u_shiftBlue;
  uniform float u_angle;
  uniform vec3 u_colorOrange;
  uniform vec3 u_colorCream;
  uniform vec3 u_colorShadow;
  uniform sampler2D u_bevelMap;
  uniform bool u_hasBevelMap;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;

  const float PI = 3.14159265358979323846;

  vec2 rotate2D(vec2 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
  }

  // Ashima 2D Simplex Noise (same foundation as @paper-design/shaders)
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
      + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float getColorChanges(float c1, float c2, float stripe_p, vec3 w, float blur, float bump, float tint) {
    float ch = mix(c2, c1, smoothstep(0.0, 2.0 * blur, stripe_p));
    float border = w.x;
    ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe_p));

    bump = smoothstep(0.15, 0.85, bump);
    border = w.x + 0.4 * (1.0 - bump) * w.y;
    ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe_p));

    border = w.x + 0.52 * (1.0 - bump) * w.y;
    ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe_p));

    border = w.x + w.y;
    ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe_p));

    float gradient_t = (stripe_p - w.x - w.y) / max(w.z, 0.001);
    float gradient = mix(c1, c2, smoothstep(0.0, 1.0, gradient_t));
    ch = mix(ch, gradient, smoothstep(border, border + 0.5 * blur, stripe_p));

    // Warm color-burn blend with brand tint
    float burned = 1.0 - min(1.0, (1.0 - ch) / max(tint, 0.05));
    ch = mix(ch, burned, 0.58);
    return ch;
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewPos);

    // 3D Fresnel + refractive normal offset
    float ndotv = clamp(dot(N, V), 0.0, 1.0);
    float fresnel = pow(1.0 - ndotv, 2.4);

    // Map local 3D position + view-refracted normal into liquid UV coordinates
    vec2 baseUV = vLocalPos.xy * 0.42 + 0.5;
    vec3 refracted = refract(-V, N, 1.0 / (1.0 + u_refraction * 1.6));
    vec2 uv = baseUV + (N.xy * u_refraction * 0.48) + (refracted.xy * u_refraction * 0.25);

    float t = 0.35 * (u_time + 2.8);
    float cycleWidth = max(0.8, u_repetition);

    // Sample Poisson bevel map if available, combined with 3D normal curvature
    float edge = fresnel * u_contour;
    if (u_hasBevelMap) {
      vec2 sampleUV = clamp(vLocalPos.xy * 0.44 + 0.5, 0.01, 0.99);
      float poissonEdge = texture2D(u_bevelMap, vec2(sampleUV.x, 1.0 - sampleUV.y)).r;
      edge = mix(edge, pow(poissonEdge, 1.4), 0.45) * u_contour;
    }

    vec2 rotatedUV = rotate2D(uv - 0.5, (-u_angle + 70.0) * PI / 180.0) + 0.5;
    float diagBLtoTR = rotatedUV.x - rotatedUV.y;
    float diagTLtoBR = rotatedUV.x + rotatedUV.y;

    vec2 grad_uv = uv - 0.5;
    float dist = length(grad_uv + vec2(0.0, 0.2 * diagBLtoTR));
    grad_uv = rotate2D(grad_uv, (0.25 - 0.2 * diagBLtoTR) * PI);
    float direction = grad_uv.x;

    float bump = clamp(1.0 - pow(1.6 * dist, 1.2), 0.0, 1.0);
    bump = mix(bump, ndotv, 0.55);

    float noise = snoise(uv * 1.35 - vec2(t * 0.65, t * 0.45));
    float noiseFine = snoise(uv * 2.8 + vec2(t * 0.35, -t * 0.5));
    edge += (1.0 - edge) * u_distortion * (noise * 0.75 + noiseFine * 0.25);

    direction += diagBLtoTR + N.x * u_refraction * 0.85 + N.y * u_refraction * 0.55;
    direction -= 1.8 * noise * diagBLtoTR * (smoothstep(0.0, 1.0, edge) * (1.0 - smoothstep(0.0, 1.0, edge)));
    direction *= mix(1.0, 1.0 - edge * 0.65, smoothstep(0.3, 1.0, u_contour));
    direction -= 1.35 * edge * smoothstep(0.35, 1.0, u_contour);
    direction *= cycleWidth;
    direction -= t;

    float thin1 = 0.13 / cycleWidth * (1.0 - 0.35 * bump);
    float thin2 = 0.08 / cycleWidth * (1.0 + 0.35 * bump);
    float wide = 1.0 - thin1 - thin2;
    vec3 w = vec3( cycleWidth * thin1, cycleWidth * thin2, wide );

    float dispersionRed = (1.0 - bump) * (u_shiftRed / 12.0) + 0.025 * noise;
    float dispersionBlue = (1.0 - bump) * 1.25 * (u_shiftBlue / 12.0) - 0.02 * edge;
    float blur = 0.032 + 0.04 * fresnel;

    // Warm Chrome palette: Cream highlight (color1) vs Deep Warm Bronze shadow (color2), tinted by Brand Orange (#D97757)
    vec3 color1 = u_colorCream;
    vec3 color2 = mix(u_colorShadow, u_colorOrange * 0.38, smoothstep(0.4, 1.3, diagTLtoBR));
    vec3 warmTint = mix(u_colorCream, u_colorOrange, 0.72);

    float sr = fract(direction + dispersionRed);
    float sg = fract(direction);
    float sb = fract(direction - dispersionBlue);

    float r = getColorChanges(color1.r, color2.r, sr, w, blur, bump, warmTint.r);
    float g = getColorChanges(color1.g, color2.g, sg, w, blur, bump, warmTint.g);
    float b = getColorChanges(color1.b, color2.b, sb, w, blur, bump, warmTint.b);

    vec3 chromeColor = vec3(r, g, b);

    // Dynamic Time-Based Iridescence, Spectral Cosine Dispersion & Chromatic Refraction
    float effectiveTime = uTime > 0.0 ? uTime : u_time;
    vec3 spectralColor = 0.5 + 0.5 * cos(6.28318 * (effectiveTime * 0.22 + fresnel * 0.82 + (rotatedUV.x - rotatedUV.y) * 0.38 + vec3(0.04, 0.16, 0.28)));
    vec3 iridWarm = mix(u_colorOrange, spectralColor, 0.38);

    float iridCycle = sin(effectiveTime * 1.35 + fresnel * 3.8 + (rotatedUV.x - rotatedUV.y) * 2.5) * 0.5 + 0.5;
    vec3 iridShift = mix(u_colorOrange, u_colorCream, iridCycle * 0.55);
    chromeColor = mix(chromeColor, chromeColor * iridShift * 1.25 + iridWarm * 0.28, 0.36 * fresnel + 0.14 * bump);

    // Add warm orange, amber & cream specular rim reflections (#D97757 + #FFF8EE)
    vec3 lightDir1 = normalize(vec3(0.6, 0.8, 0.7));
    vec3 lightDir2 = normalize(vec3(-0.7, -0.4, 0.6));
    vec3 H1 = normalize(lightDir1 + V);
    vec3 H2 = normalize(lightDir2 + V);
    float specCream = pow(max(dot(N, H1), 0.0), 38.0);
    float specOrange = pow(max(dot(N, H2), 0.0), 20.0);

    chromeColor += u_colorCream * specCream * 0.58;
    chromeColor += u_colorOrange * (specOrange * 0.52 + fresnel * 0.44);
    chromeColor += iridWarm * (fresnel * 0.22);

    gl_FragColor = vec4(chromeColor, 1.0);
  }
`;

/**
 * Extracts 2D `THREE.Shape` contours from a transparent PNG's alpha channel using
 * Marching Squares + Chaikin curve smoothing so any dropped transparent PNG logo
 * converts into a smooth extruded 3D mesh.
 */
async function extractShapesFromPngAlpha(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const GRID = 96;
        const canvas = document.createElement('canvas');
        canvas.width = GRID;
        canvas.height = GRID;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, GRID, GRID);

        // Fit image with 10% padding so boundary contours are always closed
        const pad = Math.round(GRID * 0.1);
        const drawW = GRID - pad * 2;
        const drawH = GRID - pad * 2;
        ctx.drawImage(img, pad, pad, drawW, drawH);

        const { data } = ctx.getImageData(0, 0, GRID, GRID);
        const isSolid = (x, y) => {
          if (x < 0 || y < 0 || x >= GRID || y >= GRID) return false;
          const idx = (y * GRID + x) * 4;
          const alpha = data[idx + 3];
          return alpha > 96;
        };

        // Collect directed boundary edges around solid pixels
        const nextMap = new Map();
        const keyOf = (x, y) => `${x},${y}`;
        const addEdge = (x1, y1, x2, y2) => {
          const k1 = keyOf(x1, y1);
          if (!nextMap.has(k1)) nextMap.set(k1, []);
          nextMap.get(k1).push([x2, y2]);
        };

        for (let y = 0; y < GRID; y++) {
          for (let x = 0; x < GRID; x++) {
            if (!isSolid(x, y)) continue;
            if (!isSolid(x, y - 1)) addEdge(x, y, x + 1, y); // top
            if (!isSolid(x + 1, y)) addEdge(x + 1, y, x + 1, y + 1); // right
            if (!isSolid(x, y + 1)) addEdge(x + 1, y + 1, x, y + 1); // bottom
            if (!isSolid(x - 1, y)) addEdge(x, y + 1, x, y); // left
          }
        }

        const loops = [];
        for (const [startKey, edges] of nextMap.entries()) {
          while (edges.length > 0) {
            const [sx, sy] = startKey.split(',').map(Number);
            let curr = edges.pop();
            const pts = [[sx, sy]];
            let guard = 0;
            while (curr && guard++ < 8000) {
              const [cx, cy] = curr;
              if (cx === sx && cy === sy) break;
              pts.push([cx, cy]);
              const ck = keyOf(cx, cy);
              const nextList = nextMap.get(ck);
              if (!nextList || nextList.length === 0) break;
              curr = nextList.pop();
            }
            if (pts.length >= 12) {
              loops.push(pts);
            }
          }
        }

        // Laplacian + SplineCurve smoothing for ultra-smooth, liquid-mercury rounded bevels
        const smoothLoop = rawPts => {
          const stride = Math.max(2, Math.floor(rawPts.length / 42));
          let pts = rawPts.filter((_, i) => i % stride === 0);
          if (pts.length < 4) return rawPts;
          for (let pass = 0; pass < 4; pass++) {
            pts = pts.map((p, i) => {
              const prev = pts[(i - 1 + pts.length) % pts.length];
              const next = pts[(i + 1) % pts.length];
              return [
                0.25 * prev[0] + 0.5 * p[0] + 0.25 * next[0],
                0.25 * prev[1] + 0.5 * p[1] + 0.25 * next[1],
              ];
            });
          }
          const vectors = pts.map(
            ([px, py]) =>
              new THREE.Vector2(
                ((px / GRID) * 2 - 1) * 1.05,
                (1 - (py / GRID) * 2) * 1.05,
              ),
          );
          const curve = new THREE.SplineCurve([...vectors, vectors[0]]);
          return curve.getSpacedPoints(96).map(v => [v.x, v.y]);
        };

        const signedArea = pts => {
          let area = 0;
          for (let i = 0; i < pts.length; i++) {
            const [x1, y1] = pts[i];
            const [x2, y2] = pts[(i + 1) % pts.length];
            area += x1 * y2 - x2 * y1;
          }
          return area * 0.5;
        };

        const shapes = [];
        for (const raw of loops) {
          const smoothed = smoothLoop(raw);
          if (Math.abs(signedArea(smoothed)) < 0.008) continue;
          const shape = new THREE.Shape();
          smoothed.forEach(([x, y], idx) => {
            if (idx === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
          });
          shape.closePath();
          shapes.push(shape);
        }

        resolve(shapes);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

const COLOR_WARM_ORANGE = new THREE.Color('#D97757');
const COLOR_DEEP_AMBER = new THREE.Color('#C25A22');
const COLOR_GOLDEN_AMBER = new THREE.Color('#EFA046');
const COLOR_CREAM_BASE = new THREE.Color('#FFF8EE');
const COLOR_CREAM_GOLD = new THREE.Color('#FFEBC7');

const _tempColorOrange = new THREE.Color();
const _tempColorCream = new THREE.Color();

function LiquidLogoMesh({
  logoUrl,
  settings,
  pointerRef,
  isPausedRef,
  useStylizedPlaceholder,
}) {
  const groupRef = useRef(null);
  const materialRef = useRef(null);
  const [extrudedGeo, setExtrudedGeo] = useState(null);
  const [bevelTexture, setBevelTexture] = useState(null);

  // Build extruded 3D geometry & Poisson bevel texture when logoUrl changes
  useEffect(() => {
    let active = true;
    let createdGeo = null;
    let createdTex = null;

    if (!logoUrl || useStylizedPlaceholder) {
      setExtrudedGeo(null);
      return undefined;
    }

    extractShapesFromPngAlpha(logoUrl)
      .then(shapes => {
        if (!active || !shapes || shapes.length === 0) return;
        const geo = new THREE.ExtrudeGeometry(shapes, {
          depth: 0.34,
          bevelEnabled: true,
          bevelThickness: 0.09,
          bevelSize: 0.065,
          bevelOffset: 0,
          bevelSegments: 5,
          curveSegments: 16,
        });
        geo.center();
        geo.computeVertexNormals();
        createdGeo = geo;
        setExtrudedGeo(geo);
      })
      .catch(() => {
        if (active) setExtrudedGeo(null);
      });

    // Also run @paper-design/shaders Poisson bevel solver for authentic contour refraction
    toProcessedLiquidMetal(logoUrl)
      .then(result => {
        if (!active || !result?.imageData) return;
        const { imageData } = result;
        const tex = new THREE.DataTexture(
          new Uint8Array(imageData.data.buffer),
          imageData.width,
          imageData.height,
          THREE.RGBAFormat,
        );
        tex.needsUpdate = true;
        createdTex = tex;
        setBevelTexture(tex);
      })
      .catch(() => {
        /* Fallback to pure 3D normal curvature if Poisson solver skips */
      });

    return () => {
      active = false;
      createdGeo?.dispose();
      createdTex?.dispose();
    };
  }, [logoUrl, useStylizedPlaceholder]);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      uTime: { value: 0 },
      u_refraction: { value: settings.refraction },
      u_distortion: { value: settings.distortion },
      u_repetition: { value: settings.repetition },
      u_contour: { value: settings.contour },
      u_shiftRed: { value: settings.shiftRed },
      u_shiftBlue: { value: settings.shiftBlue },
      u_angle: { value: settings.angle },
      u_colorOrange: { value: new THREE.Color(settings.colorOrange) },
      u_colorCream: { value: new THREE.Color(settings.colorCream) },
      u_colorShadow: { value: new THREE.Color(settings.colorShadow) },
      u_bevelMap: { value: null },
      u_hasBevelMap: { value: false },
    }),
    [],
  );

  // Sync live tuning uniforms without re-creating the ShaderMaterial
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.u_refraction.value = settings.refraction;
    mat.uniforms.u_distortion.value = settings.distortion;
    mat.uniforms.u_repetition.value = settings.repetition;
    mat.uniforms.u_contour.value = settings.contour;
    mat.uniforms.u_shiftRed.value = settings.shiftRed;
    mat.uniforms.u_shiftBlue.value = settings.shiftBlue;
    mat.uniforms.u_angle.value = settings.angle;
    mat.uniforms.u_colorOrange.value.set(settings.colorOrange);
    mat.uniforms.u_colorCream.value.set(settings.colorCream);
    mat.uniforms.u_colorShadow.value.set(settings.colorShadow);
    mat.uniforms.u_bevelMap.value = bevelTexture;
    mat.uniforms.u_hasBevelMap.value = Boolean(bevelTexture);
  }, [settings, bevelTexture]);

  // All mathematical & shader time updates run strictly inside useFrame (zero React re-renders)
  useFrame((state, delta) => {
    if (isPausedRef.current || document.hidden) return;
    const clampedDelta = Math.min(delta, 0.05);
    const elapsedTime = state.clock.elapsedTime;

    if (materialRef.current) {
      const u = materialRef.current.uniforms;
      u.u_time.value += clampedDelta * settings.speed * 3.2;
      if (u.uTime) {
        u.uTime.value = u.u_time.value;
      }

      // Smooth time-based iridescence and continuous hue shifting:
      // Oscillate smoothly between warm chrome, brand orange #D97757, and deep amber
      const cycle1 = (Math.sin(elapsedTime * 0.85) + 1.0) * 0.5;
      const cycle2 = (Math.sin(elapsedTime * 0.42 + 1.8) + 1.0) * 0.5;

      _tempColorOrange
        .copy(COLOR_WARM_ORANGE)
        .lerp(COLOR_DEEP_AMBER, cycle1)
        .lerp(COLOR_GOLDEN_AMBER, cycle2 * 0.52);

      _tempColorCream
        .copy(COLOR_CREAM_BASE)
        .lerp(COLOR_CREAM_GOLD, cycle1 * 0.35);

      // Mutate uniform colors directly via reference (zero allocations per frame)
      u.u_colorOrange.value.copy(_tempColorOrange);
      u.u_colorCream.value.copy(_tempColorCream);
    }

    if (groupRef.current) {
      const targetRotY = pointerRef.current.x * 0.42 + Math.sin( performance.now() * 0.00045 ) * 0.14;
      const targetRotX = -pointerRef.current.y * 0.32 + Math.cos( performance.now() * 0.00038 ) * 0.08;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        1 - Math.exp(-5.5 * clampedDelta),
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX,
        1 - Math.exp(-5.5 * clampedDelta),
      );
    }
  });

  const sharedShaderMaterial = (
    <shaderMaterial
      ref={materialRef}
      vertexShader={VERTEX_SHADER}
      fragmentShader={FRAGMENT_SHADER}
      uniforms={uniforms}
    />
  );

  return (
    <Float
      speed={settings.floatSpeed}
      rotationIntensity={0.32}
      floatIntensity={settings.floatIntensity}
      floatingRange={[-0.09, 0.09]}
    >
      <group ref={groupRef}>
        {/* Subtle rounded warm-chrome pedestal ring framing the 3D logo */}
        <mesh position={[0, 0, -0.22]}>
          <torusGeometry args={[1.12, 0.052, 28, 112]} />
          {sharedShaderMaterial}
        </mesh>

        {extrudedGeo && !useStylizedPlaceholder ? (
          <mesh geometry={extrudedGeo} scale={[0.88, 0.88, 1]}>
            {sharedShaderMaterial}
          </mesh>
        ) : (
          /* Stylized rounded 3D placeholder emblem */
          <group>
            <RoundedBox args={[1.45, 1.45, 0.36]} radius={0.32} smoothness={6}>
              {sharedShaderMaterial}
            </RoundedBox>
            <mesh position={[0.45, -0.42, 0.22]}>
              <sphereGeometry args={[0.2, 32, 32]} />
              {sharedShaderMaterial}
            </mesh>
          </group>
        )}
      </group>
    </Float>
  );
}

export default function LiquidLogo3D({
  effectsEnabled = true,
  suspended = false,
}) {
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const isPausedRef = useRef(false);

  const [logoUrl, setLogoUrl] = useState(workspaceLogoUrl || '/logo.png');
  const [customFileName, setCustomFileName] = useState('');
  const [useStylizedPlaceholder, setUseStylizedPlaceholder] = useState(false);
  const [tunerOpen, setTunerOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_LIQUID_SETTINGS);
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);
  const [inView, setInView] = useState(true);

  const isPaused = !effectsEnabled || suspended || !tabVisible || !inView;
  isPausedRef.current = isPaused;

  // Pause animation completely when browser tab is not visible
  useEffect(() => {
    const onVisibilityChange = () => {
      setTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  // Pause WebGL loop when scrolled out of the viewport
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Lightweight pointer tracking into a ref (never triggers React state re-renders)
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const handlePointerMove = event => {
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      pointerRef.current.x = Math.max(-1, Math.min(1, nx));
      pointerRef.current.y = Math.max(-1, Math.min(1, ny));
    };

    const handlePointerLeave = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    node.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      node.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  const handleFileChange = file => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setLogoUrl(objectUrl);
    setCustomFileName(file.name);
    setUseStylizedPlaceholder(false);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div
      ref={containerRef}
      className="liquid-logo-stage"
      onDragOver={event => event.preventDefault()}
      onDrop={event => {
        event.preventDefault();
        const droppedFile = event.dataTransfer?.files?.[0];
        if (droppedFile) handleFileChange(droppedFile);
      }}
    >
      <div className="liquid-logo-stage__glow" aria-hidden="true" />

      <div className="liquid-logo-stage__canvas-wrap">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 4.05], fov: 36 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          frameloop={isPaused ? 'never' : 'always'}
        >
          <LiquidLogoMesh
            logoUrl={logoUrl}
            settings={settings}
            pointerRef={pointerRef}
            isPausedRef={isPausedRef}
            useStylizedPlaceholder={useStylizedPlaceholder}
          />
        </Canvas>
      </div>

      {/* Bottom status bar + live tuning controls */}
      <div className="liquid-logo-stage__bar">
        <div className="liquid-logo-stage__badge">
          <Sparkles size={13} aria-hidden="true" />
          <span>Warm Chrome · #D97757</span>
          {customFileName && <small>· {customFileName}</small>}
        </div>

        <div className="liquid-logo-stage__actions">
          <button
            type="button"
            className="liquid-logo-btn"
            onClick={() => setUseStylizedPlaceholder(prev => !prev)}
            title="Switch between Extruded PNG Logo and Stylized 3D Rounded Emblem"
          >
            {useStylizedPlaceholder ? 'Extruded PNG' : 'Rounded 3D'}
          </button>
          <button
            type="button"
            className="liquid-logo-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Load a custom transparent PNG logo"
          >
            <Upload size={13} aria-hidden="true" />
            <span>Load PNG</span>
          </button>
          <button
            type="button"
            className={`liquid-logo-btn ${tunerOpen ? 'is-active' : ''}`}
            onClick={() => setTunerOpen(open => !open)}
            aria-expanded={tunerOpen}
            title="Open live shader & refraction tuner"
          >
            <Sliders size={13} aria-hidden="true" />
            <span>Tune</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/svg+xml,image/webp"
            hidden
            onChange={event => handleFileChange(event.target.files?.[0])}
          />
        </div>
      </div>

      {tunerOpen && (
        <div className="liquid-logo-tuner glass" role="region" aria-label="Live Liquid Metal Shader Tuner">
          <div className="liquid-logo-tuner__head">
            <strong>Live Shader Tuning</strong>
            <button
              type="button"
              className="liquid-logo-tuner__reset"
              onClick={() => setSettings(DEFAULT_LIQUID_SETTINGS)}
            >
              <RotateCcw size={12} aria-hidden="true" /> Reset
            </button>
          </div>
          <label className="liquid-logo-tuner__row">
            <span>Speed ({settings.speed.toFixed(2)})</span>
            <input
              type="range"
              min="0"
              max="1.2"
              step="0.02"
              value={settings.speed}
              onChange={e => updateSetting('speed', parseFloat(e.target.value))}
            />
          </label>
          <label className="liquid-logo-tuner__row">
            <span>Refraction ({settings.refraction.toFixed(2)})</span>
            <input
              type="range"
              min="0.02"
              max="0.75"
              step="0.01"
              value={settings.refraction}
              onChange={e => updateSetting('refraction', parseFloat(e.target.value))}
            />
          </label>
          <label className="liquid-logo-tuner__row">
            <span>Distortion ({settings.distortion.toFixed(2)})</span>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={settings.distortion}
              onChange={e => updateSetting('distortion', parseFloat(e.target.value))}
            />
          </label>
          <label className="liquid-logo-tuner__row">
            <span>Stripe Density ({settings.repetition.toFixed(1)})</span>
            <input
              type="range"
              min="1"
              max="6"
              step="0.1"
              value={settings.repetition}
              onChange={e => updateSetting('repetition', parseFloat(e.target.value))}
            />
          </label>
          <label className="liquid-logo-tuner__row">
            <span>Contour Bevel ({settings.contour.toFixed(2)})</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.02"
              value={settings.contour}
              onChange={e => updateSetting('contour', parseFloat(e.target.value))}
            />
          </label>
        </div>
      )}
    </div>
  );
}

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Text, Stars } from "@react-three/drei";
import { geoContains, geoEquirectangular, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import countries110m from "world-atlas/countries-110m.json";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import "./styles.css";
import "./fixes.css";
import "./inventory.css";

const RADIUS = 2.28;
const WORLD_FEATURES = feature(
  countries110m,
  countries110m.objects.countries,
).features;
const COUNTRY_DATA = {
  410: {
    key: "korea",
    name: "대한민국",
    english: "SOUTH KOREA",
    flag: "🇰🇷",
    lat: 36.25,
    lon: 127.9,
    color: "#f3a7ad",
    fact: "전통과 첨단이 나란히 숨 쉬는 반도 국가예요.",
    items: [
      ["궁궐", "경복궁", "조선 왕조의 첫 궁궐"],
      ["꽃", "무궁화", "끈기와 영원을 상징하는 국화"],
      ["동물", "호랑이", "용맹함과 수호의 상징"],
    ],
  },
  392: {
    key: "japan",
    name: "일본",
    english: "JAPAN",
    flag: "🇯🇵",
    lat: 36.2,
    lon: 138.25,
    color: "#f2aaa8",
    fact: "길게 이어진 섬마다 계절과 풍경이 다채로워요.",
    items: [
      ["건축", "후지산", "일본을 대표하는 아름다운 성층화산"],
      ["꽃", "벚꽃", "봄과 새로운 시작의 상징"],
      ["동물", "시바견", "영리하고 씩씩한 일본 토종견"],
    ],
  },
  250: {
    key: "france",
    name: "프랑스",
    english: "FRANCE",
    flag: "🇫🇷",
    lat: 46.23,
    lon: 2.21,
    color: "#9cafd5",
    fact: "예술과 미식, 오래된 도시가 어우러진 나라예요.",
    items: [
      ["건축", "에펠탑", "파리의 하늘을 수놓는 철제 탑"],
      ["꽃", "아이리스", "왕실 문장에 쓰인 우아한 꽃"],
      ["동물", "수탉", "용기와 당당함을 뜻하는 상징"],
    ],
  },
};

function latLonVector(lat, lon, radius = RADIUS) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function makeEarthTexture() {
  const canvas = document.createElement("canvas");
  const bumpCanvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  bumpCanvas.width = 2048;
  bumpCanvas.height = 1024;
  const context = canvas.getContext("2d");
  const bump = bumpCanvas.getContext("2d");
  context.fillStyle = "#79cbd3";
  context.fillRect(0, 0, canvas.width, canvas.height);
  bump.fillStyle = "#050505";
  bump.fillRect(0, 0, bumpCanvas.width, bumpCanvas.height);
  const projection = geoEquirectangular().translate([1024, 512]).scale(325.95);
  const path = geoPath(projection, context);
  const bumpPath = geoPath(projection, bump);
  const land = feature(countries110m, countries110m.objects.land);
  context.beginPath();
  path(land);
  context.fillStyle = "#a8c983";
  context.fill();
  bump.beginPath();
  bumpPath(land);
  bump.fillStyle = "#f7f7f7";
  bump.fill();
  const color = new THREE.CanvasTexture(canvas);
  const height = new THREE.CanvasTexture(bumpCanvas);
  color.colorSpace = THREE.SRGBColorSpace;
  color.anisotropy = 8;
  height.anisotropy = 8;
  return { color, height };
}

function Landmark({ type }) {
  const mat = (c) => <meshStandardMaterial color={c} roughness={0.82} />;
  if (type === "korea")
    return (
      <group>
        <RoundedBox args={[0.72, 0.16, 0.48]} radius={0.06} position-y={0.08}>
          {mat("#eecb98")}
        </RoundedBox>
        <mesh position-y={0.28}>
          <cylinderGeometry args={[0.44, 0.5, 0.18, 4]} />
          {mat("#7dafa0")}
        </mesh>
        <RoundedBox args={[0.42, 0.28, 0.3]} radius={0.05} position-y={0.34}>
          {mat("#d98574")}
        </RoundedBox>
        <mesh position-y={0.55}>
          <cylinderGeometry args={[0.36, 0.43, 0.16, 4]} />
          {mat("#709c8f")}
        </mesh>
      </group>
    );
  if (type === "japan")
    return (
      <group>
        <mesh position-y={0.28}>
          <coneGeometry args={[0.48, 0.72, 48]} />
          {mat("#dce6e5")}
        </mesh>
        <mesh position={[0, 0.48, 0.01]}>
          <coneGeometry args={[0.25, 0.34, 48]} />
          {mat("#fff7ed")}
        </mesh>
        <mesh position={[-0.34, 0.08, 0.05]}>
          <sphereGeometry args={[0.18, 20, 20]} />
          {mat("#f2aeb9")}
        </mesh>
      </group>
    );
  return (
    <group>
      <mesh position-y={0.38}>
        <cylinderGeometry args={[0.055, 0.2, 0.78, 4]} />
        {mat("#8ea8bb")}
      </mesh>
      <mesh position-y={0.78}>
        <sphereGeometry args={[0.07, 16, 16]} />
        {mat("#e9b96f")}
      </mesh>
      <mesh position-y={0.12} rotation-z={Math.PI / 2}>
        <torusGeometry args={[0.23, 0.055, 10, 4, Math.PI]} />
        {mat("#8ea8bb")}
      </mesh>
    </group>
  );
}

function Flower({ type }) {
  const color =
    type === "france" ? "#a9a4dc" : type === "japan" ? "#f3a8bd" : "#e7a5bf";
  return (
    <group>
      <mesh position-y={0.19}>
        <cylinderGeometry args={[0.025, 0.03, 0.38, 12]} />
        <meshStandardMaterial color="#7eae7b" />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * 1.256) * 0.13,
            0.38,
            Math.sin(i * 1.256) * 0.13,
          ]}
        >
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      <mesh position-y={0.38}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color="#f3cc72" />
      </mesh>
    </group>
  );
}

function Animal({ type }) {
  const color =
    type === "korea" ? "#e8a563" : type === "japan" ? "#d8a273" : "#df8c69";
  return (
    <group>
      <mesh position-y={0.25}>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.48, 0.02]}>
        <sphereGeometry args={[0.21, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.13, 0.65, 0]} rotation-z={s * 0.35}>
          <coneGeometry args={[0.1, 0.18, 18]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      <mesh position={[-0.075, 0.5, 0.19]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color="#493d3a" />
      </mesh>
      <mesh position={[0.075, 0.5, 0.19]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color="#493d3a" />
      </mesh>
      <mesh position={[0, 0.43, 0.205]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#7c5a52" />
      </mesh>
    </group>
  );
}

function Miniatures({ country, visible }) {
  const group = useRef();
  const anchor = useMemo(
    () => latLonVector(country.lat, country.lon, RADIUS + 0.06),
    [country],
  );
  const up = useMemo(() => anchor.clone().normalize(), [anchor]);
  const q = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up),
    [up],
  );
  useFrame((_, delta) => {
    if (!group.current) return;
    const target = visible ? 1 : 0;
    group.current.scale.lerp(
      new THREE.Vector3(target, target, target),
      1 - Math.exp(-delta * 5),
    );
  });
  return (
    <group ref={group} position={anchor} quaternion={q} scale={0}>
      <group position={[-0.46, 0.05, 0]} scale={0.55}>
        <Landmark type={country.key} />
      </group>
      <group position={[0.08, 0.05, 0.25]} scale={0.62}>
        <Flower type={country.key} />
      </group>
      <group position={[0.45, 0.05, -0.12]} scale={0.62}>
        <Animal type={country.key} />
      </group>
      <Text
        position={[0, 0.78, 0]}
        fontSize={0.15}
        color="#5d5046"
        anchorX="center"
        outlineWidth={0.008}
        outlineColor="#fff8ee"
      >
        {country.name}
      </Text>
    </group>
  );
}

function Globe({ selectedId, onSelect, onReady }) {
  const globe = useRef();
  const controls = useRef();
  const [revealed, setRevealed] = useState(false);
  const { camera, size } = useThree();
  const earthTexture = useMemo(makeEarthTexture, []);
  useEffect(() => {
    const aspect = size.width / size.height;
    const frameScale = aspect < 1 ? Math.min(1.9, 1 / aspect) : 1;
    if (!selectedId) camera.position.set(0, 0.1, 6.7 * frameScale);
  }, [size.width, size.height, selectedId, camera]);
  const handleEarthClick = (e) => {
    e.stopPropagation();
    const local = globe.current.worldToLocal(e.point.clone()).normalize();
    const lat = THREE.MathUtils.radToDeg(Math.asin(local.y));
    let lon = THREE.MathUtils.radToDeg(Math.atan2(local.z, -local.x)) - 180;
    if (lon < -180) lon += 360;
    const hit = WORLD_FEATURES.find((f) => geoContains(f, [lon, lat]));
    const id = hit ? String(hit.id).padStart(3, "0") : null;
    if (COUNTRY_DATA[id]) onSelect(id);
  };
  useEffect(() => {
    setRevealed(false);
    if (selectedId) setTimeout(() => setRevealed(true), 850);
  }, [selectedId]);
  useFrame((state, delta) => {
    if (!globe.current) return;
    const aspect = state.size.width / state.size.height;
    const frameScale = aspect < 1 ? Math.min(1.9, 1 / aspect) : 1;
    if (!selectedId) globe.current.rotation.y += delta * 0.12;
    if (selectedId) {
      const c = COUNTRY_DATA[selectedId];
      const point = latLonVector(c.lat, c.lon, 1).normalize();
      const targetQ = new THREE.Quaternion().setFromUnitVectors(
        point,
        new THREE.Vector3(0, 0, 1),
      );
      globe.current.quaternion.slerp(targetQ, 1 - Math.exp(-delta * 2.2));
      state.camera.position.lerp(
        new THREE.Vector3(0, 0.05, 6.1 * frameScale),
        1 - Math.exp(-delta * 2.4),
      );
    }
  });
  useEffect(() => onReady?.(), [onReady]);
  return (
    <>
      <group ref={globe} rotation={[0.08, -0.8, -0.04]}>
        <mesh
          castShadow
          receiveShadow
          onClick={handleEarthClick}
          onDoubleClick={() => {
            onSelect(null);
            const aspect = size.width / size.height;
            camera.position.set(
              0,
              0.1,
              6.7 * (aspect < 1 ? Math.min(1.9, 1 / aspect) : 1),
            );
          }}
        >
          <sphereGeometry args={[RADIUS, 192, 128]} />
          <meshStandardMaterial
            map={earthTexture.color}
            displacementMap={earthTexture.height}
            displacementScale={0.09}
            bumpMap={earthTexture.height}
            bumpScale={0.052}
            roughness={0.94}
            metalness={0}
          />
        </mesh>
      </group>
      <OrbitControls
        ref={controls}
        enablePan={false}
        minDistance={5.8}
        maxDistance={9.5}
        zoomSpeed={0.85}
        autoRotate={false}
        rotateSpeed={0.72}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  );
}

const DAYS_FROM_J2000 =
  (Date.UTC(2026, 10, 13) - Date.UTC(2000, 0, 1, 12)) / 86400000;
const PLANET_FACTS = [
  ["수성", 0.387, 0.383, "#a9a59f", 87.97, 252.25],
  ["금성", 0.723, 0.949, "#ffb52e", 224.7, 181.98],
  ["지구", 1, 1, "#18c7da", 365.256, 100.46],
  ["화성", 1.524, 0.532, "#ff5a36", 686.98, 355.45],
  ["목성", 5.203, 10.97, "#ff8a45", 4332.59, 34.4],
  ["토성", 9.537, 9.14, "#ffd45f", 10759.22, 49.95],
  ["천왕성", 19.19, 3.98, "#49e4dc", 30688.5, 313.24],
  ["해왕성", 30.07, 3.86, "#2878ff", 60182, 304.88],
];
const PLANETS = PLANET_FACTS.map(
  ([name, au, radius, color, period, longitude]) => [
    name,
    0.55 + 1.15 * Math.log1p(au),
    0.09 * Math.pow(radius, 0.35),
    color,
    365.256 / period,
    THREE.MathUtils.degToRad(
      (longitude + (360 * DAYS_FROM_J2000) / period) % 360,
    ),
  ],
);

const MOONS = {
  지구: [["달", 0.29, 0.045, "#c8c3b8"]],
  화성: [
    ["포보스", 0.22, 0.025, "#9b806b"],
    ["데이모스", 0.3, 0.018, "#b39b82"],
  ],
  목성: [
    ["이오", 0.46, 0.035, "#e7bd64"],
    ["유로파", 0.56, 0.03, "#d8c7a1"],
    ["가니메데", 0.68, 0.045, "#9c8f80"],
    ["칼리스토", 0.8, 0.042, "#766d67"],
  ],
  토성: [
    ["타이탄", 0.53, 0.05, "#d3a85d"],
    ["엔셀라두스", 0.65, 0.025, "#dce8ea"],
  ],
  천왕성: [
    ["티타니아", 0.39, 0.032, "#b9c5c1"],
    ["오베론", 0.48, 0.03, "#8f9995"],
  ],
  해왕성: [["트리톤", 0.38, 0.04, "#c6d2cf"]],
};

const DISCOVERY_INFO = {
  수성: ["☿", "태양에 가장 가까운 작고 회색인 암석 행성"],
  금성: ["♀", "두꺼운 구름에 둘러싸인 가장 뜨거운 행성"],
  지구: ["🌍", "푸른 바다와 생명이 있는 우리의 행성"],
  화성: ["♂", "산화철 때문에 붉게 보이는 암석 행성"],
  목성: ["♃", "대적점과 줄무늬를 가진 가장 큰 가스 행성"],
  토성: ["♄", "얼음과 암석으로 된 아름다운 고리의 행성"],
  천왕성: ["⛢", "옆으로 누운 채 공전하는 청록색 얼음 행성"],
  해왕성: ["♆", "강한 바람이 부는 가장 먼 푸른 행성"],
  달: ["🌙", "지구의 유일한 자연 위성"],
  포보스: ["🪨", "화성 가까이 빠르게 도는 울퉁불퉁한 위성"],
  데이모스: ["🪨", "화성의 작고 먼 바깥쪽 위성"],
  이오: ["🌋", "태양계에서 화산 활동이 가장 활발한 천체"],
  유로파: ["🧊", "얼음 아래 바다가 있을 것으로 추정되는 위성"],
  가니메데: ["🌕", "태양계에서 가장 큰 위성"],
  칼리스토: ["🌑", "충돌 흔적이 가득한 목성의 위성"],
  타이탄: ["🟠", "짙은 대기와 액체 메탄 호수가 있는 위성"],
  엔셀라두스: ["💧", "얼음 틈에서 물기둥을 뿜는 작은 위성"],
  티타니아: ["🌘", "천왕성에서 가장 큰 위성"],
  오베론: ["🌒", "어둡고 충돌구가 많은 천왕성의 위성"],
  트리톤: ["❄️", "해왕성을 거꾸로 공전하는 차가운 위성"],
  혜성: ["☄️", "얼음과 먼지가 만든 꼬리를 빛내며 지나가는 여행자"],
};
const SCIENCE_LAYER = {
  수성: "대기층 거의 없음 · 충돌구와 절벽이 많은 암석 표면",
  금성: "황산 구름층 · 이산화탄소 대기 · 화산성 암석 지형",
  지구: "질소·산소 대기 · 액체 바다 · 대륙 지각",
  화성: "희박한 이산화탄소 대기 · 산화철 사막 · 극지 얼음",
  목성: "암모니아 구름층 · 수소·헬륨 대기 · 고체 표면 없음",
  토성: "암모니아 구름층 · 수소·헬륨 대기 · 고체 표면 없음",
  천왕성: "메탄 대기 · 물·암모니아 얼음층 · 고체 표면 없음",
  해왕성: "메탄 구름과 폭풍 · 깊은 얼음층 · 고체 표면 없음",
};

const ELEMENT_SYMBOLS =
  `H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og`.split(
    " ",
  );
const ELEMENT_GAME_INFO = {
  H: [
    "수소",
    "물과 유기물의 핵심이며 호흡용 물 생산과 로켓 연료에 쓰입니다.",
    5,
    5,
    2,
  ],
  He: [
    "헬륨",
    "장비 냉각과 기밀 검사에 유용하며 미래 핵융합 연료로 가치가 높습니다.",
    1,
    4,
    4,
  ],
  Li: [
    "리튬",
    "고밀도 배터리를 만들어 탐사차와 우주선의 항속 거리를 늘립니다.",
    2,
    5,
    5,
  ],
  Be: [
    "베릴륨",
    "가볍고 단단한 우주선 구조재지만 분진은 생명체에 위험합니다.",
    0,
    4,
    5,
  ],
  B: [
    "붕소",
    "식물 성장에 필요하고 방사선 차폐재와 고강도 섬유에 쓰입니다.",
    3,
    4,
    3,
  ],
  C: [
    "탄소",
    "모든 유기 생명과 연료·플라스틱·탄소섬유 제작의 기반입니다.",
    5,
    4,
    3,
  ],
  N: [
    "질소",
    "호흡 가능한 대기압과 비료를 만들며 생태계를 안정시킵니다.",
    5,
    2,
    2,
  ],
  O: [
    "산소",
    "호흡과 물 생산에 필수이며 강력한 로켓 산화제로도 사용됩니다.",
    5,
    5,
    3,
  ],
  F: [
    "플루오린",
    "고성능 화학 추진제와 정제 공정에 쓰이나 독성이 매우 강합니다.",
    0,
    4,
    4,
  ],
  Ne: ["네온", "냉각·표시 장치와 정밀 센서에 쓰이는 희귀 가스입니다.", 1, 2, 4],
  Na: [
    "나트륨",
    "생체 전해질이며 열전달 장치와 저가형 배터리에 활용됩니다.",
    4,
    3,
    2,
  ],
  Mg: [
    "마그네슘",
    "가벼운 합금과 조명탄을 만들어 우주선 질량을 줄입니다.",
    2,
    4,
    3,
  ],
  Al: [
    "알루미늄",
    "가볍고 가공하기 쉬워 선체·거주지·연료 탱크의 기본 재료입니다.",
    1,
    5,
    3,
  ],
  Si: [
    "규소",
    "유리·태양전지·컴퓨터 칩을 만들어 기지 자동화를 가능하게 합니다.",
    2,
    5,
    4,
  ],
  P: [
    "인",
    "DNA와 세포 에너지에 필수이며 비료 생산의 핵심 자원입니다.",
    5,
    2,
    4,
  ],
  S: [
    "황",
    "비료·산·고무·화학 연료 생산에 쓰이는 산업 기초 자원입니다.",
    2,
    3,
    3,
  ],
  Cl: [
    "염소",
    "물 소독과 산소 생산 공정에 쓰이지만 고농도에서는 독성입니다.",
    3,
    2,
    2,
  ],
  Ar: [
    "아르곤",
    "용접 보호가스와 이온 엔진 추진제로 안정적이고 유용합니다.",
    1,
    4,
    3,
  ],
  K: [
    "칼륨",
    "신경과 식물 성장에 필수이며 비료와 열저장 장치에 쓰입니다.",
    5,
    2,
    3,
  ],
  Ca: [
    "칼슘",
    "뼈 건강과 식량 생산, 시멘트·세라믹 거주지 건설에 필요합니다.",
    4,
    3,
    2,
  ],
  Ti: [
    "티타늄",
    "가볍고 내열성이 높아 엔진과 고급 선체에 매우 유리합니다.",
    1,
    5,
    5,
  ],
  Cr: [
    "크로뮴",
    "부식에 강한 합금을 만들어 우주선 수명을 크게 늘립니다.",
    0,
    4,
    4,
  ],
  Mn: [
    "망가니즈",
    "강철과 배터리 성능을 높여 중장비 제작에 도움을 줍니다.",
    1,
    4,
    3,
  ],
  Fe: [
    "철",
    "기지·도구·선체를 만드는 가장 중요한 범용 건축 자원입니다.",
    2,
    5,
    3,
  ],
  Co: [
    "코발트",
    "고온 합금과 배터리에 쓰여 엔진 성능과 저장 전력을 높입니다.",
    1,
    5,
    5,
  ],
  Ni: [
    "니켈",
    "내열 합금·배터리·촉매에 쓰이는 우주 산업 핵심 금속입니다.",
    1,
    5,
    4,
  ],
  Cu: ["구리", "전선·모터·열교환기를 만들어 전력망 효율을 높입니다.", 2, 5, 4],
  Zn: ["아연", "부식 방지와 배터리, 생체 효소 유지에 도움을 줍니다.", 3, 3, 3],
  Ga: [
    "갈륨",
    "고효율 태양전지와 통신 반도체에 쓰이는 고가 자원입니다.",
    0,
    4,
    5,
  ],
  Ge: [
    "저마늄",
    "적외선 센서와 고성능 태양전지를 만드는 희귀 반도체입니다.",
    0,
    4,
    5,
  ],
  Se: ["셀레늄", "미량 영양소이며 태양전지와 광센서 생산에 쓰입니다.", 2, 3, 4],
  Kr: [
    "크립톤",
    "고성능 이온 엔진과 조명에 쓰이는 희귀 추진 자원입니다.",
    0,
    4,
    5,
  ],
  Ag: [
    "은",
    "최고급 전기 접점·항균 장치에 쓰이며 거래 가치도 높습니다.",
    2,
    4,
    5,
  ],
  Cd: [
    "카드뮴",
    "배터리와 방사선 차폐에 쓰이지만 강한 독성 관리가 필요합니다.",
    0,
    3,
    4,
  ],
  Sn: ["주석", "전자 회로 납땜과 부식 방지 합금에 꼭 필요합니다.", 0, 4, 3],
  I: [
    "아이오딘",
    "갑상선 건강과 소독에 필요하며 소형 이온 엔진 연료로도 씁니다.",
    4,
    3,
    4,
  ],
  Xe: [
    "제논",
    "효율 높은 이온 엔진의 최고급 추진제라 탈출 임무 가치가 큽니다.",
    0,
    5,
    5,
  ],
  W: [
    "텅스텐",
    "초고온 엔진 노즐과 방사선 차폐에 적합한 전략 금속입니다.",
    0,
    5,
    5,
  ],
  Pt: [
    "백금",
    "연료전지와 촉매에 필수이며 매우 높은 가격에 거래됩니다.",
    0,
    4,
    5,
  ],
  Au: [
    "금",
    "부식 없는 전자 접점과 열 차폐막에 쓰이는 최고가 거래 자원입니다.",
    0,
    3,
    5,
  ],
  Hg: [
    "수은",
    "센서와 연구에 쓰이지만 생명체에 치명적이라 격리가 필요합니다.",
    0,
    1,
    3,
  ],
  Pb: ["납", "방사선 차폐에 효과적이지만 무겁고 독성이 있습니다.", 0, 2, 2],
  U: [
    "우라늄",
    "장거리 원자로와 핵추진 동력원이지만 방사선 관리가 필수입니다.",
    0,
    5,
    5,
  ],
};
function elementGameInfo(symbol, index) {
  if (ELEMENT_GAME_INFO[symbol]) return ELEMENT_GAME_INFO[symbol];
  const heavy = index > 56,
    synthetic = index > 91;
  return [
    symbol,
    synthetic
      ? "자연에서 거의 얻기 어려운 연구용 원소입니다. 발견하면 과학 점수와 희귀 표본 가치가 크게 오릅니다."
      : heavy
        ? "정밀 장비·특수 합금 연구에 사용하는 희귀 자원입니다. 생존보다는 기술 해금과 거래에 유리합니다."
        : "기초 화학·합금 연구에 활용되는 산업 자원입니다. 새로운 제작법을 해금하는 데 쓰입니다.",
    0,
    heavy ? 3 : 2,
    synthetic ? 5 : heavy ? 4 : 2,
  ];
}
function periodicPosition(number) {
  if (number === 1) return { gridColumn: 1, gridRow: 1 };
  if (number === 2) return { gridColumn: 18, gridRow: 1 };
  if (number >= 3 && number <= 4) return { gridColumn: number - 2, gridRow: 2 };
  if (number >= 5 && number <= 10)
    return { gridColumn: number + 8, gridRow: 2 };
  if (number >= 11 && number <= 12)
    return { gridColumn: number - 10, gridRow: 3 };
  if (number >= 13 && number <= 18) return { gridColumn: number, gridRow: 3 };
  if (number >= 19 && number <= 36)
    return { gridColumn: number - 18, gridRow: 4 };
  if (number >= 37 && number <= 54)
    return { gridColumn: number - 36, gridRow: 5 };
  if (number === 55) return { gridColumn: 1, gridRow: 6 };
  if (number === 56) return { gridColumn: 2, gridRow: 6 };
  if (number >= 57 && number <= 71)
    return { gridColumn: number - 54, gridRow: 8 };
  if (number >= 72 && number <= 86)
    return { gridColumn: number - 68, gridRow: 6 };
  if (number === 87) return { gridColumn: 1, gridRow: 7 };
  if (number === 88) return { gridColumn: 2, gridRow: 7 };
  if (number >= 89 && number <= 103)
    return { gridColumn: number - 86, gridRow: 9 };
  return { gridColumn: number - 100, gridRow: 7 };
}
const BODY_START_DATA = {
  수성: {
    kind: "행성",
    gravity: 3.7,
    difficulty: "극한",
    env: "진공 · 극심한 일교차 · 금속 지각",
    confirmed: "Fe O Si Mg S Ca Al Na K".split(" "),
    inferred: "C Cr Mn Ti".split(" "),
  },
  금성: {
    kind: "행성",
    gravity: 8.87,
    difficulty: "극한",
    env: "고압 CO₂ · 황산 구름 · 현무암 지표",
    confirmed: "C O N S H Cl F Ar".split(" "),
    inferred: "Si Fe Mg Al Ca Na K Ti".split(" "),
  },
  지구: {
    kind: "행성",
    gravity: 9.81,
    difficulty: "쉬움",
    env: "질소·산소 대기 · 액체 바다 · 암석 지각",
    confirmed:
      "H He C N O Ne Na Mg Al Si P S Cl Ar K Ca Ti Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Ag Cd Sn I Xe Ba W Pt Au Hg Pb U".split(
        " ",
      ),
    inferred: [],
  },
  화성: {
    kind: "행성",
    gravity: 3.71,
    difficulty: "보통",
    env: "희박한 CO₂ · 산화철 사막 · 물얼음",
    confirmed: "H C N O Na Mg Al Si P S Cl Ar K Ca Ti Cr Mn Fe Ni".split(" "),
    inferred: "Li B F Cu Zn Br".split(" "),
  },
  목성: {
    kind: "행성",
    gravity: 24.79,
    difficulty: "극한",
    env: "수소·헬륨 대기 · 거대 폭풍 · 고체 표면 없음",
    confirmed: "H He C N O S P Ar".split(" "),
    inferred: "Ne Kr Xe".split(" "),
  },
  토성: {
    kind: "행성",
    gravity: 10.44,
    difficulty: "어려움",
    env: "수소·헬륨 대기 · 암모니아 구름 · 고체 표면 없음",
    confirmed: "H He C N O S P".split(" "),
    inferred: "Ne Ar".split(" "),
  },
  천왕성: {
    kind: "행성",
    gravity: 8.69,
    difficulty: "극한",
    env: "메탄 대기 · 물·암모니아 얼음층",
    confirmed: "H He C O N S".split(" "),
    inferred: "Ne Ar".split(" "),
  },
  해왕성: {
    kind: "행성",
    gravity: 11.15,
    difficulty: "극한",
    env: "메탄 대기 · 초고속 폭풍 · 얼음층",
    confirmed: "H He C O N S".split(" "),
    inferred: "Ne Ar".split(" "),
  },
  달: {
    kind: "위성",
    gravity: 1.62,
    difficulty: "보통",
    env: "진공 · 규산염 암석 · 극지 물얼음",
    confirmed: "H O Na Mg Al Si P S K Ca Ti Cr Mn Fe".split(" "),
    inferred: "C N He Ne Ar".split(" "),
  },
  포보스: {
    kind: "위성",
    gravity: 0.0057,
    difficulty: "어려움",
    env: "초미세 중력 · 다공성 암석 · 진공",
    confirmed: "Fe O Si Mg".split(" "),
    inferred: "C Al Ca S".split(" "),
  },
  데이모스: {
    kind: "위성",
    gravity: 0.003,
    difficulty: "어려움",
    env: "초미세 중력 · 탄소질 암석 추정",
    confirmed: "Fe O Si Mg".split(" "),
    inferred: "C Al Ca S".split(" "),
  },
  이오: {
    kind: "위성",
    gravity: 1.8,
    difficulty: "극한",
    env: "황 화산 · 강한 방사선 · 얇은 대기",
    confirmed: "S O Na K Cl".split(" "),
    inferred: "Si Fe Mg".split(" "),
  },
  유로파: {
    kind: "위성",
    gravity: 1.31,
    difficulty: "어려움",
    env: "물얼음 껍질 · 지하 바다 · 방사선",
    confirmed: "H O S Na Mg Cl C".split(" "),
    inferred: "K Ca".split(" "),
  },
  가니메데: {
    kind: "위성",
    gravity: 1.43,
    difficulty: "어려움",
    env: "물얼음 · 암석 · 자체 자기장",
    confirmed: "H O Si Fe Mg S".split(" "),
    inferred: "C Na Cl".split(" "),
  },
  칼리스토: {
    kind: "위성",
    gravity: 1.24,
    difficulty: "보통",
    env: "얼음·암석 혼합 · 낮은 방사선",
    confirmed: "H O C Si Fe Mg".split(" "),
    inferred: "S Na Cl".split(" "),
  },
  타이탄: {
    kind: "위성",
    gravity: 1.35,
    difficulty: "보통",
    env: "질소 대기 · 메탄 호수 · 물얼음 지각",
    confirmed: "N C H O Ar".split(" "),
    inferred: "P S".split(" "),
  },
  엔셀라두스: {
    kind: "위성",
    gravity: 0.113,
    difficulty: "어려움",
    env: "물얼음 · 지하 바다 · 간헐천",
    confirmed: "H O C N Si Na Cl K P".split(" "),
    inferred: "S Fe".split(" "),
  },
  티타니아: {
    kind: "위성",
    gravity: 0.379,
    difficulty: "극한",
    env: "물얼음·암석 · CO₂ 서리 추정",
    confirmed: "H O C".split(" "),
    inferred: "Si Fe Mg N".split(" "),
  },
  오베론: {
    kind: "위성",
    gravity: 0.347,
    difficulty: "극한",
    env: "어두운 얼음·암석 · 충돌구",
    confirmed: "H O C".split(" "),
    inferred: "Si Fe Mg N".split(" "),
  },
  트리톤: {
    kind: "위성",
    gravity: 0.779,
    difficulty: "어려움",
    env: "질소 얼음 · 메탄 · 얼음 화산",
    confirmed: "N C H O".split(" "),
    inferred: "Ar Ne".split(" "),
  },
};
const MOON_PARENT = Object.fromEntries(
  Object.entries(MOONS).flatMap(([parent, moons]) =>
    moons.map(([name]) => [name, parent]),
  ),
);
const gravityLevel = (g) =>
  g < 0.02
    ? "거의 무중력"
    : g < 0.5
      ? "매우 약함"
      : g < 5
        ? "약한 편"
        : g < 8
          ? "중간"
          : g < 12
            ? "지구와 비슷"
            : g < 18
              ? "강한 편"
              : "매우 강함";

function MoonSystem({ planet, paused, timeSpeed, onDiscover, onPosition }) {
  return (
    <>
      {(MOONS[planet] || []).map(([name, orbit, size, color], i) => (
        <Moon
          key={name}
          name={name}
          orbit={orbit}
          size={size}
          color={color}
          speed={(i + 1) * 0.32}
          paused={paused}
          timeSpeed={timeSpeed}
          onDiscover={onDiscover}
          onPosition={onPosition}
        />
      ))}
    </>
  );
}

function Moon({
  name,
  orbit,
  size,
  color,
  speed,
  paused,
  timeSpeed,
  onDiscover,
  onPosition,
}) {
  const pivot = useRef(),
    bodyRef = useRef(),
    world = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    if (pivot.current && !paused)
      pivot.current.rotation.y += delta * speed * timeSpeed;
    if (bodyRef.current) {
      bodyRef.current.getWorldPosition(world);
      onPosition?.(name, world);
    }
  });
  return (
    <>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[orbit, 0.0025, 4, 48]} />
        <meshBasicMaterial color="#aeb4c4" transparent opacity={0.2} />
      </mesh>
      <group ref={pivot}>
        <mesh
          ref={bodyRef}
          position={[orbit, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onDiscover(name, e.point.clone());
          }}
        >
          <sphereGeometry args={[size, 18, 18]} />
          <meshStandardMaterial color={color} roughness={0.96} />
        </mesh>
      </group>
    </>
  );
}

function makePlanetTexture(name, base) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 256);
  const bands = {
    금성: ["#f0d69a", "#cf9f62", "#f6dfaa"],
    목성: ["#ead0a6", "#b97858", "#f0dfbd", "#c9926a", "#f4e1be"],
    토성: ["#ead89f", "#cbb77b", "#f1e3b7"],
    천왕성: ["#bce7e2", "#86c9ca"],
    해왕성: ["#7399d3", "#416caf", "#8eb0df"],
  }[name];
  if (bands)
    for (let y = 0; y < 256; y += 22) {
      ctx.fillStyle = bands[(y / 22) % bands.length | 0];
      ctx.globalAlpha = 0.55;
      ctx.fillRect(0, y, 512, 12 + ((y / 22) % 3) * 3);
    }
  ctx.globalAlpha = 1;
  if (name === "목성") {
    ctx.fillStyle = "#a95d49";
    ctx.beginPath();
    ctx.ellipse(380, 150, 38, 15, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (name === "화성" || name === "수성")
    for (let i = 0; i < 28; i++) {
      const x = (i * 83) % 512,
        y = (i * 47) % 256,
        r = 3 + (i % 5) * 2;
      ctx.fillStyle = name === "화성" ? "#9f4f3b" : "#696866";
      ctx.globalAlpha = 0.32;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function ClayPlanet({ name, size, color, onDiscover }) {
  const texture = useMemo(() => makePlanetTexture(name, color), [name, color]);
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);
  useFrame((_, delta) => {
    if (mesh.current) {
      const s = hovered ? 1.1 : 1;
      mesh.current.scale.lerp(
        new THREE.Vector3(s, s, s),
        1 - Math.exp(-delta * 9),
      );
    }
  });
  return (
    <mesh
      ref={mesh}
      castShadow
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onDiscover(name, e.point.clone());
      }}
    >
      <sphereGeometry args={[size, 64, 48]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.94}
        emissive={hovered ? "#493e68" : "#000000"}
        emissiveIntensity={hovered ? 0.22 : 0}
      />
    </mesh>
  );
}

function OriginBodyMesh({ body }) {
  const group = useRef();
  const planet = PLANET_FACTS.find(([name]) => name === body);
  const moon = Object.values(MOONS)
    .flat()
    .find(([name]) => name === body);
  const color = planet?.[3] || moon?.[3] || "#9fb7c9";
  const texture = useMemo(
    () =>
      body === "지구"
        ? makeEarthTexture().color
        : makePlanetTexture(body, color),
    [body, color],
  );
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.28;
  });
  return (
    <group ref={group} rotation={[0.08, -0.45, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.82, 64, 48]} />
        <meshStandardMaterial map={texture} roughness={0.88} />
      </mesh>
    </group>
  );
}

function OriginBodyPreview({ body }) {
  return (
    <div className={`origin-orb ${body === "토성" ? "saturn-arcs" : ""}`}>
      <Canvas dpr={[1, 1.7]} camera={{ position: [0, 0, 2.7], fov: 42 }}>
        <ambientLight intensity={1.15} color="#83a6ff" />
        <directionalLight
          position={[-2, 3, 4]}
          intensity={3.2}
          color="#fff1c7"
        />
        <pointLight position={[2, -1, 2]} intensity={3} color="#34d9ff" />
        <OriginBodyMesh body={body} />
      </Canvas>
    </div>
  );
}

function EarthPlanet({ size, onSelect, focused, onLock }) {
  const earth = useRef();
  const textures = useMemo(makeEarthTexture, []);
  const handleClick = (e) => {
    e.stopPropagation();
    if (!focused) {
      onLock(e.point.clone());
      return;
    }
  };
  return (
    <mesh ref={earth} castShadow onClick={handleClick} scale={1.25}>
      <sphereGeometry args={[size, 128, 96]} />
      <meshStandardMaterial
        map={textures.color}
        displacementMap={textures.height}
        displacementScale={size * 0.035}
        bumpMap={textures.height}
        bumpScale={size * 0.025}
        roughness={0.92}
      />
    </mesh>
  );
}

function Planet({
  name,
  orbit,
  size,
  color,
  speed,
  angle,
  onSelect,
  paused,
  onEarthLock,
  onDiscover,
  timeSpeed,
  dateOffset,
  onPosition,
}) {
  const pivot = useRef(),
    bodyRef = useRef(),
    world = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    if (pivot.current)
      pivot.current.rotation.y = angle + dateOffset * speed * 0.0172;
  }, [angle, dateOffset, speed]);
  useFrame((_, delta) => {
    if (pivot.current && !paused)
      pivot.current.rotation.y += delta * speed * 0.22 * timeSpeed;
    if (bodyRef.current) {
      bodyRef.current.getWorldPosition(world);
      onPosition?.(name, world);
    }
  });
  return (
    <>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[orbit, 0.006, 6, 160]} />
        <meshBasicMaterial color="#b9a990" transparent opacity={0.32} />
      </mesh>
      <group ref={pivot} rotation-y={angle}>
        <group ref={bodyRef} position={[orbit, 0, 0]}>
          {name === "지구" ? (
            <EarthPlanet
              size={size}
              onSelect={onSelect}
              focused={paused}
              onLock={(point) => {
                onDiscover("지구", point);
                onEarthLock();
              }}
            />
          ) : (
            <ClayPlanet
              name={name}
              size={size}
              color={color}
              onDiscover={onDiscover}
            />
          )}
          {name === "토성" && (
            <mesh rotation-x={Math.PI / 2}>
              <torusGeometry args={[size * 1.65, size * 0.16, 12, 48]} />
              <meshStandardMaterial color="#cdbb8f" roughness={0.9} />
            </mesh>
          )}
          <MoonSystem
            planet={name}
            paused={paused}
            timeSpeed={timeSpeed}
            onDiscover={onDiscover}
            onPosition={onPosition}
          />
        </group>
      </group>
    </>
  );
}

function SolarSystem({
  onSelect,
  earthLocked,
  onEarthLock,
  onDiscover,
  timeSpeed,
  dateOffset,
  onPosition,
}) {
  const system = useRef();
  useFrame((_, delta) => {
    if (system.current && !earthLocked)
      system.current.rotation.y += delta * 0.035 * timeSpeed;
  });
  return (
    <group ref={system} rotation={[0.12, -0.3, 0]}>
      <mesh>
        <sphereGeometry args={[0.34, 48, 48]} />
        <meshStandardMaterial
          color="#f2bd61"
          emissive="#e69c36"
          emissiveIntensity={1.7}
          roughness={0.9}
        />
      </mesh>
      <pointLight intensity={22} distance={16} color="#ffd998" />
      {PLANETS.map(([name, orbit, size, color, speed, angle]) => (
        <Planet
          key={name}
          name={name}
          orbit={orbit}
          size={size}
          color={color}
          speed={speed}
          angle={angle}
          onSelect={onSelect}
          paused={earthLocked}
          onEarthLock={onEarthLock}
          onDiscover={onDiscover}
          timeSpeed={timeSpeed}
          dateOffset={dateOffset}
          onPosition={onPosition}
        />
      ))}
    </group>
  );
}

function SolarControls({
  resetSignal,
  focusTarget,
  gameStarted,
  onTelemetry,
  focusDistance = 1.5,
}) {
  const controls = useRef();
  const { camera } = useThree();
  const goal = useRef(null);
  const keys = useRef({});
  const reportClock = useRef(0);
  useEffect(() => {
    const down = (e) => (keys.current[e.code] = true);
    const up = (e) => (keys.current[e.code] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  useEffect(() => {
    camera.position.set(0, 5.2, 10.5);
    controls.current?.target.set(0, 0, 0);
    controls.current?.update();
    goal.current = null;
  }, [resetSignal, camera]);
  useEffect(() => {
    if (focusTarget) goal.current = new THREE.Vector3(...focusTarget);
  }, [focusTarget]);
  useFrame((state, delta) => {
    if (goal.current && controls.current) {
      const t = 1 - Math.exp(-delta * 2.2);
      controls.current.target.lerp(goal.current, t);
      const desired = goal.current
        .clone()
        .add(new THREE.Vector3(0, focusDistance * 0.18, focusDistance));
      camera.position.lerp(desired, t);
      controls.current.update();
      if (camera.position.distanceTo(desired) < 0.025) goal.current = null;
    }
    if (gameStarted && !goal.current) {
      const boost = keys.current.ShiftLeft || keys.current.ShiftRight ? 2.8 : 1;
      const speed = delta * 0.9 * boost;
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      const right = new THREE.Vector3()
        .crossVectors(forward, camera.up)
        .normalize();
      if (keys.current.KeyW) camera.position.addScaledVector(forward, speed);
      if (keys.current.KeyS) camera.position.addScaledVector(forward, -speed);
      if (keys.current.KeyA) camera.position.addScaledVector(right, -speed);
      if (keys.current.KeyD) camera.position.addScaledVector(right, speed);
      if (keys.current.KeyQ) camera.position.y -= speed;
      if (keys.current.KeyE) camera.position.y += speed;
      controls.current?.target.addScaledVector(
        forward,
        (keys.current.KeyW ? speed : 0) - (keys.current.KeyS ? speed : 0),
      );
      controls.current?.target.addScaledVector(
        right,
        (keys.current.KeyD ? speed : 0) - (keys.current.KeyA ? speed : 0),
      );
      controls.current?.update();
    }
    reportClock.current += delta;
    if (reportClock.current > 0.18) {
      reportClock.current = 0;
      onTelemetry?.({
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        boost: !!(keys.current.ShiftLeft || keys.current.ShiftRight),
        moving: Object.values(keys.current).some(Boolean),
      });
    }
  });
  return (
    <OrbitControls
      ref={controls}
      enablePan
      minDistance={0.18}
      maxDistance={16}
      zoomSpeed={0.65}
      rotateSpeed={0.55}
      dampingFactor={0.08}
      enableDamping
      zoomToCursor
    />
  );
}

function GameIntroScreen({ onStart }) {
  return (
    <div className="intro-gate">
      <div className="intro-nebula" />
      <section className="intro-content">
        <small>MEMORY LOG / SIGNAL LOST</small>
        <h1>
          낯선 별에서
          <br />
          <em>눈을 떴다</em>
        </h1>
        <div className="intro-memory">
          <p>
            낯선 태양계에 불시착했다. 함선도, 기록도, 가진 것도 모두
            불타버렸다.
          </p>
          <p>
            충격으로 과학 지식은 사라졌다. 하지만 언어와 고향의 별,
            그곳에서 기다리는 가족만은 기억난다.
          </p>
          <strong>한 가지는 분명하다. 가족이 있는 곳으로 돌아가야 한다.</strong>
        </div>
        <button onClick={onStart}>
          잔해 밖으로 나간다 <span>→</span>
        </button>
        <div className="intro-steps">
          <span>
            <b>01</b>살아남기
          </span>
          <span>
            <b>02</b>지식 되찾기
          </span>
          <span>
            <b>03</b>가족에게 돌아가기
          </span>
        </div>
      </section>
      <footer className="intro-footer">
        <span>LAST MEMORY / HOME BEYOND THIS SYSTEM</span>
        <span>NO RESCUE SIGNAL · NO CIVILIZATION</span>
      </footer>
    </div>
  );
}

function BirthScreen({ onStart, onBack }) {
  const [kind, setKind] = useState("행성");
  const [body, setBody] = useState("화성");
  const [activeElement, setActiveElement] = useState("H");
  const info = BODY_START_DATA[body];
  const activeIndex = ELEMENT_SYMBOLS.indexOf(activeElement);
  const activeGameInfo = elementGameInfo(activeElement, activeIndex);
  const bodies = Object.entries(BODY_START_DATA).filter(
    ([, v]) => v.kind === kind,
  );
  const pickRandom = () => {
    const pool = Object.keys(BODY_START_DATA).filter((name) => name !== "지구");
    const next = pool[Math.floor(Math.random() * pool.length)];
    setKind(BODY_START_DATA[next].kind);
    setBody(next);
  };
  const selectBody = (name) => setBody(name);
  return (
    <div className="game-start">
      <section className="birth-console">
        <header className="birth-head">
          <div>
            <small>MONGLE SURVIVOR / CRASH VECTOR</small>
            <h2>어디에 불시착할까요?</h2>
            <p>
              문명도 구조 신호도 없는 세계에서 잃어버린 지식을 되찾고,
              가족이 기다리는 고향으로 돌아가세요.
            </p>
          </div>
          <div className="birth-head-actions">
            <button className="back-intro" onClick={onBack}>
              ← 처음으로
            </button>
            <button className="random-birth" onClick={pickRandom}>
              ✦ 랜덤 불시착
            </button>
          </div>
        </header>
        <div className="birth-layout">
          <aside className="body-browser">
            <div className="body-tabs">
              {["행성", "위성"].map((v) => (
                <button
                  key={v}
                  className={kind === v ? "active" : ""}
                  onClick={() => {
                    setKind(v);
                    const first = Object.keys(BODY_START_DATA).find(
                      (n) => BODY_START_DATA[n].kind === v,
                    );
                    selectBody(first);
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="body-list">
              {bodies.map(([name, data]) => (
                <button
                  key={name}
                  className={body === name ? "active" : ""}
                  onClick={() => selectBody(name)}
                >
                  <i
                    style={{
                      background:
                        PLANET_FACTS.find((p) => p[0] === name)?.[3] ||
                        MOONS[
                          Object.keys(MOONS).find((p) =>
                            MOONS[p].some((m) => m[0] === name),
                          )
                        ]?.find((m) => m[0] === name)?.[3] ||
                        "#aab8d0",
                    }}
                  />
                  <span>
                    {name}
                    <small>{data.difficulty}</small>
                  </span>
                </button>
              ))}
            </div>
          </aside>
          <section className="origin-card">
            <OriginBodyPreview body={body} />
            <small>SELECTED ORIGIN</small>
            <h3>{body}</h3>
            <p className="body-description">{DISCOVERY_INFO[body]?.[1]}</p>
            <div className="location-map always-visible">
              <div className="mini-system">
                <i className="mini-sun" />
                {PLANETS.map(([name], index) => (
                  <span
                    key={name}
                    className={
                      name === body || name === MOON_PARENT[body]
                        ? "current"
                        : ""
                    }
                    style={{ left: `${15 + index * 10.3}%` }}
                    title={name}
                  />
                ))}
              </div>
              <b>
                {info.kind === "행성"
                  ? `태양에서 ${PLANET_FACTS.findIndex((p) => p[0] === body) + 1}번째 궤도`
                  : `${MOON_PARENT[body]} 주위를 도는 위성`}
              </b>
              <small>
                {info.kind === "위성"
                  ? `${MOON_PARENT[body]} → ${body}`
                  : `태양 → ${body}`}
              </small>
            </div>
            <div className="origin-stats">
              <span>
                <small>표면 중력</small>
                <b>{info.gravity} m/s²</b>
                <em>{gravityLevel(info.gravity)}</em>
              </span>
              <span>
                <small>생존 난이도</small>
                <b>{info.difficulty}</b>
              </span>
            </div>
            <p className="environment-line">{info.env}</p>
            <div className="resource-count">
              <b>{info.confirmed.length}</b> 확인 원소 <i />{" "}
              <b>{info.inferred.length}</b> 추정 원소
            </div>
          </section>
          <section className="element-panel">
            <div className="element-title">
              <div>
                <small>LOCAL RESOURCE SCAN</small>
                <h3>{body} 원소 자원표</h3>
              </div>
              <div className="element-legend">
                <span className="confirmed">확인</span>
                <span className="inferred">추정</span>
                <span>미확인</span>
              </div>
            </div>
            <div className="periodic-grid">
              <span className="series-label lanthanide">57–71</span>
              <span className="series-label actinide">89–103</span>
              {ELEMENT_SYMBOLS.map((symbol, index) => {
                const state = info.confirmed.includes(symbol)
                  ? "confirmed"
                  : info.inferred.includes(symbol)
                    ? "inferred"
                    : "";
                return (
                  <button
                    type="button"
                    key={symbol}
                    style={periodicPosition(index + 1)}
                    className={`${state} ${index >= 20 ? "advanced-element" : "core-element"} ${activeElement === symbol ? "selected" : ""}`}
                    onMouseEnter={() => setActiveElement(symbol)}
                    onFocus={() => setActiveElement(symbol)}
                    onClick={() => setActiveElement(symbol)}
                    aria-label={`${symbol} 원소 효과 보기`}
                  >
                    <small>{index + 1}</small>
                    <b>{symbol}</b>
                    <em>{elementGameInfo(symbol, index)[0]}</em>
                  </button>
                );
              })}
            </div>
            <div className="element-effect">
              <div className="element-identity">
                <span>{activeElement}</span>
                <div>
                  <small>ELEMENT {activeIndex + 1}</small>
                  <b>{activeGameInfo[0]}</b>
                </div>
              </div>
              <p>{activeGameInfo[1]}</p>
              <div className="effect-bars">
                {[
                  ["생존", activeGameInfo[2]],
                  ["탈출", activeGameInfo[3]],
                  ["가치", activeGameInfo[4]],
                ].map(([label, value]) => (
                  <span key={label}>
                    <small>{label}</small>
                    <i>
                      {Array.from({ length: 5 }, (_, i) => (
                        <b key={i} className={i < value ? "on" : ""} />
                      ))}
                    </i>
                  </span>
                ))}
              </div>
              <em>
                {info.confirmed.includes(activeElement)
                  ? `${body}에서 확보 가능`
                  : info.inferred.includes(activeElement)
                    ? `${body}에서 발견 가능성 있음`
                    : `${body}에서는 아직 미확인`}
              </em>
            </div>
            <p className="science-note">
              ※ 원격 관측·탐사선 분석 자료를 게임용으로 단순화했습니다. ‘추정’은
              조성 모델에 근거합니다.
            </p>
          </section>
        </div>
        <footer className="birth-footer">
          <div className="key-guide">
            <kbd>WASD</kbd>
            <span>이동</span>
            <kbd>SPACE</kbd>
            <span>채집</span>
            <kbd>M</kbd>
            <span>지도</span>
          </div>
          <button className="launch-birth" onClick={() => onStart(body)}>
            이곳에 불시착 <span>→</span>
          </button>
        </footer>
      </section>
    </div>
  );
}

const SURFACE_PALETTES = {
  수성: ["#746b63", "#253346", "#07080d", "#010105", "#f0a86f", "#d7c2a6"],
  금성: ["#a85832", "#493e45", "#d89255", "#241323", "#ff6845", "#f6c16f"],
  지구: ["#477559", "#126a93", "#63bce8", "#06132c", "#ff765d", "#f9e5a2"],
  화성: ["#a7462e", "#243d5c", "#d59570", "#080d21", "#4e78bd", "#f5c58b"],
  목성: ["#cb8c5e", "#664253", "#d6ad82", "#171327", "#de6d58", "#f9d193"],
  토성: ["#c4a963", "#655d58", "#dfcf98", "#111629", "#eaa766", "#f7dfa1"],
  천왕성: ["#68b8b9", "#226f86", "#9bdbd7", "#06192c", "#71c3d6", "#d8ffff"],
  해왕성: ["#315fb0", "#102b70", "#477bd3", "#040b29", "#765b9c", "#b3c9ff"],
  달: ["#817d75", "#1b293b", "#11141d", "#010105", "#d7a56f", "#eee4cc"],
  포보스: ["#6f5b50", "#1d2937", "#080a10", "#010104", "#b66f52", "#d7b18c"],
  데이모스: ["#806c5b", "#24303b", "#0b0d13", "#010104", "#ca865a", "#dac4a5"],
  이오: ["#d6ad38", "#5c2822", "#18120e", "#030308", "#ef5537", "#fff09b"],
  유로파: ["#d8d6c4", "#174f73", "#b8d5df", "#061229", "#e99196", "#f6f6d9"],
  가니메데: ["#858078", "#1c4665", "#9cabb0", "#07101f", "#d19a70", "#e9d8b4"],
  칼리스토: ["#5e554e", "#172e44", "#707174", "#050913", "#b0775b", "#d1b39c"],
  타이탄: ["#9a5735", "#172e36", "#d18442", "#321724", "#b63f2d", "#ffb258"],
  엔셀라두스: [
    "#d6e3df",
    "#13576a",
    "#bce7ea",
    "#071426",
    "#da8fa6",
    "#f2ffff",
  ],
  티타니아: ["#87989b", "#234757", "#91b4bd", "#081226", "#b17aa3", "#e3eff4"],
  오베론: ["#687274", "#1c3b50", "#778b94", "#070d1d", "#a46f80", "#d4e0e2"],
  트리톤: ["#b0a4a5", "#174e72", "#b9b0cb", "#090b29", "#d281a0", "#eef0ff"],
};

const SURFACE_NOTES = {
  화성: "산화철 먼지가 낮을 황갈색으로, 미세 먼지가 해질녘 태양 주변을 푸르게 만듭니다.",
  타이탄:
    "질소·메탄 대기의 짙은 주황 안개와 실제 메탄·에탄 바다를 반영했습니다.",
  유로파:
    "밝은 물얼음과 적갈색 염류 균열 아래의 거대한 염수 바다를 지상으로 확장한 설정입니다.",
  지구: "질소·산소 대기의 푸른 산란, 액체 물의 바다와 녹색 생태 지형입니다.",
  금성: "황산 구름과 고온 대기의 황금빛 산란을 반영한 가상 해안입니다.",
  목성: "고체 표면 대신 암모니아 구름층 위에 부유하는 땅과 깊은 유체 바다를 가정합니다.",
  토성: "연한 암모니아 구름색을 가진 부유 대륙과 황금 안개 바다를 가정합니다.",
  천왕성:
    "메탄이 붉은빛을 흡수해 생기는 청록빛을 얼음 바다와 하늘에 적용했습니다.",
  해왕성: "메탄 대기의 짙은 청색과 높은 구름층을 바다 세계로 재해석했습니다.",
};

const CAMPAIGN_PHASES = [
  ["DAY 1–7", "생존", "대기·물 분석, 체온 유지, 첫 피난처"],
  ["DAY 8–30", "정착", "채굴기, 온실, 저장고, 첫 탐사차"],
  ["MONTH 2–6", "확장", "자동화 산업, 해안 원정, 지역 기지"],
  ["MONTH 7–12", "문명", "도시 건설, 궤도 통신, 첫 발사"],
  ["YEAR 2", "이주", "위성·이웃 행성 거점과 자원 항로"],
  ["YEAR 3", "탈출", "성간선 완성, 태양권계면 돌파"],
];

const WORLD_REGION_NAMES = {
  수성: ["칼로리스 대륙", "회색해", "새벽 절벽"],
  금성: ["이슈타르 대륙", "황혼해", "아프로디테 군도"],
  지구: ["가이아 대륙", "푸른해", "새별 군도"],
  화성: ["타르시스 대륙", "보레알리스해", "녹티스 군도"],
  목성: ["갈릴레이 부유대륙", "대적해", "암모니아 군도"],
  토성: ["크로노스 대륙", "황금해", "고리 그림자섬"],
  천왕성: ["미란다 대륙", "청록해", "극광 군도"],
  해왕성: ["트리톤 대륙", "남청해", "폭풍 군도"],
  달: ["셀레네 대륙", "고요해", "새벽 군도"],
  포보스: ["스틱니 대륙", "그림자해", "화성빛 군도"],
  데이모스: ["볼테르 대륙", "회백해", "저중력 군도"],
  이오: ["펠레 대륙", "용암해", "유황 군도"],
  유로파: ["미노스 대륙", "갈릴레오해", "소금빛 군도"],
  가니메데: ["갈릴레오 대륙", "자기해", "얼음 군도"],
  칼리스토: ["발할라 대륙", "검은해", "고리 군도"],
  타이탄: ["샹그릴라 대륙", "크라켄해", "메탄 군도"],
  엔셀라두스: ["다마스쿠스 대륙", "분출해", "눈꽃 군도"],
  티타니아: ["게르트루드 대륙", "보랏빛해", "셰익스피어 군도"],
  오베론: ["햄릿 대륙", "흑청해", "서리 군도"],
  트리톤: ["칸탈루프 대륙", "질소해", "분홍서리 군도"],
};

function seeded(seed) {
  let n = [...seed].reduce((a, c) => a + c.charCodeAt(0), 17);
  return () => {
    n = Math.sin(n * 91.73) * 43758.5453;
    return n - Math.floor(n);
  };
}
function continentPath(r, cx, cy, rx, ry) {
  const points = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    const wobble = 0.72 + r() * 0.48;
    return [cx + Math.cos(a) * rx * wobble, cy + Math.sin(a) * ry * wobble];
  });
  return `M${points.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" L")} Z`;
}
function WorldMap({ body, palette, onClose }) {
  const paths = useMemo(() => {
    const r = seeded(body);
    return Array.from({ length: 5 }, (_, i) =>
      continentPath(
        r,
        18 + r() * 64,
        18 + r() * 48,
        8 + r() * 15,
        6 + r() * 11,
      ),
    );
  }, [body]);
  const names = WORLD_REGION_NAMES[body] || WORLD_REGION_NAMES.지구;
  return (
    <div className="world-map-modal">
      <header>
        <div>
          <small>PROCEDURAL PLANETARY MAP</small>
          <h3>{body} 세계 지도</h3>
        </div>
        <button onClick={onClose}>×</button>
      </header>
      <div
        className="world-map-globe"
        style={{ "--map-sea": palette[1], "--map-land": palette[0] }}
      >
        <svg viewBox="0 0 100 70" preserveAspectRatio="none">
          <defs>
            <filter id="softLand">
              <feGaussianBlur stdDeviation=".35" />
            </filter>
          </defs>
          {paths.map((d, i) => (
            <path key={i} d={d} filter="url(#softLand)" />
          ))}
        </svg>
        <i />
        <b />
      </div>
      <div className="region-list">
        {names.map((n, i) => (
          <span key={n}>
            <i>{String(i + 1).padStart(2, "0")}</i>
            <b>{n}</b>
            <small>
              {i === 0
                ? "주요 정착 후보지"
                : i === 1
                  ? "수자원·연료 지대"
                  : "희귀 원소 탐사 지대"}
            </small>
          </span>
        ))}
      </div>
      <p>
        실제 천체 조성을 바탕으로 만든 게임용 가상 지리입니다. 매 세계는 고유한
        대륙, 바다, 기후대와 자원 분포를 가집니다.
      </p>
    </div>
  );
}

const START_STATS = {
  science: 0,
  material: 12,
  credits: 40,
  math: 0,
  food: 18,
  ship: 0,
};
const ACTIONS = [
  ["연구", "science", "현상을 관측해 기술을 해금합니다."],
  ["채굴", "material", "광물과 희귀 원소를 확보합니다."],
  ["수학", "math", "궤도와 구조 계산 능력을 높입니다."],
  ["재배", "food", "현지 원소로 먹을 것을 만듭니다."],
  ["거래", "credits", "가공 자원을 팔아 자금을 만듭니다."],
  ["제작", "ship", "우주선 부품을 조립합니다."],
];

function ColonyConsole({ body, onMap }) {
  const [stats, setStats] = useState(START_STATS);
  const [energy, setEnergy] = useState(5);
  const [day, setDay] = useState(1);
  const [log, setLog] = useState("첫 임무를 선택하세요.");
  const act = (type) => {
    if (energy < 1) {
      setLog("오늘의 행동력이 없습니다. 하루를 마치세요.");
      return;
    }
    setStats((s) => {
      let n = { ...s };
      if (type === "science") {
        n.science += 8;
        n.math += 1;
        setLog("새로운 자연 법칙을 기록했습니다.");
      }
      if (type === "material") {
        n.material += 12;
        setLog("철·규산염 자원을 채굴했습니다.");
      }
      if (type === "math") {
        n.math += 7;
        n.science += 2;
        setLog("궤도 방정식의 오차를 줄였습니다.");
      }
      if (type === "food") {
        n.food += 9;
        setLog("첫 배양 식량이 자라기 시작했습니다.");
      }
      if (type === "credits") {
        if (n.material < 5) {
          setLog("판매할 재료가 부족합니다.");
          return s;
        }
        n.material -= 5;
        n.credits += 14;
        setLog("정제 자원을 판매해 자금을 확보했습니다.");
      }
      if (type === "ship") {
        if (n.science < 8 || n.math < 7 || n.material < 15 || n.credits < 10) {
          setLog("과학 8 · 수학 7 · 재료 15 · 자금 10이 필요합니다.");
          return s;
        }
        n.science -= 8;
        n.math -= 7;
        n.material -= 15;
        n.credits -= 10;
        n.ship = Math.min(100, n.ship + 8);
        setLog("탈출선 모듈 제작 +8%");
      }
      setEnergy((e) => e - 1);
      return n;
    });
  };
  const nextDay = () => {
    setDay((d) => d + 1);
    setEnergy(5);
    setStats((s) => ({ ...s, food: Math.max(0, s.food - 3) }));
    setLog("새로운 하루가 시작됐습니다. 식량 3을 소비했습니다.");
  };
  return (
    <aside className="colony-console">
      <header>
        <div>
          <small>COLONY / {body}</small>
          <b>DAY {String(day).padStart(3, "0")}</b>
        </div>
        <button onClick={onMap}>세계 지도</button>
      </header>
      <div className="resource-bar">
        {[
          ["science", "과학"],
          ["material", "재료"],
          ["credits", "자금"],
          ["math", "수학"],
          ["food", "식량"],
        ].map(([k, l]) => (
          <span key={k}>
            <small>{l}</small>
            <b>{stats[k]}</b>
          </span>
        ))}
      </div>
      <div className="action-grid">
        {ACTIONS.map(([label, type, desc]) => (
          <button key={type} onClick={() => act(type)} title={desc}>
            <i>
              {type === "science"
                ? "⌁"
                : type === "material"
                  ? "◆"
                  : type === "math"
                    ? "∑"
                    : type === "food"
                      ? "◌"
                      : type === "credits"
                        ? "₢"
                        : "△"}
            </i>
            <span>
              {label}
              <small>{desc}</small>
            </span>
          </button>
        ))}
      </div>
      <div className="ship-progress">
        <span>
          <small>태양계 탈출선</small>
          <b>{stats.ship}%</b>
        </span>
        <i>
          <b style={{ width: `${stats.ship}%` }} />
        </i>
      </div>
      <footer>
        <p>{log}</p>
        <button onClick={nextDay}>하루 마치기 · 행동력 {energy}/5</button>
      </footer>
    </aside>
  );
}

const BODY_RADIUS_RATIO = {
  수성: 0.383,
  금성: 0.949,
  지구: 1,
  화성: 0.532,
  목성: 10.973,
  토성: 9.14,
  천왕성: 3.98,
  해왕성: 3.865,
  달: 0.2727,
  포보스: 0.00177,
  데이모스: 0.00097,
  이오: 0.2859,
  유로파: 0.245,
  가니메데: 0.4135,
  칼리스토: 0.3783,
  타이탄: 0.4041,
  엔셀라두스: 0.0396,
  티타니아: 0.1238,
  오베론: 0.1195,
  트리톤: 0.2124,
};

function makeExplorationWorld(body, w, h) {
  const r = seeded(`${body}-world-v4`),
    seed = [...body].reduce((a, c) => a + c.charCodeAt(0), 19);
  const centers = Array.from({ length: 12 }, (_, i) => ({
    x: i === 0 ? Math.floor(w / 2) : r() * w,
    y: i === 0 ? Math.floor(h / 2) : r() * h,
    rx: w * (0.035 + r() * 0.055),
    ry: h * (0.045 + r() * 0.07),
    power: 0.72 + r() * 0.65,
  }));
  const overrides = new Map(),
    rows = new Map();
  const noise = (x, y, s = 0) => {
    const n =
      Math.sin(x * 12.9898 + y * 78.233 + seed * 3.117 + s * 19.19) *
      43758.5453;
    return n - Math.floor(n);
  };
  const getTile = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return undefined;
    const key = `${x},${y}`;
    if (overrides.has(key)) return overrides.get(key);
    let land = 0;
    centers.forEach((c) => {
      const dx = (x - c.x) / (c.rx * c.power),
        dy = (y - c.y) / (c.ry * c.power);
      land += Math.exp(-(dx * dx + dy * dy) * 1.25);
    });
    land +=
      (Math.sin(x * 0.031 + y * 0.047 + body.length) +
        Math.sin(x * 0.011 - y * 0.029) +
        2) *
        0.075 +
      (noise(x, y) - 0.5) * 0.18;
    if (land <= 0.61)
      return { type: "sea", depth: land < 0.2 ? "deep" : "coast" };
    const roll = noise(x, y, 2);
    return {
      type:
        roll > 0.965
          ? "resource"
          : roll > 0.87
            ? "mountain"
            : roll > 0.7
              ? "forest"
              : "land",
      depth: "land",
    };
  };
  return new Proxy(
    { width: w, height: h, overrides },
    {
      get(target, p) {
        if (p in target) return target[p];
        const y = Number(p);
        if (!Number.isInteger(y) || y < 0 || y >= h) return undefined;
        if (!rows.has(y))
          rows.set(
            y,
            new Proxy(
              {},
              {
                get(_, x) {
                  return getTile(Number(x), y);
                },
                set(_, x, value) {
                  overrides.set(`${Number(x)},${y}`, value);
                  return true;
                },
              },
            ),
          );
        return rows.get(y);
      },
    },
  );
}

function ExplorationCanvas({
  world,
  pos,
  revealed,
  visited,
  onMove,
  palette,
  buildings,
  pins,
  showTrail,
}) {
  const ref = useRef(),
    buildingRef = useRef();
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas.getContext("2d");
    const draw = () => {
      const rect = canvas.getBoundingClientRect(),
        dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const width = rect.width,
        height = rect.height,
        tile = Math.max(9, Math.min(15, width / 58)),
        cols = Math.ceil(width / tile) + 4,
        rows = Math.ceil(height / tile) + 4,
        startX = Math.floor(pos.x - cols / 2),
        startY = Math.floor(pos.y - rows * (width <= 760 ? 0.36 : 0.5));
      ctx.fillStyle = "#040b15";
      ctx.fillRect(0, 0, width, height);
      for (let sy = 0; sy < rows; sy++)
        for (let sx = 0; sx < cols; sx++) {
          const x = startX + sx,
            y = startY + sy,
            px = (sx - 1) * tile,
            py = (sy - 1) * tile;
          if (!world[y] || !world[y][x]) continue;
          const seen = revealed.has(`${x},${y}`),
            t = world[y][x];
          if (!seen) continue;
          let color = palette[0];
          if (t.type === "sea")
            color =
              t.depth === "deep"
                ? palette[1]
                : mixHex(palette[1], "#8ad5db", 0.18);
          if (t.type === "forest") color = mixHex(palette[0], "#174c45", 0.45);
          if (t.type === "mountain")
            color = mixHex(palette[0], "#d9d3c0", 0.28);
          if (t.type === "resource") color = "#c9973f";
          ctx.fillStyle = color;
          ctx.fillRect(px - 0.5, py - 0.5, tile + 1.2, tile + 1.2);
          if (t.type === "sea") {
            ctx.strokeStyle = "rgba(190,238,246,.09)";
            ctx.beginPath();
            ctx.moveTo(px + 1, py + tile * 0.65);
            ctx.lineTo(px + tile - 1, py + tile * 0.55);
            ctx.stroke();
          }
          if (t.type === "resource") {
            ctx.fillStyle = "#ffe58a";
            ctx.beginPath();
            ctx.arc(
              px + tile / 2,
              py + tile / 2,
              Math.max(1.5, tile * 0.13),
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }
          if (showTrail && visited.has(`${x},${y}`)) {
            ctx.fillStyle = "rgba(223,250,255,.25)";
            ctx.beginPath();
            ctx.arc(px + tile / 2, py + tile / 2, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      const playerX = (pos.x - startX - 1) * tile + tile / 2,
        playerY = (pos.y - startY - 1) * tile + tile / 2;
      const glow = ctx.createRadialGradient(
        playerX,
        playerY,
        0,
        playerX,
        playerY,
        tile * 2.4,
      );
      glow.addColorStop(0, "rgba(85,238,255,.5)");
      glow.addColorStop(1, "rgba(85,238,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(playerX, playerY, tile * 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#eaffff";
      ctx.beginPath();
      ctx.arc(playerX, playerY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#41e6f3";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(playerX, playerY, 8, 0, Math.PI * 2);
      ctx.stroke();
    };
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    draw();
    return () => ro.disconnect();
  }, [world, pos, revealed, visited, palette, showTrail]);
  useEffect(() => {
    const canvas = buildingRef.current,
      rect = canvas.getBoundingClientRect(),
      dpr = Math.min(devicePixelRatio || 1, 2),
      ctx = canvas.getContext("2d"),
      tile = Math.max(9, Math.min(15, rect.width / 58)),
      cols = Math.ceil(rect.width / tile) + 4,
      rows = Math.ceil(rect.height / tile) + 4,
      startX = Math.floor(pos.x - cols / 2),
      startY = Math.floor(pos.y - rows * (rect.width <= 760 ? 0.36 : 0.5));
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildings.forEach((building, key) => {
      const [x, y] = key.split(",").map(Number);
      if (x < startX || y < startY || x > startX + cols || y > startY + rows)
        return;
      const px = (x - startX - 1) * tile,
        py = (y - startY - 1) * tile,
        size = tile * (1 + building.level * 0.24);
      ctx.save();
      ctx.translate(px + tile / 2, py + tile / 2);
      ctx.fillStyle =
        building.type === "집"
          ? "#f0d38a"
          : building.type === "보관소"
            ? "#dd9d68"
            : "#87d9ed";
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.fillRect(-size * 0.34, -size * 0.22, size * 0.68, size * 0.52);
      ctx.beginPath();
      ctx.moveTo(-size * 0.45, -size * 0.22);
      ctx.lineTo(0, -size * 0.55);
      ctx.lineTo(size * 0.45, -size * 0.22);
      ctx.fill();
      ctx.fillStyle = "#071522";
      ctx.fillRect(-size * 0.08, size * 0.05, size * 0.16, size * 0.25);
      ctx.restore();
    });
    pins.forEach((label, key) => {
      const [x, y] = key.split(",").map(Number);
      if (x < startX || y < startY || x > startX + cols || y > startY + rows)
        return;
      const px = (x - startX - 1) * tile + tile / 2,
        py = (y - startY - 1) * tile + tile / 2;
      ctx.fillStyle = "#ff6fae";
      ctx.shadowColor = "#ff4f9b";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(px, py - tile * 0.42, Math.max(2.5, tile * 0.2), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillRect(px - 0.8, py - tile * 0.25, 1.6, tile * 0.45);
    });
  }, [buildings, pins, pos]);
  const click = (e) => {
    const r = e.currentTarget.getBoundingClientRect(),
      dx = e.clientX - r.left - r.width / 2,
      dy = e.clientY - r.top - r.height / 2;
    if (Math.abs(dx) > Math.abs(dy)) onMove(dx > 0 ? 1 : -1, 0);
    else onMove(0, dy > 0 ? 1 : -1);
  };
  return (
    <div className="exploration-canvas" onClick={click}>
      <canvas ref={ref} />
      <canvas className="building-layer" ref={buildingRef} />
      <div className="map-compass">
        <i>N</i>
        <b />
      </div>
      <span className="map-scale">LOCAL SCAN · 1 CELL / 약 32 KM</span>
    </div>
  );
}

function mixHex(a, b, t) {
  const p = (n) => parseInt(n, 16),
    aa = a.replace("#", ""),
    bb = b.replace("#", "");
  return `#${[0, 2, 4]
    .map((i) =>
      Math.round(p(aa.slice(i, i + 2)) * (1 - t) + p(bb.slice(i, i + 2)) * t)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

const BUILDING_RECIPES = {
  집: {
    structure: 4,
    circuit: 1,
    data: 0,
    desc: "휴식과 식량 보관이 가능한 첫 생활 거점",
  },
  도서관: {
    structure: 3,
    circuit: 2,
    data: 2,
    desc: "손상된 설계 자료를 복구하고 현지 과학 연구를 진행하는 시설",
  },
  보관소: {
    structure: 5,
    circuit: 1,
    data: 0,
    desc: "무거운 자재를 내려놓아 휴대 중량을 줄이는 시설",
  },
};

const INVENTORY_CAPACITY = 24;
const INVENTORY_WEIGHT = {
  선체판: 3,
  "부력 셀": 2,
  "동력 코어": 4,
  응급약: 1,
};
function ConstructionPanel({
  position,
  tile,
  stock,
  building,
  onBuild,
  onClose,
}) {
  const [selected, setSelected] = useState("집"),
    recipe = BUILDING_RECIPES[selected];
  const canBuild =
    tile?.type !== "sea" &&
    stock.structure >= recipe.structure &&
    stock.circuit >= recipe.circuit &&
    stock.data >= recipe.data;
  return (
    <div className="construction-panel">
      <header>
        <div>
          <small>SETTLEMENT CONSTRUCTION</small>
          <h2>{building ? "건물 확장" : "첫 거점 건설"}</h2>
          <p>
            좌표 {position.x} : {position.y} ·{" "}
            {building
              ? `${building.type} ${building.level}단계`
              : "미개발 육지"}
          </p>
        </div>
        <button onClick={onClose}>×</button>
      </header>
      {!building ? (
        <>
          <div className="building-choice">
            {Object.entries(BUILDING_RECIPES).map(([name, data]) => (
              <button
                key={name}
                className={selected === name ? "active" : ""}
                onClick={() => setSelected(name)}
              >
                <i>{name === "집" ? "⌂" : name === "보관소" ? "▣" : "▥"}</i>
                <span>
                  <b>{name}</b>
                  <small>{data.desc}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="construction-recipe">
            <span>
              구조재{" "}
              <b>
                {stock.structure}/{recipe.structure}
              </b>
            </span>
            <span>
              회로 묶음{" "}
              <b>
                {stock.circuit}/{recipe.circuit}
              </b>
            </span>
            <span>
              기록 매체{" "}
              <b>
                {stock.data}/{recipe.data}
              </b>
            </span>
          </div>
          <button
            className="construct-action"
            disabled={!canBuild}
            onClick={() => onBuild(selected)}
          >
            1셀에 {selected} 건설하기 <b>→</b>
          </button>
        </>
      ) : (
        <>
          <div className="building-upgrade">
            <i>
              {building.type === "집"
                ? "⌂"
                : building.type === "보관소"
                  ? "▣"
                  : "▥"}
            </i>
            <div>
              <small>CURRENT FOOTPRINT</small>
              <b>
                {building.level} × {building.level} 셀
              </b>
              <p>
                {building.level < 3
                  ? "주변 셀을 연결해 시설 범위를 확장합니다."
                  : "최대 확장이 완료된 시설입니다."}
              </p>
            </div>
          </div>
          <div className="construction-recipe">
            <span>
              구조재{" "}
              <b>
                {stock.structure}/{building.level * 4}
              </b>
            </span>
            <span>
              회로 묶음{" "}
              <b>
                {stock.circuit}/{building.level * 2}
              </b>
            </span>
            <span>
              기록 매체{" "}
              <b>
                {stock.data}/{building.type === "도서관" ? building.level : 0}
              </b>
            </span>
          </div>
          <button
            className="construct-action"
            disabled={building.level >= 3}
            onClick={() => onBuild(building.type)}
          >
            다음 단계로 확장하기{" "}
            <b>
              {building.level < 3
                ? `${building.level + 1}×${building.level + 1}`
                : "MAX"}
            </b>
          </button>
        </>
      )}
    </div>
  );
}

function WorldOverview({
  width,
  height,
  revealed,
  world,
  pos,
  visited,
  buildings,
  pins,
  palette,
  showTrail,
  onClose,
}) {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current,
      rect = canvas.getBoundingClientRect(),
      dpr = Math.min(devicePixelRatio || 1, 2),
      ctx = canvas.getContext("2d");
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#030914";
    ctx.fillRect(0, 0, rect.width, rect.height);
    const sx = rect.width / width,
      sy = rect.height / height,
      px = Math.max(1, sx * 1.25),
      py = Math.max(1, sy * 1.25);
    revealed.forEach((key) => {
      const [x, y] = key.split(",").map(Number),
        tile = world[y]?.[x];
      if (!tile) return;
      ctx.fillStyle =
        tile.type === "sea"
          ? palette[1]
          : tile.type === "forest"
            ? mixHex(palette[0], "#174c45", 0.45)
            : tile.type === "mountain"
              ? mixHex(palette[0], "#d9d3c0", 0.28)
              : tile.type === "resource"
                ? "#d0a247"
                : palette[0];
      ctx.fillRect(x * sx, y * sy, px, py);
    });
    if (showTrail) {
      ctx.fillStyle = "rgba(223,250,255,.45)";
      visited.forEach((key) => {
        const [x, y] = key.split(",").map(Number);
        ctx.fillRect(x * sx, y * sy, Math.max(1, sx), Math.max(1, sy));
      });
    }
    buildings.forEach((b, key) => {
      const [x, y] = key.split(",").map(Number);
      ctx.fillStyle = b.type === "집" ? "#ffe19a" : "#7ee8f2";
      ctx.beginPath();
      ctx.arc(x * sx, y * sy, 3 + b.level, 0, Math.PI * 2);
      ctx.fill();
    });
    pins.forEach((label, key) => {
      const [x, y] = key.split(",").map(Number);
      ctx.fillStyle = "#ff6fae";
      ctx.shadowColor = "#ff4f9b";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x * sx, y * sy, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#5ff5ff";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(pos.x * sx, pos.y * sy, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [
    width,
    height,
    revealed,
    world,
    pos,
    visited,
    buildings,
    pins,
    palette,
    showTrail,
  ]);
  return (
    <div className="world-overview">
      <header>
        <div>
          <small>PLANETARY CARTOGRAPHY</small>
          <h2>세계 지도</h2>
          <p>
            {width.toLocaleString()} × {height.toLocaleString()} 셀 · 밝혀진
            지역만 표시
          </p>
        </div>
        <button onClick={onClose}>×</button>
      </header>
      <div className="overview-canvas">
        <canvas ref={ref} />
        <i>북</i>
        <span>현재 위치 ●</span>
      </div>
      <footer>
        <span>
          <i className="land" />
          육지
        </span>
        <span>
          <i className="sea" />
          바다
        </span>
        <span>
          <i className="building" />
          건물
        </span>
        <b>
          {((revealed.size / (width * height)) * 100).toFixed(3)}% 조사 완료
        </b>
      </footer>
    </div>
  );
}

function MapSettings({
  showTrail,
  setShowTrail,
  gatherMode,
  setGatherMode,
  onClose,
}) {
  return (
    <div className="map-settings">
      <header>
        <div>
          <small>DISPLAY SETTINGS</small>
          <h2>지도 설정</h2>
        </div>
        <button onClick={onClose}>×</button>
      </header>
      <label>
        <span>
          <b>이동 경로 표시</b>
          <small>지나온 셀에 작은 점을 남깁니다.</small>
        </span>
        <input
          type="checkbox"
          checked={showTrail}
          onChange={(e) => setShowTrail(e.target.checked)}
        />
        <i />
      </label>
      <section className="gather-setting">
        <span>
          <b>자원 채집 방식</b>
          <small>플레이 스타일에 맞게 언제든 바꿀 수 있습니다.</small>
        </span>
        <div>
          <button
            className={gatherMode === "manual" ? "active" : ""}
            onClick={() => setGatherMode("manual")}
          >
            <b>스페이스바</b>
            <small>자원 칸에서 직접 채집</small>
          </button>
          <button
            className={gatherMode === "auto" ? "active" : ""}
            onClick={() => setGatherMode("auto")}
          >
            <b>자동 채집</b>
            <small>칸에 들어가면 즉시 회수</small>
          </button>
        </div>
      </section>
      <button className="settings-save" onClick={onClose}>
        설정 저장 <span>✓</span>
      </button>
      <p>저장한 설정은 다음 탐험에도 유지됩니다.</p>
    </div>
  );
}

function ExplorationMap({ body, onOrbit }) {
  const radiusRatio = BODY_RADIUS_RATIO[body] || 1,
    W = Math.max(4, Math.round(1264 * radiusRatio)),
    H = Math.max(3, Math.round(791 * radiusRatio)),
    cx = Math.floor(W / 2),
    cy = Math.floor(H / 2);
  const palette = SURFACE_PALETTES[body] || SURFACE_PALETTES.지구;
  const world = useMemo(() => makeExplorationWorld(body, W, H), [body, W, H]);
  const [pos, setPos] = useState({ x: cx, y: cy });
  const [revealed, setRevealed] = useState(() => new Set());
  const [visited, setVisited] = useState(() => new Set([`${cx},${cy}`]));
  const [day, setDay] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [food, setFood] = useState(5);
  const [inventory, setInventory] = useState({
    선체판: 0,
    "부력 셀": 0,
    "동력 코어": 0,
    응급약: 1,
  });
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [hunger, setHunger] = useState(0);
  const [health, setHealth] = useState(100);
  const [dead, setDead] = useState(false);
  const [boat, setBoat] = useState(false);
  const [message, setMessage] = useState(
    "착륙 지점 주변만 지도에 표시되었습니다.",
  );
  const [mapRevision, setMapRevision] = useState(0);
  const [showTrail, setShowTrail] = useState(
    () => localStorage.getItem("mongle-show-trail") !== "false",
  );
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gatherMode, setGatherMode] = useState(
    () => localStorage.getItem("mongle-gather-mode") || "manual",
  );
  const [buildings, setBuildings] = useState(() => new Map());
  const [pins, setPins] = useState(() => new Map());
  const [buildOpen, setBuildOpen] = useState(false);
  const [buildStock, setBuildStock] = useState({
    structure: 6,
    circuit: 3,
    data: 2,
  });
  const inventoryLoad = Object.entries(inventory).reduce(
    (total, [name, count]) => total + (INVENTORY_WEIGHT[name] || 1) * count,
    0,
  );
  const loadRatio = inventoryLoad / INVENTORY_CAPACITY;
  const currentBuilding = buildings.get(`${pos.x},${pos.y}`);
  const currentStorage = currentBuilding?.type === "보관소" ? currentBuilding : null;
  const storageLoad = currentStorage
    ? Object.entries(currentStorage.storage || {}).reduce(
        (total, [name, count]) =>
          total + (INVENTORY_WEIGHT[name] || 1) * count,
        0,
      )
    : 0;
  useEffect(() => {
    localStorage.setItem("mongle-show-trail", String(showTrail));
    localStorage.setItem("mongle-gather-mode", gatherMode);
  }, [showTrail, gatherMode]);
  const revealAround = (x, y) =>
    setRevealed((prev) => {
      const n = new Set(prev);
      for (let yy = y - 6; yy <= y + 6; yy++)
        for (let xx = x - 6; xx <= x + 6; xx++)
          if (
            xx >= 0 &&
            yy >= 0 &&
            xx < W &&
            yy < H &&
            Math.hypot(xx - x, yy - y) <= 6.25
          )
            n.add(`${xx},${yy}`);
      return n;
    });
  useEffect(() => revealAround(cx, cy), []);
  const move = (dx, dy) => {
    if (dead) return;
    const nx = pos.x + dx,
      ny = pos.y + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) return;
    const tile = world[ny][nx];
    if (tile.type === "sea" && !boat) {
      setMessage(
        "바다는 걸어서 건널 수 없습니다. 부품을 모아 탐사선을 먼저 만드세요.",
      );
      return;
    }
    setPos({ x: nx, y: ny });
    setVisited((v) => new Set([...v, `${nx},${ny}`]));
    revealAround(nx, ny);
    if (tile.type === "resource" && gatherMode === "auto") {
      gatherResource(nx, ny);
      return;
    }
    if (tile.type === "sea")
      setMessage(
        tile.depth === "deep"
          ? "탐사선으로 깊은 바다를 항해 중입니다. 육지는 아직 보이지 않습니다."
          : "탐사선이 얕은 바다에 진입했습니다. 수평선을 확인하세요.",
      );
    else if (tile.type === "resource")
      setMessage(
        "자원 지대에 도착했습니다. ‘자원 채집’을 눌러 부품을 회수하세요.",
      );
    else if (tile.type === "mountain")
      setMessage("높은 지형에 올라 더 넓은 지역을 확인했습니다.");
    else setMessage("새로운 육지를 지도에 기록했습니다.");
  };
  const gatherResource = (x = pos.x, y = pos.y) => {
    const tile = world[y]?.[x];
    if (tile?.type !== "resource") {
      setMessage(
        "현재 위치에는 채집할 자원이 없습니다. 노란 표식으로 이동하세요.",
      );
      return;
    }
    const medicine = (x + y + body.length) % 5 === 0,
      parts = ["선체판", "부력 셀", "동력 코어"],
      part = medicine
        ? "응급약"
        : parts[(x * 3 + y + body.length) % parts.length],
      rawAmount = part === "동력 코어" || part === "응급약" ? 1 : 2,
      available = INVENTORY_CAPACITY - inventoryLoad,
      amount = Math.min(
        rawAmount,
        Math.floor(available / INVENTORY_WEIGHT[part]),
      );
    if (amount < 1) {
      setMessage(
        `가방이 가득 찼습니다. 현재 중량 ${inventoryLoad}/${INVENTORY_CAPACITY} · 부품을 사용하거나 건물 보관함으로 옮기세요.`,
      );
      return;
    }
    setInventory((v) => ({ ...v, [part]: v[part] + amount }));
    setBuildStock((v) => ({
      structure: v.structure + (medicine ? 0 : 2),
      circuit: v.circuit + (part === "부력 셀" ? 1 : 0),
      data: v.data + (part === "동력 코어" ? 1 : 0),
    }));
    world[y][x] = { type: "land", depth: "land" };
    setMapRevision((v) => v + 1);
    setMessage(
      medicine
        ? "버려진 생존 캡슐에서 응급약 1개를 발견했습니다."
        : `${part} ${amount}개와 건축 자재를 회수했습니다.`,
    );
  };
  const constructBuilding = (type) => {
    const key = `${pos.x},${pos.y}`,
      tile = world[pos.y]?.[pos.x],
      existing = buildings.get(key);
    if (tile?.type === "sea") {
      setMessage("바다 위에는 건물을 세울 수 없습니다.");
      return;
    }
    if (existing) {
      if (existing.level >= 3) return;
      const cost = {
        structure: existing.level * 4,
        circuit: existing.level * 2,
        data: existing.type === "도서관" ? existing.level : 0,
      };
      if (Object.keys(cost).some((k) => buildStock[k] < cost[k])) {
        setMessage("시설 확장에 필요한 건축 자원이 부족합니다.");
        return;
      }
      setBuildStock((s) =>
        Object.fromEntries(Object.entries(s).map(([k, v]) => [k, v - cost[k]])),
      );
      setBuildings((prev) => {
        const n = new Map(prev);
        n.set(key, { ...existing, level: existing.level + 1 });
        return n;
      });
      setMessage(
        `${existing.type}을 ${existing.level + 1}×${existing.level + 1}셀로 확장했습니다.`,
      );
    } else {
      const recipe = BUILDING_RECIPES[type];
      if (
        Object.keys(recipe)
          .filter((k) => k !== "desc")
          .some((k) => buildStock[k] < recipe[k])
      ) {
        setMessage("건설 키트가 부족합니다.");
        return;
      }
      setBuildStock((s) => ({
        ...s,
        structure: s.structure - recipe.structure,
        circuit: s.circuit - recipe.circuit,
        data: s.data - recipe.data,
      }));
      setBuildings((prev) =>
        new Map(prev).set(key, {
          type,
          level: 1,
          ...(type === "보관소" ? { storage: {} } : {}),
        }),
      );
      setMessage(`${type}을 현재 셀에 건설했습니다.`);
    }
    setBuildOpen(false);
  };
  const shelter = [...buildings.entries()].find(([key, b]) => {
    if (b.type !== "집") return false;
    const [x, y] = key.split(",").map(Number),
      range = b.level - 1;
    return Math.abs(pos.x - x) <= range && Math.abs(pos.y - y) <= range;
  });
  const useMedicine = () => {
    if (inventory["응급약"] < 1) {
      setMessage(
        "사용할 응급약이 없습니다. 자원 지대나 생존 캡슐을 찾아보세요.",
      );
      return;
    }
    if (health >= 100) {
      setMessage("현재는 치료할 부상이 없습니다.");
      return;
    }
    setInventory((v) => ({ ...v, 응급약: v["응급약"] - 1 }));
    setHealth((v) => Math.min(100, v + 45));
    setMessage("응급약을 사용해 체력을 45 회복했습니다.");
  };
  const togglePin = () => {
    const key = `${pos.x},${pos.y}`;
    setPins((prev) => {
      const next = new Map(prev);
      if (next.has(key)) {
        next.delete(key);
        setMessage("현재 위치의 지도 핀을 제거했습니다.");
      } else {
        next.set(key, `탐사 핀 ${String(next.size + 1).padStart(2, "0")}`);
        setMessage("현재 위치를 세계 지도에 표시했습니다.");
      }
      return next;
    });
  };
  const transferStorage = (name, direction) => {
    if (!currentStorage) return;
    const key = `${pos.x},${pos.y}`,
      storage = currentStorage.storage || {},
      capacity = currentStorage.level * 40,
      weight = INVENTORY_WEIGHT[name] || 1;
    if (direction === "store") {
      if (inventory[name] < 1) return;
      if (storageLoad + weight > capacity) {
        setMessage("보관소가 가득 찼습니다. 시설을 확장하세요.");
        return;
      }
      setInventory((v) => ({ ...v, [name]: v[name] - 1 }));
      setBuildings((prev) => {
        const next = new Map(prev);
        next.set(key, {
          ...currentStorage,
          storage: { ...storage, [name]: (storage[name] || 0) + 1 },
        });
        return next;
      });
    } else {
      if (!storage[name]) return;
      if (inventoryLoad + weight > INVENTORY_CAPACITY) {
        setMessage("가방 중량 한도를 초과해 꺼낼 수 없습니다.");
        return;
      }
      setInventory((v) => ({ ...v, [name]: v[name] + 1 }));
      setBuildings((prev) => {
        const next = new Map(prev);
        next.set(key, {
          ...currentStorage,
          storage: { ...storage, [name]: storage[name] - 1 },
        });
        return next;
      });
    }
  };
  const buildBoat = () => {
    if (boat) {
      setMessage("탐사선이 이미 준비되어 있습니다.");
      return;
    }
    const need = { 선체판: 3, "부력 셀": 2, "동력 코어": 1 };
    const missing = Object.entries(need).filter(([k, v]) => inventory[k] < v);
    if (missing.length) {
      setMessage(
        `부품 부족: ${missing.map(([k, v]) => `${k} ${v - inventory[k]}`).join(" · ")}`,
      );
      setInventoryOpen(true);
      return;
    }
    setInventory((v) =>
      Object.fromEntries(
        Object.entries(v).map(([k, n]) => [k, n - (need[k] || 0)]),
      ),
    );
    setBoat(true);
    setMessage("소형 탐사선 완성. 이제 바다 칸으로 이동할 수 있습니다.");
  };
  const endDay = () => {
    if (dead) return;
    setDay((v) => v + 1);
    setSecondsLeft(600);
    if (food > 0) {
      setFood((v) => v - 1);
      setHunger(0);
      setMessage("새로운 하루가 시작됐습니다. 식량 1을 먹었습니다.");
    } else {
      const next = hunger + 1;
      setHunger(next);
      if (next === 1) setMessage("하루를 굶었습니다. 배가 고픕니다.");
      if (next === 2)
        setMessage("이틀째 굶었습니다. 매우 배고프고 행동이 느려집니다.");
      if (next >= 3) {
        setDead(true);
        setMessage("사흘째 식사를 하지 못해 생존에 실패했습니다.");
      }
    }
  };
  useEffect(() => {
    if (dead) return;
    const timer = window.setInterval(
      () =>
        setSecondsLeft((v) => {
          if (v <= 1) {
            window.setTimeout(endDay, 0);
            return 600;
          }
          return v - 1;
        }),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [dead, food, hunger]);
  useEffect(() => {
    if (dead || secondsLeft > 120 || secondsLeft % 30 !== 0 || shelter) return;
    setHealth((v) => {
      const next = Math.max(0, v - 18);
      if (next === 0) setDead(true);
      return next;
    });
    setMessage(
      "어둠 속 야생동물이 습격했습니다. 체력 −18 · 집으로 피신하세요.",
    );
  }, [secondsLeft, dead, !!shelter]);
  useEffect(() => {
    if (dead || loadRatio < 0.7) return;
    const fatigue = window.setInterval(() => {
      const damage = loadRatio >= 0.9 ? 2 : 1;
      setHealth((v) => {
        const next = Math.max(0, v - damage);
        if (next === 0) setDead(true);
        return next;
      });
      setMessage(
        loadRatio >= 0.9
          ? "짐이 너무 무거워 체력이 빠르게 줄고 있습니다. 인벤토리를 비우세요."
          : "무거운 짐 때문에 체력이 조금씩 줄고 있습니다.",
      );
    }, 60000);
    return () => window.clearInterval(fatigue);
  }, [dead, loadRatio]);
  useEffect(() => {
    const key = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName)) return;
      if (e.code === "KeyI") {
        if (e.repeat) return;
        setInventoryOpen((v) => !v);
        return;
      }
      if (e.key === "m" || e.key === "M") {
        setOverviewOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setOverviewOpen(false);
        setSettingsOpen(false);
        setInventoryOpen(false);
        setBuildOpen(false);
        return;
      }
      if (
        e.code === "Space" &&
        gatherMode === "manual" &&
        !inventoryOpen &&
        !buildOpen &&
        !overviewOpen &&
        !settingsOpen
      ) {
        e.preventDefault();
        gatherResource();
        return;
      }
      if (e.key === "ArrowUp" || e.key === "w") move(0, -1);
      if (e.key === "ArrowDown" || e.key === "s") move(0, 1);
      if (e.key === "ArrowLeft" || e.key === "a") move(-1, 0);
      if (e.key === "ArrowRight" || e.key === "d") move(1, 0);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  const discovered = (revealed.size / (W * H)) * 100,
    names = WORLD_REGION_NAMES[body] || WORLD_REGION_NAMES.지구,
    clock = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`,
    isNight = secondsLeft <= 120;
  return (
    <section
      className="planet-map-game"
      style={{
        "--map-land": palette[0],
        "--map-sea": palette[1],
        "--map-sunset": palette[4],
      }}
    >
      <header className={`map-game-head ${isNight ? "night" : ""}`}>
        <div>
          <small>PLANETARY EXPEDITION / {body}</small>
          <h1>{isNight ? "야간 경계 중" : "미지의 행성도"}</h1>
        </div>
        <div className="map-head-stats">
          <span>
            <small>
              DAY {String(day).padStart(3, "0")} ·{" "}
              {isNight ? "NIGHT" : "DAYLIGHT"}
            </small>
            <b>{clock}</b>
          </span>
          <span>
            <small>지도화</small>
            <b>
              {discovered < 10 ? discovered.toFixed(2) : discovered.toFixed(1)}%
            </b>
          </span>
          <button onClick={onOrbit}>궤도 보기</button>
        </div>
      </header>
      <aside className="map-status">
        <small>
          CRASH LOG · {W.toLocaleString()} × {H.toLocaleString()} ·{" "}
          {(W * H).toLocaleString()} CELLS
        </small>
        <h2>{names[0]}</h2>
        <p>{message}</p>
        <div className="map-resources">
          <span>
            <small>식량</small>
            <b>{food}</b>
          </span>
          <span>
            <small>체력</small>
            <b className={health < 40 ? "danger" : ""}>{health}</b>
          </span>
          <span className={`hunger-${hunger}`}>
            <small>상태</small>
            <b>
              {shelter
                ? "집 안"
                : hunger === 0
                  ? "안정"
                  : hunger === 1
                    ? "배고픔"
                    : hunger === 2
                      ? "위험"
                      : "사망"}
            </b>
          </span>
        </div>
        <div className="map-tools">
          <button
            onClick={() => gatherResource()}
            disabled={gatherMode === "auto"}
            className={
              world[pos.y]?.[pos.x]?.type === "resource" ? "collect-ready" : ""
            }
          >
            {gatherMode === "auto" ? "자동 채집 중" : "자원 채집"}{" "}
            <kbd>{gatherMode === "auto" ? "AUTO" : "SPACE"}</kbd>
          </button>
          <button className="inventory-control" onClick={() => setInventoryOpen(true)}>
            가방 <kbd>I</kbd>{" "}
            <b>
              {inventoryLoad}/{INVENTORY_CAPACITY}
            </b>
          </button>
          <button className="build-control" onClick={() => setBuildOpen(true)}>
            건설 <b>{buildings.size}</b>
          </button>
          <button onClick={useMedicine}>
            응급약 사용 <b>{inventory["응급약"]}</b>
          </button>
        </div>
        <div className="map-navigation">
          <button onClick={() => setOverviewOpen(true)}>
            세계 지도 <kbd>M</kbd>
          </button>
          <button onClick={() => setSettingsOpen(true)}>지도 설정</button>
          <button onClick={togglePin}>
            {pins.has(`${pos.x},${pos.y}`) ? "핀 제거" : "현재 위치 핀"}
          </button>
        </div>
        <em>
          {isNight && !shelter
            ? "야생동물 활동 중 · 집이 없으면 30초마다 공격받습니다."
            : "문명 신호 없음 · 첫 정착지를 건설하세요."}
        </em>
      </aside>
      <ExplorationCanvas
        key={mapRevision}
        world={world}
        pos={pos}
        revealed={revealed}
        visited={visited}
        onMove={move}
        palette={palette}
        buildings={buildings}
        pins={pins}
        showTrail={showTrail}
      />
      <div className="map-legend">
        <span>
          <i className="lg-land" />
          육지
        </span>
        <span>
          <i className="lg-mountain" />
          산악
        </span>
        <span>
          <i className="lg-sea" />
          바다
        </span>
        <span>
          <i className="lg-resource" />
          자원
        </span>
        <span>
          <i className="lg-unknown" />
          미탐사
        </span>
      </div>
      <div className="move-pad">
        <button onClick={() => move(0, -1)}>↑</button>
        <button onClick={() => move(-1, 0)}>←</button>
        <button onClick={() => move(0, 1)}>↓</button>
        <button onClick={() => move(1, 0)}>→</button>
        <small>WASD / 방향키</small>
      </div>
      <footer className="map-game-foot">
        <span>현재 목표</span>
        <b>해안선을 따라 이동하고 새로운 대륙을 찾으세요.</b>
        <i>
          <b style={{ width: `${Math.min(100, discovered * 5)}%` }} />
        </i>
      </footer>
      {inventoryOpen && (
        <div className="inventory-modal" role="dialog" aria-modal="true" aria-label="탐사 가방">
          <header>
            <div>
              <small>EXPEDITION LOADOUT</small>
              <h2>탐사 가방</h2>
              <p>
                {currentStorage
                  ? `보관소 연결됨 · ${storageLoad}/${currentStorage.level * 40}`
                  : "탐사 중 회수한 부품과 생존 물품"}
              </p>
            </div>
            <button aria-label="가방 닫기" onClick={() => setInventoryOpen(false)}>×</button>
          </header>
          <div className="carry-meter">
            <span>휴대 중량 <b>{inventoryLoad} / {INVENTORY_CAPACITY}</b></span>
            <meter min="0" max={INVENTORY_CAPACITY} value={inventoryLoad} />
            <small>{loadRatio >= .9 ? "과적 주의 · 물품을 보관소로 옮기세요" : "부품을 모아 장비를 제작하세요"}</small>
          </div>
          <div className="inventory-layout">
            <div className="inventory-slots">
              {Object.entries(inventory).map(([name, count], i) => (
                <article key={name} className={count ? "has-item" : ""}>
                  <i>
                    {name === "응급약"
                      ? "✚"
                      : i === 0
                        ? "▰"
                        : i === 1
                          ? "◉"
                          : "◇"}
                  </i>
                  <span>
                    <b>{name}</b>
                    <small>
                      {name === "선체판"
                        ? "HULL PLATE"
                        : name === "부력 셀"
                          ? "FLOAT CELL"
                          : name === "동력 코어"
                            ? "DRIVE CORE"
                            : "MEDICAL KIT"}
                    </small>
                  </span>
                  <strong>{String(count).padStart(2, "0")}</strong>
                  {name === "응급약" && <button className="inventory-use" disabled={!count || health >= 100 || dead} onClick={useMedicine}>{health >= 100 ? "체력 가득" : "사용 · 체력 +45"}</button>}
                  {currentStorage && (
                    <div className="item-transfer">
                      <button onClick={() => transferStorage(name, "store")}>
                        보관
                      </button>
                      <button onClick={() => transferStorage(name, "take")}>
                        꺼내기 {currentStorage.storage?.[name] || 0}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
            <section className="boat-recipe">
              <div className="boat-blueprint">
                <i />
                <i />
                <b />
                <span>SKIFF–01</span>
              </div>
              <small>ACTIVE BLUEPRINT</small>
              <h3>소형 해양 탐사선</h3>
              <p>
                <span>
                  선체판{" "}
                  <b className={inventory["선체판"] >= 3 ? "ok" : ""}>
                    {inventory["선체판"]} / 3
                  </b>
                </span>
                <span>
                  부력 셀{" "}
                  <b className={inventory["부력 셀"] >= 2 ? "ok" : ""}>
                    {inventory["부력 셀"]} / 2
                  </b>
                </span>
                <span>
                  동력 코어{" "}
                  <b className={inventory["동력 코어"] >= 1 ? "ok" : ""}>
                    {inventory["동력 코어"]} / 1
                  </b>
                </span>
              </p>
              <button onClick={buildBoat}>
                {boat ? "탐사선 제작 완료" : "탐사선 조립하기"} <span>→</span>
              </button>
            </section>
          </div>
          <footer>
            <span>
              <kbd>I</kbd> 가방 열기 / 닫기 · <kbd>ESC</kbd> 닫기
            </span>
            <span>
              CARRY WEIGHT {inventoryLoad} / {INVENTORY_CAPACITY}
            </span>
          </footer>
        </div>
      )}
      {buildOpen && (
        <ConstructionPanel
          position={pos}
          tile={world[pos.y]?.[pos.x]}
          stock={buildStock}
          building={buildings.get(`${pos.x},${pos.y}`)}
          onBuild={constructBuilding}
          onClose={() => setBuildOpen(false)}
        />
      )}
      {overviewOpen && (
        <WorldOverview
          width={W}
          height={H}
          revealed={revealed}
          world={world}
          pos={pos}
          visited={visited}
          buildings={buildings}
          pins={pins}
          palette={palette}
          showTrail={showTrail}
          onClose={() => setOverviewOpen(false)}
        />
      )}
      {settingsOpen && (
        <MapSettings
          showTrail={showTrail}
          setShowTrail={setShowTrail}
          gatherMode={gatherMode}
          setGatherMode={setGatherMode}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      {dead && (
        <div className="survival-failed">
          <small>SURVIVAL FAILED</small>
          <h2>불시착지에서 생존하지 못했습니다.</h2>
          <p>식량과 체력을 관리하고, 밤이 오기 전에 집을 건설하세요.</p>
          <button onClick={() => window.location.reload()}>
            처음부터 다시 시작
          </button>
        </div>
      )}
    </section>
  );
}

function SurfaceWorld({ body, onOrbit }) {
  return <ExplorationMap body={body} onOrbit={onOrbit} />;
}

function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [earthLocked, setEarthLocked] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [selectedObject, setSelectedObject] = useState(null);
  const [discovered, setDiscovered] = useState(() => new Set());
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [dateOffset, setDateOffset] = useState(0);
  const [focusTarget, setFocusTarget] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [birthSelectionOpen, setBirthSelectionOpen] = useState(false);
  const [birthSequence, setBirthSequence] = useState(null);
  const [birthBody, setBirthBody] = useState(null);
  const [surfaceMode, setSurfaceMode] = useState(false);
  const bodyPositions = useRef(new Map());
  const [telemetry, setTelemetry] = useState({
    x: 0,
    y: 5.2,
    z: 10.5,
    boost: false,
    moving: false,
  });
  const selected = selectedId ? COUNTRY_DATA[selectedId] : null;
  const discover = (name, point) => {
    setSelectedObject(name);
    setDiscovered((prev) => new Set([...prev, name]));
    setTimeSpeed(0);
    if (point) setFocusTarget([point.x, point.y, point.z]);
  };
  const displayDate = useMemo(() => {
    const d = new Date(2026, 10, 13);
    d.setDate(d.getDate() + dateOffset);
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [dateOffset]);
  const missions = [
    ["지구를 눌러 고정하기", earthLocked],
    ["토성 발견하기", discovered.has("토성")],
    ["달 발견하기", discovered.has("달")],
  ];
  const beginBirthJourney = (body) => {
    setBirthBody(body);
    setBirthSelectionOpen(false);
    setBirthSequence(body);
    setTimeSpeed(0);
    setSelectedObject(null);
    const target =
      bodyPositions.current.get(body) ||
      bodyPositions.current.get(MOON_PARENT[body]);
    if (target) setFocusTarget([target.x, target.y, target.z]);
    window.setTimeout(() => {
      setSelectedObject(null);
      setDiscovered(new Set([body]));
      setGameStarted(true);
      setSurfaceMode(true);
      setBirthSequence(null);
    }, 3600);
  };
  useEffect(() => {
    const release = (e) => {
      if (e.key === "Escape") {
        setEarthLocked(false);
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", release);
    return () => window.removeEventListener("keydown", release);
  }, []);
  return (
    <main
      className={`solar-page ${!gameStarted && !birthSelectionOpen && !birthSequence ? "intro-active" : ""} ${birthSequence ? "cinematic-active" : ""} ${surfaceMode ? "surface-active" : ""}`}
    >
      <header>
        <a className="brand" href="#" onClick={(e) => e.preventDefault()}>
          <span className="brand-orbit">✦</span>
          <span>몽글월드</span>
        </a>
        <nav>
          <span>태양계 탐사</span>
          <i>·</i>
          <span>FLIGHT 01</span>
        </nav>
        <div className="header-actions">
          {earthLocked && (
            <button
              className="view-reset"
              onClick={() => setEarthLocked(false)}
            >
              공전 재시작
            </button>
          )}
          <button
            className="view-reset"
            onClick={() => {
              setFocusTarget(null);
              setResetSignal((v) => v + 1);
            }}
          >
            전체 보기
          </button>
          <button className="sound" aria-label="소리 켜기">
            ♫
          </button>
        </div>
      </header>
      <section className="solar-hero">
        <div className="solar-canvas">
          <Canvas
            dpr={[1, 1.6]}
            shadows
            camera={{
              position: [0, 5.2, 10.5],
              fov: 48,
              near: 0.005,
              far: 120,
            }}
          >
            <color attach="background" args={["#020617"]} />
            <fog attach="fog" args={["#020617", 14, 42]} />
            <Stars
              radius={38}
              depth={28}
              count={240}
              factor={2.8}
              saturation={0.45}
              fade
              speed={0.12}
            />
            <ambientLight intensity={0.72} color="#7c9cff" />
            <hemisphereLight args={["#5adfff", "#160821", 1.25]} />
            <directionalLight
              position={[3, 6, 4]}
              intensity={3.2}
              color="#fff1bf"
            />
            <SolarSystem
              onSelect={setSelectedId}
              earthLocked={earthLocked}
              onEarthLock={() => setEarthLocked(true)}
              onDiscover={discover}
              timeSpeed={timeSpeed}
              dateOffset={dateOffset}
              onPosition={(name, pos) =>
                bodyPositions.current.set(name, pos.clone())
              }
            />
            <SolarControls
              resetSignal={resetSignal}
              focusTarget={focusTarget}
              focusDistance={birthSequence ? 0.42 : 1.5}
              gameStarted={gameStarted}
              onTelemetry={setTelemetry}
            />
          </Canvas>
          {gameStarted && (
            <>
              <div className="crosshair">
                <i />
                <i />
              </div>
              <div className="flight-hud left-hud">
                <small>ORIGIN / {birthBody}</small>
                <b>{telemetry.boost ? "BOOST" : "CRUISE"}</b>
                <span>X {telemetry.x.toFixed(1)}</span>
                <span>Y {telemetry.y.toFixed(1)}</span>
                <span>Z {telemetry.z.toFixed(1)}</span>
              </div>
              <div className="flight-hud right-hud">
                <small>SHIP CONTROL</small>
                <span>WASD 이동</span>
                <span>Q / E 하강·상승</span>
                <span>SHIFT 부스터</span>
              </div>
            </>
          )}
        </div>
        <AnimatePresence>
          {selectedObject && (
            <motion.aside
              className="explorer-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
            >
              <button className="close" onClick={() => setSelectedObject(null)}>
                ×
              </button>
              <span className="object-icon">
                {DISCOVERY_INFO[selectedObject]?.[0] || "✦"}
              </span>
              <small>ORBITAL SCAN</small>
              <h3>{selectedObject}</h3>
              <p>{DISCOVERY_INFO[selectedObject]?.[1]}</p>
              {SCIENCE_LAYER[selectedObject] && (
                <div className="science-layer">
                  <b>과학 탐사층</b>
                  {SCIENCE_LAYER[selectedObject]}
                </div>
              )}
              <em>휠을 올리면 표면 가까이 접근합니다</em>
            </motion.aside>
          )}
        </AnimatePresence>
        <aside className="mission-card">
          <strong>오늘의 우주 미션</strong>
          {missions.map(([label, done]) => (
            <span key={label} className={done ? "done" : ""}>
              {done ? "✓" : "○"} {label}
            </span>
          ))}
          <div className="stamp-progress">
            <b>{discovered.size}</b> / {Object.keys(DISCOVERY_INFO).length} 발견
          </div>
        </aside>
      </section>
      <div className="time-dock">
        <div>
          <small>공전 속도</small>
          {[
            [0, "정지"],
            [1, "보통"],
            [3, "빠르게"],
          ].map(([v, label]) => (
            <button
              key={v}
              className={timeSpeed === v ? "active" : ""}
              onClick={() => setTimeSpeed(v)}
            >
              {label}
            </button>
          ))}
        </div>
        <label>
          <small>{displayDate}</small>
          <input
            type="range"
            min="-3650"
            max="3650"
            step="30"
            value={dateOffset}
            onChange={(e) => setDateOffset(Number(e.target.value))}
          />
        </label>
        <span>실제 거리 로그 압축</span>
      </div>
      <div className="planet-strip">
        {PLANETS.map(([name, , , color]) => (
          <span key={name}>
            <i style={{ background: color }} />
            {name}
          </span>
        ))}
      </div>
      {!gameStarted && !birthSelectionOpen && !birthSequence && (
        <GameIntroScreen onStart={() => setBirthSelectionOpen(true)} />
      )}
      {!gameStarted && birthSelectionOpen && (
        <BirthScreen
          onBack={() => setBirthSelectionOpen(false)}
          onStart={beginBirthJourney}
        />
      )}
      {birthSequence && (
        <div className="birth-cinematic">
          <small>ORIGIN LOCKED</small>
          <h2>{birthSequence}</h2>
          <p>생명 신호 동기화 중</p>
          <i>
            <b />
          </i>
        </div>
      )}
      {surfaceMode && (
        <SurfaceWorld body={birthBody} onOrbit={() => setSurfaceMode(false)} />
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <>
    <App />
    <Analytics />
  </>,
);

import React from 'react';
import { PlateStyleId } from '../types/homebuying';

interface ArchitecturalPlateProps {
  plateId: PlateStyleId;
  title: string;
  subtitle: string;
  className?: string;
}

function SharedDefs() {
  return (
    <defs>
      <linearGradient id="skyWarm" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#DCE6EC" />
        <stop offset="55%" stopColor="#EFECE3" />
        <stop offset="100%" stopColor="#F6EFE2" />
      </linearGradient>
      <linearGradient id="skyCrisp" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D3E0EA" />
        <stop offset="65%" stopColor="#EBE9E1" />
        <stop offset="100%" stopColor="#F4EFE6" />
      </linearGradient>
      <linearGradient id="skyGolden" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#D9E2E8" />
        <stop offset="55%" stopColor="#F2E7D5" />
        <stop offset="100%" stopColor="#F8E9D2" />
      </linearGradient>
      <linearGradient id="glassReflect" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#465D71" />
        <stop offset="50%" stopColor="#6B8396" />
        <stop offset="100%" stopColor="#2F404F" />
      </linearGradient>
      <linearGradient id="lawnGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8CA17F" />
        <stop offset="100%" stopColor="#6D8362" />
      </linearGradient>
      <pattern id="brickPattern" width="24" height="12" patternUnits="userSpaceOnUse">
        <rect width="24" height="12" fill="#A64B37" />
        <path d="M0 0 H24 M0 6 H24 M12 0 V6 M0 6 V12 M24 6 V12" stroke="#8C3928" strokeWidth="0.9" opacity="0.55" />
      </pattern>
      <pattern id="brickDeep" width="22" height="11" patternUnits="userSpaceOnUse">
        <rect width="22" height="11" fill="#8E3B2B" />
        <path d="M0 0 H22 M0 5.5 H22 M11 0 V5.5 M0 5.5 V11" stroke="#6E2B1E" strokeWidth="0.9" opacity="0.55" />
      </pattern>
      <pattern id="paintedBrick" width="22" height="11" patternUnits="userSpaceOnUse">
        <rect width="22" height="11" fill="#F2EDE3" />
        <path d="M0 0 H22 M0 5.5 H22 M11 0 V5.5 M0 5.5 V11" stroke="#D7CFC0" strokeWidth="0.8" opacity="0.7" />
      </pattern>
      <pattern id="cedarSiding" width="40" height="10" patternUnits="userSpaceOnUse">
        <rect width="40" height="10" fill="#B58258" />
        <line x1="0" y1="10" x2="40" y2="10" stroke="#8E623E" strokeWidth="1.2" />
      </pattern>
      <pattern id="shingleSiding" width="20" height="12" patternUnits="userSpaceOnUse">
        <rect width="20" height="12" fill="#8B9388" />
        <path d="M0 12 H20 M10 0 V6 M0 6 H20 M5 6 V12 M15 6 V12" stroke="#6F776C" strokeWidth="0.8" opacity="0.65" />
      </pattern>
      <pattern id="clapboard" width="40" height="11" patternUnits="userSpaceOnUse">
        <rect width="40" height="11" fill="#ECE6DA" />
        <line x1="0" y1="10.5" x2="40" y2="10.5" stroke="#CFC7B6" strokeWidth="1.1" />
      </pattern>
      <pattern id="roofSlate" width="18" height="12" patternUnits="userSpaceOnUse">
        <rect width="18" height="12" fill="#39444E" />
        <path d="M0 6 H18 M9 0 V6 M0 6 V12 M18 6 V12" stroke="#28313A" strokeWidth="0.8" opacity="0.55" />
      </pattern>
    </defs>
  );
}

function SashWindow({
  x,
  y,
  w = 46,
  h = 74,
  shutters = false,
  shutterColor = '#2A3A35',
  arched = false,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  shutters?: boolean;
  shutterColor?: string;
  arched?: boolean;
}) {
  return (
    <g>
      {shutters && (
        <>
          <rect x={x - 16} y={y + 2} width={14} height={h - 4} fill={shutterColor} rx="1" />
          <rect x={x + w + 2} y={y + 2} width={14} height={h - 4} fill={shutterColor} rx="1" />
        </>
      )}
      {arched ? (
        <path
          d={`M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h} Z`}
          fill="url(#glassReflect)"
          stroke="#F4EFE6"
          strokeWidth="3.5"
        />
      ) : (
        <rect x={x} y={y} width={w} height={h} fill="url(#glassReflect)" stroke="#F4EFE6" strokeWidth="3.5" />
      )}
      <line x1={x} y1={y + h * 0.5} x2={x + w} y2={y + h * 0.5} stroke="#F4EFE6" strokeWidth="3" />
      <line x1={x + w * 0.5} y1={y + (arched ? w * 0.35 : 0)} x2={x + w * 0.5} y2={y + h} stroke="#F4EFE6" strokeWidth="1.6" />
      <rect x={x - 4} y={y + h} width={w + 8} height={6} fill="#E4DDD0" stroke="#BDB4A4" strokeWidth="0.8" />
    </g>
  );
}

function TreeCanopy({ cx, cy, r = 64, tone = '#566E51' }: { cx: number; cy: number; r?: number; tone?: string }) {
  return (
    <g>
      <path d={`M${cx} ${cy + r * 0.4} L${cx} ${cy + r * 1.9}`} stroke="#57473B" strokeWidth={Math.max(6, r * 0.14)} strokeLinecap="round" />
      <circle cx={cx - r * 0.42} cy={cy + r * 0.18} r={r * 0.65} fill={tone} opacity="0.92" />
      <circle cx={cx + r * 0.4} cy={cy + r * 0.22} r={r * 0.6} fill={tone} opacity="0.85" />
      <circle cx={cx} cy={cy - r * 0.15} r={r * 0.72} fill={tone} />
      <circle cx={cx - r * 0.15} cy={cy - r * 0.3} r={r * 0.42} fill="#7A9470" opacity="0.4" />
    </g>
  );
}

function renderScene(plateId: PlateStyleId) {
  switch (plateId) {
    case 'dupont_coop':
      return (
        <>
          <rect width="800" height="600" fill="url(#skyWarm)" />
          {/* Background street silhouette */}
          <rect x="0" y="190" width="145" height="310" fill="#DDD5C6" />
          <rect x="655" y="175" width="145" height="325" fill="#D5CCBC" />
          {/* Main Beaux-Arts 4-story building */}
          <rect x="135" y="102" width="530" height="398" fill="url(#brickPattern)" stroke="#6B2B1E" strokeWidth="1.5" />
          {/* Limestone ground base */}
          <rect x="135" y="378" width="530" height="122" fill="#E8E1D3" stroke="#BFB5A2" strokeWidth="1.2" />
          {/* Rusticated stone lines */}
          {[400, 424, 448, 472].map((ly) => (
            <line key={ly} x1="135" y1={ly} x2="665" y2={ly} stroke="#CFC6B5" strokeWidth="1" />
          ))}
          {/* Ornate limestone cornice */}
          <rect x="122" y="88" width="556" height="18" fill="#EAE3D5" stroke="#B7AE9D" strokeWidth="1.2" />
          <rect x="130" y="106" width="540" height="10" fill="#D6CEBD" />
          {/* Belt course */}
          <rect x="132" y="370" width="536" height="12" fill="#DDD5C5" stroke="#B7AE9D" strokeWidth="1" />
          {/* Windows grid (3 upper floors x 5 bays) */}
          {[138, 218, 294].map((wy, rowIdx) =>
            [172, 266, 376, 486, 580].map((wx) => (
              <SashWindow
                key={`${wy}-${wx}`}
                x={wx}
                y={wy}
                w={46}
                h={58}
                arched={rowIdx === 0}
              />
            ))
          )}
          {/* Ground floor windows */}
          <SashWindow x={172} y={404} w={48} h={64} arched />
          <SashWindow x={266} y={404} w={48} h={64} arched />
          <SashWindow x={486} y={404} w={48} h={64} arched />
          <SashWindow x={580} y={404} w={48} h={64} arched />
          {/* Grand Beaux-Arts limestone arched entry */}
          <path d="M352 500 V426 A48 48 0 0 1 448 426 V500 Z" fill="#D5CCB9" stroke="#A69C88" strokeWidth="2" />
          <path d="M366 500 V432 A34 34 0 0 1 434 432 V500 Z" fill="#2A333B" />
          <rect x="372" y="438" width="24" height="62" fill="#46596A" opacity="0.65" />
          <rect x="404" y="438" width="24" height="62" fill="#46596A" opacity="0.65" />
          {/* Brick sidewalk & street trees */}
          <rect x="0" y="500" width="800" height="100" fill="#D7CFC0" />
          <line x1="0" y1="538" x2="800" y2="538" stroke="#BFB5A4" strokeWidth="2" />
          <TreeCanopy cx={86} cy={386} r={58} tone="#506B4D" />
          <TreeCanopy cx={714} cy={382} r={62} tone="#4B6648" />
        </>
      );

    case 'petworth_rowhouse':
      return (
        <>
          <rect width="800" height="600" fill="url(#skyGolden)" />
          {/* Neighboring DC rowhouses */}
          <rect x="0" y="135" width="195" height="365" fill="#C9735B" opacity="0.55" />
          <rect x="605" y="145" width="195" height="355" fill="#B8846D" opacity="0.55" />
          {/* Main Wardman Porch-Front Brick Rowhouse */}
          <rect x="195" y="128" width="410" height="372" fill="url(#brickPattern)" stroke="#6E2A1D" strokeWidth="1.8" />
          {/* Classic DC parapet & cornice */}
          <rect x="188" y="108" width="424" height="22" fill="#323C46" />
          <rect x="195" y="130" width="410" height="9" fill="#E9E2D4" />
          {/* Second-floor projecting bay window on left */}
          <polygon points="222,162 415,162 428,176 428,292 210,292 210,176" fill="url(#brickDeep)" stroke="#68281C" strokeWidth="1.5" />
          <rect x="210" y="154" width="218" height="11" fill="#EFE9DD" />
          <SashWindow x={232} y={180} w={42} h={84} />
          <SashWindow x={296} y={180} w={48} h={84} />
          <SashWindow x={366} y={180} w={42} h={84} />
          {/* Right 2nd floor window */}
          <SashWindow x={485} y={180} w={56} h={84} />
          {/* Covered front porch roof & columns */}
          <polygon points="182,322 618,322 604,296 196,296" fill="url(#roofSlate)" stroke="#232B32" strokeWidth="1.5" />
          <rect x="186" y="320" width="428" height="14" fill="#F4EFE6" stroke="#CFC7B6" strokeWidth="1" />
          {/* Porch shadow interior */}
          <rect x="198" y="334" width="404" height="122" fill="#6F2B1E" opacity="0.32" />
          {/* Front bay & entry door under porch */}
          <SashWindow x={244} y={352} w={50} h={82} />
          <SashWindow x={312} y={352} w={50} h={82} />
          {/* Warm wood front door with transom */}
          <rect x="468" y="346" width="68" height="110" fill="#2A3B36" stroke="#F4EFE6" strokeWidth="4" />
          <rect x="476" y="354" width="52" height="22" fill="url(#glassReflect)" />
          <rect x="480" y="388" width="44" height="58" fill="#1E2D29" />
          {/* White porch columns & balustrade */}
          {[208, 412, 586].map((cx) => (
            <rect key={cx} x={cx} y="334" width="16" height="122" fill="#F7F3EA" stroke="#D2C9B8" strokeWidth="1" />
          ))}
          <rect x="195" y="422" width="232" height="10" fill="#F7F3EA" stroke="#D2C9B8" strokeWidth="1" />
          {/* Porch deck & brick stoop steps */}
          <rect x="190" y="456" width="420" height="44" fill="#8B3A2A" stroke="#662619" strokeWidth="1.2" />
          <rect x="444" y="456" width="112" height="58" fill="#E3DBCC" stroke="#BEB5A4" strokeWidth="1.2" />
          {[470, 484, 498].map((sy) => (
            <line key={sy} x1="444" y1={sy} x2="556" y2={sy} stroke="#B8AE9B" strokeWidth="1.5" />
          ))}
          {/* English basement window */}
          <rect x="255" y="468" width="84" height="24" fill="#2F404F" stroke="#EDE7DB" strokeWidth="2.5" />
          {/* Front yard & DC sidewalk */}
          <rect x="0" y="500" width="800" height="42" fill="url(#lawnGrad)" />
          <rect x="0" y="542" width="800" height="58" fill="#DBD3C4" />
          <TreeCanopy cx={95} cy={355} r={66} tone="#5F7A59" />
          <TreeCanopy cx={720} cy={372} r={54} tone="#6A8562" />
        </>
      );

    case 'silver_spring_rambler':
      return (
        <>
          <rect width="800" height="600" fill="url(#skyWarm)" />
          {/* Mature Silver Spring oaks behind house */}
          <TreeCanopy cx={115} cy={225} r={88} tone="#536C4D" />
          <TreeCanopy cx={685} cy={235} r={92} tone="#4A6445" />
          {/* Wide single-story hipped roof */}
          <polygon points="88,286 205,198 595,198 712,286" fill="url(#roofSlate)" stroke="#242C34" strokeWidth="1.5" />
          {/* Brick chimney */}
          <rect x="242" y="158" width="44" height="68" fill="url(#brickDeep)" stroke="#68281C" strokeWidth="1.2" />
          <rect x="237" y="154" width="54" height="8" fill="#DDD5C5" />
          {/* Main brick body */}
          <rect x="112" y="286" width="576" height="172" fill="url(#brickPattern)" stroke="#752E20" strokeWidth="1.5" />
          {/* White fascia trim */}
          <rect x="86" y="282" width="628" height="11" fill="#F5F0E6" />
          {/* Large mid-century picture window on left */}
          <rect x="152" y="324" width="166" height="86" fill="url(#glassReflect)" stroke="#F5F0E6" strokeWidth="5" />
          <line x1="202" y1="324" x2="202" y2="410" stroke="#F5F0E6" strokeWidth="3.5" />
          <line x1="268" y1="324" x2="268" y2="410" stroke="#F5F0E6" strokeWidth="3.5" />
          <rect x="146" y="410" width="178" height="8" fill="#E3DACB" />
          {/* Entry portico */}
          <rect x="368" y="330" width="68" height="128" fill="#2A3E38" stroke="#F5F0E6" strokeWidth="4" />
          <rect x="384" y="346" width="36" height="32" fill="url(#glassReflect)" />
          <rect x="356" y="446" width="92" height="14" fill="#DCD3C2" />
          {/* Right bedroom windows */}
          <SashWindow x={486} y={326} w={54} h={74} shutters shutterColor="#2E3D39" />
          <SashWindow x={592} y={326} w={54} h={74} shutters shutterColor="#2E3D39" />
          {/* Green front lawn & paved side driveway */}
          <rect x="0" y="458" width="800" height="142" fill="url(#lawnGrad)" />
          <polygon points="620,458 755,458 800,600 660,600" fill="#CFC8BC" />
          {/* Curved front flagstone walk */}
          <path d="M368 460 Q390 535 320 600 L422 600 Q442 535 436 460 Z" fill="#DED7C8" />
          {/* Foundation hedges */}
          {[168, 222, 280, 505, 565, 625].map((hx) => (
            <ellipse key={hx} cx={hx} cy={456} rx="34" ry="18" fill="#476042" />
          ))}
        </>
      );

    case 'hyattsville_townhome':
      return (
        <>
          <rect width="800" height="600" fill="url(#skyCrisp)" />
          {/* Flanking Colonial brick townhomes */}
          <rect x="0" y="160" width="218" height="335" fill="#B5654E" opacity="0.62" />
          <polygon points="0,160 110,92 218,160" fill="#4A5560" opacity="0.65" />
          <rect x="582" y="160" width="218" height="335" fill="#9E5643" opacity="0.62" />
          <polygon points="582,160 692,92 800,160" fill="#4A5560" opacity="0.65" />
          {/* Center 3-story Colonial townhome */}
          <polygon points="210,160 400,76 590,160" fill="url(#roofSlate)" stroke="#232B32" strokeWidth="1.5" />
          <rect x="218" y="160" width="364" height="335" fill="url(#brickPattern)" stroke="#6D2B1D" strokeWidth="1.8" />
          {/* Crisp white gable trim & decorative round attic vent */}
          <polygon points="210,160 400,82 590,160 578,160 400,92 222,160" fill="#F5F0E6" />
          <circle cx="400" cy="126" r="14" fill="#F5F0E6" stroke="#CFC7B6" strokeWidth="1.5" />
          {/* Top floor windows (3rd floor) */}
          <SashWindow x={264} y={182} w={50} h={68} shutters shutterColor="#1E272E" />
          <SashWindow x={375} y={182} w={50} h={68} shutters shutterColor="#1E272E" />
          <SashWindow x={486} y={182} w={50} h={68} shutters shutterColor="#1E272E" />
          {/* Main living level (2nd floor) */}
          <SashWindow x={264} y={286} w={50} h={76} shutters shutterColor="#1E272E" />
          <SashWindow x={375} y={286} w={50} h={76} shutters shutterColor="#1E272E" />
          <SashWindow x={486} y={286} w={50} h={76} shutters shutterColor="#1E272E" />
          {/* Ground entry level with portico & brick steps */}
          <rect x="262" y="400" width="110" height="64" fill="url(#glassReflect)" stroke="#F5F0E6" strokeWidth="4" />
          <polygon points="442,394 494,368 546,394" fill="#F5F0E6" stroke="#C5BDB0" strokeWidth="1.2" />
          <rect x="462" y="394" width="64" height="101" fill="#23313F" stroke="#F5F0E6" strokeWidth="4" />
          {/* Front yard & sidewalk */}
          <rect x="0" y="495" width="800" height="45" fill="url(#lawnGrad)" />
          <rect x="0" y="540" width="800" height="60" fill="#DFD8CA" />
          <rect x="454" y="495" width="80" height="45" fill="#E8E1D3" />
          <TreeCanopy cx={110} cy={390} r={54} tone="#577151" />
          <TreeCanopy cx={705} cy={386} r={58} tone="#4E6949" />
        </>
      );

    case 'ballston_condo':
      return (
        <>
          <rect width="800" height="600" fill="url(#skyCrisp)" />
          {/* Contemporary Arlington mid-rise */}
          <rect x="115" y="70" width="570" height="430" fill="#E8E2D6" stroke="#BEB5A4" strokeWidth="1.5" />
          {/* Brick architectural wing */}
          <rect x="115" y="70" width="195" height="430" fill="url(#brickPattern)" />
          <rect x="520" y="70" width="165" height="430" fill="url(#brickDeep)" />
          {/* Central glass curtain-wall bay */}
          <rect x="310" y="88" width="210" height="340" fill="#324352" />
          {[104, 184, 264, 344].map((fy) => (
            <g key={fy}>
              {/* Glass curtain panes */}
              <rect x="322" y={fy} width="88" height="66" fill="url(#glassReflect)" stroke="#E8E2D6" strokeWidth="2.5" />
              <rect x="420" y={fy} width="88" height="66" fill="url(#glassReflect)" stroke="#E8E2D6" strokeWidth="2.5" />
              {/* Juliet balcony rails */}
              <rect x="322" y={fy + 40} width="88" height="26" fill="none" stroke="#1E242B" strokeWidth="2" />
              <rect x="420" y={fy + 40} width="88" height="26" fill="none" stroke="#1E242B" strokeWidth="2" />
              {/* Brick wing tall windows */}
              <rect x="148" y={fy} width="54" height="66" fill="url(#glassReflect)" stroke="#EAE4D8" strokeWidth="2.5" />
              <rect x="224" y={fy} width="54" height="66" fill="url(#glassReflect)" stroke="#EAE4D8" strokeWidth="2.5" />
              <rect x="548" y={fy} width="50" height="66" fill="url(#glassReflect)" stroke="#EAE4D8" strokeWidth="2.5" />
              <rect x="614" y={fy} width="46" height="66" fill="url(#glassReflect)" stroke="#EAE4D8" strokeWidth="2.5" />
            </g>
          ))}
          {/* Sleek ground lobby & canopy */}
          <rect x="310" y="428" width="210" height="72" fill="#2A3844" />
          <rect x="330" y="438" width="170" height="62" fill="url(#glassReflect)" />
          <rect x="292" y="420" width="246" height="12" fill="#1E242B" />
          {/* Walkable urban sidewalk & street trees */}
          <rect x="0" y="500" width="800" height="100" fill="#DCD6C8" />
          <line x1="0" y1="546" x2="800" y2="546" stroke="#C2B9A8" strokeWidth="2" />
          <TreeCanopy cx={72} cy={390} r={54} tone="#587454" />
          <TreeCanopy cx={730} cy={386} r={58} tone="#526D4E" />
        </>
      );

    case 'alexandria_endunit':
      return (
        <>
          <rect width="800" height="600" fill="url(#skyGolden)" />
          {/* Attached interior neighbor on left */}
          <rect x="0" y="172" width="185" height="318" fill="#B76A53" opacity="0.6" />
          <polygon points="0,172 185,172 185,108 0,108" fill="#46515C" opacity="0.65" />
          {/* End-unit main brick Colonial townhome */}
          <polygon points="182,172 182,102 528,102 574,172" fill="url(#roofSlate)" stroke="#232B32" strokeWidth="1.5" />
          <rect x="185" y="172" width="352" height="318" fill="url(#brickPattern)" stroke="#6D2A1D" strokeWidth="1.8" />
          {/* End-unit side exposure wall in subtle perspective */}
          <polygon points="537,172 606,192 606,490 537,490" fill="#DFD8CA" stroke="#B7AEA0" strokeWidth="1.2" />
          {/* Side windows (extra natural light!) */}
          <rect x="556" y="218" width="28" height="58" fill="url(#glassReflect)" stroke="#F6F2EA" strokeWidth="2.5" />
          <rect x="556" y="318" width="28" height="58" fill="url(#glassReflect)" stroke="#F6F2EA" strokeWidth="2.5" />
          {/* Front upper windows */}
          <SashWindow x={232} y={206} w={52} h={74} shutters shutterColor="#243530" />
          <SashWindow x={338} y={206} w={52} h={74} shutters shutterColor="#243530" />
          <SashWindow x={444} y={206} w={52} h={74} shutters shutterColor="#243530" />
          {/* Ground-floor bay window + Colonial front door */}
          <polygon points="218,332 360,332 372,348 372,442 206,442 206,348" fill="#F4EFE6" stroke="#C5BCB0" strokeWidth="1.5" />
          <rect x="224" y="352" width="36" height="72" fill="url(#glassReflect)" stroke="#EAE3D5" strokeWidth="2" />
          <rect x="268" y="352" width="44" height="72" fill="url(#glassReflect)" stroke="#EAE3D5" strokeWidth="2" />
          <rect x="320" y="352" width="36" height="72" fill="url(#glassReflect)" stroke="#EAE3D5" strokeWidth="2" />
          <rect x="424" y="346" width="66" height="144" fill="#233730" stroke="#F5F0E6" strokeWidth="4" />
          <rect x="424" y="324" width="66" height="16" fill="#F5F0E6" />
          {/* Wooden privacy fence on side lot */}
          <rect x="606" y="402" width="160" height="88" fill="#B89B78" stroke="#8C7152" strokeWidth="1.2" />
          {[626, 646, 666, 686, 706, 726, 746].map((fx) => (
            <line key={fx} x1={fx} y1="402" x2={fx} y2="490" stroke="#8C7152" strokeWidth="1" />
          ))}
          {/* Green lawn & brick walkway */}
          <rect x="0" y="490" width="800" height="110" fill="url(#lawnGrad)" />
          <polygon points="424,490 490,490 520,600 398,600" fill="#A14E3A" />
          <TreeCanopy cx={712} cy={312} r={74} tone="#506A4B" />
        </>
      );

    case 'reston_garden':
      return (
        <>
          <rect width="800" height="600" fill="url(#skyWarm)" />
          {/* Lush Reston forest backdrop */}
          <TreeCanopy cx={96} cy={200} r={96} tone="#425C3E" />
          <TreeCanopy cx={210} cy={170} r={88} tone="#4E6A49" />
          <TreeCanopy cx={610} cy={175} r={94} tone="#456141" />
          <TreeCanopy cx={725} cy={210} r={92} tone="#3D5539" />
          {/* Low-rise 1979 garden condo building */}
          <polygon points="118,200 170,152 630,152 682,200" fill="url(#roofSlate)" />
          <rect x="135" y="200" width="530" height="288" fill="url(#cedarSiding)" stroke="#754D2E" strokeWidth="1.5" />
          {/* Brick structural piers */}
          <rect x="135" y="200" width="68" height="288" fill="url(#brickDeep)" />
          <rect x="372" y="200" width="56" height="288" fill="url(#brickDeep)" />
          <rect x="597" y="200" width="68" height="288" fill="url(#brickDeep)" />
          {/* Stacked private covered balconies (left & right units) */}
          {[226, 354].map((by) => (
            <g key={by}>
              {/* Left balcony */}
              <rect x="218" y={by} width="138" height="96" fill="#46372C" opacity="0.45" />
              <rect x="234" y={by + 10} width="106" height="82" fill="url(#glassReflect)" stroke="#EDE6D8" strokeWidth="3" />
              <line x1="287" y1={by + 10} x2="287" y2={by + 92} stroke="#EDE6D8" strokeWidth="3" />
              <rect x="214" y={by + 64} width="146" height="34" fill="#9A6C48" stroke="#6E4A2E" strokeWidth="1.4" />
              {/* Right balcony */}
              <rect x="444" y={by} width="138" height="96" fill="#46372C" opacity="0.45" />
              <rect x="460" y={by + 10} width="106" height="82" fill="url(#glassReflect)" stroke="#EDE6D8" strokeWidth="3" />
              <line x1="513" y1={by + 10} x2="513" y2={by + 92} stroke="#EDE6D8" strokeWidth="3" />
              <rect x="440" y={by + 64} width="146" height="34" fill="#9A6C48" stroke="#6E4A2E" strokeWidth="1.4" />
            </g>
          ))}
          {/* Wooded Reston trail & lawn */}
          <rect x="0" y="488" width="800" height="112" fill="url(#lawnGrad)" />
          <path d="M0 544 Q280 518 520 554 T800 532 L800 578 Q520 598 280 562 T0 582 Z" fill="#D5CCB8" />
          <TreeCanopy cx={84} cy={386} r={58} tone="#577451" />
          <TreeCanopy cx={720} cy={390} r={60} tone="#4E6A49" />
        </>
      );

    case 'bowie_capecod':
      return (
        <>
          <rect width="800" height="600" fill="url(#skyCrisp)" />
          <TreeCanopy cx={102} cy={258} r={78} tone="#556F4F" />
          <TreeCanopy cx={704} cy={246} r={82} tone="#4C6646" />
          {/* Classic steep Cape Cod roof */}
          <polygon points="122,292 212,162 588,162 678,292" fill="url(#roofSlate)" stroke="#232C34" strokeWidth="1.6" />
          {/* Brick chimney */}
          <rect x="524" y="128" width="38" height="64" fill="url(#brickDeep)" />
          {/* Twin classic dormer windows */}
          {[242, 476].map((dx) => (
            <g key={dx}>
              <polygon points={`${dx - 8},218 ${dx + 41},182 ${dx + 90},218`} fill="url(#roofSlate)" stroke="#232C34" strokeWidth="1.2" />
              <rect x={dx} y={218} width={82} height={74} fill="url(#clapboard)" stroke="#C6BEB0" strokeWidth="1.2" />
              <SashWindow x={dx + 19} y={226} w={44} h={56} />
            </g>
          ))}
          {/* Main Cape Cod clapboard body */}
          <rect x="142" y="292" width="516" height="176" fill="url(#clapboard)" stroke="#BFB6A6" strokeWidth="1.5" />
          <rect x="118" y="286" width="564" height="10" fill="#FAF7F0" />
          {/* Symmetrical ground floor windows + center door */}
          <SashWindow x={196} y={332} w={52} h={78} shutters shutterColor="#31414D" />
          <SashWindow x={294} y={332} w={52} h={78} shutters shutterColor="#31414D" />
          <rect x="374" y="338" width="54" height="130" fill="#8E3B2B" stroke="#FAF7F0" strokeWidth="4" />
          <SashWindow x={456} y={332} w={52} h={78} shutters shutterColor="#31414D" />
          <SashWindow x={554} y={332} w={52} h={78} shutters shutterColor="#31414D" />
          {/* Spacious Levitt Bowie lawn & driveway */}
          <rect x="0" y="468" width="800" height="132" fill="url(#lawnGrad)" />
          <polygon points="622,468 740,468 795,600 658,600" fill="#D5CEC0" />
          <rect x="366" y="468" width="70" height="132" fill="#E3DCD0" />
        </>
      );

    case 'takoma_craftsman':
      return (
        <>
          <rect width="800" height="600" fill="url(#skyGolden)" />
          <TreeCanopy cx={96} cy={220} r={86} tone="#4B6646" />
          <TreeCanopy cx={712} cy={230} r={84} tone="#55724F" />
          {/* Broad low-pitched Craftsman gable roof with exposed eaves */}
          <polygon points="104,260 400,118 696,260" fill="url(#roofSlate)" stroke="#232B32" strokeWidth="2" />
          <polygon points="132,260 400,136 668,260" fill="url(#shingleSiding)" stroke="#5E665C" strokeWidth="1.5" />
          {/* Attic triple craftsman window */}
          <rect x="342" y="182" width="116" height="52" fill="url(#glassReflect)" stroke="#F3EDE0" strokeWidth="4" />
          <line x1="380" y1="182" x2="380" y2="234" stroke="#F3EDE0" strokeWidth="3" />
          <line x1="420" y1="182" x2="420" y2="234" stroke="#F3EDE0" strokeWidth="3" />
          {/* Main shingle body */}
          <rect x="148" y="260" width="504" height="224" fill="url(#shingleSiding)" stroke="#5A6358" strokeWidth="1.5" />
          {/* Full-width shaded front porch roof */}
          <polygon points="116,326 156,282 644,282 684,326" fill="url(#roofSlate)" />
          <rect x="122" y="324" width="556" height="14" fill="#F2ECE0" />
          {/* Porch recess */}
          <rect x="156" y="338" width="488" height="122" fill="#323A33" opacity="0.34" />
          <SashWindow x={208} y={356} w={74} h={76} />
          <rect x="366" y="352" width="68" height="108" fill="#6D4329" stroke="#F2ECE0" strokeWidth="4" />
          <SashWindow x={518} y={356} w={74} h={76} />
          {/* Tapered Craftsman stone & wood porch piers */}
          {[156, 308, 466, 616].map((px) => (
            <g key={px}>
              <polygon points={`${px + 6},338 ${px + 22},338 ${px + 25},408 ${px + 3},408`} fill="#F4EFE4" stroke="#C8C0B0" strokeWidth="1" />
              <polygon points={`${px},408 ${px + 28},408 ${px + 32},484 ${px - 4},484`} fill="#A99F8F" stroke="#7E7568" strokeWidth="1.2" />
            </g>
          ))}
          {/* Porch steps & lush Takoma garden */}
          <rect x="146" y="458" width="508" height="26" fill="#A99F8F" />
          <rect x="352" y="458" width="96" height="44" fill="#DCD4C5" stroke="#B2A898" strokeWidth="1.2" />
          <rect x="0" y="484" width="800" height="116" fill="url(#lawnGrad)" />
          {[190, 260, 535, 610].map((gx) => (
            <ellipse key={gx} cx={gx} cy={488} rx="38" ry="18" fill="#5D7B55" />
          ))}
        </>
      );

    case 'arlington_colonial':
      return (
        <>
          <rect width="800" height="600" fill="url(#skyWarm)" />
          <TreeCanopy cx={90} cy={225} r={86} tone="#4E6949" />
          <TreeCanopy cx={710} cy={235} r={82} tone="#476142" />
          {/* Side brick chimney */}
          <rect x="136" y="138" width="38" height="332" fill="url(#brickDeep)" />
          {/* Classic Colonial side-gable roof */}
          <polygon points="132,202 192,126 608,126 668,202" fill="url(#roofSlate)" stroke="#232B32" strokeWidth="1.5" />
          {/* Five-bay red brick facade */}
          <rect x="160" y="202" width="480" height="268" fill="url(#brickPattern)" stroke="#6C2A1D" strokeWidth="1.6" />
          <rect x="148" y="198" width="504" height="12" fill="#F5F0E6" />
          {/* Upper five symmetrical windows */}
          {[198, 286, 376, 466, 554].map((wx) => (
            <SashWindow key={wx} x={wx} y={230} w={46} h={74} shutters shutterColor="#1E3C31" />
          ))}
          {/* Lower windows flanking pedimented center doorway */}
          <SashWindow x={198} y={346} w={48} h={82} shutters shutterColor="#1E3C31" />
          <SashWindow x={286} y={346} w={48} h={82} shutters shutterColor="#1E3C31" />
          <SashWindow x={466} y={346} w={48} h={82} shutters shutterColor="#1E3C31" />
          <SashWindow x={554} y={346} w={48} h={82} shutters shutterColor="#1E3C31" />
          {/* Pedimented Colonial front portico */}
          <polygon points="354,344 400,316 446,344" fill="#F5F0E6" stroke="#C5BDB0" strokeWidth="1.2" />
          <rect x="368" y="344" width="64" height="126" fill="#1E3C31" stroke="#F5F0E6" strokeWidth="4" />
          {/* Lawn & flagstone path */}
          <rect x="0" y="470" width="800" height="130" fill="url(#lawnGrad)" />
          <polygon points="366,470 434,470 456,600 344,600" fill="#DED7C8" />
        </>
      );

    case 'navy_yard_loft':
      return (
        <>
          <rect width="800" height="600" fill="url(#skyCrisp)" />
          {/* Modern industrial brick & steel loft building */}
          <rect x="112" y="88" width="576" height="412" fill="url(#brickDeep)" stroke="#522116" strokeWidth="1.8" />
          {/* Black steel horizontal beams */}
          {[88, 198, 308, 418].map((by) => (
            <rect key={by} x="106" y={by} width="588" height="12" fill="#232A31" />
          ))}
          {/* Oversized factory-style multi-pane windows */}
          {[116, 226, 336].map((wy) =>
            [144, 326, 508].map((wx) => (
              <g key={`${wy}-${wx}`}>
                <rect x={wx} y={wy} width={148} height={74} fill="url(#glassReflect)" stroke="#232A31" strokeWidth="4" />
                <line x1={wx + 50} y1={wy} x2={wx + 50} y2={wy + 74} stroke="#232A31" strokeWidth="2.5" />
                <line x1={wx + 98} y1={wy} x2={wx + 98} y2={wy + 74} stroke="#232A31" strokeWidth="2.5" />
                <line x1={wx} y1={wy + 37} x2={wx + 148} y2={wy + 37} stroke="#232A31" strokeWidth="2.5" />
              </g>
            ))
          )}
          {/* Ground floor steel & glass entrance */}
          <rect x="316" y="430" width="168" height="70" fill="url(#glassReflect)" stroke="#232A31" strokeWidth="4" />
          <rect x="144" y="440" width="142" height="50" fill="url(#glassReflect)" stroke="#232A31" strokeWidth="3" />
          <rect x="514" y="440" width="142" height="50" fill="url(#glassReflect)" stroke="#232A31" strokeWidth="3" />
          {/* Urban streetscape */}
          <rect x="0" y="500" width="800" height="100" fill="#D9D3C7" />
          <TreeCanopy cx={72} cy={394} r={54} tone="#597455" />
          <TreeCanopy cx={728} cy={394} r={54} tone="#597455" />
        </>
      );

    case 'del_ray_townhome':
    default:
      return (
        <>
          <rect width="800" height="600" fill="url(#skyGolden)" />
          <TreeCanopy cx={94} cy={240} r={82} tone="#577353" />
          <TreeCanopy cx={708} cy={255} r={78} tone="#4E6A4A" />
          {/* Semi-detached painted brick neighbor glimpse */}
          <rect x="0" y="182" width="192" height="308" fill="#E3DDD0" opacity="0.72" />
          <polygon points="0,182 192,182 192,118 0,118" fill="#46525C" opacity="0.68" />
          {/* Main Del Ray 1940s white-painted brick townhome */}
          <polygon points="186,182 186,112 560,112 612,182" fill="url(#roofSlate)" stroke="#232B32" strokeWidth="1.5" />
          <rect x="192" y="182" width="388" height="308" fill="url(#paintedBrick)" stroke="#C2B9A8" strokeWidth="1.5" />
          {/* Second floor windows */}
          <SashWindow x={246} y={214} w={54} h={76} shutters shutterColor="#314740" />
          <SashWindow x={360} y={214} w={54} h={76} shutters shutterColor="#314740" />
          <SashWindow x={474} y={214} w={54} h={76} shutters shutterColor="#314740" />
          {/* Inviting Del Ray covered front porch */}
          <polygon points="178,336 206,304 568,304 596,336" fill="url(#roofSlate)" />
          <rect x="182" y="334" width="410" height="12" fill="#FAF7F1" />
          <rect x="192" y="346" width="388" height="114" fill="#6B6255" opacity="0.16" />
          <SashWindow x={244} y={362} w={58} h={76} />
          <SashWindow x={320} y={362} w={58} h={76} />
          <rect x="462" y="358" width="64" height="102" fill="#9E3B26" stroke="#FAF7F1" strokeWidth="4" />
          {/* White porch columns */}
          {[204, 412, 558].map((cx) => (
            <rect key={cx} x={cx} y={346} width="14" height="114" fill="#FAF7F1" stroke="#CFC7B8" strokeWidth="1" />
          ))}
          <rect x="192" y="460" width="388" height="30" fill="#B68B64" stroke="#8F6947" strokeWidth="1.2" />
          {/* Green garden yard & low white picket fence */}
          <rect x="0" y="490" width="800" height="110" fill="url(#lawnGrad)" />
          <rect x="140" y="518" width="275" height="34" fill="none" />
          {Array.from({ length: 18 }).map((_, idx) => (
            <rect key={idx} x={132 + idx * 18} y={516} width="8" height="38" fill="#FAF7F1" stroke="#D5CEC0" strokeWidth="0.8" />
          ))}
          <rect x="132" y="526" width="314" height="5" fill="#FAF7F1" />
          <rect x="132" y="544" width="314" height="5" fill="#FAF7F1" />
          {/* Hydrangea shrubs */}
          <circle cx="212" cy="508" r="18" fill="#6F8C67" />
          <circle cx="250" cy="510" r="15" fill="#7D9874" />
          <circle cx="536" cy="508" r="18" fill="#6F8C67" />
        </>
      );
  }
}

export const ArchitecturalPlate: React.FC<ArchitecturalPlateProps> = ({
  plateId,
  title,
  subtitle,
  className = '',
}) => {
  return (
    <figure className={`w-full ${className}`}>
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl border border-[#DCD5C7] bg-[#EFECE4]">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full object-cover block"
          role="img"
          aria-label={`Architectural elevation illustration of ${title} — ${subtitle}`}
        >
          <SharedDefs />
          {renderScene(plateId)}
          {/* Subtle archival border hairline inside plate */}
          <rect
            x="10"
            y="10"
            width="780"
            height="580"
            fill="none"
            stroke="#FCFBF8"
            strokeWidth="2"
            opacity="0.55"
          />
        </svg>
      </div>
      <figcaption className="mt-2.5 text-sm font-serif italic text-[#524E49]">
        {subtitle}
      </figcaption>
    </figure>
  );
};

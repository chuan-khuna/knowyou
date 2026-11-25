import {
  NEIGHBOURS_VIEWBOX,
  NEIGHBOUR_SHAPES,
  PROVINCES,
  PROVINCE_IDS,
  PROVINCE_ISO,
  PROVINCE_RULES,
  PROVINCE_SHAPES,
  THAILAND_VIEWBOX,
  type NeighbourCode,
  type ProvinceId,
} from "@/games/province";

/**
 * How a province is drawn from its belief: faded to the paper tone once the
 * game has ruled it out, otherwise tinted toward the accent by its share of
 * the leader's belief.
 */
function fillFor(p: number, leader: number): string {
  const share = leader > 0 ? p / leader : 0;
  if (share < PROVINCE_RULES.ruledOutBelow) return "var(--color-paper-3)";
  const accent = Math.round(18 + 82 * Math.sqrt(share));
  return `color-mix(in oklch, var(--color-accent) ${accent}%, var(--color-paper-2))`;
}

const shapeOf = (id: ProvinceId) => PROVINCE_SHAPES[PROVINCE_ISO[id]]!;

export const ruledOutCount = (belief: readonly number[]): number => {
  const leader = Math.max(...belief);
  return belief.filter((p) => p / leader < PROVINCE_RULES.ruledOutBelow).length;
};

/** The small map beside each question. Provinces the game has ruled out fade. */
export function LiveMap({ belief }: { belief: readonly number[] }) {
  const leader = Math.max(...belief);
  const out = ruledOutCount(belief);
  return (
    <svg viewBox={THAILAND_VIEWBOX} className="map" role="img" aria-label={`แผนที่ประเทศไทย ตัดออกไปแล้ว ${out} จาก 77 จังหวัด`}>
      {PROVINCE_IDS.map((id, i) => (
        <path key={id} d={shapeOf(id).d} className="map-province" style={{ fill: fillFor(belief[i]!, leader) }} />
      ))}
    </svg>
  );
}

/**
 * The result map: every province tinted by the final belief, the guess
 * outlined in ink and the player's real province, when given, in mint.
 */
export function ResultMap({ belief, guess, real }: { belief: readonly number[]; guess: ProvinceId; real?: ProvinceId }) {
  const leader = Math.max(...belief);
  const label =
    `แผนที่ความเชื่อของเกม จังหวัดที่สีเข้มคือจังหวัดที่เกมคิดว่าน่าจะใช่ ทาย${PROVINCES[guess].name}` +
    (real && real !== guess ? ` จังหวัดจริงคือ${PROVINCES[real].name}` : "");
  const marked = real && real !== guess ? ([guess, real] as const) : ([guess] as const);
  return (
    <svg viewBox={THAILAND_VIEWBOX} className="map map--result" role="img" aria-label={label}>
      {PROVINCE_IDS.map((id, i) => (
        <path key={id} d={shapeOf(id).d} className="map-province" style={{ fill: fillFor(belief[i]!, leader) }} />
      ))}
      {marked.map((id) => (
        <path key={`mark-${id}`} d={shapeOf(id).d} className={id === guess ? "map-mark map-mark--guess" : "map-mark map-mark--real"} />
      ))}
      {marked.map((id) => {
        const [x, y] = shapeOf(id).at;
        const left = x > 640;
        return (
          <text key={`label-${id}`} x={x + (left ? -28 : 28)} y={y + 12} textAnchor={left ? "end" : "start"} className={id === guess ? "map-label" : "map-label map-label--real"}>
            {PROVINCES[id].name}
          </text>
        );
      })}
    </svg>
  );
}

const NEIGHBOUR_NAMES: Record<NeighbourCode, string> = { MM: "เมียนมา", LA: "ลาว", KH: "กัมพูชา", MY: "มาเลเซีย" };

/** Thailand with its four land neighbours labelled, for the nearest-neighbour question. */
export function NeighboursMap() {
  const codes = Object.keys(NEIGHBOUR_SHAPES) as NeighbourCode[];
  return (
    <figure className="sheet neighbours-figure">
      <svg viewBox={NEIGHBOURS_VIEWBOX} className="map map--neighbours" role="img" aria-label="แผนที่ประเทศไทยกับเพื่อนบ้าน เมียนมาอยู่ทางตะวันตก ลาวทางเหนือและตะวันออก กัมพูชาทางตะวันออก มาเลเซียทางใต้">
        {codes.map((code) => (
          <path key={code} d={NEIGHBOUR_SHAPES[code].d} className="map-neighbour" />
        ))}
        {PROVINCE_IDS.map((id) => (
          <path key={id} d={shapeOf(id).d} className="map-thailand" />
        ))}
        {codes.map((code) => {
          const [x, y] = NEIGHBOUR_SHAPES[code].at;
          return (
            <text key={`label-${code}`} x={x} y={y} textAnchor="middle" className="map-label map-label--country">
              {NEIGHBOUR_NAMES[code]}
            </text>
          );
        })}
        <text x={560} y={820} textAnchor="middle" className="map-label map-label--country">
          ไทย
        </text>
      </svg>
    </figure>
  );
}

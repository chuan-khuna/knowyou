import {
  MAP_VIEWBOX,
  NEIGHBOUR_SHAPES,
  PROVINCES,
  PROVINCE_IDS,
  PROVINCE_ISO,
  PROVINCE_RULES,
  PROVINCE_SHAPES,
  type NeighbourCode,
  type ProvinceId,
} from "@/games/province";

const [VIEW_X, VIEW_Y, VIEW_W, VIEW_H] = MAP_VIEWBOX.split(" ").map(Number) as [number, number, number, number];
const NEIGHBOURS = Object.keys(NEIGHBOUR_SHAPES) as NeighbourCode[];
const NEIGHBOUR_NAMES: Record<NeighbourCode, string> = { MM: "เมียนมา", LA: "ลาว", KH: "กัมพูชา", MY: "มาเลเซีย" };
/** Myanmar shows only a thin strip at the frame's west edge, so its name starts at the edge instead of centring on it. */
const WEST_EDGE_LABEL: NeighbourCode = "MM";

/**
 * How a province is drawn from its belief: the plain paper-3 grey once the
 * game has ruled it out, otherwise that grey warmed toward the deep accent by
 * its share of the leader's belief, so the leader is the strongest amber and
 * no live province is quieter than a ruled-out one.
 */
function fillFor(p: number, leader: number): string {
  const share = leader > 0 ? p / leader : 0;
  if (share < PROVINCE_RULES.ruledOutBelow) return "var(--color-paper-3)";
  const accent = Math.round(25 + 75 * Math.sqrt(share));
  return `color-mix(in oklch, var(--color-accent-deep) ${accent}%, var(--color-paper-3))`;
}

const shapeOf = (id: ProvinceId) => PROVINCE_SHAPES[PROVINCE_ISO[id]]!;

export const ruledOutCount = (belief: readonly number[]): number => {
  const leader = Math.max(...belief);
  return belief.filter((p) => p / leader < PROVINCE_RULES.ruledOutBelow).length;
};

/** Myanmar, Laos, Cambodia and Malaysia as muted context, clipped to the map's frame. */
function Neighbours() {
  return NEIGHBOURS.map((code) => <path key={code} d={NEIGHBOUR_SHAPES[code].d} className="map-neighbour" />);
}

function Provinces({ belief }: { belief: readonly number[] }) {
  const leader = Math.max(...belief);
  return PROVINCE_IDS.map((id, i) => (
    <path key={id} d={shapeOf(id).d} className="map-province" style={{ fill: fillFor(belief[i]!, leader) }} />
  ));
}

/**
 * The small map beside each question. Provinces the game has ruled out fade.
 * While the question asks about the neighbouring countries, it names them.
 */
export function LiveMap({ belief, neighboursLabelled }: { belief: readonly number[]; neighboursLabelled: boolean }) {
  const out = ruledOutCount(belief);
  const label =
    `แผนที่ประเทศไทย ตัดออกไปแล้ว ${out} จาก 77 จังหวัด` +
    (neighboursLabelled ? " รอบประเทศไทยมีเมียนมาทางตะวันตก ลาวทางเหนือและตะวันออก กัมพูชาทางตะวันออก มาเลเซียทางใต้" : "");
  return (
    <div className={neighboursLabelled ? "map-frame map-frame--labelled" : "map-frame"}>
      <svg viewBox={MAP_VIEWBOX} className="map" role="img" aria-label={label}>
        <Neighbours />
        <Provinces belief={belief} />
      </svg>
      {neighboursLabelled
        ? NEIGHBOURS.map((code) => {
            const [x, y] = NEIGHBOUR_SHAPES[code].at;
            return (
              <span
                key={code}
                aria-hidden="true"
                className={code === WEST_EDGE_LABEL ? "map-country map-country--west" : "map-country"}
                style={{ left: `${((x - VIEW_X) / VIEW_W) * 100}%`, top: `${((y - VIEW_Y) / VIEW_H) * 100}%` }}
              >
                {NEIGHBOUR_NAMES[code]}
              </span>
            );
          })
        : null}
    </div>
  );
}

/**
 * The result map: every province tinted by the final belief, the guess
 * outlined in ink and the player's real province, when given, in mint.
 */
export function ResultMap({ belief, guess, real }: { belief: readonly number[]; guess: ProvinceId; real?: ProvinceId }) {
  const label =
    `แผนที่ความเชื่อของเกม จังหวัดที่สีเข้มคือจังหวัดที่เกมคิดว่าน่าจะใช่ ทาย${PROVINCES[guess].name}` +
    (real && real !== guess ? ` จังหวัดจริงคือ${PROVINCES[real].name}` : "");
  const marked = real && real !== guess ? ([guess, real] as const) : ([guess] as const);
  return (
    <div className="map-frame">
      <svg viewBox={MAP_VIEWBOX} className="map map--result" role="img" aria-label={label}>
        <Neighbours />
        <Provinces belief={belief} />
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
    </div>
  );
}

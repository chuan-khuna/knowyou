import { MockAd } from "@/components/ads/mock-ad";

export function AdsSketchbook() {
  return (
    <MockAd
      tone="moss"
      headline="สมุดสเก็ตช์เส้นไว"
      copy="กระดาษ 160 แกรม ไม่ซึมทุกปากกา"
      cta="สั่งเลย"
      word="fiw"
      art={
        <>
          <path className="spot" d="M8 9 h24 v32 h-24z" />
          <path d="M8 14 h-2 M8 21 h-2 M8 28 h-2 M8 35 h-2" />
          <path className="puff" d="M14 30 q4-8 8-2 t6-4" />
          <path className="spot" d="M28 38 L41 12 L45 14 L32 40 L27 43z" />
        </>
      }
    />
  );
}

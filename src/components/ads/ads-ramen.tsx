import { MockAd } from "@/components/ads/mock-ad";

export function AdsRamen() {
  return (
    <MockAd
      tone="clay"
      headline="ราเมงจันทร์เสี้ยว"
      copy="ซุปกระดูกหมูเคี่ยว 12 ชั่วโมง"
      cta="ดูเมนู"
      word="pok"
      art={
        <>
          <path d="M30 5 L38 20 M37 4 L43 18" />
          <path className="puff" d="M14 16 q3-3 0-6 M21 15 q3-3 0-6" />
          <path className="spot" d="M6 24 h36 a18 16 0 0 1-36 0z" />
          <path d="M13 31 q4-3 8 0 t8 0 t8 0" />
          <path d="M18 40 h12" />
        </>
      }
    />
  );
}

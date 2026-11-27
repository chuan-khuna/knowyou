import { MockAd } from "@/components/ads/mock-ad";

export function AdsNightMarket() {
  return (
    <MockAd
      tone="slate"
      headline="ตลาดนัดโอตาคุยามค่ำ"
      copy="ทุกวันเสาร์ ห้าโมงเย็นถึงเที่ยงคืน"
      cta="ดูวันจัด"
      word="zuza"
      art={
        <>
          <path d="M22 3 v5" />
          <path d="M17 8 h10 M17 38 h10" />
          <path className="spot" d="M22 8 c-16 2-16 28 0 30 c16-2 16-28 0-30z" />
          <path d="M14 18 h16 M13 28 h18" />
          <path d="M22 38 v6" />
          <path className="twinkle" d="M40 8 v4 M38 10 h4 M40 30 v3 M38.5 31.5 h3" />
        </>
      }
    />
  );
}

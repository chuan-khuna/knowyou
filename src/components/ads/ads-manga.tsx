import { MockAd } from "@/components/ads/mock-ad";

export function AdsManga() {
  return (
    <MockAd
      tone="sea"
      headline="ชั้นหนังสือปลาวาฬ"
      copy="มังงะมือสองครบชุด ส่งทั่วไทย"
      cta="เลือกเล่ม"
      word="pon"
      art={
        <>
          <path className="spot" d="M24 14 q-9-6-18-3 v26 q9-3 18 3z" />
          <path className="spot" d="M24 14 q9-6 18-3 v26 q-9-3-18 3z" />
          <path d="M11 18 q5-1 9 1 M11 24 q5-1 9 1 M28 19 q5-2 9-1 M28 25 q5-2 9-1" />
        </>
      }
    />
  );
}

import { MockAd } from "@/components/ads/mock-ad";

export function AdsCafe() {
  return (
    <MockAd
      tone="wheat"
      headline="คาเฟ่ช่องที่ 9"
      copy="นั่งอ่านการ์ตูนได้ทั้งวัน กาแฟ 55 บาท"
      cta="ดูแผนที่"
      word="ting"
      art={
        <>
          <path className="puff" d="M17 14 q3-3 0-6 M24 14 q3-3 0-6" />
          <path className="spot" d="M9 19 h24 v10 a9 9 0 0 1-9 9 h-6 a9 9 0 0 1-9-9z" />
          <path d="M33 22 h3 a4 4 0 0 1 0 8 h-3" />
          <path d="M6 42 h30" />
        </>
      }
    />
  );
}

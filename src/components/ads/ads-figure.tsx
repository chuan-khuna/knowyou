import { MockAd } from "@/components/ads/mock-ad";

export function AdsFigure() {
  return (
    <MockAd
      tone="plum"
      headline="ฟิกเกอร์นักดาบจันทรา 1/7"
      copy="เปิดจองถึงสิ้นเดือน มัดจำ 500 บาท"
      cta="จองเลย"
      word="don"
      art={
        <>
          <circle className="spot" cx="22" cy="12" r="5" />
          <path className="spot" d="M14 36 L22 19 L30 36z" />
          <path d="M31 6 L35 30" />
          <path className="spot" d="M9 36 h26 v6 h-26z" />
          <path className="twinkle" d="M39 8 v4 M37 10 h4" />
        </>
      }
    />
  );
}

import type { Metadata } from "next";
import { ProvinceGame } from "./province-game";

export const metadata: Metadata = {
  title: "ทายจังหวัด · byou",
  description: "ตอบเรื่องภาษา อาหาร และประเพณีแถวบ้าน แล้วเกมจะทายจังหวัดของคุณครั้งเดียว",
};

export default function Page() {
  return <ProvinceGame />;
}

import type { Metadata } from "next";
import { AnimeAgeGame } from "./anime-age-game";

export const metadata: Metadata = {
  title: "ทายอายุจากการ์ตูน · byou",
  description: "ตอบว่าคุณรู้จักการ์ตูนเรื่องไหนบ้าง แล้วเกมจะทายอายุคุณครั้งเดียว",
};

export default function Page() {
  return <AnimeAgeGame />;
}

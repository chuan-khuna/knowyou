import type { Metadata } from "next";
import { KurokoNoBasketQuiz } from "@/app/kuroko-no-basket/kuroko-no-basket-quiz";

export const metadata: Metadata = {
  title: "คุณรู้จัก Kuroko no Basket ดีแค่ไหน · byou",
  description: "ตอบคำถามแล้วดูว่าคุณเป็นแฟนระดับไหน",
};

export default function Page() {
  return <KurokoNoBasketQuiz />;
}

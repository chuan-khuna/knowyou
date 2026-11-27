import type { Metadata } from "next";
import { BleachQuiz } from "@/app/bleach/bleach-quiz";

export const metadata: Metadata = {
  title: "คุณรู้จัก Bleach ดีแค่ไหน · byou",
  description: "ตอบคำถามแล้วดูว่าคุณเป็นแฟนระดับไหน",
};

export default function Page() {
  return <BleachQuiz />;
}

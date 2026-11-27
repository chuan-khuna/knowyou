import type { Metadata } from "next";
import { HaikyuQuiz } from "@/app/haikyu/haikyu-quiz";

export const metadata: Metadata = {
  title: "คุณรู้จัก Haikyu!! ดีแค่ไหน · byou",
  description: "ตอบคำถามแล้วดูว่าคุณเป็นนักวอลเลย์ระดับไหน",
};

export default function Page() {
  return <HaikyuQuiz />;
}

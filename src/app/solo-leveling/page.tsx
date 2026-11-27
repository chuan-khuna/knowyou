import type { Metadata } from "next";
import { SoloLevelingQuiz } from "@/app/solo-leveling/solo-leveling-quiz";

export const metadata: Metadata = {
  title: "คุณรู้จัก Solo Leveling ดีแค่ไหน · KnowYou",
  description: "ตอบคำถามแล้วดูว่าคุณเป็นฮันเตอร์แรงก์ไหน",
};

export default function Page() {
  return <SoloLevelingQuiz />;
}

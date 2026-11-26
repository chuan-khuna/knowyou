import type { Metadata } from "next";
import { NarutoQuiz } from "./naruto-quiz";

export const metadata: Metadata = {
  title: "คุณรู้จัก Naruto ดีแค่ไหน · KnowYou",
  description: "ตอบคำถามแล้วดูว่าคุณเป็นนินจาระดับไหน",
};

export default function Page() {
  return <NarutoQuiz />;
}

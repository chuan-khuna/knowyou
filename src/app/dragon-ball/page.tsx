import type { Metadata } from "next";
import { DragonBallQuiz } from "./dragon-ball-quiz";

export const metadata: Metadata = {
  title: "คุณรู้จัก Dragon Ball ดีแค่ไหน · KnowYou",
  description: "ตอบคำถามแล้วดูว่าคุณเป็นนักสู้ระดับไหน",
};

export default function Page() {
  return <DragonBallQuiz />;
}

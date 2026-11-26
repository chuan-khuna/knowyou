import type { Metadata } from "next";
import { RebornQuiz } from "./reborn-quiz";

export const metadata: Metadata = {
  title: "คุณรู้จัก Reborn ดีแค่ไหน · KnowYou",
  description: "ตอบคำถามแล้วดูว่าคุณอยู่ระดับไหนในแฟมิลี่",
};

export default function Page() {
  return <RebornQuiz />;
}

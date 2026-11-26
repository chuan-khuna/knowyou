import type { Metadata } from "next";
import { PrinceOfTennisQuiz } from "./prince-of-tennis-quiz";

export const metadata: Metadata = {
  title: "คุณรู้จัก Prince of Tennis ดีแค่ไหน · KnowYou",
  description: "ตอบคำถามแล้วดูว่าคุณเป็นแฟนระดับไหน",
};

export default function Page() {
  return <PrinceOfTennisQuiz />;
}

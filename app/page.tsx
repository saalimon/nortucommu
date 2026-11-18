import Invitation from "@/components/Invitation";
import { thai } from "@/lib/fonts";

export default function Page() {
  // The scratch-card canvas draws its hint text with the real (hashed) font name.
  return <Invitation canvasFont={thai.style.fontFamily} />;
}

import { Manufacturing_Consent, Nothing_You_Could_Do, Satisfy, Sriracha } from "next/font/google";

export const blackletter = Manufacturing_Consent({ weight: "400", subsets: ["latin"], variable: "--font-blackletter" });
export const script = Satisfy({ weight: "400", subsets: ["latin"], variable: "--font-script" });
export const thai = Sriracha({ weight: "400", subsets: ["latin", "thai"], variable: "--font-thai" });
export const hand = Nothing_You_Could_Do({ weight: "400", subsets: ["latin"], variable: "--font-hand" });

export const fontVariables = [blackletter, script, thai, hand].map((f) => f.variable).join(" ");

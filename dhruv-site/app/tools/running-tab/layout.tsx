import type { Metadata } from "next";
import "./running-tab.css";

export const metadata: Metadata = {
  title: "Running Tab",
  description: "Split expenses with friends on a trip. No accounts, just a link.",
};

export default function RunningTabLayout({ children }: { children: React.ReactNode }) {
  return <div className="running-tab">{children}</div>;
}

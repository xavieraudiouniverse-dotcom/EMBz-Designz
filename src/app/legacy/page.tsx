import Image from "next/image";
import MemorialPortrait from "@/components/MemorialPortrait";
import { UsersIcon, HeartIcon, SparkleIcon, SproutIcon } from "@/components/Icons";
import Artwork from "@/components/Artwork";

export const metadata = {
  title: "The Legacy — EMBZ DESIGNZ",
  description: "Dedicated to the memory of Ella Mary Broughton & John Broughton.",
};

const PILLARS = [
  { Icon: UsersIcon, title: "FAMILY", body: "Everything we do is for the family they left behind." },
  { Icon: HeartIcon, title: "LOVE", body: "Uniting people through art, culture, and purpose." },
  { Icon: SparkleIcon, title: "LEGACY", body: "Their memory lives on in every piece we create." },
  { Icon: SproutIcon, title: "FUTURE", body: "Creating opportunities for the next generation." },
];

export default function LegacyPage() {
  return (
    <div>
      <section className="legacy-hero page">
        <div>
          <p className="eyebrow">THE LEGACY OF</p>
          <Image
            src="/legacy/john-and-ella-title.png"
            alt="John and Ella"
            width={1536}
            height={1024}
            priority
            className="h-auto w-full max-w-[560px] drop-shadow-[0_0_60px_rgba(155,92,240,0.55)]"
          />
          <p>A LEGACY OF LOVE. A FUTURE OF HOPE.</p>
          <a href="#our-story" className="btn">
            OUR STORY
          </a>
        </div>
        <Artwork mark="EMBZ" />
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2" style={{ textAlign: "center" }}>
          <div>
            <MemorialPortrait src="/legacy/ella.jpg" name="Ella Mary Broughton" initial="E" />
            <h2 style={{ marginTop: 20, fontSize: 22, textShadow: "0 0 12px #7015b7" }}>Ella Mary Broughton</h2>
            <p style={{ margin: "10px auto 0", maxWidth: 320, color: "#aaa0af", lineHeight: 1.7, fontSize: 13 }}>
              A beautiful soul whose love, strength and kindness will forever continue through her family.
            </p>
          </div>
          <div>
            <MemorialPortrait src="/legacy/john.jpg" name="John Broughton" initial="J" />
            <h2 style={{ marginTop: 20, fontSize: 22, textShadow: "0 0 12px #7015b7" }}>John Broughton</h2>
            <p style={{ margin: "10px auto 0", maxWidth: 320, color: "#aaa0af", lineHeight: 1.7, fontSize: 13 }}>
              A man of strength, loyalty and love whose legacy lives on in generations to come.
            </p>
          </div>
        </div>
      </section>

      <section id="our-story" className="panel" style={{ maxWidth: 900, margin: "0 40px", padding: 40, textAlign: "center" }}>
        <h3 className="eyebrow">THEIR LEGACY. OUR PURPOSE.</h3>
        <p style={{ margin: "16px auto 0", maxWidth: 640, color: "#aaa0af", lineHeight: 1.7, fontSize: 13 }}>
          This store was created in loving memory of Ella Mary Broughton &amp; John Broughton. Every design, every
          order, every movement keeps their memory alive and supports the family they left behind.
        </p>
        <p style={{ marginTop: 16, fontSize: 11, letterSpacing: 2, color: "#d66eff", textTransform: "uppercase" }}>
          This is more than a store. This is a legacy.
        </p>
      </section>

      <section className="values">
        {PILLARS.map((p) => (
          <div key={p.title}>
            <span style={{ display: "flex", justifyContent: "center", color: "#c05aff", marginBottom: 8 }}>
              <p.Icon className="h-5 w-5" />
            </span>
            <b>{p.title}</b>
            <small>{p.body}</small>
          </div>
        ))}
      </section>

      <section className="panel" style={{ margin: "40px", padding: 40, textAlign: "center" }}>
        <h3 className="eyebrow">THE LEGACY FUND</h3>
        <p style={{ margin: "16px auto 0", maxWidth: 560, color: "#aaa0af", lineHeight: 1.7, fontSize: 13 }}>
          A portion of all proceeds from this store are dedicated to supporting the family of Ella Mary Broughton
          &amp; John Broughton.
        </p>
        <p style={{ margin: "12px auto 0", maxWidth: 560, color: "#75687d", fontSize: 10 }}>
          A full transparency report — the exact split and where funds go — is being finalized and will be published
          here.
        </p>
      </section>

      <p className="smallcaps" style={{ textAlign: "center", padding: "50px 0", fontSize: 10 }}>
        THEIR LOVE CREATED A FAMILY. THEIR LEGACY CREATES A FUTURE.
      </p>
    </div>
  );
}

"use client";

export default function FeaturesPage() {
  const features = [
    {
      title: "Real-Time Face Recognition",
      desc: "Detects and verifies faces against an authorized database using advanced image processing.",
    },
    {
      title: "Military Vehicle Detection",
      desc: "Identifies military vehicles and calculates their distance from the surveillance camera.",
    },
    {
      title: "Instant Alert System",
      desc: "Sends automated email/SMS alerts to authorities when unauthorized activity is detected.",
    },
    {
      title: "24/7 Monitoring",
      desc: "Operates continuously with support for night vision and low-light conditions.",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-200 py-16">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="mb-10 text-5xl font-bold text-primary">Key Features</h1>
        <div className="grid gap-8 md:grid-cols-2">
          {features.map((f, i) => (
            <div
              key={i}
              className="card bg-base-100 shadow-xl p-6 border border-primary/20"
            >
              <h2 className="card-title mb-2 text-xl text-primary">
                {f.title}
              </h2>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

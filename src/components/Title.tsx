import { Toaster } from "react-hot-toast";

export default function Title({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 bg-primary/10 p-4">
      <Toaster />
      <h1 className="text-3xl font-bold text-primary text-center">{title}</h1>
      {subtitle && (
        <p className="text-base-content/70 text-center">{subtitle}</p>
      )}
    </div>
  );
}

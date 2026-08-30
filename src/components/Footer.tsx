import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="hairline h-px w-full" />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center text-sm text-muted-foreground md:flex-row md:justify-between md:text-left">
        <Logo />
        <p>&copy; {new Date().getFullYear()} EMBZ DESIGNZ. All rights reserved.</p>
      </div>
    </footer>
  );
}

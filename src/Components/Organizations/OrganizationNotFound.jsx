import { Link } from "react-router-dom";

export default function OrganizationNotFound() {
  return <main className="grid min-h-screen place-items-center bg-background px-4 text-center text-foreground">
    <section>
      <h1 className="text-3xl font-bold">Organization Not Found</h1>
      <p className="mt-3 text-muted-foreground">This organization is unavailable or is not currently accepting sign-ins.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link className="rounded-lg border border-border px-4 py-2" to="/organizations">Choose Organization</Link>
        <Link className="rounded-lg bg-primary px-4 py-2 text-primary-foreground" to="/onboard">Register Your Organization</Link>
      </div>
    </section>
  </main>;
}

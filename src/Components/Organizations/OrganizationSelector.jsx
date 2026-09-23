import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../config/api";

export default function OrganizationSelector({ onboarding = false }) {
  const [organizations, setOrganizations] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/organization/public")
      .then(({ data }) => setOrganizations(Array.isArray(data) ? data : []))
      .catch(() => setError("Organizations could not be loaded. Please try again."));
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return organizations.filter((organization) => !needle
      || organization.name?.toLocaleLowerCase().includes(needle)
      || organization.slug?.toLocaleLowerCase().includes(needle));
  }, [organizations, query]);

  return <main className="min-h-screen bg-background px-4 py-12 text-foreground">
    <section className="mx-auto max-w-4xl">
      <Link to="/" className="text-xl font-black tracking-tight text-primary">COOPR8</Link>
      <h1 className="mt-8 text-3xl font-bold">{onboarding ? "Register your organization" : "Choose your organization"}</h1>
      <p className="mt-2 text-muted-foreground">{onboarding
        ? "Organization registration is activated by the COOPR8 platform team after plan and billing details are confirmed."
        : "Select your cooperative to sign in securely."}</p>
      {onboarding && <Link to="/organizations" className="mt-5 inline-block text-primary hover:underline">Already registered? Choose your organization.</Link>}
      {!onboarding && <input className="mt-6 w-full rounded-xl border border-border bg-card p-3"
        aria-label="Search organizations" placeholder="Search organizations" value={query}
        onChange={(event) => setQuery(event.target.value)} />}
      {error && <p className="mt-4 text-destructive">{error}</p>}
      {!onboarding && <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {visible.map((organization) => <button key={organization.slug} type="button"
          onClick={() => navigate(`/o/${organization.slug}/login`)}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left hover:border-primary hover:bg-muted">
          {organization.logoUrl
            ? <img className="h-11 w-11 rounded-lg object-contain" src={organization.logoUrl} alt="" />
            : <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">{organization.name?.slice(0, 2)}</span>}
          <span className="font-semibold">{organization.name}</span>
        </button>)}
      </div>}
      {!onboarding && !error && organizations.length > 0 && visible.length === 0 && <p className="mt-6 text-muted-foreground">No organization matches your search.</p>}
      {!onboarding && <Link to="/onboard" className="mt-8 inline-block rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground">Register Your Organization</Link>}
    </section>
  </main>;
}

import { listSkills } from "@/lib/skills";
import { Mono } from "@/components/site/kit";

export async function SkillsList() {
  const skills = await listSkills();

  if (skills.length === 0) {
    return (
      <div className="rounded-2xl bg-surface px-6 py-10 text-center">
        <p className="text-caption text-muted">
          No skills found. Install them with{" "}
          <span className="font-mono">npx skills add coreyhaines31/marketingskills</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-surface divide-y divide-subtle">
      {skills.map((s) => (
        <div key={s.name} className="flex flex-col gap-1 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-body font-semibold text-t1">{s.name}</span>
            {s.custom ? (
              <span className="rounded-full bg-subtle px-2 py-0.5 font-mono text-caption text-t3">
                custom
              </span>
            ) : null}
            <Mono className="ml-auto shrink-0">{s.source}</Mono>
          </div>
          {s.description ? (
            <p className="line-clamp-2 text-caption leading-caption text-t3">
              {s.description}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

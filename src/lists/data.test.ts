import { describe, expect, test } from "bun:test";
import profile from "src/lists/profile.json";
import proyectsData from "src/lists/proyects.json";
import taskList from "src/lists/taskList.json";

function expectComplete(v: Bi, label: string) {
  expect(typeof v, label).toBe("object");
  expect(v.es.trim(), `${label}.es`).not.toBe("");
  expect(v.en.trim(), `${label}.en`).not.toBe("");
}

describe("datos bilingües", () => {
  test("proyectos: textos completos en ambos idiomas", () => {
    for (const p of proyectsData.proyects as Project[]) {
      if (p.description) expectComplete(p.description, `${p.title}.description`);
      if (p.badge) expectComplete(p.badge, `${p.title}.badge`);
      if (p.noDemoNote) expectComplete(p.noDemoNote, `${p.title}.noDemoNote`);
      for (const [i, d] of (p.details ?? []).entries()) {
        expectComplete(d, `${p.title}.details[${i}]`);
      }
    }
  });

  test("los 9 proyectos con details tienen landing", () => {
    const withDetails = (proyectsData.proyects as Project[]).filter(
      (p) => p.details && p.details.length > 0
    );
    expect(withDetails.length).toBe(9);
  });

  test("profile: bio, tagline y current completos", () => {
    expectComplete(profile.tagline, "profile.tagline");
    expectComplete(profile.current, "profile.current");
    for (const [i, p] of profile.bio.entries()) {
      expectComplete(p, `profile.bio[${i}]`);
    }
    for (const link of profile.links) expectComplete(link.title, `link.title`);
  });

  test("taskList: títulos completos", () => {
    for (const item of taskList.items) expectComplete(item.title, item.href);
  });
});

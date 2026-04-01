import type { FranjaDef, Materia, MateriaSlot } from "../state/types.js";

/** Migrate materia slots when franja IDs change — maps by time-range overlap */
export function migrateSlots(
  oldFranjas: FranjaDef[],
  newFranjas: FranjaDef[],
  mats: Materia[],
): Materia[] {
  if (newFranjas.length === 0) return mats;

  // Build mapping: oldFranjaId → newFranjaId[]
  const mapping = new Map<string, string[]>();

  for (const oldF of oldFranjas) {
    const targets: string[] = [];
    for (const newF of newFranjas) {
      // Strict interval overlap: (a1, a2) ∩ (b1, b2) ≠ ∅
      if (oldF.horaInicio < newF.horaFin && newF.horaInicio < oldF.horaFin) {
        targets.push(newF.id);
      }
    }

    // Fallback: no overlap → pick nearest franja by midpoint distance
    if (targets.length === 0) {
      const oldMid = (oldF.horaInicio + oldF.horaFin) / 2;
      let bestId = newFranjas[0].id;
      let bestDist = Infinity;
      for (const newF of newFranjas) {
        const dist = Math.abs((newF.horaInicio + newF.horaFin) / 2 - oldMid);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = newF.id;
        }
      }
      targets.push(bestId);
    }

    mapping.set(oldF.id, targets);
  }

  return mats.map((mat) => {
    if (!mat.slots || mat.slots.length === 0) return mat;

    const seen = new Set<string>();
    const migrated: MateriaSlot[] = [];

    for (const slot of mat.slots) {
      const targets = mapping.get(slot.franjaId);
      if (!targets) continue;
      for (const fid of targets) {
        const key = `${slot.dia}-${fid}`;
        if (!seen.has(key)) {
          seen.add(key);
          migrated.push({ dia: slot.dia, franjaId: fid });
        }
      }
    }

    return { ...mat, slots: migrated.length > 0 ? migrated : undefined };
  });
}

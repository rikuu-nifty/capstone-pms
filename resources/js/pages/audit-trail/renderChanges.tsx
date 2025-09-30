import { AuditLog } from './index';

// Map DB field names → friendly labels
const fieldLabels: Record<string, string> = {
  unit_or_department_id: "Unit / Department",
  building_id: "Building",
  room_id: "Room",
  category_id: "Category",
  asset_model_id: "Asset Model",
  actor_id: "User",
  personnel_id: "Personnel",
};

// Helper: convert snake_case → "Capitalized Words"
function prettifyFieldName(field: string): string {
  return field
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper to format hydrated values for display
function formatValue(val: unknown): string {
  if (val === null || val === undefined || val === "") return "—";

  // Prettify enum/status strings like "left_university" → "Left University"
  if (typeof val === "string" && /^[a-z0-9_]+$/.test(val)) {
    return val
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Format dates (yyyy-mm-dd or ISO string)
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)) {
    const dt = new Date(val);
    return isNaN(dt.getTime())
      ? val
      : dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  // Format currency (if number looks like money)
  if (typeof val === "number" && val > 1000) {
    return "₱ " + val.toLocaleString();
  }

  return String(val);
}

export function renderChanges(log: AuditLog) {
  const oldVals = log.old_values || {};
  const newVals = log.new_values || {};
  const fields = Object.keys({ ...oldVals, ...newVals });

  if (fields.length === 0) {
    return <div className="text-muted-foreground">No field changes recorded.</div>;
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b">
          <th className="py-1 pr-4 font-medium">Field</th>
          <th className="py-1 pr-4 font-medium">Before</th>
          <th className="py-1 font-medium">After</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((field) => {
          const label = fieldLabels[field] || prettifyFieldName(field);

          return (
            <tr key={field} className="border-b last:border-0">
              <td className="py-1 pr-4">{label}</td>
              <td className="py-1 pr-4 text-gray-500">{formatValue(oldVals[field])}</td>
              <td className="py-1 text-green-600">{formatValue(newVals[field])}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

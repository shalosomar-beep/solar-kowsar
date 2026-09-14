import { base44 } from "@/api/base44Client";

/**
 * Creates an in-app Notification record when equipment status changes to warning or offline.
 * @param {object} equipment - the saved equipment record
 * @param {string|null} prevStatus - previous status (for updates)
 */
export async function notifyEquipmentStatusChange(equipment, prevStatus = null) {
  const isAlert = equipment.status === "warning" || equipment.status === "offline";
  if (!isAlert) return;
  // Only notify when the status actually transitioned into an alert state
  if (prevStatus === equipment.status) return;

  const statusLabel = equipment.status === "offline" ? "OFFLINE" : "DIGNIIN";
  const title = `Qalab: ${equipment.name}`;
  const message = `Qalabka "${equipment.name}"${equipment.location ? ` (${equipment.location})` : ""} wuxuu yeeshay xaalad ${statusLabel}. Fadlan sii deg deg u fiirso si aad uga socon karto xaaladda.`;
  try {
    await base44.entities.Notification.create({
      title,
      message,
      type: "warning",
      is_read: false,
    });
  } catch {
    // silent — notification failure should not break the main operation
  }
}

/**
 * Creates an in-app Notification record when a new alarm is registered.
 * @param {object} alarm - the created alarm record
 */
export async function notifyAlarmCreated(alarm) {
  const title = `Cilad cusub: ${alarm.name}`;
  const message = `Cilad "${alarm.name}" ayaa la diiwaangeliyay goobta ${alarm.location || "-"}${alarm.description ? `. ${alarm.description}` : ""}. Fadlan sii deg deg u qor si aad uga socon karto xaaladda.`;
  try {
    await base44.entities.Notification.create({
      title,
      message,
      type: "warning",
      is_read: false,
    });
  } catch {
    // silent — notification failure should not break the main operation
  }
}
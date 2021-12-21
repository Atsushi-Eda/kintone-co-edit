import sweetAlert from "sweetalert2";
import iziToast from "izitoast";
import _ from "lodash";
import "izitoast/dist/css/iziToast.min.css";
import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import type { KintoneRecordField } from "@kintone/rest-api-client";
import type { Change } from "types/change";

declare type KintoneRecord = { $id: KintoneRecordField.ID } & Record<
  string,
  KintoneRecordField.OneOf
>;

const client = new KintoneRestAPIClient();

export function alertAndReload(message: string) {
  sweetAlert
    .fire({
      text: message,
    })
    .then(() => location.reload());
}

export function notify(message: string) {
  iziToast.info({
    title: message,
    position: "topRight",
  });
}

export function addEmptyBox() {
  const box = document.createElement("div");
  document.body.appendChild(box);
  return box;
}

export function setFieldValues(changes: Change[]) {
  const record = kintone.app.record.get();
  changes.forEach(({ code, recordField }) => {
    record.record[code].value = recordField.value;
  });
  kintone.app.record.set(record);
}

export async function revisionCheck(event: any) {
  const {
    record: {
      $revision: { value: revision },
    },
  } = await client.record.getRecord({
    app: event.appId,
    id: event.recordId,
  });
  if (revision !== event.record.$revision.value) {
    location.reload();
  }
}

export function saveToTemporaryApp(
  temporaryApp: string,
  event: any,
  change: Change
) {
  client.record.addRecord({
    app: temporaryApp,
    record: {
      appId: {
        value: event.appId,
      },
      recordId: {
        value: event.recordId,
      },
      revision: {
        value: event.record.$revision.value,
      },
      change: {
        value: JSON.stringify(change),
      },
    },
  });
}

export async function removeFromTemporaryApp(temporaryApp: string, event: any) {
  const records: KintoneRecord[] = await client.record.getAllRecords({
    app: temporaryApp,
    condition: `appId = "${event.appId}" and recordId = "${
      event.recordId
    }" and revision = "${event.record.$revision.value - 1}"`,
  });
  client.record.deleteAllRecords({
    app: temporaryApp,
    records: records.map(({ $id }: { $id: KintoneRecordField.ID }) => ({
      id: $id.value,
    })),
  });
}

export async function getChangesFromTemporaryApp(
  temporaryApp: string,
  event: any
) {
  const records = await client.record.getAllRecords({
    app: temporaryApp,
    condition: `appId = "${event.appId}" and recordId = "${event.recordId}" and revision = "${event.record.$revision.value}"`,
    orderBy: "$id asc",
  });
  return Object.values(
    records
      .map(({ change }): Change => JSON.parse(String(change.value)))
      .reduce(
        (changes: Record<string, Change>, change) => ({
          ...changes,
          [change.code]: change,
        }),
        {}
      )
  ).filter(
    (change) =>
      !_.isEqual(event.record[change.code].value, change.recordField.value)
  );
}

export function replaceUndefinedWithEmptyString(change: Change): Change {
  if (change.recordField.type !== "SUBTABLE") {
    return change;
  }
  return {
    ...change,
    recordField: {
      ...change.recordField,
      value: change.recordField.value.map((row) => ({
        ...row,
        value: {
          ...row.value,
          ...Object.entries(row.value).reduce(
            (fields, [code, field]) => ({
              ...fields,
              [code]: {
                ...field,
                value: field.value || "",
              },
            }),
            {}
          ),
        },
      })),
    },
  };
}

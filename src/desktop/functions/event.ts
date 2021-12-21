import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import type { KintoneFormFieldProperty } from "@kintone/rest-api-client";
import type { Change } from "types/change";

declare type FlatProperty = KintoneFormFieldProperty.OneOf & {
  parent?: string;
};

export function detailShowEvent(callback: ({ event }: { event: any }) => void) {
  kintone.events.on(["app.record.detail.show"], (event) => {
    callback({ event });
    return event;
  });
}

export function showEvent(callback: ({ event }: { event: any }) => void) {
  kintone.events.on(["app.record.edit.show"], (event) => {
    callback({ event });
    return event;
  });
}

export function saveEvent(callback: ({ event }: { event: any }) => void) {
  kintone.events.on(["app.record.edit.submit.success"], (event) => {
    callback({ event });
    return event;
  });
}

export function changeEvent(
  callback: ({ event, change }: { event: any; change: Change }) => void
) {
  kintone.events.on(["app.record.edit.show"], async (editShowEvent) => {
    const client = new KintoneRestAPIClient();
    const { properties } = await client.app.getFormFields({
      app: editShowEvent.appId,
    });
    const flatProperties: FlatProperty[] = Object.values(properties)
      .map((property) => {
        if (property.type !== "SUBTABLE") {
          return property;
        }
        return [
          property,
          ...Object.values(property.fields).map((field) => ({
            ...field,
            parent: property.code,
          })),
        ];
      }, {})
      .flat();
    flatProperties.forEach((property) => {
      kintone.events.on(
        [`app.record.edit.change.${property.code}`],
        (event) => {
          callback({
            event,
            change: {
              code: property.parent || property.code,
              label: properties[property.parent || property.code].label,
              recordField: event.record[property.parent || property.code],
            },
          });
        }
      );
    });
    return editShowEvent;
  });
}

import { KintoneRecordField } from "@kintone/rest-api-client";

export declare type Change = {
  code: string;
  label: string;
  recordField: KintoneRecordField.OneOf;
  resolved?: boolean;
};

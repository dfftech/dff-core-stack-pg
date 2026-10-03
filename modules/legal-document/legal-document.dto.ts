import type { JsonValueType } from "../../utils/app-types";

export type LegalDocumentType = "PRIVACY_POLICY" | "TERMS_AND_CONDITIONS" | "REFUND_POLICY";

export type LegalDocumentDto = {
  id?: string;
  type: LegalDocumentType;
  version: string;
  content: JsonValueType;
  priority?: number;
  active?: boolean;
};

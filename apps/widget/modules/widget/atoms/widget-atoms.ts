import { atom } from "jotai";
import { WidgetScreen } from "../types";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { CONTACT_SESSIONS_KEY } from "../constants";
import { Doc, Id } from "@workspace/backend/_generated/dataModel";
//Basic widget state atoms
//There are 4 atoms:
//1. screenAtom - holds the current screen of the widget
//2. organizationIdAtom - holds the organization id of the widget
//3. errorMessageAtom - holds the error message of the widget
//4. loadingMessageAtom - holds the loading message of the widget

export const screenAtom = atom<WidgetScreen>("loading");
export const organizationIdAtom = atom<string | null>(null);
export const errorMessageAtom = atom<string | null>(null);
export const loadingMessageAtom = atom<string | null>(null);

//Organization-scoped contact session atom
export const contactSessionIdAtomFamily = atomFamily((organizationId: string) =>
  atomWithStorage<Id<"contactSessions"> | null>(
    `${CONTACT_SESSIONS_KEY}-${organizationId}`,
    null
  )
);

export const conversationIdAtom = atom<Id<"conversations"> | null>(null);
export const widgetSettingsAtom = atom<Doc<"widgetSettings"> | null>(null);
export const vapiSecretAtom = atom<{
  publicApiKey: string;
} | null>(null);

export const hasVapiSecretsAtom = atom((get) => get(vapiSecretAtom) !== null);

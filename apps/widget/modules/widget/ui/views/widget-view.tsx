"use client";
import { screenAtom } from "@/modules/widget/atoms/widget-atoms";
import { WidgetAuthScreen } from "@/modules/widget/ui/screens/widget-auth-screen";
import { useAtomValue } from "jotai";
import { WidgetErrorScreen } from "@/modules/widget/ui/screens/widget-error-screen";
import { WidgetLoadingScreen } from "@/modules/widget/ui/screens/widget-loading-screen";
import { WidgetSelectionScreen } from "@/modules/widget/ui/screens/widget-selection-screen";
import { WidgetChatScreen } from "../screens/widget-chat-screen";
import { WidgetInboxScreen } from "../screens/widget-inbox-screen";
interface Props {
  organizationId: string | null;
}

export const WidgetView = ({ organizationId }: Props) => {
  //min-h-screen could work differently with an iframe(later check)
  const screen = useAtomValue(screenAtom);
  const screenComponents = {
    error: <WidgetErrorScreen />,
    loading: <WidgetLoadingScreen organizationId={organizationId} />,
    auth: <WidgetAuthScreen />,
    voice: <p>TODO:voice</p>,
    inbox: <WidgetInboxScreen />,
    chat: <WidgetChatScreen />,
    contact: <p>TODO:contact</p>,
    selection: <WidgetSelectionScreen />,
  };
  return (
    <main className="min-h-screen min-w-screen flex h-full w-full flex-col  overflow-hidden rounded-xl border bg-muted">
      {screenComponents[screen]}
    </main>
  );
};

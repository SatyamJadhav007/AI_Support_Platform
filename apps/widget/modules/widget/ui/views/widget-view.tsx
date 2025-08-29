"use client";
import { screenAtom } from "@/modules/widget/atoms/widget-atoms";
import { WidgetAuthScreen } from "@/modules/widget/ui/screens/widget-auth-screen";
import { useAtomValue } from "jotai";
import { WidgetErrorScreen } from "@/modules/widget/ui/screens/widget-error-screen";
import { WidgetLoadingScreen } from "../screens/widget-loading-screen";
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
    inbox: <p>TODO:inbox</p>,
    chat: <p>TODO:chat</p>,
    contact: <p>TODO:contact</p>,
    selection: <p>TODO:selection</p>,
  };
  return (
    <main className="min-h-screen min-w-screen flex h-full w-full flex-col  overflow-hidden rounded-xl border bg-muted">
      {screenComponents[screen]}
    </main>
  );
};

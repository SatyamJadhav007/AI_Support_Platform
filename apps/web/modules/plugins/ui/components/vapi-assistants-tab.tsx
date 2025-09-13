"use client";

import { BotIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

import { useVapiAssistant } from "../../hooks/use-vapi-data";

export const VapiAssistantsTab = () => {
  const { data: assistants, isLoading } = useVapiAssistant();
  return (
    <div className="border-t bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 py-4">Assistant</TableHead>
            <TableHead className="px-6 py-4">Model</TableHead>
            <TableHead className="px-6 py-4">First Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(() => {
            if (isLoading) {
              return (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    Loading Assistants...
                  </TableCell>
                </TableRow>
              );
            }
            if (assistants.length === 0) {
              return (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No Assistants configured
                  </TableCell>
                </TableRow>
              );
            }
            return assistants.map((assitant) => (
              <TableRow className="hover:bg-muted/50" key={assitant.id}>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <BotIcon className="size-4 text-muted-foreground" />
                    <span>{assitant.name || "Unnamed Assistant"}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="text-sm">
                    {assitant.model?.model || "Not Configured"}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs px-6 py-4">
                  <span className="truncate text-muted-foreground text-sm">
                    {assitant.firstMessage || "No Greeting configured"}
                  </span>
                </TableCell>
              </TableRow>
            ));
          })()}
        </TableBody>
      </Table>
    </div>
  );
};

"use client";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React, { useMemo } from "react";
import { getCountryFlagUrl, getCountryFromTimezone } from "@/lib/country-utils";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { MailIcon, MonitorIcon } from "lucide-react";
import Bowser from "bowser";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";

type InfoItem = {
  label: string;
  value: string | React.ReactNode;
  calssName?: string;
};
type InfoSection = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: InfoItem[];
};

export const ContactPanel = () => {
  const params = useParams();
  const conversationId = params.conversationId as
    | Id<"conversations">
    | undefined;

  const args = conversationId ? { conversationId } : "skip";

  const contactSession = useQuery(
    api.private.contactSessions.getOneByConversationId,
    args
  );
  const parseUserAgent = useMemo(() => {
    return (userAgent?: string) => {
      if (!userAgent) {
        return {
          browser: "Unknown",
          os: "Unknown",
          device: "Unknown",
        };
      }

      const browser = Bowser.getParser(userAgent);
      const result = browser.getResult();
      return {
        browser: result.browser.name || "Unknown",
        browserVersion: result.browser.version || "",
        os: result.os.name || "Unknown",
        osVersion: result.os.version || "Unknown",
        device: result.platform.type || "desktop",
        deviceVendor: result.platform.vendor || "",
        deviceModel: result.platform.model || "",
      };
    };
  }, []);
  const userAgentInfo = useMemo(
    () => parseUserAgent(contactSession?.metadata?.userAgent),
    [contactSession?.metadata?.userAgent, parseUserAgent]
  );
  const countryInfo = useMemo(() => {
    return getCountryFromTimezone(contactSession?.metadata?.timezone);
  }, [contactSession?.metadata?.timezone]);

  const accordionSections = useMemo<InfoSection[]>(() => {
    if (!contactSession?.metadata) {
      return [];
    }
    return [
      {
        id: "device-info",
        icon: MonitorIcon,
        title: "Device Information",
        items: [
          {
            label: "Browser",
            value:
              userAgentInfo.browser +
              (userAgentInfo.browserVersion
                ? ` ${userAgentInfo.browserVersion}`
                : ""),
          },
          {
            label: "OS",
            value:
              userAgentInfo.os +
              (userAgentInfo.osVersion ? ` ${userAgentInfo.osVersion}` : ""),
          },
        ],
      },
    ];
  }, [contactSession?.metadata, userAgentInfo]);
  if (!contactSession) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">
      <div className="flex flex-col gap-y-4 p-4">
        <div className="flex items-center gap-x-2">
          <DicebearAvatar
            badgeImageUrl={
              countryInfo?.code
                ? getCountryFlagUrl(countryInfo.code)
                : undefined
            }
            seed={contactSession._id}
            size={42}
          />
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-x-2">
              <h4 className="line-clamp-1">{contactSession.name}</h4>
            </div>
            <p className="line-clamp-1 text-muted-foreground text-sm">
              {contactSession.email}
            </p>
          </div>
        </div>
        {contactSession.email && (
          <Button asChild className="w-full" size="lg">
            <Link href={`mailto:${contactSession.email}`}>
              <MailIcon aria-hidden="true" />
              <span>Send Email</span>
            </Link>
          </Button>
        )}
      </div>

      <div>
        {contactSession.metadata && (
          <Accordion
            className="w-full rounded-none border-y"
            collapsible
            type="single"
          >
            {accordionSections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="rounded-none outline-none has-focus-visible:z-10 has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 "
              >
                <AccordionTrigger className="flex w-full items-start justify-between gap-4 rounded-none bg-accent px-5 py-4 text-left font-medium text-sm outline-none transition-all hover:no-underline disabled:pointer-events-none disabled:opacity-50 ">
                  <div className="flex items-center gap-4">
                    <section.icon className="size-4 shrink-0" />
                    <span>{section.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 py-4">
                  <div className="space-y-4 text-sm">
                    {section.items.map((item) => (
                      <div
                        className="flex justify-between"
                        key={`${section.id}-${item.label}`}
                      >
                        <span className="text-muted-foreground">
                          {item.label}:
                        </span>
                        <span className={item.calssName}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

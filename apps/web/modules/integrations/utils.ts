import {
  HTML_SCRIPT,
  type IntegrationId,
  JAVSCRIPT_SCRIPT,
  NEXTJS_SCRIPT,
  REACT_SCRIPT,
} from "./constants";

export const createScript = (
  integrationId: IntegrationId,
  organizationId: string
) => {
  if (integrationId === "html") {
    return HTML_SCRIPT.replace(/{{ORGANIZATION_ID}}/g, organizationId);
  }
  if (integrationId === "react") {
    return REACT_SCRIPT.replace(/{{ORGANIZATION_ID}}/g, organizationId);
  }
  if (integrationId === "nextjs") {
    return NEXTJS_SCRIPT.replace(/{{ORGANIZATION_ID}}/g, organizationId);
  }
  if (integrationId === "javascript") {
    return JAVSCRIPT_SCRIPT.replace(/{{ORGANIZATION_ID}}/g, organizationId);
  }

  return "";
};

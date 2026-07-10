import { memo, useEffect } from "react";

type IntegrationPosition = "HEAD" | "BODY_START" | "BODY_END";

export interface WebsiteIntegration {
  id: number | string;
  websiteId?: number | string | null;
  integrationType: string;
  isActive?: boolean;
  config?: Record<string, any> | null;
}

interface PublicWebsiteIntegrationsProps {
  websiteId?: number | string | null;
  integrations?: WebsiteIntegration[] | null;
}

const DEFAULT_POSITION_BY_TYPE: Record<string, IntegrationPosition> = {
  GOOGLE_ANALYTICS: "HEAD",
  FACEBOOK_PIXEL: "HEAD",
  GOOGLE_TAG_MANAGER: "HEAD",
  HOTJAR: "HEAD",
  INTERCOM: "BODY_END",
  CUSTOM_SCRIPT: "BODY_END",
};

function normalizePosition(
  rawPosition: unknown,
  integrationType: string,
): IntegrationPosition {
  if (
    rawPosition === "HEAD" ||
    rawPosition === "BODY_START" ||
    rawPosition === "BODY_END"
  ) {
    return rawPosition;
  }

  return DEFAULT_POSITION_BY_TYPE[integrationType] || "BODY_END";
}

function appendNode(node: Node, position: IntegrationPosition) {
  if (position === "HEAD") {
    document.head.appendChild(node);
    return;
  }

  if (position === "BODY_START") {
    document.body.insertBefore(node, document.body.firstChild);
    return;
  }

  document.body.appendChild(node);
}

function createManagedScript(
  integrationId: string,
  scriptId: string,
  attrs: Record<string, string> = {},
  inlineCode?: string,
) {
  const script = document.createElement("script");
  script.dataset.ttIntegrationId = integrationId;
  script.dataset.ttIntegrationManaged = "true";
  script.dataset.ttIntegrationScriptId = scriptId;

  Object.entries(attrs).forEach(([key, value]) => {
    if (value) {
      script.setAttribute(key, value);
    }
  });

  if (inlineCode) {
    script.text = inlineCode;
  }

  return script;
}

function injectCustomMarkup(
  html: string,
  position: IntegrationPosition,
  integrationId: string,
  createdNodes: Node[],
) {
  if (!html.trim()) {
    return;
  }

  const template = document.createElement("template");
  template.innerHTML = html;

  // <script> tags inserted via innerHTML never execute on their own — rebuild
  // them as real, executable script nodes (inline code and src both supported).
  const scripts = Array.from(template.content.querySelectorAll("script"));
  scripts.forEach((oldScript, index) => {
    const script = createManagedScript(
      integrationId,
      `custom-script-${index}`,
      Array.from(oldScript.attributes).reduce<Record<string, string>>(
        (acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        },
        {},
      ),
      oldScript.textContent || "",
    );
    oldScript.replaceWith(script);
  });

  // A snippet that is pure JavaScript (no HTML tags) parses to text-only nodes.
  // Appending that text would print dead code on the page, so run it as a
  // script instead — this lets users paste raw JS without wrapping it in
  // <script> tags. Snippets that contain any element (incl. converted <script>
  // tags above, <div>, <style>, <iframe>, …) fall through to normal DOM append.
  const hasElementNode = Array.from(template.content.childNodes).some(
    (node) => node.nodeType === Node.ELEMENT_NODE,
  );
  if (!hasElementNode) {
    const inlineCode = (template.textContent || "").trim();
    if (inlineCode) {
      const script = createManagedScript(
        integrationId,
        "custom-inline-js",
        {},
        inlineCode,
      );
      appendNode(script, position);
      createdNodes.push(script);
    }
    return;
  }

  const nodes = Array.from(template.content.childNodes);
  const orderedNodes =
    position === "BODY_START" ? [...nodes].reverse() : nodes;

  orderedNodes.forEach((node, index) => {
    if (node instanceof HTMLElement) {
      node.dataset.ttIntegrationId = integrationId;
      node.dataset.ttIntegrationManaged = "true";
      node.dataset.ttIntegrationNodeIndex = String(index);
    }
    appendNode(node, position);
    createdNodes.push(node);
  });
}

function injectIntegration(
  integration: WebsiteIntegration,
  createdNodes: Node[],
  websiteId?: number | string | null,
) {
  const integrationId = String(integration.id);
  const config = integration.config || {};
  const position = normalizePosition(config.position, integration.integrationType);

  switch (integration.integrationType) {
    case "GOOGLE_ANALYTICS": {
      const measurementId = String(config.measurementId || "").trim();
      if (!measurementId) return;

      const externalScript = createManagedScript(integrationId, "ga4-loader", {
        async: "true",
        src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
      });
      appendNode(externalScript, "HEAD");
      createdNodes.push(externalScript);

      const inlineScript = createManagedScript(
        integrationId,
        "ga4-config",
        {},
        `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('js', new Date());
gtag('config', '${measurementId}', { send_page_view: true });
        `.trim(),
      );
      appendNode(inlineScript, "HEAD");
      createdNodes.push(inlineScript);
      return;
    }

    case "FACEBOOK_PIXEL": {
      const pixelId = String(config.pixelId || "").trim();
      if (!pixelId) return;

      const pixelScript = createManagedScript(
        integrationId,
        "facebook-pixel",
        {},
        `
if (window.fbq) {
  window.fbq('init', '${pixelId}');
  window.fbq('track', 'PageView');
} else {
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
}
        `.trim(),
      );
      appendNode(pixelScript, "HEAD");
      createdNodes.push(pixelScript);
      return;
    }

    case "GOOGLE_TAG_MANAGER": {
      const containerId = String(config.containerId || "").trim();
      if (!containerId) return;

      const gtmScript = createManagedScript(
        integrationId,
        "gtm-loader",
        {},
        `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');
        `.trim(),
      );
      appendNode(gtmScript, "HEAD");
      createdNodes.push(gtmScript);

      const iframe = document.createElement("iframe");
      iframe.src = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(containerId)}`;
      iframe.height = "0";
      iframe.width = "0";
      iframe.style.display = "none";
      iframe.style.visibility = "hidden";
      iframe.dataset.ttIntegrationId = integrationId;
      iframe.dataset.ttIntegrationManaged = "true";
      appendNode(iframe, "BODY_START");
      createdNodes.push(iframe);
      return;
    }

    case "HOTJAR": {
      const siteId = String(config.siteId || "").trim();
      if (!siteId) return;

      const hotjarScript = createManagedScript(
        integrationId,
        "hotjar-loader",
        {},
        `
(function(h,o,t,j,a,r){
  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
  h._hjSettings={hjid:${JSON.stringify(siteId)},hjsv:6};
  a=o.getElementsByTagName('head')[0];
  r=o.createElement('script');r.async=1;
  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
  a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `.trim(),
      );
      appendNode(hotjarScript, "HEAD");
      createdNodes.push(hotjarScript);
      return;
    }

    case "INTERCOM": {
      const appId = String(config.appId || "").trim();
      if (!appId) return;

      const intercomScript = createManagedScript(
        integrationId,
        "intercom-loader",
        {},
        `
window.intercomSettings = {
  app_id: '${appId}',
  website_id: '${websiteId ?? ""}'
};
(function(){
  var w=window;
  var ic=w.Intercom;
  if(typeof ic==="function"){
    ic('reattach_activator');
    ic('update', w.intercomSettings);
  } else {
    var d=document;
    var i=function(){i.c(arguments);};
    i.q=[];
    i.c=function(args){i.q.push(args);};
    w.Intercom=i;
    var l=function(){
      var s=d.createElement('script');
      s.type='text/javascript';
      s.async=true;
      s.src='https://widget.intercom.io/widget/${appId}';
      var x=d.getElementsByTagName('script')[0];
      x.parentNode.insertBefore(s,x);
    };
    if(document.readyState==='complete'){
      l();
    } else if(w.attachEvent){
      w.attachEvent('onload', l);
    } else {
      w.addEventListener('load', l, false);
    }
  }
})();
        `.trim(),
      );
      appendNode(intercomScript, position);
      createdNodes.push(intercomScript);
      return;
    }

    case "CUSTOM_SCRIPT": {
      const scriptContent = String(config.scriptContent || "");
      injectCustomMarkup(scriptContent, position, integrationId, createdNodes);
      return;
    }

    default:
      return;
  }
}

const PublicWebsiteIntegrations = memo(
  ({ websiteId, integrations }: PublicWebsiteIntegrationsProps) => {
    useEffect(() => {
      const activeIntegrations = (integrations || []).filter(
        (integration) =>
          integration &&
          integration.isActive &&
          String(integration.websiteId ?? websiteId ?? "") ===
            String(websiteId ?? integration.websiteId ?? ""),
      );

      if (!websiteId || activeIntegrations.length === 0) {
        return;
      }

      const createdNodes: Node[] = [];

      activeIntegrations.forEach((integration) => {
        injectIntegration(integration, createdNodes, websiteId);
      });

      return () => {
        createdNodes.forEach((node) => {
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        });
      };
    }, [integrations, websiteId]);

    return null;
  },
);

PublicWebsiteIntegrations.displayName = "PublicWebsiteIntegrations";

export default PublicWebsiteIntegrations;

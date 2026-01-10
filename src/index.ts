#!/usr/bin/env bun

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { tools } from "./tools.js";
import {
  listAccounts,
  listMailboxes,
  getEmails,
  searchEmails,
  getUnreadCount,
  sendEmail,
  archiveEmail,
  deleteEmail,
  markAsRead,
  markAsUnread,
  createDraft,
  createDraftReply,
} from "./applescript/mail.js";

// Create MCP server
const server = new Server(
  {
    name: "apple-mail-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handler for listing available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handler for tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "mail_list_accounts": {
        const accounts = listAccounts();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ accounts }, null, 2),
            },
          ],
        };
      }

      case "mail_list_mailboxes": {
        const account = args?.account as string | undefined;
        const result = listMailboxes(account);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ mailboxes: result }, null, 2),
            },
          ],
        };
      }

      case "mail_get_emails": {
        const emails = getEmails({
          account: args?.account as string | undefined,
          mailbox: (args?.mailbox as string) || "INBOX",
          limit: (args?.limit as number) || 10,
          includeContent: (args?.includeContent as boolean) || false,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ emails, count: emails.length }, null, 2),
            },
          ],
        };
      }

      case "mail_search": {
        const query = args?.query as string;
        if (!query) {
          throw new Error("Search query is required");
        }
        const emails = searchEmails({
          query,
          account: args?.account as string | undefined,
          mailbox: args?.mailbox as string | undefined,
          limit: (args?.limit as number) || 10,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ emails, count: emails.length, query }, null, 2),
            },
          ],
        };
      }

      case "mail_get_unread_count": {
        const count = getUnreadCount({
          account: args?.account as string | undefined,
          mailbox: args?.mailbox as string | undefined,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ unreadCount: count }, null, 2),
            },
          ],
        };
      }

      case "mail_send": {
        const to = args?.to as string | string[];
        const subject = args?.subject as string;
        const body = args?.body as string;

        if (!to || !subject || !body) {
          throw new Error("Required fields: to, subject, body");
        }

        const result = sendEmail({
          to,
          subject,
          body,
          cc: args?.cc as string | string[] | undefined,
          bcc: args?.bcc as string | string[] | undefined,
          from: args?.from as string | undefined,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "mail_archive": {
        const messageId = args?.messageId as number;
        if (!messageId) {
          throw new Error("Required field: messageId");
        }

        const result = archiveEmail({
          messageId,
          account: args?.account as string | undefined,
          mailbox: (args?.mailbox as string) || "INBOX",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "mail_delete": {
        const messageId = args?.messageId as number;
        if (!messageId) {
          throw new Error("Required field: messageId");
        }

        const result = deleteEmail({
          messageId,
          account: args?.account as string | undefined,
          mailbox: (args?.mailbox as string) || "INBOX",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "mail_mark_read": {
        const messageId = args?.messageId as number;
        if (!messageId) {
          throw new Error("Required field: messageId");
        }

        const result = markAsRead({
          messageId,
          account: args?.account as string | undefined,
          mailbox: (args?.mailbox as string) || "INBOX",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "mail_mark_unread": {
        const messageId = args?.messageId as number;
        if (!messageId) {
          throw new Error("Required field: messageId");
        }

        const result = markAsUnread({
          messageId,
          account: args?.account as string | undefined,
          mailbox: (args?.mailbox as string) || "INBOX",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "mail_create_draft": {
        const subject = args?.subject as string;
        const body = args?.body as string;

        if (!subject || !body) {
          throw new Error("Required fields: subject, body");
        }

        const result = createDraft({
          to: args?.to as string | string[] | undefined,
          subject,
          body,
          cc: args?.cc as string | string[] | undefined,
          bcc: args?.bcc as string | string[] | undefined,
          from: args?.from as string | undefined,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "mail_create_draft_reply": {
        const messageId = args?.messageId as number;
        const body = args?.body as string;

        if (!messageId || !body) {
          throw new Error("Required fields: messageId, body");
        }

        const result = createDraftReply({
          messageId,
          body,
          replyAll: (args?.replyAll as boolean) || false,
          account: args?.account as string | undefined,
          mailbox: (args?.mailbox as string) || "INBOX",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Apple Mail MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

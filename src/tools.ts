import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const MAIL_LIST_ACCOUNTS: Tool = {
  name: "mail_list_accounts",
  description: "List all email accounts configured in Apple Mail",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

export const MAIL_LIST_MAILBOXES: Tool = {
  name: "mail_list_mailboxes",
  description: "List all mailboxes (folders) for a specific account or all accounts in Apple Mail",
  inputSchema: {
    type: "object",
    properties: {
      account: {
        type: "string",
        description: "The name of the email account to list mailboxes for. If not provided, lists mailboxes for all accounts.",
      },
    },
    required: [],
  },
};

export const MAIL_GET_EMAILS: Tool = {
  name: "mail_get_emails",
  description: "Get recent emails from a mailbox in Apple Mail",
  inputSchema: {
    type: "object",
    properties: {
      account: {
        type: "string",
        description: "The name of the email account",
      },
      mailbox: {
        type: "string",
        description: "The name of the mailbox/folder (default: INBOX)",
        default: "INBOX",
      },
      limit: {
        type: "number",
        description: "Maximum number of emails to retrieve (default: 10)",
        default: 10,
      },
      includeContent: {
        type: "boolean",
        description: "Whether to include the email body content (default: false)",
        default: false,
      },
    },
    required: [],
  },
};

export const MAIL_SEARCH: Tool = {
  name: "mail_search",
  description: "Search emails in Apple Mail by subject, sender, or content",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query to match against email subject, sender, or content",
      },
      account: {
        type: "string",
        description: "The name of the email account to search in",
      },
      mailbox: {
        type: "string",
        description: "The name of the mailbox/folder to search in",
      },
      limit: {
        type: "number",
        description: "Maximum number of emails to return (default: 10)",
        default: 10,
      },
    },
    required: ["query"],
  },
};

export const MAIL_GET_UNREAD_COUNT: Tool = {
  name: "mail_get_unread_count",
  description: "Get the count of unread emails in Apple Mail",
  inputSchema: {
    type: "object",
    properties: {
      account: {
        type: "string",
        description: "The name of the email account",
      },
      mailbox: {
        type: "string",
        description: "The name of the mailbox/folder",
      },
    },
    required: [],
  },
};

export const MAIL_SEND: Tool = {
  name: "mail_send",
  description: "Send an email using Apple Mail",
  inputSchema: {
    type: "object",
    properties: {
      to: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } },
        ],
        description: "Email address(es) of the recipient(s)",
      },
      subject: {
        type: "string",
        description: "The email subject line",
      },
      body: {
        type: "string",
        description: "The email body content",
      },
      cc: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } },
        ],
        description: "Email address(es) for CC recipients",
      },
      bcc: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } },
        ],
        description: "Email address(es) for BCC recipients",
      },
      from: {
        type: "string",
        description: "The sender email address (must be a configured account)",
      },
    },
    required: ["to", "subject", "body"],
  },
};

export const tools: Tool[] = [
  MAIL_LIST_ACCOUNTS,
  MAIL_LIST_MAILBOXES,
  MAIL_GET_EMAILS,
  MAIL_SEARCH,
  MAIL_GET_UNREAD_COUNT,
  MAIL_SEND,
];

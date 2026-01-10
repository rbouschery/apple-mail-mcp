import { execSync } from "child_process";

/**
 * Execute an AppleScript and return the result
 */
export function runAppleScript(script: string): string {
  try {
    // Use osascript with heredoc to handle complex scripts
    const result = execSync(`osascript <<'APPLESCRIPT'
${script}
APPLESCRIPT`, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large results
    });
    return result.trim();
  } catch (error: any) {
    throw new Error(`AppleScript error: ${error.message}`);
  }
}

/**
 * List all email accounts configured in Apple Mail
 */
export function listAccounts(): string[] {
  const script = `
tell application "Mail"
    set accountList to {}
    repeat with acc in accounts
        set end of accountList to name of acc
    end repeat
    return accountList
end tell
`;
  const result = runAppleScript(script);
  if (!result) return [];

  // AppleScript returns comma-separated list
  return result.split(", ").map(s => s.trim()).filter(Boolean);
}

/**
 * List mailboxes for a specific account or all accounts
 */
export function listMailboxes(accountName?: string): { account: string; mailboxes: string[] }[] {
  const script = accountName
    ? `
tell application "Mail"
    set results to {}
    try
        set acc to account "${accountName}"
        set mailboxList to {}
        repeat with mb in mailboxes of acc
            set end of mailboxList to name of mb
        end repeat
        return mailboxList
    on error
        return {}
    end try
end tell
`
    : `
tell application "Mail"
    set results to ""
    repeat with acc in accounts
        set accName to name of acc
        set mailboxList to {}
        repeat with mb in mailboxes of acc
            set end of mailboxList to name of mb
        end repeat
        set results to results & accName & ":" & (mailboxList as string) & "|||"
    end repeat
    return results
end tell
`;

  const result = runAppleScript(script);

  if (accountName) {
    // Single account result
    const mailboxes = result ? result.split(", ").map(s => s.trim()).filter(Boolean) : [];
    return [{ account: accountName, mailboxes }];
  }

  // Multiple accounts result
  const accountResults: { account: string; mailboxes: string[] }[] = [];
  const parts = result.split("|||").filter(Boolean);

  for (const part of parts) {
    const [accName, ...mailboxParts] = part.split(":");
    const mailboxes = mailboxParts.join(":").split(", ").map(s => s.trim()).filter(Boolean);
    if (accName) {
      accountResults.push({ account: accName.trim(), mailboxes });
    }
  }

  return accountResults;
}

export interface Email {
  id: number;
  subject: string;
  sender: string;
  dateSent: string;
  isRead: boolean;
  content?: string;
}

/**
 * Get emails from a mailbox
 */
export function getEmails(options: {
  account?: string;
  mailbox?: string;
  limit?: number;
  includeContent?: boolean;
}): Email[] {
  const { account, mailbox = "INBOX", limit = 10, includeContent = false } = options;

  const contentPart = includeContent
    ? `set msgContent to content of msg`
    : `set msgContent to ""`;

  const accountPart = account
    ? `mailbox "${mailbox}" of account "${account}"`
    : `mailbox "${mailbox}"`;

  const script = `
tell application "Mail"
    set results to ""
    try
        set theMailbox to ${accountPart}
        set msgList to messages of theMailbox
        set msgCount to count of msgList
        if msgCount > ${limit} then set msgCount to ${limit}

        repeat with i from 1 to msgCount
            set msg to item i of msgList
            set msgId to id of msg
            set msgSubject to subject of msg
            set msgSender to sender of msg
            set msgDate to date sent of msg
            set msgRead to read status of msg
            ${contentPart}

            set results to results & msgId & "<<>>" & msgSubject & "<<>>" & msgSender & "<<>>" & (msgDate as string) & "<<>>" & msgRead & "<<>>" & msgContent & "|||"
        end repeat
    on error errMsg
        return "ERROR:" & errMsg
    end try
    return results
end tell
`;

  const result = runAppleScript(script);

  if (result.startsWith("ERROR:")) {
    throw new Error(result.substring(6));
  }

  const emails: Email[] = [];
  const parts = result.split("|||").filter(Boolean);

  for (const part of parts) {
    const [id, subject, sender, dateSent, isRead, content] = part.split("<<>>");
    emails.push({
      id: parseInt(id) || 0,
      subject: subject || "(No Subject)",
      sender: sender || "(Unknown)",
      dateSent: dateSent || "",
      isRead: isRead === "true",
      content: content || undefined,
    });
  }

  return emails;
}

/**
 * Search emails by query
 */
export function searchEmails(options: {
  query: string;
  account?: string;
  mailbox?: string;
  limit?: number;
}): Email[] {
  const { query, account, mailbox, limit = 10 } = options;

  // Build the mailbox selection part
  let mailboxPart: string;
  if (account && mailbox) {
    mailboxPart = `{mailbox "${mailbox}" of account "${account}"}`;
  } else if (account) {
    mailboxPart = `mailboxes of account "${account}"`;
  } else if (mailbox) {
    mailboxPart = `{mailbox "${mailbox}"}`;
  } else {
    mailboxPart = `inbox`;
  }

  const script = `
tell application "Mail"
    set results to ""
    set foundCount to 0
    set searchQuery to "${query.replace(/"/g, '\\"')}"

    try
        set searchMailboxes to ${mailboxPart}
        repeat with mb in searchMailboxes
            if foundCount >= ${limit} then exit repeat

            set msgList to (messages of mb whose subject contains searchQuery or sender contains searchQuery or content contains searchQuery)
            repeat with msg in msgList
                if foundCount >= ${limit} then exit repeat

                set msgId to id of msg
                set msgSubject to subject of msg
                set msgSender to sender of msg
                set msgDate to date sent of msg
                set msgRead to read status of msg

                set results to results & msgId & "<<>>" & msgSubject & "<<>>" & msgSender & "<<>>" & (msgDate as string) & "<<>>" & msgRead & "|||"
                set foundCount to foundCount + 1
            end repeat
        end repeat
    on error errMsg
        return "ERROR:" & errMsg
    end try
    return results
end tell
`;

  const result = runAppleScript(script);

  if (result.startsWith("ERROR:")) {
    throw new Error(result.substring(6));
  }

  const emails: Email[] = [];
  const parts = result.split("|||").filter(Boolean);

  for (const part of parts) {
    const [id, subject, sender, dateSent, isRead] = part.split("<<>>");
    emails.push({
      id: parseInt(id) || 0,
      subject: subject || "(No Subject)",
      sender: sender || "(Unknown)",
      dateSent: dateSent || "",
      isRead: isRead === "true",
    });
  }

  return emails;
}

/**
 * Get unread email count
 */
export function getUnreadCount(options: {
  account?: string;
  mailbox?: string;
}): number {
  const { account, mailbox } = options;

  let script: string;

  if (account && mailbox) {
    script = `
tell application "Mail"
    return unread count of mailbox "${mailbox}" of account "${account}"
end tell
`;
  } else if (account) {
    script = `
tell application "Mail"
    set total to 0
    repeat with mb in mailboxes of account "${account}"
        set total to total + (unread count of mb)
    end repeat
    return total
end tell
`;
  } else if (mailbox) {
    script = `
tell application "Mail"
    set total to 0
    repeat with acc in accounts
        try
            set total to total + (unread count of mailbox "${mailbox}" of acc)
        end try
    end repeat
    return total
end tell
`;
  } else {
    script = `
tell application "Mail"
    set total to 0
    repeat with acc in accounts
        repeat with mb in mailboxes of acc
            set total to total + (unread count of mb)
        end repeat
    end repeat
    return total
end tell
`;
  }

  const result = runAppleScript(script);
  return parseInt(result) || 0;
}

/**
 * Send an email
 */
export function sendEmail(options: {
  to: string | string[];
  subject: string;
  body: string;
  cc?: string | string[];
  bcc?: string | string[];
  from?: string;
}): { success: boolean; message: string } {
  const { to, subject, body, cc, bcc, from } = options;

  const toList = Array.isArray(to) ? to : [to];
  const ccList = cc ? (Array.isArray(cc) ? cc : [cc]) : [];
  const bccList = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [];

  // Build recipient parts
  const toRecipients = toList.map(addr => `make new to recipient at end of to recipients with properties {address:"${addr}"}`).join("\n            ");
  const ccRecipients = ccList.map(addr => `make new cc recipient at end of cc recipients with properties {address:"${addr}"}`).join("\n            ");
  const bccRecipients = bccList.map(addr => `make new bcc recipient at end of bcc recipients with properties {address:"${addr}"}`).join("\n            ");

  const fromPart = from ? `, sender:"${from}"` : "";

  const script = `
tell application "Mail"
    set newMessage to make new outgoing message with properties {subject:"${subject.replace(/"/g, '\\"')}", content:"${body.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"${fromPart}}
    tell newMessage
        ${toRecipients}
        ${ccRecipients ? ccRecipients : ""}
        ${bccRecipients ? bccRecipients : ""}
    end tell
    send newMessage
    return "Message sent successfully"
end tell
`;

  try {
    const result = runAppleScript(script);
    return { success: true, message: result || "Message sent successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Archive an email by moving it to the Archive mailbox
 */
export function archiveEmail(options: {
  messageId: number;
  account?: string;
  mailbox?: string;
}): { success: boolean; message: string } {
  const { messageId, account, mailbox = "INBOX" } = options;

  const accountPart = account
    ? `mailbox "${mailbox}" of account "${account}"`
    : `mailbox "${mailbox}"`;

  const script = `
tell application "Mail"
    try
        set theMailbox to ${accountPart}
        set theMessage to (first message of theMailbox whose id is ${messageId})
        set theAccount to account of theMailbox

        -- Find the Archive mailbox for this account
        set archiveMailbox to missing value
        repeat with mb in mailboxes of theAccount
            if name of mb is "Archive" or name of mb is "All Mail" then
                set archiveMailbox to mb
                exit repeat
            end if
        end repeat

        if archiveMailbox is missing value then
            return "ERROR:No Archive mailbox found for this account"
        end if

        move theMessage to archiveMailbox
        return "Message archived successfully"
    on error errMsg
        return "ERROR:" & errMsg
    end try
end tell
`;

  try {
    const result = runAppleScript(script);
    if (result.startsWith("ERROR:")) {
      return { success: false, message: result.substring(6) };
    }
    return { success: true, message: result || "Message archived successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Delete an email by moving it to the Trash mailbox
 */
export function deleteEmail(options: {
  messageId: number;
  account?: string;
  mailbox?: string;
}): { success: boolean; message: string } {
  const { messageId, account, mailbox = "INBOX" } = options;

  const accountPart = account
    ? `mailbox "${mailbox}" of account "${account}"`
    : `mailbox "${mailbox}"`;

  const script = `
tell application "Mail"
    try
        set theMailbox to ${accountPart}
        set theMessage to (first message of theMailbox whose id is ${messageId})
        delete theMessage
        return "Message deleted successfully"
    on error errMsg
        return "ERROR:" & errMsg
    end try
end tell
`;

  try {
    const result = runAppleScript(script);
    if (result.startsWith("ERROR:")) {
      return { success: false, message: result.substring(6) };
    }
    return { success: true, message: result || "Message deleted successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Mark an email as read
 */
export function markAsRead(options: {
  messageId: number;
  account?: string;
  mailbox?: string;
}): { success: boolean; message: string } {
  const { messageId, account, mailbox = "INBOX" } = options;

  const accountPart = account
    ? `mailbox "${mailbox}" of account "${account}"`
    : `mailbox "${mailbox}"`;

  const script = `
tell application "Mail"
    try
        set theMailbox to ${accountPart}
        set theMessage to (first message of theMailbox whose id is ${messageId})
        set read status of theMessage to true
        return "Message marked as read"
    on error errMsg
        return "ERROR:" & errMsg
    end try
end tell
`;

  try {
    const result = runAppleScript(script);
    if (result.startsWith("ERROR:")) {
      return { success: false, message: result.substring(6) };
    }
    return { success: true, message: result || "Message marked as read" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Mark an email as unread
 */
export function markAsUnread(options: {
  messageId: number;
  account?: string;
  mailbox?: string;
}): { success: boolean; message: string } {
  const { messageId, account, mailbox = "INBOX" } = options;

  const accountPart = account
    ? `mailbox "${mailbox}" of account "${account}"`
    : `mailbox "${mailbox}"`;

  const script = `
tell application "Mail"
    try
        set theMailbox to ${accountPart}
        set theMessage to (first message of theMailbox whose id is ${messageId})
        set read status of theMessage to false
        return "Message marked as unread"
    on error errMsg
        return "ERROR:" & errMsg
    end try
end tell
`;

  try {
    const result = runAppleScript(script);
    if (result.startsWith("ERROR:")) {
      return { success: false, message: result.substring(6) };
    }
    return { success: true, message: result || "Message marked as unread" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Create a draft email
 */
export function createDraft(options: {
  to?: string | string[];
  subject: string;
  body: string;
  cc?: string | string[];
  bcc?: string | string[];
  from?: string;
}): { success: boolean; message: string } {
  const { to, subject, body, cc, bcc, from } = options;

  const toList = to ? (Array.isArray(to) ? to : [to]) : [];
  const ccList = cc ? (Array.isArray(cc) ? cc : [cc]) : [];
  const bccList = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [];

  // Build recipient parts
  const toRecipients = toList.map(addr => `make new to recipient at end of to recipients with properties {address:"${addr}"}`).join("\n            ");
  const ccRecipients = ccList.map(addr => `make new cc recipient at end of cc recipients with properties {address:"${addr}"}`).join("\n            ");
  const bccRecipients = bccList.map(addr => `make new bcc recipient at end of bcc recipients with properties {address:"${addr}"}`).join("\n            ");

  const fromPart = from ? `, sender:"${from}"` : "";

  const script = `
tell application "Mail"
    set newMessage to make new outgoing message with properties {subject:"${subject.replace(/"/g, '\\"')}", content:"${body.replace(/"/g, '\\"').replace(/\n/g, "\\n")}", visible:true${fromPart}}
    tell newMessage
        ${toRecipients}
        ${ccRecipients ? ccRecipients : ""}
        ${bccRecipients ? bccRecipients : ""}
    end tell
    -- Save as draft by not sending, just leaving it open
    return "Draft created successfully"
end tell
`;

  try {
    const result = runAppleScript(script);
    return { success: true, message: result || "Draft created successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Create a draft reply to an existing email
 */
export function createDraftReply(options: {
  messageId: number;
  body: string;
  replyAll?: boolean;
  account?: string;
  mailbox?: string;
}): { success: boolean; message: string } {
  const { messageId, body, replyAll = false, account, mailbox = "INBOX" } = options;

  const accountPart = account
    ? `mailbox "${mailbox}" of account "${account}"`
    : `mailbox "${mailbox}"`;

  const replyCommand = replyAll ? "reply theMessage with opening window and reply to all" : "reply theMessage with opening window";

  const script = `
tell application "Mail"
    try
        set theMailbox to ${accountPart}
        set theMessage to (first message of theMailbox whose id is ${messageId})

        set replyMessage to ${replyCommand}

        -- Prepend the new body to the reply
        set currentContent to content of replyMessage
        set content of replyMessage to "${body.replace(/"/g, '\\"').replace(/\n/g, "\\n")}" & return & return & currentContent

        return "Draft reply created successfully"
    on error errMsg
        return "ERROR:" & errMsg
    end try
end tell
`;

  try {
    const result = runAppleScript(script);
    if (result.startsWith("ERROR:")) {
      return { success: false, message: result.substring(6) };
    }
    return { success: true, message: result || "Draft reply created successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

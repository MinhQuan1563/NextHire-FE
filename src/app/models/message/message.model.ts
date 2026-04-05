export interface MessageDto {
  messageId: string;
  senderCode: string;
  receiverCode: string;
  content: string;
  createDate: string;
  isRead: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
}

export interface CreateMessageDto {
  receiverCode: string;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
}

export interface ChatPartner {
  userCode: string;
  fullName: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

export interface ConversationDto {
  partnerCode: string;
  partnerName: string;
  partnerAvatar?: string;
  lastMessageContent: string;
  lastMessageTime: string | Date;
  isLastMessageFromMe: boolean; 
  hasUnread: boolean;
  isOnline?: boolean;
}
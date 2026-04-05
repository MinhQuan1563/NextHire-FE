export interface NotificationDto {
  notificationId: string;
  userCode: string;
  channel: number;
  title: string;
  content: string;
  cc?: string;
  isRead: boolean;
  createDate: string;
  type: string;
  refId?: string;
}
/**
 * Friendship status types
 * Based on PRD requirements: not friends, pending, friends, blocked
 */
export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked';

/**
 * Friendship status display labels
 */
export const FriendshipStatusLabels: Record<FriendshipStatus, string> = {
  none: 'Not Friends',
  pending_sent: 'Friend Request Sent',
  pending_received: 'Friend Request Received',
  friends: 'Friends',
  blocked: 'Blocked'
};


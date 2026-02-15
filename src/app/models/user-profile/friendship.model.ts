import { FriendshipStatus } from './friendship-status.enum';

/**
 * FriendRequestDto interface
 * Used for friendship API requests (send, accept, decline, cancel, block)
 */
export interface FriendRequestDto {
  userCode: string;
}

/**
 * Friendship status response
 * Returned from /api/friendship/friends/{userCode}
 */
export interface FriendshipStatusResponse {
  status: FriendshipStatus;
  userCode: string;
}


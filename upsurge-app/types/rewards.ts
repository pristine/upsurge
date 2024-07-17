import { type User } from './users';

export interface Reward {
  id: string;
  active: boolean;
  nickname: string;
  description: string;
  pointsRequired: number;
  createdAt: Date;
  amountRedeemed?: number;
}

export interface RedeemedReward {
  id: string;
  processed: boolean;
  userId: string;
  rewardId: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface RedeemedRewardSearch {
  id: string;
  processed: boolean;
  createdAt: Date;

  reward: Reward;
  user: User;

  processedAt?: Date;
}

export interface UpdateReward {
  description?: string;
  pointsRequired?: number;
  nickname?: string;
  active?: boolean;
}

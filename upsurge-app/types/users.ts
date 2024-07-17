export interface User {
  // discord, or telegram id, etc.
  id: string;
  username: string;
  nickname: string;
  profilePicUrl?: string;
  points: number;
  totalPoints: number;
  rewardsRedeemed: number;
  joinDate: Date;
}
